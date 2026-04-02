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
      <el-form-item label="发起人" prop="procInitiatorName">
        <el-input
          v-model="queryParams.procInitiatorName"
          placeholder="请输入发起人"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="标题" label-width="40px" prop="procTitle">
        <el-input
          v-model="queryParams.procTitle"
          placeholder="请输入标题"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程ID" label-width="80px" prop="procId">
        <el-input
          v-model="queryParams.procId"
          placeholder="请输入流程ID"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="流程发起系统" label-width="120px" prop="systemCode">
        <el-select
          v-model="queryParams.systemCode"
          collapse-tags
          multiple
          class="mr-2"
          :style="{ width: '200px' }"
          @change="handleQuery"
          clearable
        >
          <el-option
            v-for="item in systemCodeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label-width="90px" label="用户oneId" prop="oneId">
        <el-input
          v-model="queryParams.oneId"
          placeholder="请输入用户oneId"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item> -->
      <el-form-item label="流程信息" prop="mixInfo">
        <el-input
          v-model="queryParams.mixInfo"
          placeholder="请输入流程信息"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发起时间开始" prop="arriveTimeStart" label-width="100px">
        <el-date-picker
          v-model="queryParams.arriveTimeStart"
          value-format="YYYY-MM-DD HH:MM"
          type="date"
          placeholder="选择发起时间开始日期"
          style="width: 100%"
          @change="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="发起时间结束" prop="arriveTimeEnd" label-width="100px">
        <el-date-picker
          v-model="queryParams.arriveTimeEnd"
          value-format="YYYY-MM-DD HH:MM"
          type="date"
          placeholder="选择发起时间结束日期"
          style="width: 100%"
          @change="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getList">
          <Icon icon="ep:search" class="mr-5px" />搜索
        </el-button>
        <el-button @click="resetQuery"> <Icon icon="ep:refresh" class="mr-5px" />重置 </el-button>
        <el-button type="success" plain @click="flowExportFn" v-hasPermi="['system:user:export']">
          <Icon icon="ep:download" />导出
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>

  <el-card shadow="hover">
    <!-- 用户列表 -->
    <el-table v-loading="loading" :data="userList" border stripe highlight-current-row>
      <el-table-column label="流程ID" prop="procId" width="100" align="center" />
      <el-table-column label="流程名称" prop="procName" width="140" />
      <el-table-column label="流程发起系统" prop="systemCode" width="120" />
      <el-table-column label="流程标题" prop="procTitle" width="180" />
      <el-table-column label="审批用户姓名" prop="handlerName" />
      <el-table-column label="审批用户部门" prop="deptName" />
      <el-table-column label="流程发起时间" prop="procStartTime">
        <!-- <template #default="{ row }">
          {{ dateFormat(row.procStartTime) }}
        </template> -->
      </el-table-column>
      <el-table-column label="流程到达时间" prop="arriveTime">
        <!-- <template #default="{ row }">
          {{ dateFormat(row.arriveTime) }}
        </template> -->
      </el-table-column>
      <el-table-column label="流程审批时间" prop="completeTime">
        <!-- <template #default="{ row }">
          {{ dateFormat(row.completeTime) }}
        </template> -->
      </el-table-column>
      <el-table-column label="流程完成时间" prop="procFinishTime">
        <!-- <template #default="{ row }">
          {{ dateFormat(row.procFinishTime) }}
        </template> -->
      </el-table-column>
      <el-table-column label="当前用户审批状态" prop="commentType" />
      <el-table-column label="流程状态" prop="procStatus" />
      <el-table-column label="当前用户审批时长（分钟）" prop="approvalDurationMinutes" />
      <el-table-column label="流程审批时长" prop="processApprovalTime" />
    </el-table>
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
      class="mt-15px"
    />
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, dayjs } from 'element-plus'
import * as UserApi from '@/api/mini/todo'
const message = useMessage() // 消息弹窗
import download from '@/utils/download'
import { systemCodeList } from '@/components/SimpleProcessDesignerV2/src/consts'
// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  procInitiatorName: '',
  procTitle: '',
  procId: '',
  systemCode: [],
  mixInfo: '',
  arriveTimeEnd: '',
  arriveTimeStart: ''
})

const loading = ref(false)
const total = ref(0)
const userList = ref<any[]>([])

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
const dateFormat = (time: any) => {
  if (!time) return
  return dayjs(time).format('YYYY-MM-DD HH:mm')
}
// 处理查询
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

// 重置查询
const resetQuery = () => {
  queryParams.procInitiatorName = ''
  queryParams.procTitle = ''
  queryParams.procId = ''
  queryParams.systemCode = []
  queryParams.mixInfo = ''
  queryParams.arriveTimeEnd = ''
  queryParams.arriveTimeStart = ''
  handleQuery()
}
// 下载
const flowExportFn = async () => {
  loading.value = true
  try {
    await message.exportConfirm()
    const data = await UserApi.flowExport(queryParams)
    download.excel(data, '用户数据.xls')
    ElMessage.success('下载成功')
  } catch (error) {
    console.error(error)
    ElMessage.error('下载失败')
  } finally {
    loading.value = false
  }
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

::v-deep .el-input__wrapper {
  max-width: 190px;
}
</style>
