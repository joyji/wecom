<!--
 * @Description: 顶部区域 - 保存/预览/平台切换/发布/项目信息编辑
-->
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import { useLcProjectStore } from '@/store/modules/lcProject'
import * as ProjectApi from '@/api/lowcode/project'
import type { PlatformMode } from '@/components/LowcodeEditor/types'
import PreviewPublishDialog from './PreviewPublishDialog.vue'

const lcProjectStore = useLcProjectStore()
defineOptions({ name: 'LcEditorHeader' })
const lcEditor = inject('lcEditor') as any

const message = useMessage()

// 平台切换
const platformMode = computed({
  get: () => lcProjectStore.platformMode,
  set: (val: PlatformMode) => lcProjectStore.switchPlatform(val)
})

// 项目状态
const projectStatus = computed(() => lcProjectStore.project?.status || 'draft')
const isPublished = computed(() => projectStatus.value === 'published')

// --- 项目信息编辑 Dialog ---
const projectDialogVisible = ref(false)
const projectForm = reactive({
  name: '',
  description: ''
})

const openProjectDialog = () => {
  projectForm.name = lcProjectStore.project?.name || ''
  projectForm.description = lcProjectStore.project?.description || ''
  projectDialogVisible.value = true
}

const handleProjectDialogConfirm = () => {
  if (!projectForm.name.trim()) {
    message.warning('项目名称不能为空')
    return
  }
  lcProjectStore.updateProject({
    name: projectForm.name.trim(),
    description: projectForm.description.trim()
  })
  projectDialogVisible.value = false
  message.success('项目信息已更新')
}

// --- 预览/发布链接弹窗 ---
const previewDialogVisible = ref(false)
const previewDialogMode = ref<'preview' | 'publish'>('preview')

// --- 保存 / 发布 ---

// 将编辑器内部的 props 数组转换为存储格式的 propsMap
const transformProject = (project: any) => {
  const cProject = cloneDeep(project)
  const currentMode = lcProjectStore.platformMode
  cProject.pageList.forEach((page: any) => {
    // 保存前：将当前 componentList 同步到对应平台的备份字段
    if (currentMode === 'mobile') {
      page.mobileComponentList = cloneDeep(page.componentList)
    } else {
      page.pcComponentList = cloneDeep(page.componentList)
    }
    // 转换各平台组件列表的 props → propsMap
    ;['componentList', 'mobileComponentList', 'pcComponentList'].forEach((field) => {
      if (Array.isArray(page[field])) {
        page[field].forEach((widget: any) => {
          if (widget.props) {
            widget.propsMap = transformProps(widget.props)
            delete widget.props
          }
        })
      }
    })
  })
  return cProject
}

const transformProps = (props: any[]) => {
  const propsMap: Record<string, any> = {}
  props.forEach((item) => {
    propsMap[item.code] = {
      value: item.value
    }
    if (item.extraProps) {
      propsMap[item.code].extraProps = item.extraProps
    }
  })
  return propsMap
}

// 构建待保存的项目数据
const buildProjectToSave = () => {
  return {
    ...lcProjectStore.project!,
    pageList: lcProjectStore.pageList
  }
}

const handleSave = async (status: number) => {
  if (!lcProjectStore.project) return
  const projectToSave = buildProjectToSave()
  const cProject = transformProject(projectToSave)
  // 构建全量保存的请求数据
  const saveData = {
    projectKey: cProject.projectKey,
    name: cProject.name,
    description: cProject.description,
    status: cProject.status === 'published' ? 1 : 0,
    configure: cProject.configure,
    pageList: cProject.pageList.map((page: any, index: number) => ({
      pageKey: page.pageKey || undefined,
      name: page.name,
      sort: index,
      configure: page.configure,
      mobileComponentList: page.mobileComponentList || [],
      pcComponentList: page.pcComponentList || []
    }))
  }
  const result = await ProjectApi.saveProject(saveData)
  // 用返回的详情刷新 store 中的 pageKey（新页面会获得后端生成的 pageKey）
  if (result && result.pageList) {
    result.pageList.forEach((respPage: any, i: number) => {
      if (lcProjectStore.pageList[i]) {
        lcProjectStore.pageList[i].pageKey = respPage.pageKey
      }
    })
  }
  lcProjectStore.markSaved()
  status !== 1 && message.success('保存成功')
}

const handlePublish = async () => {
  if (!lcProjectStore.project) return
  // 先保存
  await handleSave(1)
  // 再发布
  await ProjectApi.publishProject(lcProjectStore.project!.projectKey)
  lcProjectStore.project!.status = 'published'
  // 弹出发布链接弹窗
  previewDialogMode.value = 'publish'
  previewDialogVisible.value = true
}

// 预览：自动保存草稿后展示预览链接
const handlePreview = async () => {
  if (!lcProjectStore.project) return
  await handleSave(1)
  previewDialogMode.value = 'preview'
  previewDialogVisible.value = true
}
</script>

<template>
  <el-header class="lc-editor-header">
    <div class="logo">
      <span class="font-size-14px font-bold">页面编辑器</span>
    </div>
    <div class="title-area" @click="openProjectDialog">
      <span class="title font-bold">
        {{ lcProjectStore.project?.name }} - {{ lcEditor?.curPage?.name }}
      </span>
      <el-tag
        :type="isPublished ? 'success' : 'info'"
        size="small"
        class="ml-8px"
      >
        {{ isPublished ? '已发布' : '草稿' }}
      </el-tag>
      <Icon icon="ep:edit" :size="14" class="edit-icon ml-4px" />
    </div>
    <div class="buttons flex items-center gap-12px">
      <!-- 平台切换 -->
      <el-radio-group v-model="platformMode" size="small">
        <el-radio-button value="mobile">
          <Icon icon="ep:cellphone" :size="14" />
          <span class="ml-4px">移动端</span>
        </el-radio-button>
        <el-radio-button value="pc">
          <Icon icon="ep:monitor" :size="14" />
          <span class="ml-4px">PC端</span>
        </el-radio-button>
      </el-radio-group>

      <el-button size="small" type="success" @click="handlePreview">预览</el-button>
      <el-button size="small" type="primary" @click="handleSave">保存</el-button>
      <el-button size="small" type="warning" :disabled="isPublished" @click="handlePublish">
        发布
      </el-button>
    </div>

    <!-- 项目信息编辑 Dialog -->
    <el-dialog v-model="projectDialogVisible" title="项目信息" width="480px" append-to-body>
      <el-form label-width="80px">
        <el-form-item label="项目名称">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述">
          <el-input
            v-model="projectForm.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleProjectDialogConfirm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 预览/发布链接弹窗 -->
    <PreviewPublishDialog
      v-model="previewDialogVisible"
      :mode="previewDialogMode"
      :project-key="lcProjectStore.project?.projectKey || ''"
      :page-list="lcProjectStore.pageList"
    />
  </el-header>
</template>

<style scoped lang="scss">
$toolbar-height: 42px;

.lc-editor-header {
  display: flex;
  height: $toolbar-height;
  padding: 0 10px;
  background-color: var(--el-bg-color);
  border-bottom: solid 1px var(--el-border-color);
  align-items: center;
  justify-content: space-between;
}

.title-area {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--el-fill-color-light);

    .edit-icon {
      opacity: 1;
    }
  }

  .edit-icon {
    opacity: 0;
    color: var(--el-text-color-secondary);
    transition: opacity 0.2s;
  }
}
</style>
