<template>
  <ContentWrap :bodyStyle="{ padding: '0px' }" class="!mb-0">
    <IFrame :src="src" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useTagsView } from '@/hooks/web/useTagsView'
import { onMounted, onUnmounted, computed, unref } from 'vue'
import { usePermissionStore } from '@/store/modules/permission'

defineOptions({ name: 'IframePage' })

const route = useRoute()
const { currentRoute, push } = useRouter()
const src = computed(() => route.query.url || '') as any

const tagsViewStore = useTagsViewStore()
const { closeCurrent } = useTagsView()

const permissionStore = usePermissionStore()
const setSelectTag = tagsViewStore.setSelectedTag

// 处理来自 iframe 内部的消息
const handleIframeMessage = (event: MessageEvent) => {
  // 检查是否是关闭当前页面的请求
  if (event.data.type === 'CLOSE_CURRENT_PAGE') {
    // 关闭当前tags页面
    closeCurrent(unref(currentRoute), () => {
      // 关闭后的回调，可以在这里添加额外的逻辑
      console.log('当前页面已关闭')
      toLastView()
    })
  }
}

// 去最后一个
const toLastView = () => {
  const visitedViews = tagsViewStore.getVisitedViews
  const latestView = visitedViews.slice(-1)[0]
  if (latestView) {
    push(latestView)
  } else {
    if (
      unref(currentRoute).path === permissionStore.getAddRouters[0].path ||
      unref(currentRoute).path === permissionStore.getAddRouters[0].redirect
    ) {
      addTags()
      return
    }
    // You can set another route
    push(permissionStore.getAddRouters[0].path)
  }
}

const addTags = () => {
  const { name } = unref(currentRoute)
  if (name) {
    setSelectTag(unref(currentRoute))
    tagsViewStore.addView(unref(currentRoute))
  }
}

// 组件挂载时添加事件监听器
onMounted(() => {
  // 添加消息监听器，用于接收 iframe 内部发送的消息
  window.addEventListener('message', handleIframeMessage)
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
})
</script>
