<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-07-04 13:41:53
 * @LastEditors: jiying
 * @LastEditTime: 2025-07-29 11:29:51
-->
<template>
  <ContentWrap :bodyStyle="{ padding: '0px' }" class="!mb-0">
    <IFrame :src="src" ref="iframeRef" />
  </ContentWrap>
</template>
<script lang="ts" setup>
import { getAccessToken } from '@/utils/auth'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'EleasingFlow' })

const { currentRoute } = useRouter() // 获取路由信息
const router = useRouter()
const iframeRef = ref()

const src = ref<string>('') // iframe 的 src 地址

/** 初始化 */
onMounted(async () => {
  const token = getAccessToken()
  console.log('当前路由：', currentRoute.value.meta.query?.url)
  src.value = `${currentRoute.value.meta.query?.url}?accessToken=${token}`

  // 添加消息监听器，用于接收 iframe 内部发送的消息
  window.addEventListener('message', handleIframeMessage)
})

// 处理来自 iframe 的消息
const handleIframeMessage = (event: MessageEvent) => {
  // 检查是否是打开新页面的请求
  if (event.data.type === 'OPEN_NEW_PAGE') {
    const { url, title } = event.data.payload
    // 跳转到新页面
    router.push({
      path: `/iframe/page`,
      query: { url }
    })
  }
}

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
})
</script>
