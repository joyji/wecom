<!--
 * @Description: Setter 容器 - 遍历 props 动态渲染对应 Setter
 * 支持按 group 过滤，对应右侧面板的属性分类 Tab
-->
<script lang="ts">
import { components } from '@/components/LowcodeEditor/components/Setter/index'
export default {
  components: { ...components }
}
</script>
<script lang="ts" setup>
import type { LcPropGroup } from '@/components/LowcodeEditor/types'

defineOptions({ name: 'LcEditorSetter' })

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  list: {
    type: Array as () => any[],
    default: () => []
  },
  /** 按分组过滤：'props'=基础属性（默认）, 'event'=事件, 'validate'=校验 */
  group: {
    type: String as () => LcPropGroup,
    default: 'props'
  }
})

// 过滤当前分组的属性（group 缺省的视为 'props'）
const filteredProps = computed(() =>
  props.list.filter((item: any) => (item.group ?? 'props') === props.group)
)
</script>

<template>
  <div class="lc-editor-setter">
    <div v-if="props.id && props.group === 'props'" class="flex pb-10px items-center">
      <div class="w-80px font-size-12px c-gray">组件ID</div>
      <div class="flex-1 font-size-12px c-gray-400">{{ props.id }}</div>
    </div>

    <template v-if="filteredProps.length > 0">
      <component
        v-for="(item, index) in filteredProps"
        :key="item.code"
        :is="`LcEditor${item.propType}Setter`"
        v-model:item="filteredProps[index]"
        v-model:value="item.value"
      />
    </template>

    <div v-else class="empty-tip">
      <span>暂无{{ group === 'event' ? '事件' : group === 'validate' ? '校验' : '属性' }}配置</span>
    </div>
  </div>
</template>

<style scoped>
.empty-tip {
  padding: 20px 0;
  text-align: center;
  color: #aaa;
  font-size: 12px;
}
</style>
