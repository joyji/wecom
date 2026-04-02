<!--
 * @Description: 属性面板 - 右侧设置区域
 * 参考 pc-micro-base right/index.vue
-->
<script lang="ts" setup>
import { DArrowLeft, DArrowRight, Delete } from '@element-plus/icons-vue'
import LcEditorSetter from '@/components/LowcodeEditor/components/Setter/index.vue'
import { useLcProjectStore } from '@/store/modules/lcProject'

defineOptions({ name: 'LcEditorAttributes' })
const lcEditor = inject('lcEditor') as any
const lcProjectStore = useLcProjectStore()

const isOpen = ref(true)
const activeName = ref('props')

const curWidget = computed(() => lcEditor.curWidget)

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
  // 通过 postMessage 通知 simulator 执行删除，保持数据流一致
  const iframeEl = lcEditor.h5Iframe as HTMLIFrameElement | null
  if (iframeEl?.contentWindow) {
    iframeEl.contentWindow.postMessage(
      JSON.stringify({ even: 'deleteWidget', params: { id } }),
      '*'
    )
  }
}
</script>

<template>
  <div class="lc-editor-right" :class="{ 'is-open': isOpen }">
    <div class="floating-action-btn" @click="isOpen = !isOpen">
      <DArrowRight v-if="isOpen" />
      <DArrowLeft v-else />
    </div>
    <div class="attrs">
      <el-tabs v-model="activeName" type="card" class="tabs">
        <!-- 属性面板 -->
        <el-tab-pane label="属性" name="props">
          <template v-if="curWidget">
            <div class="widget-header">
              <h3>{{ curWidget?.title }}</h3>
              <el-button type="danger" text size="small" :icon="Delete" @click="handleDeleteWidget">
                删除
              </el-button>
            </div>
            <lc-editor-setter :list="curWidget?.props" :id="curWidget?.id" />
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
        height: calc(100% - 80px);
        padding: 10px 15px;
        overflow-y: auto;

        .widget-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        h3 {
          margin-top: 0;
          margin-bottom: 0;
        }

        .el-form-item__label {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
