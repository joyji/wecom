<!--
 * @Description: SwitchSetter - 开关设置器
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
defineOptions({ name: 'LcEditorSwitchSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <el-switch v-model="value" size="small" />
  </lc-editor-setter-item>
</template>
