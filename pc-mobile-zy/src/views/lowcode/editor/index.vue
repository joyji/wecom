<!--
 * @Description: 低代码编辑器入口页
 * 参考 pc-micro-base views/approval/lowcode/index.vue
-->
<template>
  <el-container class="lc-editor">
    <lc-lowcode-editor v-if="!loading" />
    <div v-else class="loading-wrap">
      <el-skeleton :rows="5" animated />
    </div>
  </el-container>
</template>

<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import LcLowcodeEditor from '@/components/LowcodeEditor/index.vue'
import { config } from '@/components/LowcodeEditor/packages/api'
import { useLcProjectStore } from '@/store/modules/lcProject'
import { useTagsViewStore } from '@/store/modules/tagsView'
import * as ProjectApi from '@/api/lowcode/project'

const lcProjectStore = useLcProjectStore()
const message = useMessage()

defineOptions({ name: 'LowcodeEditorPage' })

const { delView } = useTagsViewStore()
const { currentRoute } = useRouter()
const close = () => {
  delView(unref(currentRoute))
}

const { query, params } = useRoute()
const loading = ref(true)

onMounted(() => {
  const projectKey = params.projectKey as string
  if (!projectKey) {
    message.warning('参数错误，项目Key不能为空！')
    close()
    return
  }
  getDetail(projectKey)
})

const getDetail = async (projectKey: string) => {
  loading.value = true
  try {
    const data = await ProjectApi.getProject(projectKey)
    if (!data) {
      message.warning('项目不存在！')
      close()
      return
    }

    // 适配后端返回的状态（数字→字符串）
    if (data.status === 1) data.status = 'published'
    else if (data.status === 0) data.status = 'draft'

    // 将存储格式的 propsMap 转换为编辑器内部的 props 数组格式
    data.pageList.forEach((page: any) => {
      transformComponentList(page.componentList || [])
      transformComponentList(page.mobileComponentList || [])
      transformComponentList(page.pcComponentList || [])
    })

    lcProjectStore.setProject(data)
  } finally {
    loading.value = false
  }
}

/**
 * 数据转换：propsMap → props
 * 将存储格式转为编辑器内部格式
 * 参考 pc-micro-base lowcode/index.vue 的 transformComponentList
 */
const transformComponentList = (clist: any[]) => {
  clist.forEach((item) => {
    const componentDef = config[item.componentName]
    if (!componentDef) return

    const props = cloneDeep(componentDef.props)
    if (item.propsMap) {
      props.forEach((jItem: any) => {
        if (item.propsMap[jItem.code]) {
          jItem.value = cloneDeep(item.propsMap[jItem.code].value)
          if (jItem.extraProps && item.propsMap[jItem.code].extraProps) {
            jItem.extraProps = cloneDeep(item.propsMap[jItem.code].extraProps)
          }
        }
      })
    }

    item.props = props
    delete item.propsMap
  })
}
</script>

<style lang="scss" scoped>
.lc-editor {
  display: flex;
  height: 100%;
  margin: calc(10px - var(--app-content-padding));
  flex-direction: column;
}

.loading-wrap {
  padding: 40px;
}
</style>
