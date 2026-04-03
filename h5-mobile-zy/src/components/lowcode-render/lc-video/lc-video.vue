<template>
  <view :id="props.id" class="lc-video" :style="[wrapperStyle, props.configure?.style]">
    <video
      class="video-player"
      :src="src"
      :poster="poster"
      :autoplay="autoplay"
      :controls="controls"
    />
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

const src = computed(() => props.data?.src?.value || '')
const poster = computed(() => props.data?.poster?.value || '')
const autoplay = computed(() => props.data?.autoplay?.value ?? false)
const controls = computed(() => props.data?.controls?.value ?? true)
const height = computed(() => props.data?.height?.value || 220)

const wrapperStyle = computed(() => ({
  height: `${height.value}px`
}))
</script>

<style scoped lang="scss">
.lc-video {
  padding: 8px 16px;

  .video-player {
    width: 100%;
    height: 100%;
    border-radius: 6px;
    background: #000;
  }
}
</style>
