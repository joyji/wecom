<!--
 * @Description: ImageListSetter - 图片列表设置器（多图上传/删除/链接配置）
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'

defineOptions({ name: 'LcEditorImageListSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any

const { uploadUrl, httpRequest } = useUpload()
const uploadData = { imgType: 2 }

const maxCount = computed(() => item.value?.extraProps?.maxCount ?? 10)
const canAdd = computed(() => !value.value || value.value.length < maxCount.value)

const handleUploadSuccess = (response: any) => {
  const url = response?.data
  if (!url) return
  if (!Array.isArray(value.value)) {
    value.value = []
  }
  value.value = [...value.value, { src: url, link: '' }]
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败，请重试！')
}

const handleRemove = (index: number) => {
  if (!Array.isArray(value.value)) return
  const next = [...value.value]
  next.splice(index, 1)
  value.value = next
}

const handleLinkChange = (index: number, link: string) => {
  if (!Array.isArray(value.value)) return
  const next = [...value.value]
  next[index] = { ...next[index], link }
  value.value = next
}
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <div class="image-list-setter">
      <!-- 已上传图片列表 -->
      <div v-for="(img, index) in value" :key="index" class="image-row">
        <div class="image-preview">
          <el-image :src="img.src" fit="cover" class="thumb" />
          <div class="remove-btn" @click="handleRemove(index)">
            <Icon icon="ep:close" :size="10" />
          </div>
        </div>
        <div class="image-link">
          <el-input
            :model-value="img.link || ''"
            placeholder="跳转链接（选填）"
            size="small"
            @update:model-value="(val: string) => handleLinkChange(index, val)"
          />
        </div>
      </div>

      <!-- 添加按钮 -->
      <el-upload
        v-if="canAdd"
        :action="uploadUrl"
        :auto-upload="true"
        :data="uploadData"
        :http-request="httpRequest"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
        accept=".jpg,.jpeg,.png,.gif,.webp"
      >
        <div class="add-btn">
          <Icon icon="ep:plus" :size="18" />
        </div>
      </el-upload>
    </div>
  </lc-editor-setter-item>
</template>

<style scoped lang="scss">
.image-list-setter {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.image-preview {
  position: relative;
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);

  .thumb {
    width: 100%;
    height: 100%;
  }

  .remove-btn {
    position: absolute;
    top: 0;
    right: 0;
    width: 16px;
    height: 16px;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 0 0 0 4px;

    &:hover {
      background: var(--el-color-danger);
    }
  }
}

.image-link {
  flex: 1;
  min-width: 0;
  padding-top: 16px;
}

.add-btn {
  width: 60px;
  height: 60px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
  }
}
</style>
