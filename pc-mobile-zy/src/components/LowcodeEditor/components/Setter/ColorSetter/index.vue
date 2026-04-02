<!--
 * @Description: ColorSetter - 颜色选择设置器
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
defineOptions({ name: 'LcEditorColorSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <div class="flex items-center gap-8px">
      <el-color-picker v-model="value" size="small" />
      <el-input v-model="value" placeholder="#000000" size="small" style="width: 120px" />
    </div>
  </lc-editor-setter-item>
</template>
