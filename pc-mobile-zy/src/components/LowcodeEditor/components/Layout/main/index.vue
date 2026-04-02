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
// TODO: 替换为实际的 h5-mobile-zy 地址，可通过环境变量配置
const iframeUrl = `${import.meta.env.VITE_LC_H5_BASE_URL}/#/pages/simulator/simulator`

// 画布宽度根据平台模式切换
const canvasWidth = computed(() => lcProjectStore.canvasWidth)
const platformMode = computed(() => lcProjectStore.platformMode)

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
// 平台切换期间跳过自动同步，由平台切换 watcher 统一处理
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
    // 清除选中组件
    lcEditor.curWidget = null
    lcProjectStore.setcurComponent(null)
    // 通知 simulator 取消选中
    iframe.value?.contentWindow?.postMessage(
      JSON.stringify({ even: 'changeCurrWidget', params: { id: '' } }), '*'
    )
    // 清除旧平台的覆盖层数据，避免残留
    widgetInfoList.value = []
    iframeHeight.value = 667
    messagePlatform(val)
    // 平台切换完成，清除标志并发送新平台的组件列表和页面配置
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

// 同步组件高度
const setHeight = (params: any[]) => {
  widgetInfoList.value = params
  iframeHeight.value = params.reduce((a: number, b: any) => a + (b.height || 0), 0)
  if (iframeHeight.value < 667) iframeHeight.value = 667
}

// iframe 内组件列表变化（拖拽排序），同步更新
// 从编辑器原始数据中恢复 props 数组（simulator 回传的数据只有 propsMap）
const setList = (params: any) => {
  const { list } = params
  if (lcEditor.curPage) {
    const oldList = lcEditor.curPage.componentList
    const newList = list.map((item: any) => {
      const original = oldList.find((o: any) => o.id === item.id)
      if (original?.props) {
        return { ...item, props: original.props }
      }
      return item
    })
    lcEditor.curPage.componentList = newList
  }
}

// 设置选中组件
const setCurrWidget = (params: any) => {
  const { id } = params
  if (lcEditor.curPage) {
    lcEditor.curWidget = lcEditor.curPage.componentList.find(
      (item: any) => id === item.id
    )
    lcProjectStore.setcurComponent(lcEditor.curWidget)
  }
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

// 发送组件列表消息 - 实时将 props 转换为 propsMap 供 simulator 渲染
const messageList = () => {
  if (lcEditor.curPage) {
    const list = lcEditor.curPage.componentList.map((item: any) => ({
      ...item,
      propsMap: item.props ? buildPropsMap(item.props) : (item.propsMap || {})
    }))
    const data = {
      even: 'list',
      params: list
    }
    iframe.value?.contentWindow?.postMessage(JSON.stringify(data), '*')
  }
}

// 发送页面配置消息（背景色、高度等）
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

// 组件变动（拖拽）
const handleComponentChange = (dragEvent: any) => {
  if (dragEvent.added) {
    const { element, newIndex } = dragEvent.added
    lcEditor.dragWidget = element

    iframe.value?.contentWindow?.postMessage(
      JSON.parse(
        JSON.stringify({
          even: 'drop',
          params: {
            element: lcEditor.dragWidget,
            newIndex
          }
        })
      ),
      '*'
    )
  } else if (dragEvent.moved) {
    // 拖拽排序 - 通过 messageList 同步新顺序即可
    messageList()
  }

  lcEditor.dragstatus = false
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

          <!-- 拖拽蒙层（拖拽时覆盖在 iframe 上） -->
          <draggable
            class="page-layer drag-area"
            :style="{
              height: iframeHeight + 'px',
              zIndex: dragStatus ? '20' : '1'
            }"
            v-model="widgetInfoList"
            item-key="id"
            :animation="200"
            filter=".component-toolbar"
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
              ></div>
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

  // 可滚动画布区域，占据剩余空间
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
      // PC 模式宽度自适应容器，最大 1200px
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
