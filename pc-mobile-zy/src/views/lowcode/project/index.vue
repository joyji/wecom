<!--
 * @Description: 低代码项目列表页
-->
<template>
  <ContentWrap>
    <div class="flex justify-between mb-16px">
      <span class="font-size-18px font-bold">页面配置项目</span>
      <el-button type="primary" @click="handleCreate">
        <Icon icon="ep:plus" class="mr-4px" />
        新建项目
      </el-button>
    </div>

    <el-table v-loading="loading" :data="projectList" stripe>
      <template #empty>
        <el-empty description="暂无项目" :image-size="120" />
      </template>
      <el-table-column prop="name" label="项目名称" min-width="200" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="页面数" width="80">
        <template #default="{ row }">
          {{ row.pageCount ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" link @click="handleEdit(row)">
            <Icon icon="ep:edit" class="mr-4px" />编辑
          </el-button>
          <el-button size="small" type="danger" link @click="handleDelete(row)">
            <Icon icon="ep:delete" class="mr-4px" />删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

  </ContentWrap>

  <!-- 新建项目对话框 -->
  <el-dialog v-model="dialogVisible" title="新建项目" width="400px">
    <el-form :model="form" label-width="80px">
      <el-form-item label="项目名称" required>
        <el-input v-model="form.name" placeholder="请输入项目名称" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import * as ProjectApi from '@/api/lowcode/project'

defineOptions({ name: 'LowcodeProject' })

const router = useRouter()
const message = useMessage()

const loading = ref(false)
const projectList = ref<any[]>([])
const dialogVisible = ref(false)
const submitting = ref(false)
const form = reactive({ name: '' })

// 加载项目列表
const loadList = async () => {
  loading.value = true
  try {
    const page = await ProjectApi.getProjectList()
    projectList.value = page?.list ?? []
  } finally {
    loading.value = false
  }
}

// 新建项目
const handleCreate = () => {
  form.name = ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.name.trim()) {
    message.warning('请输入项目名称')
    return
  }
  submitting.value = true
  try {
    const projectKey = await ProjectApi.createProject({ name: form.name.trim() })
    dialogVisible.value = false
    message.success('创建成功')
    // 进入编辑器（后端返回项目Key）
    router.push({ name: 'LowcodeEditor', params: { projectKey } })
  } finally {
    submitting.value = false
  }
}

// 编辑项目
const handleEdit = (row: any) => {
  router.push({ name: 'LowcodeEditor', params: { projectKey: row.projectKey } })
}

// 删除项目
const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除项目「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await ProjectApi.deleteProject(row.projectKey)
  message.success('删除成功')
  loadList()
}

onMounted(() => {
  loadList()
})
</script>
