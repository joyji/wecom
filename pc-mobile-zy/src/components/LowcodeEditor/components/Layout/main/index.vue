<!--
 * @Description: 画布区域 - iframe 模拟器
 * 参考 pc-micro-base main/index.vue 的 iframe + postMessage 实现
-->
<script lang="ts" setup>
import draggable from 'vuedraggable'
import { throttle } from 'lodash-es'
import { useLcProjectStore } from '@/store/modules/lcProject'
import LcEditorPageList from '@/components/LowcodeEditor/components/PageList/index.vue'

defineOptions({ name: 'LcEditorMain' })
const lcEditor = inject('lcEditor') as any
const lcProjectStore = useLcProjectStore()

const iframe = ref<HTMLIFrameElement>()
const initIframe = ref(true)
const widgetInfoList = ref<any[]>([])
const iframeHeight = ref(667)

// 模拟器 URL - 指向 h5-mobile-zy 的 simulator 页面
const iframeUrl = `${import.meta.env.VITE_LC_H5_BASE_URL}/#/pages/simulator/simulator`

// 画布宽度根据平台模式切换
const canvasWidth = computed(() => lcProjectStore.canvasWidth)
const platformMode = computed(() => lcProjectStore.platformMode)

// 容器组件名称集合（这类组件支持子槽位拖拽）
const CONTAINER_COMPONENT_NAMES = new Set(['LcCard', 'LcForm'])

onMounted(() => {
  lcEditor.h5Iframe = iframe.value
  getMessage()
})

onUnmounted(() => {
  initIframe.value = false
  window.removeEventListener('message', getMessageHandle)
})

const dragStatus = computed(() => lcEditor.dragstatus)

// 监听组件列表变化，同步到 iframe
watch(
  () => lcEditor.curPage?.componentList,
  () => {
    if (lcProjectStore.isSwitchingPlatform) return
    messageList()
  },
  { deep: true }
)

// 监听页面配置变化，同步到 iframe（背景色、高度等）
watch(
  () => lcEditor.curPage?.configure,
  () => {
    messagePageConfig()
  },
  { deep: true }
)

// 监听平台模式变化，通知 iframe 并重新同步组件列表
watch(
  () => platformMode.value,
  (val) => {
    lcEditor.curWidget = null
    lcProjectStore.setcurComponent(null)
    iframe.value?.contentWindow?.postMessage(
      JSON.stringify({ even: 'changeCurrWidget', params: { id: '' } }), '*'
    )
    widgetInfoList.value = []
    iframeHeight.value = 667
    messagePlatform(val)
    nextTick(() => {
      lcProjectStore.isSwitchingPlatform = false
      messageList()
      messagePageConfig()
    })
  }
)

// iframe 加载完成后初始化
const init = () => {
  setTimeout(() => {
    messageInit()
    messageList()
    messagePageConfig()
  }, 50)
}

// 接收 iframe 消息
const getMessage = () => {
  window.addEventListener('message', getMessageHandle)
}

const getMessageHandle = (e: MessageEvent) => {
  let data = e.data
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch {
      return
    }
  }
  const { type, params } = data
  switch (type) {
    case 'setList':
      setList(params)
      break
    case 'setHeight':
      setHeight(params)
      break
    case 'setCurrWidget':
      setCurrWidget(params)
      break
  }
}

// 同步组件高度，同时保留子槽位信息，并同步 slotOverlays
const setHeight = (params: any[]) => {
  // 保留旧的 slotOverlays，避免子槽位 draggable 列表丢失
  const oldMap = new Map(widgetInfoList.value.map((w: any) => [w.id, w]))
  params.forEach((item: any) => {
    const old = oldMap.get(item.id)
    if (old?.slotOverlays) {
      item.slotOverlays = old.slotOverlays
    }
    // 如果有 slots 且 slotOverlays 还未初始化，从 children 初始化一次
    if (item.slots && !item.slotOverlays) {
      item.slotOverlays = {}
      item.slots.forEach((_: any, slotIdx: number) => {
        const children = item.children?.[slotIdx] || []
        item.slotOverlays[slotIdx] = {
          items: children.map((c: any) => ({
            id: c.id,
            height: c.height || 40,
            componentName: c.componentName
          }))
        }
      })
    }
    // 更新子槽位 items 的高度（从 children 数据同步）
    if (item.slotOverlays && item.slots) {
      item.slots.forEach((_: any, slotIdx: number) => {
        const overlay = item.slotOverlays[slotIdx]
        if (!overlay) return
        const children = item.children?.[slotIdx] || []
        // 同步高度并合并新增子组件
        const childIds = new Set(children.map((c: any) => c.id))
        const overlayIds = new Set(overlay.items.map((i: any) => i.id))
        // 移除已删除的
        overlay.items = overlay.items.filter((i: any) => childIds.has(i.id))
        // 新增进来的
        children.forEach((c: any) => {
          if (!overlayIds.has(c.id)) {
            overlay.items.push({ id: c.id, height: c.height || 40, componentName: c.componentName })
          } else {
            const oi = overlay.items.find((i: any) => i.id === c.id)
            if (oi && c.height) oi.height = c.height
          }
        })
      })
    }
  })
  widgetInfoList.value = params
  iframeHeight.value = params.reduce((a: number, b: any) => a + (b.height || 0), 0)
  if (iframeHeight.value < 667) iframeHeight.value = 667
}

// 将 props 数组转换为 propsMap（供 simulator 渲染使用）
const buildPropsMap = (props: any[]) => {
  const propsMap: Record<string, any> = {}
  if (!Array.isArray(props)) return propsMap
  props.forEach((item: any) => {
    propsMap[item.code] = { value: item.value }
    if (item.extraProps) {
      propsMap[item.code].extraProps = item.extraProps
    }
  })
  return propsMap
}

/**
 * 递归为组件树的每一级构建 propsMap，保持 children 结构
 */
const buildItemWithPropsMap = (item: any): any => {
  const result: any = {
    ...item,
    propsMap: item.props ? buildPropsMap(item.props) : (item.propsMap || {})
  }
  if (item.children) {
    result.children = item.children.map((col: any[]) =>
      col.map((child: any) => buildItemWithPropsMap(child))
    )
  }
  return result
}

// iframe 内组件列表变化（拖拽排序），同步更新（递归恢复 props 数组）
const setList = (params: any) => {
  const { list } = params
  if (lcEditor.curPage) {
    const oldList = lcEditor.curPage.componentList
    lcEditor.curPage.componentList = mergePropsTree(list, oldList)
  }
}

/**
 * 递归将 simulator 回传的 list（含 children）与编辑器原始数据合并，
 * 恢复 props 数组（simulator 只有 propsMap）。
 * 优先级：item 自身携带的 props（新拖入组件）> oldList 中对应 original 的 props
 */
const mergePropsTree = (newItems: any[], oldItems: any[]): any[] => {
  return newItems.map((item: any) => {
    const original = findInTree(oldItems, item.id)
    // item.props 存在（新拖入时 element 携带了 props[]）直接用自身
    // 否则从 oldList 中的 original 恢复（编辑器状态中已有）
    const resolvedProps = item.props || original?.props
    const merged: any = resolvedProps
      ? { ...item, props: resolvedProps }
      : item
    if (item.children) {
      merged.children = item.children.map((col: any[], colIdx: number) => {
        const oldChildren = original?.children?.[colIdx] || []
        return mergePropsTree(col, oldChildren)
      })
    }
    return merged
  })
}

// 设置选中组件（支持子组件全树搜索）
const setCurrWidget = (params: any) => {
  const { id } = params
  if (!lcEditor.curPage) return
  const found = findInTree(lcEditor.curPage.componentList, id)
  lcEditor.curWidget = found || null
  lcProjectStore.setcurComponent(lcEditor.curWidget)
}

// 全树搜索组件
const findInTree = (items: any[], id: string): any => {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      for (const col of item.children) {
        const found = findInTree(col, id)
        if (found) return found
      }
    }
  }
  return null
}

// 修改选中组件，并通知 iframe
const changeCurrWidget = (widget: any) => {
  setCurrWidget(widget)
  const data = {
    even: 'changeCurrWidget',
    params: { id: widget.id }
  }
  iframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
}

// 发送初始化消息
const messageInit = () => {
  if (!lcProjectStore.project) return
  const data = {
    even: 'init',
    params: { project: lcProjectStore.project }
  }
  iframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
}

// 发送组件列表消息（递归构建 propsMap）
const messageList = () => {
  if (lcEditor.curPage) {
    const list = lcEditor.curPage.componentList.map((item: any) =>
      buildItemWithPropsMap(item)
    )
    const data = {
      even: 'list',
      params: list
    }
    iframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
  }
}

// 发送页面配置消息
const messagePageConfig = () => {
  if (lcEditor.curPage) {
    const data = {
      even: 'pageConfig',
      params: lcEditor.curPage.configure || {}
    }
    iframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
  }
}

// 发送平台切换消息
const messagePlatform = (mode: string) => {
  const data = {
    even: 'platform',
    params: { mode }
  }
  iframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
}

// 顶层拖拽变动
const handleComponentChange = (dragEvent: any) => {
  if (dragEvent.added) {
    const { element, newIndex } = dragEvent.added
    lcEditor.dragWidget = element

    // 转换 props[] → propsMap，让 simulator 能正确渲染，同时保留 props 供编辑器使用
    const elementWithPropsMap = buildItemWithPropsMap(element)

    iframe.value?.contentWindow?.postMessage(
      JSON.parse(
        JSON.stringify({
          even: 'drop',
          params: {
            element: elementWithPropsMap,
            newIndex
          }
        })
      ),
      '*'
    )
  } else if (dragEvent.moved) {
    messageList()
  }

  lcEditor.dragstatus = false
}

/**
 * 子槽位拖拽变动
 * parentId: 容器组件 id，slotIdx: 槽位下标
 */
const handleNestedChange = (dragEvent: any, parentId: string, slotIdx: number) => {
  if (dragEvent.added) {
    const { element, newIndex } = dragEvent.added
    lcEditor.dragWidget = element

    // 转换 props[] → propsMap，让 simulator 能正确渲染，同时保留 props 供编辑器使用
    const elementWithPropsMap = buildItemWithPropsMap(element)

    iframe.value?.contentWindow?.postMessage(
      JSON.parse(
        JSON.stringify({
          even: 'dropNested',
          params: {
            element: elementWithPropsMap,
            parentId,
            slotIdx,
            newIndex
          }
        })
      ),
      '*'
    )
  } else if (dragEvent.moved) {
    // 子组件内部排序：直接把整个顶层列表 messageList 同步
    // （子组件顺序已经通过 widgetInfoList 更新，但 lcEditor.curPage 数据需要同步更新）
    syncNestedOrder(parentId, slotIdx)
  }

  lcEditor.dragstatus = false
}

/**
 * 子槽位内部排序后，同步 lcEditor.curPage.componentList 里对应 parent 的 children
 * 通过 widgetInfoList 找到对应 parent 的 slot 虚拟列表，用新顺序更新 children
 */
const syncNestedOrder = (parentId: string, slotIdx: number) => {
  const parentInfo = widgetInfoList.value.find((w: any) => w.id === parentId)
  if (!parentInfo?.slotOverlays) return

  const slotOverlay = parentInfo.slotOverlays[slotIdx]
  if (!slotOverlay) return

  const parent = findInTree(lcEditor.curPage.componentList, parentId)
  if (!parent) return

  if (!parent.children) parent.children = []
  while (parent.children.length <= slotIdx) parent.children.push([])

  // slotOverlay.items 是子槽位覆盖层 v-model，其顺序代表新顺序，用 id 重新对齐
  const newOrder = slotOverlay.items.map((overlayItem: any) => {
    const existing = parent.children[slotIdx].find((c: any) => c.id === overlayItem.id)
    return existing || overlayItem
  })
  parent.children[slotIdx] = newOrder

  messageList()
}

/**
 * 获取或初始化子槽位覆盖层的条目列表（用于 draggable v-model）
 */
const getSlotOverlayItems = (element: any, slotIdx: number): any[] => {
  if (!element.slotOverlays) element.slotOverlays = {}
  if (!element.slotOverlays[slotIdx]) {
    const children = element.children?.[slotIdx] || []
    element.slotOverlays[slotIdx] = {
      items: children.map((c: any) => ({
        id: c.id,
        height: c.height || 40,
        componentName: c.componentName
      }))
    }
  }
  return element.slotOverlays[slotIdx].items
}

/**
 * 计算某个 widget 之前所有 widget 的高度累加（即该 widget 覆盖层 div 的起始 top）
 * slot.top 是 iframe 内相对文档的绝对 top，减去 widgetOffsetTop 即为相对 widget div 的 top
 */
const getWidgetOffsetTop = (element: any): number => {
  const idx = widgetInfoList.value.indexOf(element)
  if (idx <= 0) return 0
  return widgetInfoList.value.slice(0, idx).reduce((acc: number, w: any) => acc + (w.height || 0), 0)
}

const getSlotRelativeTop = (element: any, slot: any): number => {
  return slot.top - getWidgetOffsetTop(element)
}
</script>

<template>
  <div class="lc-editor-main">
    <!-- 可滚动画布区域 -->
    <div class="canvas-scroll">
      <!-- 画布容器 -->
      <div
        class="phone-frame"
        :class="{ 'is-pc': platformMode === 'pc' }"
        :style="platformMode === 'mobile' ? { width: canvasWidth + 'px' } : {}"
      >
        <!-- 移动端顶部状态栏 -->
        <div v-if="platformMode === 'mobile'" class="phone-head"></div>

        <div class="phone-body">
          <!-- iframe 模拟器 -->
          <iframe
            v-if="initIframe"
            ref="iframe"
            class="page-iframe"
            frameborder="no"
            scrolling="auto"
            :style="{
              height: iframeHeight + 'px',
              pointerEvents: dragStatus ? 'none' : 'auto'
            }"
            :src="iframeUrl"
            @load="init"
          ></iframe>

          <!-- 顶层拖拽蒙层（拖拽时覆盖在 iframe 上） -->
          <draggable
            class="page-layer drag-area"
            :style="{
              height: iframeHeight + 'px',
              zIndex: dragStatus ? '20' : '1'
            }"
            v-model="widgetInfoList"
            item-key="id"
            :animation="200"
            filter=".component-toolbar,.nested-slot-layer"
            ghost-class="draggable-ghost"
            group="component"
            @change="handleComponentChange"
          >
            <template #item="{ element }">
              <div
                class="page-layer-widget"
                :id="element.id"
                :style="{ height: (element.height || 40) + 'px' }"
                @click="changeCurrWidget(element)"
              >
                <!-- 子槽位覆盖层：仅布局/表单容器渲染 -->
                <template v-if="CONTAINER_COMPONENT_NAMES.has(element.componentName) && element.slots">
                  <div
                    v-for="(slot, slotIdx) in element.slots"
                    :key="slotIdx"
                    class="nested-slot-layer drag-area"
                    :style="{
                      position: 'absolute',
                      top: getSlotRelativeTop(element, slot) + 'px',
                      left: 0,
                      width: '100%',
                      height: slot.height + 'px',
                      zIndex: dragStatus ? 30 : 2
                    }"
                    @click.stop
                  >
                    <draggable
                      class="nested-slot-draggable"
                      :style="{ minHeight: slot.height + 'px', height: '100%' }"
                      :list="getSlotOverlayItems(element, slotIdx)"
                      item-key="id"
                      :animation="200"
                      ghost-class="draggable-ghost"
                      group="component"
                      @change="(e: any) => handleNestedChange(e, element.id, slotIdx)"
                    >
                      <template #item="{ element: child }">
                        <div
                          class="page-layer-widget nested-child-widget"
                          :style="{ height: (child.height || 40) + 'px' }"
                          @click.stop="changeCurrWidget(child)"
                        ></div>
                      </template>
                    </draggable>
                  </div>
                </template>
              </div>
            </template>
          </draggable>
        </div>

        <!-- 移动端高度标记 -->
        <div v-if="platformMode === 'mobile'" class="height-tag">
          <span>iPhone 8 手机高度</span>
        </div>
      </div>
    </div>

    <!-- 页面标签管理 - 固定在底部 -->
    <lc-editor-page-list />
  </div>
</template>

<style scoped lang="scss">
.lc-editor-main {
  position: absolute;
  right: 360px;
  left: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .canvas-scroll {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .phone-frame {
    position: relative;
    width: 375px;
    margin: 20px auto;
    box-shadow: 0 0 14px 0 rgb(0 0 0 / 10%);
    transition: width 0.3s ease;

    &.is-pc {
      box-shadow: 0 0 20px 0 rgb(0 0 0 / 8%);
      width: calc(100% - 40px) !important;
      max-width: 1200px;
    }

    .phone-head {
      width: 100%;
      height: 26px;
      background-color: #f5f5f5;
      border-bottom: 1px solid #e5e5e5;
      background: url('@/assets/imgs/phone-head.png') no-repeat center / cover;
    }

    .phone-body {
      position: relative;
      min-height: 637px;
      background: #fff;
      overflow: hidden;

      .page-iframe {
        position: relative;
        z-index: 10;
        width: 100%;
        min-height: 637px;
      }

      .page-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        min-height: 637px;

        .page-layer-widget {
          position: relative;
          z-index: 99999;
          width: 100%;
          cursor: pointer;
        }
      }
    }

    .height-tag {
      position: absolute;
      top: 663px;
      left: -130px;
      width: 130px;
      height: 17px;
      color: #a2a2a2;
      text-align: left;
      border-bottom: 1px solid #dedede;

      span {
        font-size: 12px;
      }
    }
  }
}

/* 子槽位覆盖层 */
.nested-slot-layer {
  box-sizing: border-box;
  border: 1px dashed transparent;
  transition: border-color 0.2s;

  &:hover {
    border-color: #91caff;
  }
}

.nested-slot-draggable {
  width: 100%;
  box-sizing: border-box;
}

.nested-child-widget {
  width: 100%;
  z-index: 100;
  cursor: pointer;
}

/* 拖拽到画布时的样式 */
.drag-area {
  .draggable-ghost {
    display: flex;
    width: 100%;
    height: 40px;
    background: linear-gradient(
      45deg,
      #91a8d5 0,
      #91a8d5 10%,
      #94b4eb 10%,
      #94b4eb 50%,
      #91a8d5 50%,
      #91a8d5 60%,
      #94b4eb 60%,
      #94b4eb
    );
    background-size: 1rem 1rem;
    transition: all 0.5s;
    justify-content: center;
    align-items: center;

    span {
      display: inline-block;
      width: 140px;
      height: 25px;
      font-size: 12px;
      line-height: 25px;
      color: #fff;
      text-align: center;
      background: #5487df;
    }

    .component {
      display: none;
    }

    .drag-placement {
      display: block;
    }
  }
}
</style>
