<template>
  <view :id="props.id" class="lc-notice" :class="`notice-${type}`" :style="props.configure?.style">
    <view class="notice-title-row">
      <text v-if="showIcon" class="notice-icon">!</text>
      <text class="notice-title">{{ title }}</text>
    </view>
    <text class="notice-content">{{ content }}</text>
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

const title = computed(() => props.data?.title?.value || '系统公告')
const content = computed(() => props.data?.content?.value || '这是一条公告内容')
const showIcon = computed(() => props.data?.showIcon?.value ?? true)
const type = computed(() => props.data?.type?.value || 'info')
</script>

<style scoped lang="scss">
.lc-notice {
  margin: 8px 16px;
  padding: 10px 12px;
  border-radius: 6px;

  .notice-title-row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
  }

  .notice-icon {
    margin-right: 6px;
    font-weight: 700;
  }

  .notice-title {
    font-size: 14px;
    font-weight: 600;
  }

  .notice-content {
    font-size: 12px;
    line-height: 1.6;
  }
}

.notice-info { background: #f0f7ff; color: #1677ff; }
.notice-success { background: #edf9e8; color: #52c41a; }
.notice-warning { background: #fff7e6; color: #fa8c16; }
.notice-error { background: #fff1f0; color: #ff4d4f; }
</style>
