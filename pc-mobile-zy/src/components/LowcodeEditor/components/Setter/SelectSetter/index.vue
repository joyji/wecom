<!--
 * @Description: SelectSetter - 下拉选择设置器
-->
<script lang="ts" setup>
import LcEditorSetterItem from '@/components/LowcodeEditor/components/Setter/SetterItem.vue'
defineOptions({ name: 'LcEditorSelectSetter' })

const item = defineModel('item') as any
const value = defineModel('value') as any

const options = computed(() => item.value?.extraProps?.options || [])
</script>

<template>
  <lc-editor-setter-item :label="item?.name" :tips="item?.extraProps?.tips">
    <el-select v-model="value" :placeholder="item?.extraProps?.placeholder || '请选择'" size="small" style="width: 100%">
      <el-option
        v-for="opt in options"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
      />
    </el-select>
  </lc-editor-setter-item>
</template>
