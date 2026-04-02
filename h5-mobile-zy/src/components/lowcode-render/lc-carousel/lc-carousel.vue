<template>
  <view :id="props.id" class="lc-carousel">
    <swiper
      class="carousel-swiper"
      :autoplay="autoplay"
      :interval="interval"
      :circular="true"
      :style="{ height: carouselHeight + 'px' }"
    >
      <swiper-item v-for="(item, index) in itemList" :key="index">
        <image class="carousel-image" :src="item.src" mode="aspectFill" />
      </swiper-item>
    </swiper>
    <view v-if="itemList.length === 0" class="carousel-empty" :style="{ height: carouselHeight + 'px' }">
      <text class="empty-text">暂无轮播图</text>
    </view>
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

const autoplay = computed(() => props.data?.autoplay?.value !== false)
const interval = computed(() => props.data?.interval?.value || 3000)
const carouselHeight = computed(() => props.data?.height?.value || 200)

const itemList = computed(() => {
  const raw = props.data?.items?.value
  if (!raw) return []
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch { return [] }
  }
  return Array.isArray(raw) ? raw : []
})
</script>

<style scoped lang="scss">
.lc-carousel {
  padding: 8px 16px;

  .carousel-swiper {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
  }

  .carousel-image {
    width: 100%;
    height: 100%;
  }

  .carousel-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 8px;
    border: 1px dashed #ddd;

    .empty-text {
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
