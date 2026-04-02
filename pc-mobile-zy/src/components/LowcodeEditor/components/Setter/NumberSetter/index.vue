<!--
 * @Description: NumberSetter - 数字输入设置器
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
defineOptions({ name: 'LcEditorNumberSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any

const min = computed(() => item.value?.extraProps?.min ?? 0)
const max = computed(() => item.value?.extraProps?.max ?? 9999)
const step = computed(() => item.value?.extraProps?.step ?? 1)
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <el-input-number v-model="value" :min="min" :max="max" :step="step" size="small" style="width: 100%" />
  </lc-editor-setter-item>
</template>
