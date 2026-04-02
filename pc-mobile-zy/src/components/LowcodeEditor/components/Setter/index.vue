<!--
 * @Description: Setter 容器 - 遍历 props 动态渲染对应 Setter
 * 参考 pc-micro-base Setter/index.vue
-->
<script lang="ts">
// 注册所有的 Setter 组件
import { components } from '@/components/LowcodeEditor/components/Setter/index'
export default {
  components: { ...components }
}
</script>
<script lang="ts" setup>
defineOptions({ name: 'LcEditorSetter' })

const props = defineProps({
  id: {
    type: String,
    default: ''
  },
  list: {
    type: Array as () => any[],
    default: () => []
  }
})

const propsList = computed(() => props.list)
</script>

<template>
  <div class="lc-editor-setter">
    <div v-if="props.id" class="flex pb-10px items-center">
      <div class="w-70px font-size-12px c-gray">组件ID</div>
      <div class="flex-1">{{ props.id }}</div>
    </div>
    <component
      v-for="(item, index) in propsList"
      :key="index"
      :is="`LcEditor${item.propType}Setter`"
      v-model:item="propsList[index]"
      v-model:value="item.value"
    />
  </div>
</template>
