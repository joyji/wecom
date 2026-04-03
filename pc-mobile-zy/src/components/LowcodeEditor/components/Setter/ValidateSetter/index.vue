<!--
 * @Description: 校验规则 Setter
 * propType: 'Validate'
 * 仅表单组件使用（group: 'validate'）
 * 支持：必填、最小/最大长度、正则校验、自定义错误提示
-->
<script lang="ts" setup>
defineOptions({ name: 'LcEditorValidateSetter' })

const props = defineProps({
  item: {
    type: Object as () => any,
    default: () => ({})
  },
  value: {
    type: Object as () => any,
    default: () => ({})
  }
})

const emit = defineEmits(['update:item', 'update:value'])

const val = computed({
  get: () => props.value || {},
  set: (v) => emit('update:value', v)
})

const set = (key: string, v: any) => {
  val.value = { ...val.value, [key]: v }
}
</script>

<template>
  <div class="validate-setter">
    <div class="validate-label">{{ item?.name }}</div>

    <!-- 是否必填 -->
    <div class="validate-row">
      <span class="vl">是否必填</span>
      <el-switch
        :model-value="val.required ?? false"
        size="small"
        @update:model-value="set('required', $event)"
      />
    </div>

    <!-- 必填错误提示 -->
    <div v-if="val.required" class="validate-row">
      <span class="vl">必填提示</span>
      <el-input
        :model-value="val.requiredMsg ?? '此项不能为空'"
        size="small"
        placeholder="请输入必填提示语"
        @update:model-value="set('requiredMsg', $event)"
      />
    </div>

    <!-- 最小长度 -->
    <div class="validate-row">
      <span class="vl">最小长度</span>
      <el-input-number
        :model-value="val.minLength ?? 0"
        size="small"
        :min="0"
        :max="10000"
        controls-position="right"
        @change="set('minLength', $event ?? 0)"
      />
    </div>

    <!-- 最大长度 -->
    <div class="validate-row">
      <span class="vl">最大长度</span>
      <el-input-number
        :model-value="val.maxLength ?? 0"
        size="small"
        :min="0"
        :max="10000"
        controls-position="right"
        placeholder="0=不限制"
        @change="set('maxLength', $event ?? 0)"
      />
    </div>

    <!-- 正则表达式 -->
    <div class="validate-row">
      <span class="vl">正则校验</span>
      <el-input
        :model-value="val.pattern ?? ''"
        size="small"
        placeholder="如 ^[0-9]+$"
        @update:model-value="set('pattern', $event)"
      />
    </div>

    <!-- 正则不匹配提示 -->
    <div v-if="val.pattern" class="validate-row">
      <span class="vl">格式提示</span>
      <el-input
        :model-value="val.patternMsg ?? '格式不正确'"
        size="small"
        placeholder="正则不匹配时的提示语"
        @update:model-value="set('patternMsg', $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.validate-setter {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  font-size: 12px;
}

.validate-label {
  font-size: 12px;
  color: #555;
  font-weight: 500;
  margin-bottom: 8px;
}

.validate-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  .vl {
    width: 60px;
    flex-shrink: 0;
    color: #888;
    font-size: 12px;
  }
}
</style>
