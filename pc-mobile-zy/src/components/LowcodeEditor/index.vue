<!--
 * @Description: 低代码编辑器主布局
 * 参考 pc-micro-base lcEditor 四区域布局
 * header(TopArea) + left(LeftArea) + main(MainArea) + right(RightArea)
-->
<template>
  <el-container class="lc-editor">
    <lc-editor-header />
    <el-container class="layout-container">
      <lc-editor-aside :list="libs" />
      <el-main>
        <lc-editor-main />
        <lc-editor-attributes />
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import LcEditorHeader from './components/Layout/header/index.vue'
import LcEditorAside from './components/Layout/left/index.vue'
import LcEditorMain from './components/Layout/main/index.vue'
import LcEditorAttributes from './components/Layout/right/index.vue'

import { PAGE_LIBS } from './packages/index'
import { useLcProjectStore } from '@/store/modules/lcProject'

defineOptions({ name: 'LcLowcodeEditor' })

const lcProjectStore = useLcProjectStore()
const curPage = computed(() => lcProjectStore.curPage)

// PC/移动端共用同一套组件库
const libs = PAGE_LIBS

const lcEditor = reactive({
  dragstatus: false,
  curWidget: null as any,
  dragWidget: null as any,
  h5Iframe: null as HTMLIFrameElement | null,
  curPage
})

provide('lcEditor', lcEditor)
</script>

<style scoped lang="scss">
$toolbar-height: 42px;

.lc-editor {
  display: flex;
  height: 100%;
  margin: calc(0px - var(--app-content-padding));
  flex-direction: column;
}

.layout-container {
  height: calc(
    100vh - var(--top-tool-height) - var(--tags-view-height) - var(--app-footer-height) -
      $toolbar-height
  );
  border-bottom: solid 1px var(--el-border-color);
}

.el-main {
  position: relative;
  padding: 0;
  background-color: var(--app-content-bg-color);
  overflow: hidden;
}
</style>
