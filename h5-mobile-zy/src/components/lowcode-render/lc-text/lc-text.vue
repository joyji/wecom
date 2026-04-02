<template>
  <view :id="props.id" class="lc-text" :style="textStyle">
    <text class="text-content">{{ text }}</text>
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

const text = computed(() => props.data?.text?.value || '')
const fontSize = computed(() => props.data?.fontSize?.value || 14)
const color = computed(() => props.data?.color?.value || '#4d4d4d')
const lineHeight = computed(() => props.data?.lineHeight?.value || 1.8)

const textStyle = computed(() => ({
  fontSize: fontSize.value + 'px',
  color: color.value,
  lineHeight: lineHeight.value
}))
</script>

<style scoped lang="scss">
.lc-text {
  padding: 8px 16px;

  .text-content {
    word-break: break-all;
  }
}
</style>
