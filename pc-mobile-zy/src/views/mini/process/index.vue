<template>
  <el-card>
    <div class="flex justify-between mb-4">
      <div class="flex items-center">
        <el-input
          v-model="queryParams.name"
          placeholder="应用名称"
          clearable
          @keyup.enter="getList"
          class="!w-200px mr-2"
        />
        <el-button type="primary" @click="getList">
          <Icon icon="ep:search" class="mr-1" />搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh-right" class="mr-1" />重置
        </el-button>
      </div>
      <div>
        <el-button type="primary" @click="openAgentForm()">
          <Icon icon="ep:plus" class="mr-1" />新增应用
        </el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="list" border>
      <el-table-column label="应用ID" prop="agentid" min-width="80" />
      <el-table-column label="应用名称" prop="name" min-width="120" />
      <el-table-column label="描述" prop="description" min-width="120" show-overflow-tooltip />
      <el-table-column label="状态" min-width="100">
        <template #default="{ row }">
          <el-tag :type="row.close === 0 ? 'success' : 'danger'">
            {{ row.close === 0 ? '已启用' : '已禁用' }}
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
      <el-form-item label="应用ID" prop="agentid">
        <el-input v-model="formData.agentid" placeholder="请输入应用id" />
      </el-form-item>
      <el-form-item label="应用名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入应用名称" />
      </el-form-item>
      <el-form-item label="应用描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          placeholder="请输入应用描述"
          :rows="3"
        />
      </el-form-item>
      <el-form-item label="首页地址" prop="home_url">
        <el-input v-model="formData.home_url" placeholder="请输入首页地址" />
      </el-form-item>
      <el-form-item label="可见范围" prop="allowUsers">
        <el-select
          v-model="formData.allowUsers"
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
      </el-form-item>
      <el-form-item label="应用状态" prop="close">
        <el-radio-group v-model="formData.close">
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
      <el-descriptions-item label="应用ID">{{ detailData.agentid }}</el-descriptions-item>
      <el-descriptions-item label="应用名称">{{ detailData.name }}</el-descriptions-item>
      <el-descriptions-item label="应用描述">{{ detailData.description }}</el-descriptions-item>
      <el-descriptions-item label="应用图标">
        <el-image
          v-if="detailData.square_logo_url"
          :src="detailData.square_logo_url"
          style="width: 80px; height: 80px"
        />
        <span v-else>无</span>
      </el-descriptions-item>
      <el-descriptions-item label="首页地址">{{ detailData.home_url }}</el-descriptions-item>
      <el-descriptions-item label="重定向域名">{{
        detailData.redirect_domain
      }}</el-descriptions-item>
      <el-descriptions-item label="应用状态">
        <el-tag :type="detailData.close === 0 ? 'success' : 'danger'">
          {{ detailData.close === 0 ? '已启用' : '已禁用' }}
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
      <el-form-item label="类型" required>
        <el-radio-group v-model="workbenchForm.type">
          <el-radio label="webview">网页</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="workbenchForm.type === 'webview'">
        <el-form-item label="URL" required>
          <el-input v-model="workbenchForm.webview.url" placeholder="请输入URL" />
        </el-form-item>
        <el-form-item label="隐藏标题">
          <el-switch v-model="workbenchForm.webview.hide_title" />
        </el-form-item>
        <el-form-item label="启用点击">
          <el-switch v-model="workbenchForm.webview.enable_webview_click" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="workbenchDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="getWorkbenchData">查看数据</el-button>
      <el-button type="primary" @click="setWorkbenchData">设置数据</el-button>
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
      </el-form-item>

      <el-form-item label="类型" required>
        <el-radio-group v-model="batchForm.type">
          <el-radio label="webview">网页</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="batchForm.type === 'webview'">
        <el-form-item label="URL" required>
          <el-input v-model="batchForm.webview.url" placeholder="请输入URL" />
        </el-form-item>
        <el-form-item label="隐藏标题">
          <el-switch v-model="batchForm.webview.hide_title" />
        </el-form-item>
        <el-form-item label="启用点击">
          <el-switch v-model="batchForm.webview.enable_webview_click" />
        </el-form-item>
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
import { agentInfo, agentData } from '@/mock/agent'

// 定义接口类型
interface AgentInfo {
  agentid: number
  name: string
  square_logo_url?: string
  description: string
  allow_userinfos?: {
    user: { userid: string }[]
  }
  allow_partys?: {
    partyid: number[]
  }
  close: number
  redirect_domain?: string
  report_location_flag?: number
  isreportenter?: number
  home_url?: string
}

interface WorkbenchData {
  type: string
  webview?: {
    url: string
    jump_url?: string
    pagepath?: string
    height?: string
    hide_title: boolean
    enable_webview_click: boolean
  }
}

interface WorkbenchForm {
  agentid: number
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
  agentid: 0,
  name: '',
  description: '',
  close: 0,
  home_url: '',
  allow_userinfos: { user: [] }
})
const formRules = {
  agentid: [{ required: true, message: '请输入应用ID', trigger: 'blur' }],
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
}

// 工作台数据
const workbenchFormRef = ref()
const workbenchDialogVisible = ref(false)
const workbenchForm = reactive<WorkbenchForm>({
  agentid: 0,
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
  agentid: 0,
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
const allowUsers = computed(() => {
  return formData.allow_userinfos?.user?.map((item) => item.userid) || []
})

// 初始化
onMounted(() => {
  getList()
})

// 获取列表
const getList = () => {
  loading.value = true
  // 模拟API调用
  setTimeout(() => {
    // 这里使用mock数据，实际项目中应该调用真实API
    list.value = [agentInfo]
    total.value = 1
    loading.value = false
  }, 500)
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
      agentid: 0,
      name: '',
      description: '',
      close: 0,
      home_url: '',
      allow_userinfos: { user: [] }
    })
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      // 模拟API调用
      setTimeout(() => {
        ElMessage.success(formData.agentid ? '修改成功' : '新增成功')
        formDialogVisible.value = false
        getList()
      }, 500)
    }
  })
}

// 远程搜索用户
const remoteSearchUsers = (query: string) => {
  if (query) {
    userLoading.value = true
    // 模拟API调用
    setTimeout(() => {
      userOptions.value = [
        { userid: 'jiying', name: '季颖' },
        { userid: 'yangxin', name: '杨鑫' },
        { userid: 'zhangsan', name: '张三' },
        { userid: 'lisi', name: '李四' }
      ]
      userLoading.value = false
    }, 500)
  } else {
    userOptions.value = []
  }
}

// 查看详情
const handleDetail = (row: AgentInfo) => {
  detailDialogVisible.value = true
  detailData.value = { ...row }
}

// 查看工作台数据
const handleWorkbenchData = (row: AgentInfo) => {
  workbenchForm.agentid = row.agentid
  workbenchForm.userid = 'jiying' // 默认值
  workbenchForm.type = 'webview'
  workbenchForm.webview = {
    url: '',
    hide_title: true,
    enable_webview_click: true
  }
  workbenchDialogVisible.value = true
}

// 获取工作台数据
const getWorkbenchData = () => {
  if (!workbenchForm.userid) {
    ElMessage.warning('请输入用户ID')
    return
  }

  // 模拟API调用
  setTimeout(() => {
    const result = agentData
    if (result.errcode === 0) {
      workbenchForm.type = result.data.type
      if (result.data.webview) {
        workbenchForm.webview = { ...result.data.webview }
      }
      ElMessage.success('获取成功')
    } else {
      ElMessage.error(result.errmsg)
    }
  }, 500)
}

// 设置工作台数据
const setWorkbenchData = () => {
  if (!workbenchForm.userid || !workbenchForm.webview.url) {
    ElMessage.warning('请填写必填项')
    return
  }

  // 模拟API调用
  setTimeout(() => {
    ElMessage.success('设置成功')
    workbenchDialogVisible.value = false
  }, 500)
}

// 批量设置
const handleBatchSet = (row: AgentInfo) => {
  batchForm.agentid = row.agentid
  batchForm.userids = []
  batchForm.type = 'webview'
  batchForm.webview = {
    url: '',
    hide_title: true,
    enable_webview_click: true
  }
  batchDialogVisible.value = true
}

// 批量设置工作台数据
const batchSetWorkbenchData = () => {
  if (batchForm.userids.length === 0 || !batchForm.webview.url) {
    ElMessage.warning('请填写必填项')
    return
  }

  // 模拟API调用
  setTimeout(() => {
    ElMessage.success(`成功为${batchForm.userids.length}个用户设置工作台数据`)
    batchDialogVisible.value = false
  }, 500)
}

// 删除应用
const handleDelete = (row: AgentInfo) => {
  ElMessageBox.confirm(`确认删除应用"${row.name}"吗？`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 模拟API调用
      setTimeout(() => {
        ElMessage.success('删除成功')
        getList()
      }, 500)
    })
    .catch(() => {})
}
</script>
