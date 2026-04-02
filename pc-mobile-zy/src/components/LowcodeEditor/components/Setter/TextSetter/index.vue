<!--
 * @Description: TextSetter - 文本输入设置器
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
defineOptions({ name: 'LcEditorTextSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <el-input v-model="value" :placeholder="item?.extraProps?.placeholder || '请输入'" size="small" />
  </lc-editor-setter-item>
</template>
