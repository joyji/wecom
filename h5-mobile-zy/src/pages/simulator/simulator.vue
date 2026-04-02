<!--
 * @Description: 低代码模拟器页面
 * 作为 iframe 嵌入到 pc-mobile-zy 编辑器中
 * 参考 mobile-biz-lease simulator.vue
-->
<template>
  <view class="simulator" :style="simulatorStyle">
    <draggable :list="list" :disabled="!enabled" class="list-group" ghost-class="ghost" @start="dragging = true"
      @end="dragging = false" @change="handleChange">
      <template #item="{ element, index }">
        <view class="widget-shape" :class="{ active: curWidgetId === element.id }" @click="setCurWidgetId(element.id)">
          <!-- 选中时的操作工具栏 -->
          <view v-if="curWidgetId === element.id" class="widget-toolbar" @click.stop>
            <!-- <text class="toolbar-label">{{ element.title || element.componentName }}</text> -->
            <view class="toolbar-btn toolbar-btn--delete" @click="deleteWidget(element.id)">
              <uni-icons type="a-shanchu_delete2" color="#ffffff" :size="16" />
            </view>
          </view>
          <component :ref="($event) => setItemRef($event, element.id)" :is="element.componentName" :key="index"
            :configure="element.configure" :id="element.id" :data="element.propsMap || {}" :edit="true" />
        </view>
      </template>
    </draggable>

    <view v-if="list.length === 0" class="empty-tip">
      <text class="empty-text">从左侧拖拽组件到此处</text>
    </view>
  </view>
</template>

<script>
// 注册所有运行时组件
import { components } from '@/components/lowcode-render/index.js'
export default {
  components: { ...components }
}
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import draggable from 'vuedraggable'
import { debounce } from 'lodash'

const curWidgetId = ref('')
const list = ref([])
const enabled = ref(true)
const dragging = ref(false)
const platformMode = ref('mobile')
const pageConfig = ref({})

// 页面配置动态样式（背景色、高度）
const simulatorStyle = computed(() => {
  const style = {}
  if (pageConfig.value.backgroundColor) {
    style.backgroundColor = pageConfig.value.backgroundColor
  }
  if (pageConfig.value.heightMode === 'fixed' && pageConfig.value.height) {
    style.height = pageConfig.value.height + 'px'
    style.minHeight = 'unset'
    style.overflow = 'auto'
  }
  return style
})

// 接收来自编辑器（父窗口）的消息
const getMessage = () => {
  window.addEventListener('message', messageHandler)
}

const messageHandler = (e) => {
  if (e.source !== window.parent) return
  if (!e.data) return

  const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
  const { even, params } = data

  if (even === 'init') init(params)
  if (even === 'list') list.value = params
  if (even === 'drop') addWidget(params)
  if (even === 'changeCurrWidget') setCurWidgetId(params.id)
  if (even === 'platform') platformMode.value = params.mode
  if (even === 'deleteWidget') deleteWidget(params.id)
  if (even === 'pageConfig') pageConfig.value = params || {}
}

onMounted(() => {
  getMessage()
  listeningDom()
})

onUnmounted(() => {
  window.removeEventListener('message', messageHandler)
})

// 初始化项目配置
const init = (params) => {
  // 可在此处存储项目配置
}

// 动态 ref 管理
const compRefs = ref({})
const setItemRef = (el, id) => {
  if (el) {
    compRefs.value[`ref_${id}`] = el
  }
}

// 监听 DOM 变化，同步组件高度给编辑器
const instance = getCurrentInstance()
const listeningDom = () => {
  const MutationObserver =
    window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver
  new MutationObserver(debounce(messageHeight, 100)).observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true
  })
}

// 计算并发送组件高度
const messageHeight = () => {
  list.value?.forEach((item) => {
    const ele = document.getElementById(item.id)
    if (ele) {
      const { marginTop, marginBottom } = window.getComputedStyle(ele)
      const rect = ele.getBoundingClientRect()
      item.height = parseFloat(marginTop) + parseFloat(marginBottom) + rect.height + 2
    }
  })
  const data = JSON.stringify({ type: 'setHeight', params: list.value })
  window.parent.postMessage(data, '*')
}

// 新增组件
const addWidget = (params) => {
  const { element, newIndex } = params
  if (newIndex >= 0 && element) {
    list.value.splice(newIndex, 0, element)
  } else if (element) {
    list.value.push(element)
  }
  setList()
}

// 拖拽排序变更
const handleChange = (dragEvent) => {
  if (dragEvent.moved) {
    setList()
  }
}

// 通知父窗口组件列表变更
const setList = () => {
  const data = JSON.stringify({
    type: 'setList',
    params: { list: list.value }
  })
  window.parent.postMessage(data, '*')
}

// 设置选中组件并通知父窗口
const setCurWidgetId = (id) => {
  curWidgetId.value = id
  const data = JSON.stringify({ type: 'setCurrWidget', params: { id } })
  window.parent.postMessage(data, '*')
}

// 删除组件并通知父窗口
const deleteWidget = (id) => {
  const idx = list.value.findIndex((item) => item.id === id)
  if (idx === -1) return
  list.value.splice(idx, 1)
  curWidgetId.value = ''
  setList()
  // 通知父窗口清除选中
  const clearData = JSON.stringify({ type: 'setCurrWidget', params: { id: '' } })
  window.parent.postMessage(clearData, '*')
}
</script>

<style>
/* 重置页面默认样式 */
page {
  margin: 0;
  padding: 0;
  height: auto;
}

.simulator {
  min-height: 100px;
  background: #fff;
}

.list-group {
  min-height: 100px;
}

.widget-shape {
  position: relative;
  cursor: pointer;
}

.widget-shape::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 99;
}

.widget-shape:hover::after {
  outline: 1px dashed #1677ff;
  outline-offset: -1px;
}

.widget-shape.active::after {
  outline: 1px solid #1677ff;
  outline-offset: -1px;
}

/* 选中组件的操作工具栏 */
.widget-toolbar {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  height: 26px;
  padding: 0 4px;
  background: #ff2e2e;
  border-radius: 4px 4px 0 0;
  white-space: nowrap;
  gap: 4px;
}

.toolbar-label {
  font-size: 12px;
  color: #fff;
  line-height: 26px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  cursor: pointer;
}

.toolbar-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.ghost {
  opacity: 0.5;
  background: #e3f2fd;
}

.empty-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.empty-text {
  color: #999;
  font-size: 14px;
}
</style>
