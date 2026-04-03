<template>
  <view class="lc-input" :style="props.configure?.style">
    <view v-if="showLabel" class="lc-input__label-row" :style="labelRowStyle">
      <text v-if="required" class="lc-input__required">*</text>
      <text class="lc-input__label">{{ label }}</text>
    </view>
    <view class="lc-input__field-wrap">
      <input
        class="lc-input__field"
        :value="innerValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="handleInput"
        @change="handleChange"
      />
      <text v-if="clearable && innerValue" class="lc-input__clear" @click="handleClear">✕</text>
    </view>
    <text v-if="errorMsg" class="lc-input__error">{{ errorMsg }}</text>
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

const label = computed(() => props.data?.label?.value ?? '输入框')
const fieldKey = computed(() => props.data?.fieldKey?.value ?? 'input')
const placeholder = computed(() => props.data?.placeholder?.value ?? '请输入')
const disabled = computed(() => props.data?.disabled?.value ?? false)
const clearable = computed(() => props.data?.clearable?.value ?? true)
const showLabel = computed(() => props.data?.showLabel?.value ?? true)
const defaultValue = computed(() => props.data?.defaultValue?.value ?? '')
const required = computed(() => props.data?.required?.value ?? false)
const maxLength = computed(() => props.data?.maxLength?.value ?? 0)
const pattern = computed(() => props.data?.pattern?.value ?? '')
const patternMsg = computed(() => props.data?.patternMsg?.value ?? '格式不正确')
const requiredMsg = computed(() => props.data?.requiredMsg?.value ?? '此项不能为空')
const labelPosition = inject('lcFormLabelPosition', 'left')
const registerField = inject('lcFormRegisterField', null)

const innerValue = ref(defaultValue.value)
const errorMsg = ref('')

const labelRowStyle = computed(() => {
  if (labelPosition === 'top') return { marginBottom: '4px' }
  return {}
})

const validate = () => {
  if (required.value && !innerValue.value) {
    errorMsg.value = requiredMsg.value
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

const handleClear = () => {
  innerValue.value = ''
  errorMsg.value = ''
}
</script>

<style scoped lang="scss">
.lc-input {
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
    display: flex;
    align-items: center;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background: #fff;
    padding: 0 10px;
    height: 40px;

    &:focus-within {
      border-color: #1677ff;
    }
  }

  &__field {
    flex: 1;
    height: 100%;
    font-size: 14px;
    color: #333;
    background: transparent;
    border: none;
    outline: none;
  }

  &__clear {
    color: #bbb;
    font-size: 14px;
    padding-left: 6px;
    cursor: pointer;
    flex-shrink: 0;
  }

  &__error {
    display: block;
    font-size: 12px;
    color: #ff4d4f;
    margin-top: 4px;
  }
}
</style>
