<!--
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2026-03-31 11:24:08
 * @LastEditors: jiying
 * @LastEditTime: 2026-04-01 17:43:15
-->
<template>
  <view :id="props.id" class="lc-image" :style="props.configure?.style" @click="handleClick">
    <image
      v-if="src"
      class="image-content"
      :src="src"
      :mode="mode"
    />
    <view v-else class="image-placeholder">
      <text class="placeholder-text">暂无图片</text>
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

const src = computed(() => props.data?.src?.value || '')
const mode = computed(() => props.data?.mode?.value || 'widthFix')
const link = computed(() => props.data?.link?.value || '')

const handleClick = () => {
  if (props.edit || !link.value) return
  if (/^https?:\/\//.test(link.value)) {
    if (typeof window !== 'undefined') {
      window.location.href = link.value
    }
  } else {
    uni.navigateTo({
      url: link.value,
      fail: () => {
        uni.redirectTo({ url: link.value })
      }
    })
  }
}
</script>

<style scoped lang="scss">
.lc-image {
  .image-content {
    width: 100%;
    border-radius: 0;
    display: block;
  }

  .image-placeholder {
    width: 100%;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 0;
    border: 1px dashed #ddd;

    .placeholder-text {
      color: #999;
      font-size: 14px;
    }
  }
}
</style>
