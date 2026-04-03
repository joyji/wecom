<!--
 * @Description: 事件属性 Setter
 * propType: 'Event'
 * 支持：无动作 / 跳转链接 / 自定义函数
-->
<script lang="ts" setup>
defineOptions({ name: 'LcEditorEventSetter' })

const props = defineProps({
  item: {
    type: Object as () => any,
    default: () => ({})
  },
  value: {
    type: Object as () => any,
    default: () => ({ type: 'none', url: '', fn: '' })
  }
})

const emit = defineEmits(['update:item', 'update:value'])

const eventValue = computed({
  get: () => props.value || { type: 'none', url: '', fn: '' },
  set: (val) => emit('update:value', val)
})

const actionType = computed({
  get: () => eventValue.value?.type || 'none',
  set: (val: string) => {
    eventValue.value = { ...eventValue.value, type: val }
  }
})

const actionUrl = computed({
  get: () => eventValue.value?.url || '',
  set: (val: string) => {
    eventValue.value = { ...eventValue.value, url: val }
  }
})

const actionFn = computed({
  get: () => eventValue.value?.fn || '',
  set: (val: string) => {
    eventValue.value = { ...eventValue.value, fn: val }
  }
})

const actionTypeOptions = [
  { label: '无动作', value: 'none' },
  { label: '跳转链接', value: 'link' },
  { label: '跳转页面', value: 'page' },
  { label: '自定义函数', value: 'fn' }
]
</script>

<template>
  <div class="event-setter">
    <div class="event-header">
      <span class="event-name">{{ item?.name }}</span>
    </div>
    <div class="event-row">
      <span class="event-label">动作类型</span>
      <el-select v-model="actionType" size="small" style="flex: 1">
        <el-option v-for="o in actionTypeOptions" :key="o.value" :label="o.label" :value="o.value" />
      </el-select>
    </div>

    <div v-if="actionType === 'link' || actionType === 'page'" class="event-row">
      <span class="event-label">{{ actionType === 'link' ? '链接 URL' : '页面路径' }}</span>
      <el-input
        v-model="actionUrl"
        size="small"
        :placeholder="actionType === 'link' ? 'https://...' : '/pages/xxx/xxx'"
        style="flex: 1"
      />
    </div>

    <div v-if="actionType === 'fn'" class="event-row">
      <span class="event-label">函数名</span>
      <el-input
        v-model="actionFn"
        size="small"
        placeholder="全局函数名，如 handleClick"
        style="flex: 1"
      />
    </div>

    <div v-if="actionType === 'fn'" class="event-tip">
      函数需挂载到 <code>window.__lcEvents</code> 对象上
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-setter {
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
  font-size: 12px;
}

.event-header {
  margin-bottom: 8px;

  .event-name {
    font-size: 12px;
    color: #555;
    font-weight: 500;
  }
}

.event-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .event-label {
    width: 60px;
    flex-shrink: 0;
    color: #888;
    font-size: 12px;
  }
}

.event-tip {
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 11px;
  color: #855a00;
  margin-top: 4px;

  code {
    background: #fff7e6;
    padding: 1px 4px;
    border-radius: 2px;
    font-family: monospace;
  }
}
</style>
