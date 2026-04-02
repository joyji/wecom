<template>
  <view :id="props.id" class="lc-button">
    <button
      class="btn"
      :class="[`btn-${btnType}`, `btn-size-${btnSize}`]"
      @click="handleClick"
    >
      {{ text }}
    </button>
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

const text = computed(() => props.data?.text?.value || '按钮')
const btnType = computed(() => props.data?.type?.value || 'primary')
const btnSize = computed(() => props.data?.size?.value || 'default')
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
.lc-button {
  padding: 8px 16px;

  .btn {
    width: 100%;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    text-align: center;
  }

  .btn-primary { background: #1677ff; color: #fff; }
  .btn-default { background: #f5f5f5; color: #333; border: 1px solid #ddd; }
  .btn-success { background: #52c41a; color: #fff; }
  .btn-warning { background: #faad14; color: #fff; }
  .btn-danger { background: #ff4d4f; color: #fff; }

  .btn-size-large { padding: 14px 20px; font-size: 16px; }
  .btn-size-default { padding: 10px 16px; font-size: 14px; }
  .btn-size-small { padding: 6px 12px; font-size: 12px; }
  .btn-size-mini { padding: 4px 8px; font-size: 11px; }
}
</style>
