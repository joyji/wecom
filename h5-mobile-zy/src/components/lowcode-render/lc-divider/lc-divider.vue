<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2026-03-31 11:24:36
 * @LastEditors: jiying
 * @LastEditTime: 2026-03-31 13:23:15
-->
<template>
  <view :id="props.id" class="lc-divider" :style="dividerStyle">
    <view class="divider-line" :style="lineStyle"></view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: [String, Number], default: '' },
  data: { type: Object, default: () => ({}) },
  configure: { type: Object, default: () => ({}) },
  edit: { type: Boolean, default: false }
})

const borderStyle = computed(() => props.data?.borderStyle?.value || 'solid')
const color = computed(() => props.data?.color?.value || '#e5e5e5')
const marginY = computed(() => props.data?.marginY?.value || 16)

const dividerStyle = computed(() => ({
  padding: `${marginY.value}px 16px`
}))

const lineStyle = computed(() => ({
  borderTopStyle: borderStyle.value,
  borderTopWidth: '1px',
  borderTopColor: color.value
}))
</script>

<style scoped lang="scss">
.lc-divider {
  .divider-line {
    width: 100%;
  }
}
</style>
