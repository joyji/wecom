<template>
  <el-card shadow="hover" class="mb-15px">
    <div class="flex justify-between">
      <div class="flex items-center">
        <el-form
          ref="queryFormRef"
          :model="queryParams"
          :inline="true"
          class="-mb-15px"
          label-width="68px"
        >
          <el-form-item label="应用名称" prop="name">
            <el-input
              v-model="queryParams.name"
              placeholder="请输入应用名称"
              clearable
              @keydown.enter="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="getList">
              <Icon icon="ep:search" class="mr-1" />搜索
            </el-button>
            <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-1" />重置 </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </el-card>

  <el-card shadow="hover">
    <el-row :gutter="10" class="mb-10px">
      <el-col :span="1.5">
        <el-button
          v-hasPermi="['system:menu:create']"
          plain
          type="primary"
          @click="openAgentForm()"
        >
          <Icon class="mr-5px" icon="ep:plus" />
          新增
        </el-button>
      </el-col>
    </el-row>
    <el-table v-loading="loading" :data="list" stripe border highlight-current-row>
      <el-table-column label="应用ID" prop="agentId" min-width="80" />
      <el-table-column label="应用名称" prop="name" min-width="120" />
      <el-table-column label="图标" min-width="80">
        <template #default="{ row }">
          <Icon :icon="row.icon" />
        </template>
      </el-table-column>
      <el-table-column label="描述" prop="description" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'success' : 'danger'">
            {{ row.status === 0 ? '已启用' : '已禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" min-width="250">
        <template #default="{ row }">
          <el-button type="primary" link @click="openAgentForm(row)">
            <Icon icon="ep:edit" />修改
          </el-button>
          <el-button type="primary" link @click="handleDetail(row)">
            <Icon icon="ep:view" />详情
          </el-button>
          <el-button type="primary" link @click="handleWorkbenchData(row)">
            <Icon icon="ep:data-line" />工作台数据
          </el-button>
          <el-button type="primary" link @click="handleBatchSet(row)">
            <Icon icon="ep:setting" />批量设置
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            <Icon icon="ep:delete" />删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </el-card>

  <!-- 应用表单 -->
  <el-dialog
    :title="formTitle"
    v-model="formDialogVisible"
    width="600px"
    append-to-body
    destroy-on-close
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
      <el-form-item label="应用ID" prop="agentId">
        <el-input v-model="formData.agentId" placeholder="请输入应用id" />
      </el-form-item>
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="应用图标">
        <IconSelect v-model="formData.icon" clearable />
      </el-form-item>
      <el-form-item label="应用描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入应用描述"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="首页地址" prop="homeUrl">
        <el-input v-model="formData.homeUrl" placeholder="请输入首页地址" />
      </el-form-item>
      <el-form-item label="重定向域名" prop="redirectDomain">
        <el-input v-model="formData.redirectDomain" placeholder="请输入重定向域名" />
      </el-form-item>
      <!-- <el-form-item label="可见范围" prop="visibilityScope">
        <el-select
          v-model="formData.visibilityScope"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入用户名搜索"
          :remote-method="remoteSearchUsers"
          :loading="userLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.userid"
            :label="item.name"
            :value="item.userid"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="应用状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="0">启用</el-radio>
          <el-radio :label="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="formDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>

  <!-- 应用详情 -->
  <el-dialog title="应用详情" v-model="detailDialogVisible" width="800px" append-to-body>
    <el-descriptions border :column="1" size="large">
      <el-descriptions-item label="应用ID">{{ detailData.agentId }}</el-descriptions-item>
      <el-descriptions-item label="应用名称">{{ detailData.name }}</el-descriptions-item>
      <el-descriptions-item label="应用描述">{{ detailData.description }}</el-descriptions-item>
      <el-descriptions-item label="应用图标">
        <el-image v-if="detailData.icon" :src="detailData.icon" style="width: 80px; height: 80px" />
        <span v-else>无</span>
      </el-descriptions-item>
      <el-descriptions-item label="首页地址">{{ detailData.homeUrl }}</el-descriptions-item>
      <el-descriptions-item label="重定向域名">{{
        detailData.redirectDomain
      }}</el-descriptions-item>
      <el-descriptions-item label="应用状态">
        <el-tag :type="detailData.status === 0 ? 'success' : 'danger'">
          {{ detailData.status === 0 ? '已启用' : '已禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="可见范围(用户)">
        <el-tag
          v-for="(user, index) in detailData.allow_userinfos?.user"
          :key="index"
          class="mr-1 mb-1"
        >
          {{ user.userid }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="可见范围(部门)">
        <el-tag
          v-for="(party, index) in detailData.allow_partys?.partyid"
          :key="index"
          class="mr-1 mb-1"
        >
          {{ party }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
  </el-dialog>

  <!-- 工作台数据 -->
  <el-dialog title="工作台数据" v-model="workbenchDialogVisible" width="600px" append-to-body>
    <el-form ref="workbenchFormRef" :model="workbenchForm" label-width="100px">
      <el-form-item label="用户ID" required>
        <el-input v-model="workbenchForm.userid" placeholder="请输入用户ID" />
      </el-form-item>
      <el-form-item label="URL" disabled>
        <el-input disabled type="textarea" v-model="workbenchForm.webview.url" placeholder="URL" />
      </el-form-item>
      <!--   <el-form-item label="类型" required>
        <el-radio-group v-model="workbenchForm.type">
          <el-radio label="webview">网页</el-radio>
        </el-radio-group>
      </el-form-item> -->

      <!-- <template v-if="workbenchForm.type === 'webview'"> -->
      <!-- <template>
        <el-form-item label="URL" disabled>
          <el-input v-model="workbenchForm.webview.url" placeholder="请输入URL" />
        </el-form-item> -->
      <!--  <el-form-item label="隐藏标题">
          <el-switch v-model="workbenchForm.webview.hide_title" />
        </el-form-item>
        <el-form-item label="启用点击">
          <el-switch v-model="workbenchForm.webview.enable_webview_click" />
        </el-form-item> -->
      <!-- </template> -->
    </el-form>
    <template #footer>
      <el-button @click="workbenchDialogVisible = false">取消</el-button>
      <!--  <el-button type="primary" @click="getWorkbenchData">查看数据</el-button> -->
      <el-button type="primary" @click="setWorkbenchData">查看设置数据</el-button>
    </template>
  </el-dialog>

  <!-- 批量设置工作台 -->
  <el-dialog title="批量设置工作台" v-model="batchDialogVisible" width="700px" append-to-body>
    <el-form ref="batchFormRef" :model="batchForm" label-width="100px">
      <el-form-item label="用户列表" required>
        <el-select
          v-model="batchForm.userids"
          multiple
          filterable
          remote
          reserve-keyword
          placeholder="请输入用户名搜索"
          :loading="userLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in userOptions"
            :key="item.userid"
            :label="item.userid"
            :value="item.userid"
          />
        </el-select>
      </el-form-item>

      <!--  <el-form-item label="类型" required>
        <el-radio-group v-model="batchForm.type">
          <el-radio label="webview">网页</el-radio>
        </el-radio-group>
      </el-form-item>-->

      <template v-if="batchForm.type === 'webview'">
        <el-form-item label="URL" required>
          <el-input v-model="batchForm.webview.url" placeholder="请输入URL" />
        </el-form-item>
        <!--  <el-form-item label="隐藏标题">
          <el-switch v-model="batchForm.webview.hide_title" />
        </el-form-item>
        <el-form-item label="启用点击">
          <el-switch v-model="batchForm.webview.enable_webview_click" />
        </el-form-item>-->
      </template>
    </el-form>
    <template #footer>
      <el-button @click="batchDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="batchSetWorkbenchData">批量设置</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as AgentApi from '@/api/mini/agent'

// 定义接口类型
interface AgentInfo {
  id: string
  agentId: string
  name: string
  icon?: string
  description: string
  allow_userinfos?: {
    user: { userid: string }[]
  }
  allow_partys?: {
    partyid: number[]
  }
  status: number
  redirectDomain?: string
  homeUrl?: string
}

interface WorkbenchForm {
  agentId: string
  userid: string
  type: string
  webview: {
    url: string
    hide_title: boolean
    enable_webview_click: boolean
  }
}

interface BatchForm extends Omit<WorkbenchForm, 'userid'> {
  userids: string[]
}

interface UserOption {
  userid: string
  name: string
}

// 列表数据
const list = ref<AgentInfo[]>([])
const loading = ref(false)
const total = ref(0)
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

// 表单数据
const formRef = ref()
const formDialogVisible = ref(false)
const formTitle = ref('')
const formData = reactive<AgentInfo>({
  agentId: '',
  name: '',
  description: '',
  status: 0,
  homeUrl: '',
  icon: '',
  id: '',
  allow_userinfos: { user: [] }
})
const formRules = {
  agentId: [{ required: true, message: '请输入应用ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
}

// 工作台数据
const workbenchFormRef = ref()
const workbenchDialogVisible = ref(false)
const workbenchForm = reactive<WorkbenchForm>({
  agentId: '',
  userid: '',
  type: 'webview',
  webview: {
    url: '',
    hide_title: true,
    enable_webview_click: true
  }
})

// 批量设置工作台
const batchFormRef = ref()
const batchDialogVisible = ref(false)
const batchForm = reactive<BatchForm>({
  agentId: '',
  userids: [],
  type: 'webview',
  webview: {
    url: '',
    hide_title: true,
    enable_webview_click: true
  }
})

// 详情数据
const detailDialogVisible = ref(false)
const detailData = ref<AgentInfo>({} as AgentInfo)

// 用户搜索
const userLoading = ref(false)
const userOptions = ref<UserOption[]>([])
const visibilityScope = computed(() => {
  return formData.allow_userinfos?.user?.map((item) => item.userid) || []
})
watch(
  () => formDialogVisible.value,
  (newVal) => {
    if (!newVal) {
      // 当对话框关闭时重置表单数据
      formData.value = {
        agentId: '',
        name: '',
        description: '',
        status: 0,
        homeUrl: '',
        icon: '',
        id: ''
      }
    }
  }
)
// 初始化
onMounted(() => {
  getList()
})
/** 搜索按钮操作 */
const handleQuery = (event) => {
  event.preventDefault()
  queryParams.pageNo = 1
  getList()
}
// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const data = await AgentApi.getApplicationList(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 重置查询
const resetQuery = () => {
  queryParams.name = ''
  getList()
}

// 打开应用表单
const openAgentForm = (row?: AgentInfo) => {
  formDialogVisible.value = true
  if (row) {
    formTitle.value = '修改应用'
    // 克隆对象，避免直接修改列表数据
    const clonedRow = JSON.parse(JSON.stringify(row))
    Object.assign(formData, clonedRow)
  } else {
    formTitle.value = '新增应用'
    Object.assign(formData, {
      agentId: '',
      name: '',
      description: '',
      status: 0,
      homeUrl: ''
    })
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (formTitle.value === '修改应用') {
          await AgentApi.updateMenu(formData)
        } else {
          await AgentApi.createMenu(formData)
        }
        formDialogVisible.value = false
        ElMessage.success('操作成功')
        getList()
      } catch (error) {
        console.log('🚀 ~ awaitformRef.value.validate ~ error:', error)
      }
    }
  })
}

// 远程搜索用户
const remoteSearchUsers = async (query: string) => {
  userLoading.value = true
  const result = await AgentApi.getInfoApplicationList(batchForm.agentId)
  userOptions.value = result.allow_userinfos
  userLoading.value = false
  // 模拟API调用
}

// 查看详情
const handleDetail = async (row: AgentInfo) => {
  const result = await AgentApi.getInfoApplicationList(row.agentId)
  detailData.value = {
    ...row,
    allow_userinfos: result.allow_userinfos,
    allow_partys: result.allow_partys
  }
  detailDialogVisible.value = true
}

// 查看工作台数据
const handleWorkbenchData = (row: AgentInfo) => {
  workbenchForm.agentId = row.agentId
  workbenchForm.userid = '' // 默认值
  workbenchForm.type = 'webview'
  workbenchForm.webview = {
    url: '',
    hide_title: true,
    enable_webview_click: true
  }
  workbenchDialogVisible.value = true
}

// 获取工作台数据
const getWorkbenchData = async () => {
  // if (!workbenchForm.userid) {
  //   ElMessage.warning('请输入用户ID')
  //   return
  // }
  // // 模拟API调用
  // const result = await AgentApi.getWorkbenchDataByAgentId(parms)
  // if (result.errcode === 0) {
  //   workbenchForm.type = result.data.type
  //   if (result.data.webview) {
  //     workbenchForm.webview = { ...result.data.webview }
  //   }
  //   ElMessage.success('获取成功')
  // } else {
  //   ElMessage.error(result.errmsg)
  // }
}

// 设置工作台数据
const setWorkbenchData = async () => {
  try {
    if (!workbenchForm.userid) {
      ElMessage.warning('请填写必填项')
      return
    }
    let parms = {
      agentId: workbenchForm.agentId,
      userId: workbenchForm.userid
    }
    // {
    //     "agentId": "1000069",
    //     "userId":"jiying",
    //     "url": "https://gateway-in.dev.rosino.com/dev/biz-mit-gw/doc.html#/biz-mit-wecom/%E7%AE%A1%E7%90%86%E5%90%8E%E5%8F%B0%20-%20%E5%BA%94%E7%94%A8/saveApplication",
    //     "enableWebviewClick": true
    // }
    const res = await AgentApi.getWorkbenchDataByAgentId(parms)
    console.log('🚀 ~ setWorkbenchData ~ res.webview.url:', res.webview.url)
    workbenchForm.webview.url = res.webview.url
    // workbenchDialogVisible.value = false
    // resetQuery()
    ElMessage.success('查询成功')
  } catch (error) {
    console.log('🚀 ~ setWorkbenchData ~ error:', error)
  }
}

// 批量设置
const handleBatchSet = async (row: AgentInfo) => {
  batchForm.agentId = row.agentId
  batchForm.userids = []
  batchForm.type = 'webview'
  batchForm.webview = {
    url: '',
    hide_title: true,
    enable_webview_click: true
  }
  const result = await AgentApi.getInfoApplicationList(row.agentId)
  console.log('🚀 ~ handleBatchSet ~ result:', result)
  userOptions.value = result.allow_userinfos.user
  console.log('🚀 ~ handleBatchSet ~ userOptions.value:', userOptions.value)
  batchDialogVisible.value = true
}

// 批量设置工作台数据
const batchSetWorkbenchData = async () => {
  try {
    if (batchForm.userids.length === 0 || !batchForm.webview.url) {
      ElMessage.warning('请填写必填项')
      return
    }
    let parms = {
      agentId: batchForm.agentId,
      userIdList: batchForm.userids,
      url: batchForm.webview.url,
      enableWebviewClick: true
    }

    await AgentApi.batchSave(parms)
    resetQuery()
    batchDialogVisible.value = false
    ElMessage.success('设置成功')
  } catch (error) {
    console.log('🚀 ~ setWorkbenchData ~ error:', error)
  }
}

// 删除应用
const handleDelete = (row: AgentInfo) => {
  ElMessageBox.confirm(`确认删除应用"${row.name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      // 模拟API调用
      await AgentApi.deleteMenu(row.id)
      ElMessage.success('删除成功')
      getList()
    })
    .catch(() => {})
}
</script>
