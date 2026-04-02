<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-06-26 14:07:48
 * @LastEditors: jiying
 * @LastEditTime: 2025-07-29 09:35:54
-->
<script lang="ts" setup>
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useAppStore } from '@/store/modules/app'
import { Footer } from '@/layout/components/Footer'
import { useRoute } from 'vue-router'

defineOptions({ name: 'AppView' })

const appStore = useAppStore()
const route = useRoute()

const layout = computed(() => appStore.getLayout)

const fixedHeader = computed(() => appStore.getFixedHeader)

const footer = computed(() => appStore.getFooter)

const tagsViewStore = useTagsViewStore()

const getCaches = computed((): string[] => {
  return tagsViewStore.getCachedViews
})

const tagsView = computed(() => appStore.getTagsView)

// 根据路由路径计算 section 的 class
const sectionClass = computed(() => {
  const routePath = route.path
  const baseClass = [
    'p-[var(--app-content-padding)]',
    'w-full',
    'bg-[var(--app-content-bg-color)]',
    'dark:bg-[var(--el-bg-color)]'
  ]

  // 根据不同路径添加特定的 class
  const pathSpecificClass = []
  if (routePath.startsWith('/eleasing')) {
    pathSpecificClass.push('eleasing-route')
  }

  // 原有条件 class
  const conditionalClass = {
    '!min-h-[calc(100vh-var(--top-tool-height)-var(--tags-view-height)-var(--app-footer-height))] pb-0':
      footer.value
  }

  return [...baseClass, ...pathSpecificClass, conditionalClass]
})

//region 无感刷新
const routerAlive = ref(true)
// 无感刷新，防止出现页面闪烁白屏
const reload = () => {
  routerAlive.value = false
  nextTick(() => (routerAlive.value = true))
}
// 为组件后代提供刷新方法
provide('reload', reload)
//endregion
</script>

<template>
  <section :class="sectionClass">
    <router-view v-if="routerAlive">
      <template #default="{ Component, route }">
        <keep-alive :include="getCaches">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </template>
    </router-view>
  </section>
  <Footer v-if="footer" />
</template>

<style lang="scss" scoped>
.eleasing-route {
  padding: 0 !important;
}
</style>
