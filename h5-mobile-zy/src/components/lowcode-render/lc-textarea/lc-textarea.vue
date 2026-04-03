<template>
  <view class="lc-textarea" :style="props.configure?.style">
    <view v-if="showLabel" class="lc-textarea__label-row">
      <text v-if="required" class="lc-textarea__required">*</text>
      <text class="lc-textarea__label">{{ label }}</text>
    </view>
    <view class="lc-textarea__field-wrap">
      <textarea
        class="lc-textarea__field"
        :value="innerValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :maxlength="maxLength > 0 ? maxLength : -1"
        :auto-height="autosize"
        :style="{ minHeight: rows * 22 + 'px' }"
        @input="handleInput"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <text v-if="clearable && innerValue" class="lc-textarea__clear" @click="handleClear">✕</text>
    </view>
    <view class="lc-textarea__footer">
      <text v-if="errorMsg" class="lc-textarea__error">{{ errorMsg }}</text>
      <text v-if="maxLength > 0" class="lc-textarea__count">{{ innerValue.length }}/{{ maxLength }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const props = defineProps({
  id: { type: [String, Number], default: '' },
  data: { type: Object, default: () => ({}) },
  configure: { type: Object, default: () => ({}) },
  edit: { type: Boolean, default: false }
})

const label = computed(() => props.data?.label?.value ?? '多行输入框')
const fieldKey = computed(() => props.data?.fieldKey?.value ?? 'textarea')
const placeholder = computed(() => props.data?.placeholder?.value ?? '请输入内容')
const disabled = computed(() => props.data?.disabled?.value ?? false)
const clearable = computed(() => props.data?.clearable?.value ?? true)
const showLabel = computed(() => props.data?.showLabel?.value ?? true)
const autosize = computed(() => props.data?.autosize?.value ?? false)
const rows = computed(() => props.data?.rows?.value ?? 4)
const defaultValue = computed(() => props.data?.defaultValue?.value ?? '')
const required = computed(() => props.data?.required?.value ?? false)
const minLength = computed(() => props.data?.minLength?.value ?? 0)
const maxLength = computed(() => props.data?.maxLength?.value ?? 0)
const pattern = computed(() => props.data?.pattern?.value ?? '')
const patternMsg = computed(() => props.data?.patternMsg?.value ?? '格式不正确')
const requiredMsg = computed(() => props.data?.requiredMsg?.value ?? '此项不能为空')

const registerField = inject('lcFormRegisterField', null)

const innerValue = ref(defaultValue.value)
const errorMsg = ref('')

const validate = () => {
  if (required.value && !innerValue.value) {
    errorMsg.value = requiredMsg.value
    return false
  }
  if (minLength.value > 0 && innerValue.value.length < minLength.value) {
    errorMsg.value = `至少输入 ${minLength.value} 个字符`
    return false
  }
  if (maxLength.value > 0 && innerValue.value.length > maxLength.value) {
    errorMsg.value = `最多输入 ${maxLength.value} 个字符`
    return false
  }
  if (pattern.value) {
    try {
      const reg = new RegExp(pattern.value)
      if (!reg.test(innerValue.value)) {
        errorMsg.value = patternMsg.value
        return false
      }
    } catch {}
  }
  errorMsg.value = ''
  return true
}

const getValue = () => ({ [fieldKey.value]: innerValue.value })

if (registerField) {
  registerField({ validate, getValue })
}

const handleInput = (e) => {
  innerValue.value = e.detail.value
  if (errorMsg.value) validate()
}

const handleChange = (e) => {
  innerValue.value = e.detail.value
}

const handleFocus = () => {}

const handleBlur = () => {
  validate()
}

const handleClear = () => {
  innerValue.value = ''
  errorMsg.value = ''
}
</script>

<style scoped lang="scss">
.lc-textarea {
  padding: 10px 16px;
  box-sizing: border-box;

  &__label-row {
    display: flex;
    align-items: center;
    margin-bottom: 6px;
  }

  &__required {
    color: #ff4d4f;
    margin-right: 2px;
    font-size: 14px;
  }

  &__label {
    font-size: 14px;
    color: #333;
    line-height: 1.4;
  }

  &__field-wrap {
    position: relative;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fff;
    padding: 8px 10px;

    &:focus-within {
      border-color: #1677ff;
    }
  }

  &__field {
    width: 100%;
    font-size: 14px;
    color: #333;
    background: transparent;
    border: none;
    outline: none;
    box-sizing: border-box;
    resize: none;
  }

  &__clear {
    position: absolute;
    top: 8px;
    right: 8px;
    color: #bbb;
    font-size: 14px;
    cursor: pointer;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 4px;
  }

  &__error {
    font-size: 12px;
    color: #ff4d4f;
  }

  &__count {
    font-size: 12px;
    color: #999;
    margin-left: auto;
  }
}
</style>
