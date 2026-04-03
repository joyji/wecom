<template>
  <view :id="props.id" class="lc-form" :style="props.configure?.style">
    <!-- 递归渲染子组件 -->
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

    <!-- 按钮区域 -->
    <view class="lc-form__actions" :style="actionsStyle">
      <button
        v-if="showReset"
        class="lc-form__btn lc-form__btn--reset"
        :disabled="disabled"
        @click="handleReset"
      >{{ resetText }}</button>
      <button
        v-if="showSubmit"
        class="lc-form__btn lc-form__btn--submit"
        :disabled="disabled"
        @click="handleSubmit"
      >{{ submitText }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed, provide, ref } from 'vue'

const props = defineProps({
  id: { type: [String, Number], default: '' },
  data: { type: Object, default: () => ({}) },
  configure: { type: Object, default: () => ({}) },
  edit: { type: Boolean, default: false },
  children: { type: Array, default: () => [] }
})

const labelPosition = computed(() => props.data?.labelPosition?.value ?? 'left')
const labelWidth = computed(() => props.data?.labelWidth?.value ?? '80px')
const submitText = computed(() => props.data?.submitText?.value ?? '提交')
const resetText = computed(() => props.data?.resetText?.value ?? '重置')
const showSubmit = computed(() => props.data?.showSubmit?.value ?? true)
const showReset = computed(() => props.data?.showReset?.value ?? true)
const disabled = computed(() => props.data?.disabled?.value ?? false)

// 收集子表单字段的注册器
const fieldList = ref([])

provide('lcFormLabelPosition', labelPosition)
provide('lcFormLabelWidth', labelWidth)
provide('lcFormRegisterField', (fieldCtrl) => {
  fieldList.value.push(fieldCtrl)
})

const actionsStyle = computed(() => {
  const style = {
    justifyContent: showReset.value && showSubmit.value ? 'space-between' : 'center'
  }
  return style
})

const handleSubmit = () => {
  if (props.edit) return
  let valid = true
  const formData = {}

  fieldList.value.forEach((field) => {
    if (!field.validate()) valid = false
    Object.assign(formData, field.getValue())
  })

  if (!valid) return

  const onSubmit = props.data?.onSubmit?.value
  if (onSubmit?.type === 'url' && onSubmit.url) {
    const query = Object.keys(formData)
      .map((k) => `${k}=${encodeURIComponent(formData[k])}`)
      .join('&')
    const url = onSubmit.url + (onSubmit.url.includes('?') ? '&' : '?') + query
    if (/^https?:\/\//.test(url)) {
      if (typeof window !== 'undefined') window.location.href = url
    } else {
      uni.navigateTo({ url, fail: () => uni.redirectTo({ url }) })
    }
  } else if (onSubmit?.type === 'fn' && onSubmit.fn) {
    try {
      const fn = new Function('formData', onSubmit.fn)
      fn(formData)
    } catch (e) {
      console.error('[LcForm] onSubmit fn error:', e)
    }
  }
}

const handleReset = () => {
  if (props.edit) return
  fieldList.value.forEach((field) => {
    if (field.reset) field.reset()
  })
}
</script>

<style scoped lang="scss">
.lc-form {
  padding: 12px 0;
  box-sizing: border-box;

  &__actions {
    display: flex;
    align-items: center;
    padding: 12px 16px 4px;
    gap: 12px;
  }

  &__btn {
    flex: 1;
    height: 40px;
    border-radius: 6px;
    font-size: 14px;
    border: none;
    cursor: pointer;
    text-align: center;

    &--submit {
      background: #1677ff;
      color: #fff;
    }

    &--reset {
      background: #f5f5f5;
      color: #666;
      border: 1px solid #d9d9d9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
