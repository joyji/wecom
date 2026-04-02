<!--
 * @Description: 组件库面板 - 左侧物料区
 * 参考 pc-micro-base left/index.vue + DiyEditor ComponentLibrary.vue
-->
<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import draggable from 'vuedraggable'
import { config } from '@/components/LowcodeEditor/packages/api'
import type { LcComponentLibrary } from '@/components/LowcodeEditor/types'

defineOptions({ name: 'LcEditorAside' })
const lcEditor = inject('lcEditor') as any

const props = defineProps({
  list: {
    type: Array as () => LcComponentLibrary[],
    default: () => []
  }
})

// 获取分组下的组件列表
const getGroupComponents = (group: LcComponentLibrary) => {
  return group.components.map((name) => config[name]).filter(Boolean)
}

// 分组折叠状态，默认全部展开
const collapsedGroups = ref<Set<string>>(new Set())
const toggleGroup = (name: string) => {
  if (collapsedGroups.value.has(name)) {
    collapsedGroups.value.delete(name)
  } else {
    collapsedGroups.value.add(name)
  }
}
const isCollapsed = (name: string) => collapsedGroups.value.has(name)

// 拖拽开始
const handleDragStart = () => {
  lcEditor.dragstatus = true
}

// 克隆组件（从物料库拖出时生成新实例）
const handleCloneComponent = (component: any) => {
  const instance = cloneDeep(component)
  instance.id = `widget_${Date.now()}`
  return instance
}
</script>

<template>
  <el-aside width="260px" class="lc-editor-aside">
    <div class="aside-scroll">
      <div v-for="item in props.list" :key="item.name" class="component-group">
        <h4 class="group-title" @click="toggleGroup(item.name)">
          {{ item.label }}
          <Icon
            icon="ep:arrow-right"
            :size="12"
            :class="{ down: !isCollapsed(item.name) }"
            class="arrow-icon"
          />
        </h4>
        <draggable
          v-show="!isCollapsed(item.name)"
          class="component-container"
          :list="getGroupComponents(item)"
          ghost-class="draggable-ghost"
          :group="{ name: 'component', pull: 'clone', put: false }"
          :clone="handleCloneComponent"
          :sort="false"
          item-key="componentName"
          :animation="200"
          @start="handleDragStart"
        >
          <template #item="{ element }">
            <div>
              <div class="drag-placement">组件放置区域</div>
              <div class="component">
                <div class="component-icon">
                  <Icon :icon="element.icon" :size="21" />
                </div>
                <span class="component-name">{{ element.title }}</span>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </el-aside>
</template>

<style scoped lang="scss">
.lc-editor-aside {
  z-index: 1;
  flex-shrink: 0;
  user-select: none;
  background: #fff;
  box-shadow: 8px 0 8px -8px rgb(0 0 0 / 12%);

  .aside-scroll {
    height: 100%;
    overflow-y: auto;
  }

  .component-group {
    border: 1px solid #eee;
    margin: 12px;
  }

  .group-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    padding: 12px;
    margin: 0;

    .arrow-icon {
      transition: transform 0.2s ease;
    }

    .arrow-icon.down {
      transform: rotate(90deg);
    }
  }

  .component-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: stretch;
  }

  .component {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    cursor: move;
    line-height: 1;
    padding-bottom: 10px;
    transition: all 0.2s ease;
    background: #fff;
    color: #000;

    .component-icon {
      padding: 10px 5px 12px;

      .el-icon {
        color: gray;
      }
    }

    .component-name {
      font-size: 12px;
    }
  }

  .component:hover {
    background: var(--el-color-primary);
    color: var(--el-color-white);

    .component-icon .el-icon {
      color: var(--el-color-white);
    }
  }
}

/* 拖拽占位提示，默认不显示 */
.drag-placement {
  display: none;
  color: #fff;
}

.drag-area {
  .draggable-ghost {
    display: flex;
    width: 100%;
    height: 40px;
    background: linear-gradient(
      45deg,
      #91a8d5 0,
      #91a8d5 10%,
      #94b4eb 10%,
      #94b4eb 50%,
      #91a8d5 50%,
      #91a8d5 60%,
      #94b4eb 60%,
      #94b4eb
    );
    background-size: 1rem 1rem;
    transition: all 0.5s;
    justify-content: center;
    align-items: center;

    .component {
      display: none;
    }

    .drag-placement {
      display: block;
    }
  }
}
</style>
