<template>
  <view :id="props.id" class="lc-title" :style="[titleStyle, props.configure?.style]">
    <text :class="['title-text', `title-${level}`]">{{ text }}</text>
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

const text = computed(() => props.data?.text?.value || '标题文本')
const level = computed(() => props.data?.level?.value || 'h2')
const align = computed(() => props.data?.align?.value || 'left')
const color = computed(() => props.data?.color?.value || '#333333')

const titleStyle = computed(() => ({
  textAlign: align.value,
  color: color.value
}))
</script>

<style scoped lang="scss">
.lc-title {
  padding: 12px 16px;

  .title-text {
    font-weight: 600;
    line-height: 1.4;
  }

  .title-h1 { font-size: 24px; }
  .title-h2 { font-size: 20px; }
  .title-h3 { font-size: 17px; }
  .title-h4 { font-size: 15px; }
}
</style>
