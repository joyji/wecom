<!--
 * @Description: 属性面板 - 右侧设置区域
 * 包含：组件属性（基础属性/事件/校验）、组件样式、页面设置
-->
<script lang="ts" setup>
import { DArrowLeft, DArrowRight, Delete } from '@element-plus/icons-vue'
import LcEditorSetter from '@/components/LowcodeEditor/components/Setter/index.vue'
import LcEditorStyleSetter from '@/components/LowcodeEditor/components/Setter/StyleSetter/index.vue'
import { useLcProjectStore } from '@/store/modules/lcProject'

defineOptions({ name: 'LcEditorAttributes' })
const lcEditor = inject('lcEditor') as any
const lcProjectStore = useLcProjectStore()

const isOpen = ref(true)
// 外层 Tab：props-panel=属性配置，page=页面设置
const activeName = ref('props-panel')
// 内层属性 Tab：props=基础属性，style=组件样式，event=事件，validate=校验
const attrTab = ref('props')

const curWidget = computed(() => lcEditor.curWidget)

// 切换组件时重置内层 Tab 到"基础属性"
watch(
  () => curWidget.value?.id,
  () => {
    attrTab.value = 'props'
  }
)

// 页面设置
const curPageName = ref('')
curPageName.value = lcEditor?.curPage?.name || ''

watch(
  () => lcEditor?.curPage?.name,
  (val: string) => {
    curPageName.value = val || ''
  }
)

watch(
  () => curPageName.value,
  (val) => {
    lcProjectStore.setCurPageContent({ name: val })
  }
)

// 页面背景色
const bgColor = ref('')
bgColor.value = lcEditor?.curPage?.configure?.backgroundColor || ''

watch(
  () => lcEditor?.curPage?.configure?.backgroundColor,
  (val: string) => {
    bgColor.value = val || ''
  }
)

watch(
  () => bgColor.value,
  (val) => {
    const configure = { ...(lcEditor?.curPage?.configure || {}), backgroundColor: val }
    lcProjectStore.setCurPageContent({ configure })
  }
)

// 页面高度设置
const heightMode = ref<'auto' | 'fixed'>('auto')
const pageHeight = ref(667)
heightMode.value = lcEditor?.curPage?.configure?.heightMode || 'auto'
pageHeight.value = lcEditor?.curPage?.configure?.height || 667

watch(
  () => lcEditor?.curPage?.configure?.heightMode,
  (val: string) => {
    heightMode.value = (val as 'auto' | 'fixed') || 'auto'
  }
)

watch(
  () => lcEditor?.curPage?.configure?.height,
  (val: number) => {
    pageHeight.value = val || 667
  }
)

watch(
  () => heightMode.value,
  (val) => {
    const configure = { ...(lcEditor?.curPage?.configure || {}), heightMode: val }
    lcProjectStore.setCurPageContent({ configure })
  }
)

watch(
  () => pageHeight.value,
  (val) => {
    if (heightMode.value !== 'fixed') return
    const configure = { ...(lcEditor?.curPage?.configure || {}), height: val }
    lcProjectStore.setCurPageContent({ configure })
  }
)

// 删除当前选中组件
const handleDeleteWidget = () => {
  if (!curWidget.value) return
  const id = curWidget.value.id
  const iframeEl = lcEditor.h5Iframe as HTMLIFrameElement | null
  if (iframeEl?.contentWindow) {
    iframeEl.contentWindow.postMessage(
      JSON.stringify({ even: 'deleteWidget', params: { id } }),
      '*'
    )
  }
}

// 当前组件是否为表单组件（有 validate 分组的 props 即认为是表单组件）
const isFormWidget = computed(() => {
  return curWidget.value?.props?.some((p: any) => p.group === 'validate')
})

// 当前组件是否有事件配置
const hasEventProps = computed(() => {
  return curWidget.value?.props?.some((p: any) => p.group === 'event')
})
</script>

<template>
  <div class="lc-editor-right" :class="{ 'is-open': isOpen }">
    <div class="floating-action-btn" @click="isOpen = !isOpen">
      <DArrowRight v-if="isOpen" />
      <DArrowLeft v-else />
    </div>
    <div class="attrs">
      <el-tabs v-model="activeName" type="card" class="tabs">
        <!-- 属性配置面板 -->
        <el-tab-pane label="属性配置" name="props-panel">
          <template v-if="curWidget">
            <div class="widget-header">
              <h3>{{ curWidget?.title }}</h3>
              <el-button type="danger" text size="small" :icon="Delete" @click="handleDeleteWidget">
                删除
              </el-button>
            </div>

            <!-- 属性分类 Tab -->
            <el-tabs v-model="attrTab" class="attr-tabs">
              <el-tab-pane label="基础属性" name="props">
                <lc-editor-setter :list="curWidget?.props" :id="curWidget?.id" group="props" />
              </el-tab-pane>

              <el-tab-pane label="组件样式" name="style">
                <lc-editor-style-setter :widget="curWidget" />
              </el-tab-pane>

              <el-tab-pane v-if="hasEventProps" label="事件" name="event">
                <lc-editor-setter :list="curWidget?.props" :id="curWidget?.id" group="event" />
              </el-tab-pane>

              <el-tab-pane v-if="isFormWidget" label="校验" name="validate">
                <lc-editor-setter :list="curWidget?.props" :id="curWidget?.id" group="validate" />
              </el-tab-pane>
            </el-tabs>
          </template>
          <template v-else>
            <el-empty description="请选择组件" :image-size="80" />
          </template>
        </el-tab-pane>

        <!-- 页面设置 -->
        <el-tab-pane label="页面设置" name="page">
          <div class="flex pb-10px items-center">
            <div class="w-80px font-size-13px c-gray">页面ID</div>
            <div class="flex-1">{{ lcEditor?.curPage?.id || lcEditor?.curPage?.pageKey }}</div>
          </div>
          <div class="flex pb-10px items-center">
            <div class="w-80px font-size-13px c-gray">页面名称</div>
            <div class="flex-1">
              <el-input v-model="curPageName" placeholder="请输入页面名称" size="small" />
            </div>
          </div>
          <div class="flex pb-10px items-center">
            <div class="w-80px font-size-13px c-gray">背景颜色</div>
            <div class="flex-1">
              <el-color-picker v-model="bgColor" size="small" />
            </div>
          </div>
          <div class="flex pb-10px items-center">
            <div class="w-80px font-size-13px c-gray">页面高度</div>
            <div class="flex-1">
              <el-radio-group v-model="heightMode" size="small">
                <el-radio-button value="auto">自动</el-radio-button>
                <el-radio-button value="fixed">固定</el-radio-button>
              </el-radio-group>
            </div>
          </div>
          <div v-if="heightMode === 'fixed'" class="flex pb-10px items-center">
            <div class="w-80px font-size-13px c-gray">高度(px)</div>
            <div class="flex-1">
              <el-input-number v-model="pageHeight" :min="300" :max="2000" :step="10" size="small" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lc-editor-right {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  width: 360px;
  background-color: white;
  transform: translateX(100%);
  transition: transform 0.5s ease-in-out;
  contain: layout;

  &.is-open {
    transform: translateX(0);
  }

  .floating-action-btn {
    position: absolute;
    top: 50%;
    left: 0;
    display: flex;
    width: 20px;
    height: 80px;
    cursor: pointer;
    background: #fff;
    transform: translateX(-20px);
    justify-content: center;
    align-items: center;
    border-radius: 16px 0 0 16px;
    box-shadow: -2px 0 8px rgb(0 0 0 / 10%);
  }

  .attrs {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow-y: hidden;
    background-color: white;

    .tabs {
      height: 100%;

      :deep(.el-tabs__content) {
        height: calc(100% - 42px);
        padding: 10px 12px;
        overflow-y: auto;

        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        h3 {
          margin-top: 0;
          margin-bottom: 0;
          font-size: 14px;
        }
      }
    }

    .attr-tabs {
      :deep(.el-tabs__header) {
        margin-bottom: 8px;
      }

      :deep(.el-tabs__nav-wrap) {
        &::after {
          height: 1px;
        }
      }

      :deep(.el-tabs__item) {
        font-size: 12px;
        padding: 0 10px;
        height: 32px;
        line-height: 32px;
      }

      :deep(.el-tabs__content) {
        height: auto;
        padding: 8px 0 0 0;
        overflow-y: visible;
      }
    }
  }
}
</style>
