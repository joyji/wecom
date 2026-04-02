<!--
 * @Description: Setter 标签包装组件
 * 参考 pc-micro-base SetterItem.vue
-->
<script lang="ts" setup>
defineOptions({ name: 'LcEditorSetterItem' })

const props = defineProps({
  label: {
    type: String,
    default: ''
  },
  tips: {
    type: String,
    default: ''
  }
})
</script>

<template>
  <div class="flex pb-10px items-center">
    <div class="w-80px font-size-12px c-gray">
      {{ props.label }}
      <el-tooltip v-if="props.tips" effect="dark" :content="props.tips" placement="right">
        <Icon icon="ep:info-filled" :size="12" />
      </el-tooltip>
    </div>
    <div class="flex-1">
      <slot></slot>
    </div>
  </div>
</template>
