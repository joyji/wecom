<template>
  <view :id="props.id" class="lc-spacer" :style="[spacerStyle, props.configure?.style]"></view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: [String, Number], default: '' },
  data: { type: Object, default: () => ({}) },
  configure: { type: Object, default: () => ({}) },
  edit: { type: Boolean, default: false }
})

const height = computed(() => props.data?.height?.value ?? 20)
const backgroundColor = computed(() => props.data?.backgroundColor?.value || 'transparent')

const spacerStyle = computed(() => ({
  height: `${height.value}px`,
  backgroundColor: backgroundColor.value
}))
</script>

<style scoped lang="scss">
.lc-spacer {
  width: 100%;
}
</style>
