<template>
  <el-card shadow="hover" class="mb-15px">
    <!-- 搜索表单 -->
    <el-form
      ref="queryFormRef"
      :model="queryParams"
      :inline="true"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="账号ID" prop="welcomeId">
        <el-input
          v-model="queryParams.welcomeId"
          placeholder="请输入账号ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />搜索
        </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-5px" />重置 </el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-card shadow="hover">
    <!-- 用户列表 -->
    <el-table v-loading="loading" :data="userList" border stripe highlight-current-row>
      <el-table-column label="用户ID" prop="id" width="80" align="center" />
      <el-table-column label="用户名" prop="username" width="120" />
      <el-table-column label="账号ID" prop="wecomId" width="120" />
      <el-table-column label="OneID" prop="oneId" width="180" />
      <el-table-column label="角色" prop="roleName" min-width="120" />
      <!-- <el-table-column label="角色" min-width="120">
        <template #default="{ row }">
          <el-tag v-for="role in row.roles" :key="role" class="mr-5px mb-5px" effect="light">
            {{ role }}
          </el-tag>
          <el-tag v-if="!row.roles || row.roles.length === 0" type="info" effect="plain">
            暂无角色
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleRoleAssign(row)">
            <Icon icon="ep:user-filled" class="mr-2px" />分配角色
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
      class="mt-15px"
    />
  </el-card>

  <!-- 分配角色弹窗 -->
  <el-dialog
    v-model="roleDialogVisible"
    title="分配角色"
    width="1200px"
    destroy-on-close
    append-to-body
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="用户ID">{{ roleForm.id }}</el-descriptions-item>
      <el-descriptions-item label="用户名">{{ roleForm.username }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="center">角色列表</el-divider>

    <el-card shadow="none">
      <el-table v-loading="loading" :data="roleOptions" border stripe highlight-current-row>
        <el-table-column label="角色名称" prop="name" min-width="80" align="center" />
        <el-table-column label="角色code" prop="code" min-width="80" align="center" />
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.check"
              active-text="开启"
              inactive-text="关闭"
              @change="timeoutHandlerChange(row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-model:limit="queryParamsT.pageSize"
        v-model:page="queryParamsT.pageNo"
        @pagination="getUserlistAll"
        :total="totals"
        class="mt-15px"
      />
    </el-card>

    <template #footer>
      <el-button @click="roleDialogVisibleFn">取消</el-button>
      <el-button type="primary" @click="submitRoleAssign">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import * as UserApi from '@/api/mini/user'

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  username: '',
  welcomeId: ''
})
// 查询参数
const queryParamsT = reactive({
  pageNo: 1,
  pageSize: 10
})

const loading = ref(false)
const total = ref(0)
const totals = ref(0)
const userList = ref<any[]>([])
const roleDialogVisible = ref(false)
const roleForm = reactive({
  id: '',
  username: '',
  oneId: '',
  roleIds: [] as string[]
})
const roleOptions = ref<any[]>([])

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const res = await UserApi.getUserList(queryParams)
    userList.value = res.list
    total.value = res.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}
// 获取用户列表
const getUserlistAll = async () => {
  try {
    const res1 = await UserApi.getUserlistAllSimple({
      pageNo: queryParamsT.pageNo,
      pageSize: queryParamsT.pageSize
    })
    roleOptions.value = res1.list
    totals.value = res1.total
  } catch (error) {
    console.error(error)
    ElMessage.error('获取角色列表失败')
  } finally {
    for (let i = 0; i < roleOptions.value.length; i++) {
      const element = roleOptions.value[i]
      if (roleForm.roleIds.includes(element.id)) {
        element.check = true
      } else {
        element.check = false
      }
    }
  }
}

// 处理查询
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.username = ''
  queryParams.welcomeId = ''
  handleQuery()
}

// 分配角色
const handleRoleAssign = async (row: any) => {
  getUserlistAll().then(async () => {
    const res = await UserApi.getUserlistSserRoles({
      oneId: row.oneId
    } as PageParam)
    roleForm.id = row.id
    roleForm.oneId = row.oneId
    roleForm.username = row.username
    roleForm.roleIds = [...(res || [])]
    for (let i = 0; i < roleOptions.value.length; i++) {
      const element = roleOptions.value[i]
      if (roleForm.roleIds.includes(element.id)) {
        element.check = true
      } else {
        element.check = false
      }
    }
    roleDialogVisible.value = true
  })
}

// 提交角色分配
const submitRoleAssign = async () => {
  try {
    // 使用模拟服务
    await UserApi.getPermissionUserRoles({
      userId: roleForm.oneId,
      roleIds: roleForm.roleIds
    })
    roleDialogVisibleFn()
    ElMessage.success('分配角色成功')
    getList()
  } catch (error) {
    // ElMessage.error('分配角色失败')
  }
}

const timeoutHandlerChange = (row: any) => {
  if (row.check) {
    roleForm.roleIds.push(row.id)
  } else {
    roleForm.roleIds = roleForm.roleIds.filter((id) => id !== row.id)
  }
}

const roleDialogVisibleFn = () => {
  roleDialogVisible.value = false
  queryParamsT.pageNo = 1
  queryParamsT.pageSize = 10
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.role-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.role-checkbox-group .el-checkbox {
  margin-right: 15px;
}
</style>
