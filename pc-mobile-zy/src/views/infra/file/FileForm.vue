<template>
  <Dialog v-model="dialogVisible" :title="fileForm.id ? '修改文件' : '上传文件'">
    <div class="mb-15px">
      访问类型：
      <el-radio-group v-model="fileForm.imgType" :style="{ width: '200px' }">
        <el-radio
          v-for="(item, index) in imgTypeList"
          :key="index"
          :value="item.value"
          :label="item.label"
        >
          {{ item.label }}
        </el-radio>
      </el-radio-group>
      项目：
      <el-select v-model="fileForm.bucketName" class="mr-2" :style="{ width: '200px' }">
        <el-option
          v-for="item in TIME_UNIT_TYPES"
          :key="item.bucketName"
          :label="item.name"
          :value="item.bucketName"
        />
      </el-select>
    </div>
    <el-upload
      ref="uploadRef"
      multiple
      v-model:file-list="fileList"
      :action="uploadUrl"
      :auto-upload="false"
      :data="data"
      :disabled="formLoading"
      :limit="100"
      :on-change="handleFileChange"
      :on-error="submitFormError"
      :on-exceed="handleExceed"
      :on-success="submitFormSuccess"
      :http-request="httpRequest"
      accept=".jpg, .png, .gif"
      drag
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text"> 将文件拖到此处，或 <em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip" style="color: red">
          提示：仅允许导入 jpg、png、gif 格式文件！
        </div>
      </template>
    </el-upload>
    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitFileForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { useUpload } from '@/components/UploadFile/src/useUpload'
import * as FileConfigApi from '@/api/infra/fileConfig'

defineOptions({ name: 'InfraFileForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中
const fileList = ref([]) // 文件列表
const data = ref({ path: '', imgType: '' })
const fileForm = ref({})
const uploadRef = ref()
const TIME_UNIT_TYPES = ref([])
const imgTypeList = ref([
  { label: '内网', value: 1 },
  { label: '外网', value: 2 }
])

const { uploadUrl, httpRequest } = useUpload()

const queryParams = reactive({
  pageNo: 1,
  pageSize: 100,
  name: undefined,
  storage: undefined,
  createTime: []
})
/** 查询列表 */
const getList = async () => {
  try {
    const data = await FileConfigApi.getFileConfigPage(queryParams)
    TIME_UNIT_TYPES.value = data.list
    console.log('🚀 ~ getList ~ TIME_UNIT_TYPES.value :', TIME_UNIT_TYPES.value)
  } finally {
  }
}
/** 打开弹窗 */
const open = async (obj?: any) => {
  getList().finally(() => {
    dialogVisible.value = true
    if (!obj.id) {
      resetForm()
      fileForm.value = { imgType: 1 }
    } else {
      let type = 1
      if (obj.path.startsWith('public/')) {
        type = 2
      }
      fileForm.value = { ...obj, imgType: type }
    }
  })
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 处理上传的文件发生变化 */
const handleFileChange = (file) => {
  data.value.path = file.name
  data.value.imgType = fileForm.value.imgType
  data.value.bucketName = fileForm.value.bucketName
}

/** 提交表单 */
const submitFileForm = () => {
  if (fileList.value.length == 0) {
    message.error('请上传文件')
    return
  }
  unref(uploadRef)?.submit()
}

/** 文件上传成功处理 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitFormSuccess = () => {
  // 清理
  dialogVisible.value = false
  formLoading.value = false
  unref(uploadRef)?.clearFiles()
  // 提示成功，并刷新
  message.success(t('common.createSuccess'))
  emit('success')
}

/** 上传错误提示 */
const submitFormError = (): void => {
  message.error('上传失败，请您重新上传！')
  formLoading.value = false
}

/** 重置表单 */
const resetForm = () => {
  // 重置上传状态和文件
  formLoading.value = false
  uploadRef.value?.clearFiles()
  fileForm.value = {}
}

/** 文件数超出提示 */
const handleExceed = (): void => {
  message.error('最多只能上传一个文件！')
}
</script>
