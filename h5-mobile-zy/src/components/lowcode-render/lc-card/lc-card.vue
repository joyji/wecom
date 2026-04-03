<template>
  <view
    :id="props.id"
    class="lc-card"
    :class="[`lc-card--shadow-${shadow}`, { 'lc-card--bordered': bordered }]"
    :style="[cardStyle, props.configure?.style]"
    @click="handleClick"
  >
    <!-- 卡片头部 -->
    <view v-if="showHeader" class="lc-card__header">
      <text class="lc-card__title">{{ title }}</text>
    </view>

    <!-- 卡片内容区：递归渲染子组件 -->
    <view
      class="lc-card__body"
      :style="bodyStyle"
      :data-lc-slot="0"
      :data-lc-parent="props.id"
    >
      <template v-if="children && children.length">
        <template v-for="(col, colIdx) in children" :key="colIdx">
          <component
            v-for="child in col"
            :key="child.id"
            :is="child.componentName"
            :id="child.id"
            :data="child.propsMap || {}"
            :configure="child.configure || {}"
            :edit="props.edit"
            :children="child.children"
          />
        </template>
      </template>

      <!-- 编辑态空占位 -->
      <view v-else-if="props.edit" class="lc-card__empty">
        <text class="lc-card__empty-text">卡片内容区（拖入子组件）</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  id: { type: [String, Number], default: '' },
  data: { type: Object, default: () => ({}) },
  configure: { type: Object, default: () => ({}) },
  edit: { type: Boolean, default: false },
  children: { type: Array, default: () => [] }
})

const title = computed(() => props.data?.title?.value ?? '')
const showHeader = computed(() => props.data?.showHeader?.value ?? false)
const shadow = computed(() => props.data?.shadow?.value ?? 'always')
const bodyPadding = computed(() => props.data?.bodyPadding?.value ?? '20px')
const bordered = computed(() => props.data?.bordered?.value ?? true)
const link = computed(() => props.data?.onClick?.value)

const cardStyle = computed(() => ({}))

const bodyStyle = computed(() => ({
  padding: bodyPadding.value
}))

const handleClick = () => {
  if (props.edit) return
  const event = link.value
  if (!event) return
  if (event.type === 'url' && event.url) {
    const url = event.url
    if (/^https?:\/\//.test(url)) {
      if (typeof window !== 'undefined') window.location.href = url
    } else {
      uni.navigateTo({ url, fail: () => uni.redirectTo({ url }) })
    }
  } else if (event.type === 'fn' && event.fn) {
    try {
      const fn = new Function(event.fn)
      fn()
    } catch (e) {
      console.error('[LcCard] onClick fn error:', e)
    }
  }
}
</script>

<style scoped lang="scss">
.lc-card {
  margin: 8px 16px;
  border-radius: 8px;
  background: #fff;
  overflow: hidden;
  box-sizing: border-box;

  &--bordered {
    border: 1px solid #e8e8e8;
  }

  &--shadow-always {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &--shadow-hover {
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  &--shadow-never {
    box-shadow: none;
  }

  &__header {
    padding: 12px 16px 0;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 10px;
    margin-bottom: 0;
  }

  &__title {
    font-size: 15px;
    font-weight: 600;
    color: #333;
  }

  &__body {
    box-sizing: border-box;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
  }

  &__empty-text {
    color: #bbb;
    font-size: 13px;
  }
}
</style>
