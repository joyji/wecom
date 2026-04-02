<!--
 * @Description: 页面标签管理 - 多页面切换
-->
<script lang="ts" setup>
import { useLcProjectStore } from '@/store/modules/lcProject'
import type { LcPage } from '@/components/LowcodeEditor/types'

defineOptions({ name: 'LcEditorPageList' })
const lcProjectStore = useLcProjectStore()

const pageList = computed(() => lcProjectStore.pageList)
const curPageIndex = computed(() => lcProjectStore.curPageIndex)

// 切换页面
const handlePageClick = (index: number) => {
  // 清除选中组件
  lcProjectStore.setcurComponent(null)
  // 通知 simulator 取消选中
  const iframeEl = document.querySelector('.lc-editor-main iframe') as HTMLIFrameElement | null
  iframeEl?.contentWindow?.postMessage(
    JSON.stringify({ even: 'changeCurrWidget', params: { id: '' } }),
    '*'
  )
  lcProjectStore.setCurPage(index)
}

// 新增页面
const handleAddPage = () => {
  const page: LcPage = {
    pageKey: '',
    name: `页面${pageList.value.length + 1}`,
    componentList: [],
    mobileComponentList: [],
    pcComponentList: [],
    configure: {}
  }
  lcProjectStore.addPage(page)
  lcProjectStore.setCurPage(pageList.value.length - 1)
}

// 删除页面
const handleDelPage = (index: number) => {
  if (pageList.value.length <= 1) {
    ElMessage.warning('至少保留一个页面')
    return
  }
  ElMessageBox.confirm('确定要删除该页面吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    lcProjectStore.delPage(index)
  })
}
</script>

<template>
  <div class="page-list">
    <div class="page-list-header">
      <span class="title">页面列表</span>
      <el-button size="small" type="primary" link @click="handleAddPage">
        <Icon icon="ep:plus" :size="14" />
        新增
      </el-button>
    </div>
    <div class="page-list-body">
      <div
        v-for="(page, index) in pageList"
        :key="page.pageKey || index"
        class="page-item"
        :class="{ active: index === curPageIndex }"
        @click="handlePageClick(index)"
      >
        <span class="page-name">{{ page.name }}</span>
        <Icon
          v-if="pageList.length > 1"
          icon="ep:close"
          :size="12"
          class="page-close"
          @click.stop="handleDelPage(index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-list {
  flex-shrink: 0;
  background: #fff;
  border-top: 1px solid var(--el-border-color);
  padding: 8px 12px;

  .page-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .title {
      font-size: 13px;
      font-weight: 600;
      color: #333;
    }
  }

  .page-list-body {
    display: flex;
    gap: 8px;
    overflow-x: auto;
  }

  .page-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &.active {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .page-close {
      color: #999;
      cursor: pointer;

      &:hover {
        color: var(--el-color-danger);
      }
    }
  }
}
</style>
