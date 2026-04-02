<!--
 * @Description: 预览/发布链接弹窗 - 展示各页面的 H5 访问链接和二维码
-->
<script lang="ts" setup>
import { Qrcode } from '@/components/Qrcode'

defineOptions({ name: 'PreviewPublishDialog' })

const props = defineProps<{
  modelValue: boolean
  mode: 'preview' | 'publish'
  projectKey: string
  pageList: Array<{ pageKey: string; name: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const message = useMessage()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val: boolean) => emit('update:modelValue', val)
})

const activeTab = ref(0)

const dialogTitle = computed(() => (props.mode === 'publish' ? '发布成功' : '草稿预览'))

const h5BaseUrl = import.meta.env.VITE_LC_H5_BASE_URL || 'http://localhost:5173'

const buildPageUrl = (pageKey: string) => {
  const base = `${h5BaseUrl}/#/pages/template/detail?projectKey=${props.projectKey}&pageKey=${pageKey}`
  return props.mode === 'preview' ? `${base}&preview=1` : base
}

const handleCopy = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url)
    message.success('链接已复制')
  } catch {
    // fallback
    const input = document.createElement('input')
    input.value = url
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    message.success('链接已复制')
  }
}

const handleOpen = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="520px"
    append-to-body
    destroy-on-close
  >
    <div class="preview-dialog-content">
      <div class="mode-tag-wrap">
        <el-tag v-if="mode === 'publish'" type="success" size="small">已发布</el-tag>
        <el-tag v-else type="warning" size="small">草稿预览</el-tag>
        <span class="mode-hint">
          {{ mode === 'publish' ? '以下链接指向已发布的正式页面' : '以下链接指向当前保存的草稿内容' }}
        </span>
      </div>

      <!-- 多页面: tabs -->
      <el-tabs v-if="pageList.length > 1" v-model="activeTab" class="page-tabs">
        <el-tab-pane
          v-for="(page, index) in pageList"
          :key="page.pageKey || index"
          :label="page.name"
          :name="index"
        >
          <div class="page-preview-card">
            <div class="qrcode-section">
              <div class="section-label">手机扫码访问</div>
              <Qrcode :text="buildPageUrl(page.pageKey)" :width="180" />
            </div>
            <div class="link-section">
              <div class="section-label">PC端链接</div>
              <el-input :model-value="buildPageUrl(page.pageKey)" readonly size="small" />
              <div class="link-actions">
                <el-button size="small" @click="handleCopy(buildPageUrl(page.pageKey))">
                  复制链接
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="handleOpen(buildPageUrl(page.pageKey))"
                >
                  打开
                </el-button>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <!-- 单页面: 直接展示 -->
      <div v-else-if="pageList.length === 1" class="page-preview-card">
        <div class="qrcode-section">
          <div class="section-label">手机扫码访问</div>
          <Qrcode :text="buildPageUrl(pageList[0].pageKey)" :width="180" />
        </div>
        <div class="link-section">
          <div class="section-label">PC端链接</div>
          <el-input :model-value="buildPageUrl(pageList[0].pageKey)" readonly size="small" />
          <div class="link-actions">
            <el-button size="small" @click="handleCopy(buildPageUrl(pageList[0].pageKey))">
              复制链接
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleOpen(buildPageUrl(pageList[0].pageKey))"
            >
              打开
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.preview-dialog-content {
  .mode-tag-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .mode-hint {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .page-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 12px;
    }
  }

  .page-preview-card {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .qrcode-section {
    flex-shrink: 0;
    text-align: center;

    .section-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }
  }

  .link-section {
    flex: 1;
    min-width: 0;

    .section-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
      margin-bottom: 8px;
    }

    .link-actions {
      margin-top: 8px;
      display: flex;
      gap: 8px;
    }
  }
}
</style>
