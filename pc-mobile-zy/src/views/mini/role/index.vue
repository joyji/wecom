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
      <el-form-item label="角色名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入角色名称"
          clearable
          @keydown.enter="handleQuery"
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
    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb-10px">
      <el-col :span="1.5">
        <el-button type="primary" plain @click="handleAdd">
          <Icon icon="ep:plus" class="mr-5px" />新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 角色列表 -->
    <el-table v-loading="loading" :data="roleList" stripe border highlight-current-row>
      <el-table-column label="角色ID" prop="id" width="100" align="center" />
      <el-table-column label="角色名称" prop="name" min-width="150" />
      <el-table-column label="角色code" prop="code" min-width="180" />
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template #default="{ row }">
          {{ dateFormat(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" prop="updateTime" width="180">
        <template #default="{ row }">
          {{ dateFormat(row.updateTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link @click="handleUpdate(row)">
            <Icon icon="ep:edit" class="mr-2px" />修改
          </el-button>
          <el-button type="primary" link @click="handlePermission(row)">
            <Icon icon="ep:setting" class="mr-2px" />权限分配
          </el-button>
          <el-button type="danger" link @click="handleDelete(row)">
            <Icon icon="ep:delete" class="mr-2px" />删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination
      v-if="total > 0"
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
      class="mt-15px"
    />
  </el-card>

  <!-- 表单弹窗：添加/修改 -->
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="500px"
    destroy-on-close
    append-to-body
  >
    <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入角色名称" />
      </el-form-item>
      <el-form-item label="角色code" prop="code">
        <el-input v-model="form.code" type="textarea" :rows="4" placeholder="请输入角色描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>

  <!-- 权限分配弹窗 -->
  <el-dialog
    v-model="permDialogVisible"
    title="权限分配"
    width="600px"
    destroy-on-close
    append-to-body
  >
    <el-form :model="permForm" label-width="80px">
      <el-form-item label="角色名称">
        <el-input v-model="permForm.name" disabled />
      </el-form-item>
      <el-form-item label="菜单权限">
        <el-tree
          ref="menuTreeRef"
          :data="menuOptions"
          :props="{ label: 'name', children: 'children' }"
          show-checkbox
          node-key="id"
          default-expand-all
          class="menu-tree"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="permDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitPermission">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessageBox, ElMessage, ElTree, dayjs } from 'element-plus'
import * as RoleApi from '@/api/mini/role'
import { handleTree } from '@/utils/tree'
// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: ''
})

// 角色列表
const loading = ref(false)
const total = ref(0)
const roleList = ref<any[]>([])

// 搜索过滤后的角色列表
const filteredRoleList = computed(() => {
  if (!queryParams.name) {
    return roleList.value
  }

  return roleList.value.filter((role) => role.name.includes(queryParams.name))
})

// 处理查询
const handleQuery = (event) => {
  event.preventDefault()
  queryParams.pageNo = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.name = ''
  handleQuery()
}

// 表单相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const dialogTitle = computed(() => (dialogType.value === 'add' ? '新增角色' : '修改角色'))
const formRef = ref()
const form = reactive({
  id: '',
  name: '',
  code: ''
})
const formRules = {
  name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }],
  code: [{ required: true, message: '角色code不能为空', trigger: 'blur' }]
}

// 权限分配相关
const permDialogVisible = ref(false)
const menuTreeRef = ref() // 菜单树组件 Ref
const permForm = reactive({
  id: '',
  code: '',
  name: '',
  menuIds: [] as number[]
})
const menuOptions = ref<any[]>([])

// 获取角色列表
const getList = async () => {
  loading.value = true
  try {
    // 使用模拟服务
    const res = await RoleApi.getRoleList(queryParams)
    roleList.value = res.list
    total.value = res.total || roleList.value.length
  } catch (error) {
    console.error(error)
    ElMessage.error('获取角色列表失败')
  } finally {
    loading.value = false
  }
}

// 获取菜单列表
const getMenuList = async () => {
  try {
    // 使用模拟服务
    const res = await RoleApi.getUserlistAllSimple()
    menuOptions.value = handleTree(res)
  } catch (error) {
    console.error(error)
  }
}

// 新增角色
const handleAdd = () => {
  resetForm()
  dialogType.value = 'add'
  dialogVisible.value = true
}

// 修改角色
const handleUpdate = (row: any) => {
  resetForm()
  dialogType.value = 'update'
  dialogVisible.value = true
  nextTick(() => {
    form.id = row.id
    form.name = row.name
    form.code = row.code || ''
  })
}

// 删除角色
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除角色 "${row.name}" 吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // 使用模拟服务
        await RoleApi.addRoleDelete(row.id)
        // 更新本地数据
        getList()
        ElMessage.success('删除成功')
      } catch (error) {
        console.error(error)
        ElMessage.error('删除失败')
      }
    })
    .catch(() => {})
}

// 权限分配
const handlePermission = async (row: any) => {
  getMenuList().then(async () => {
    permForm.id = row.id
    permForm.name = row.name
    permForm.menuIds = []
    permDialogVisible.value = true
    try {
      // 使用模拟服务
      permForm.menuIds = await RoleApi.getUserlistRoleSimple(row.id)
      permForm.menuIds.forEach((menuId: number) => {
        menuTreeRef.value.setChecked(menuId, true, false)
      })
    } catch (error) {
      console.error(error)
    }
  })
}

// 提交权限分配
const submitPermission = async () => {
  if (!menuTreeRef.value) return

  try {
    const checkedKeys = menuTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
    const menuIds = [...checkedKeys, ...halfCheckedKeys] as number[]
    // const menuIds = [...checkedKeys] as number[]
    // 使用模拟服务
    await RoleApi.addAssignRoleMenu({
      roleId: permForm.id,
      menuIds: menuIds
    })

    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
  } catch (error) {
    console.error(error)
    ElMessage.error('权限分配失败')
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!form.id) {
      // 使用模拟服务
      await RoleApi.addRoleCreate({
        name: form.name,
        code: form.code
      })

      // 更新本地数据
      getList()
      ElMessage.success('新增成功')
    } else {
      // 使用模拟服务
      await RoleApi.addRoleUpdate({
        id: form.id,
        name: form.name,
        code: form.code
      })

      // 更新本地数据
      getList()
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

// 重置表单
const resetForm = () => {
  form.id = ''
  form.name = ''
  form.code = ''
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
const dateFormat = (time: any) => {
  return dayjs(time).format('YYYY-MM-DD')
}
onMounted(() => {
  getList()
})
</script>

<style scoped>
.menu-tree {
  max-height: 400px;
  padding: 10px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}
</style>
