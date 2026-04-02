<!--
 * @Description: ImageSetter - 图片 URL 设置器
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
import { useUpload } from '@/components/UploadFile/src/useUpload'

defineOptions({ name: 'LcEditorImageSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any

const { uploadUrl, httpRequest } = useUpload()

// 默认外网上传（imgType: 2），与 FileForm 保持一致
const uploadData = { imgType: 2 }

/** 上传成功回调，将返回的图片 URL 赋值给 value */
const handleUploadSuccess = (response: any) => {
  // 后端上传返回 { code: 0, data: url }
  const url = response?.data
  if (url) {
    value.value = url
  }
}

/** 上传错误提示 */
const handleUploadError = () => {
  ElMessage.error('图片上传失败，请重试！')
}
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <el-upload
      :action="uploadUrl"
      :auto-upload="true"
      :limit="1"
      :data="uploadData"
      :http-request="httpRequest"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :show-file-list="false"
      accept=".jpg,.jpeg,.png,.gif,.webp"
    >
      <el-image
        v-if="value"
        :src="value"
        style="width: 100%; max-height: 120px; display: block; cursor: pointer"
        fit="contain"
      />
      <div
        v-else
        style="
          width: 100%;
          height: 80px;
          border: 1px dashed #d9d9d9;
          border-radius: 4px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #999;
          font-size: 12px;
        "
      >
        <Icon icon="ep:picture" :size="20" class="mb-4px" />
        点击上传
      </div>
    </el-upload>
  </lc-editor-setter-item>
</template>
