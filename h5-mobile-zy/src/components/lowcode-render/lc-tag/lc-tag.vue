<template>
  <view :id="props.id" class="lc-tag" :style="props.configure?.style">
    <text class="tag" :class="[`tag-${type}`, `tag-size-${size}`]">{{ text }}</text>
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

const text = computed(() => props.data?.text?.value || '标签')
const type = computed(() => props.data?.type?.value || 'primary')
const size = computed(() => props.data?.size?.value || 'default')
</script>

<style scoped lang="scss">
.lc-tag {
  padding: 8px 16px;

  .tag {
    display: inline-block;
    border-radius: 4px;
    border: 1px solid transparent;
  }

  .tag-primary { background: #e8f3ff; color: #1677ff; border-color: #b3d8ff; }
  .tag-success { background: #edf9e8; color: #52c41a; border-color: #b7eb8f; }
  .tag-warning { background: #fff7e6; color: #fa8c16; border-color: #ffd591; }
  .tag-danger { background: #fff1f0; color: #ff4d4f; border-color: #ffccc7; }
  .tag-info { background: #f5f5f5; color: #666; border-color: #d9d9d9; }

  .tag-size-default { padding: 4px 10px; font-size: 12px; }
  .tag-size-small { padding: 2px 8px; font-size: 11px; }
  .tag-size-large { padding: 6px 12px; font-size: 13px; }
}
</style>
