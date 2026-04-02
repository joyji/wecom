<template>
  <view :id="props.id" class="lc-rich-text" :style="richStyle">
    <rich-text :nodes="content"></rich-text>
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

const content = computed(() => props.data?.content?.value || '<p>请输入富文本内容</p>')
const padding = computed(() => props.data?.padding?.value ?? 12)
const backgroundColor = computed(() => props.data?.backgroundColor?.value || '#ffffff')

const richStyle = computed(() => ({
  padding: `${padding.value}px`,
  backgroundColor: backgroundColor.value
}))
</script>

<style scoped lang="scss">
.lc-rich-text {
  box-sizing: border-box;
}
</style>
