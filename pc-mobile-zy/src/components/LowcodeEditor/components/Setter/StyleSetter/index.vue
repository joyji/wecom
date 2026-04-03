<!--
 * @Description: 组件样式配置面板
 * 对应图片中的"组件样式配置"区域
 * 包含：ID/Class、外边距/内边距（盒模型）、尺寸、颜色、背景色、边框、圆角、字体、阴影、透明度
 * 数据写入 widget.configure.style（不走 propsMap，直接读写 configure）
-->
<script lang="ts" setup>
import type { LcComponentStyle } from '@/components/LowcodeEditor/types'

defineOptions({ name: 'LcEditorStyleSetter' })

const props = defineProps({
  widget: {
    type: Object as () => any,
    default: null
  }
})

const ensureStyle = () => {
  if (!props.widget) return
  if (!props.widget.configure) props.widget.configure = {}
  if (!props.widget.configure.style) props.widget.configure.style = {}
}

const style = computed<LcComponentStyle>(() => {
  ensureStyle()
  return props.widget?.configure?.style || {}
})

const configure = computed(() => {
  ensureStyle()
  return props.widget?.configure || {}
})

const setStyle = (key: keyof LcComponentStyle, val: any) => {
  ensureStyle()
  props.widget.configure.style[key] = val
}

const setConfigure = (key: string, val: any) => {
  ensureStyle()
  props.widget.configure[key] = val
}

const marginLinked = ref(false)
const paddingLinked = ref(false)

const setMarginAll = (val: number) => {
  ;(['marginTop', 'marginRight', 'marginBottom', 'marginLeft'] as (keyof LcComponentStyle)[]).forEach(
    (k) => setStyle(k, val)
  )
}

const setPaddingAll = (val: number) => {
  ;(['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as (keyof LcComponentStyle)[]).forEach(
    (k) => setStyle(k, val)
  )
}

const borderStyleOptions = [
  { label: '无', value: 'none' },
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' }
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '加粗', value: 'bold' },
  { label: '细体', value: '300' }
]

const clearStyle = () => {
  if (props.widget?.configure) {
    props.widget.configure.style = {}
  }
}

const previewStyle = computed(() => {
  const s = style.value
  const result: Record<string, any> = {}
  if (s.color) result.color = s.color
  if (s.backgroundColor) result.backgroundColor = s.backgroundColor
  if (s.fontSize) result.fontSize = s.fontSize + 'px'
  if (s.fontWeight) result.fontWeight = s.fontWeight
  if (s.borderRadius) result.borderRadius = s.borderRadius + 'px'
  if (s.borderWidth && s.borderStyle && s.borderStyle !== 'none') {
    result.border = `${s.borderWidth}px ${s.borderStyle} ${s.borderColor || '#ccc'}`
  }
  if (s.boxShadow) result.boxShadow = s.boxShadow
  if (s.opacity !== undefined && s.opacity !== 100) result.opacity = s.opacity / 100
  result.padding = '8px 12px'
  result.display = 'inline-block'
  result.minWidth = '80px'
  result.textAlign = 'center'
  if (!result.fontSize) result.fontSize = '14px'
  if (!result.borderRadius) result.borderRadius = '4px'
  return result
})
</script>

<template>
  <div v-if="widget" class="style-setter">
    <!-- ID / Class -->
    <div class="style-section">
      <div class="style-row">
        <span class="style-label">ID</span>
        <el-input
          :model-value="configure.id"
          size="small"
          placeholder="组件 ID"
          @update:model-value="setConfigure('id', $event)"
        />
      </div>
      <div class="style-row">
        <span class="style-label">Class</span>
        <el-input
          :model-value="configure.className"
          size="small"
          placeholder="CSS 类名（空格分隔）"
          @update:model-value="setConfigure('className', $event)"
        />
      </div>
    </div>

    <!-- 外边距 -->
    <div class="style-section">
      <div class="section-title">
        <span>外边距</span>
        <el-tooltip content="四边同值">
          <el-switch v-model="marginLinked" size="small" />
        </el-tooltip>
      </div>
      <div v-if="marginLinked" class="style-row">
        <span class="style-label">外边距</span>
        <el-input-number
          :model-value="style.marginTop ?? 0"
          size="small" :min="0" :max="200" controls-position="right"
          @change="setMarginAll($event ?? 0)"
        />
        <span class="unit">px</span>
      </div>
      <div v-else class="box-model-inputs">
        <div class="box-row">
          <el-input-number
            :model-value="style.marginTop ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('marginTop', $event ?? 0)"
          />
        </div>
        <div class="box-middle-row">
          <el-input-number
            :model-value="style.marginLeft ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('marginLeft', $event ?? 0)"
          />
          <div class="box-center-label">外</div>
          <el-input-number
            :model-value="style.marginRight ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('marginRight', $event ?? 0)"
          />
        </div>
        <div class="box-row">
          <el-input-number
            :model-value="style.marginBottom ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('marginBottom', $event ?? 0)"
          />
        </div>
      </div>
    </div>

    <!-- 内边距 -->
    <div class="style-section">
      <div class="section-title">
        <span>内边距</span>
        <el-tooltip content="四边同值">
          <el-switch v-model="paddingLinked" size="small" />
        </el-tooltip>
      </div>
      <div v-if="paddingLinked" class="style-row">
        <span class="style-label">内边距</span>
        <el-input-number
          :model-value="style.paddingTop ?? 0"
          size="small" :min="0" :max="200" controls-position="right"
          @change="setPaddingAll($event ?? 0)"
        />
        <span class="unit">px</span>
      </div>
      <div v-else class="box-model-inputs">
        <div class="box-row">
          <el-input-number
            :model-value="style.paddingTop ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('paddingTop', $event ?? 0)"
          />
        </div>
        <div class="box-middle-row">
          <el-input-number
            :model-value="style.paddingLeft ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('paddingLeft', $event ?? 0)"
          />
          <div class="box-center-label">内</div>
          <el-input-number
            :model-value="style.paddingRight ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('paddingRight', $event ?? 0)"
          />
        </div>
        <div class="box-row">
          <el-input-number
            :model-value="style.paddingBottom ?? 0" size="small" :min="0" :max="200"
            controls-position="right"
            @change="setStyle('paddingBottom', $event ?? 0)"
          />
        </div>
      </div>
    </div>

    <!-- 尺寸 -->
    <div class="style-section">
      <div class="section-title">尺寸</div>
      <div class="style-row">
        <span class="style-label">宽度</span>
        <el-input
          :model-value="style.width ?? ''"
          size="small" placeholder="如 100px / 50%"
          @update:model-value="setStyle('width', $event)"
        />
      </div>
      <div class="style-row">
        <span class="style-label">高度</span>
        <el-input
          :model-value="style.height ?? ''"
          size="small" placeholder="如 100px / auto"
          @update:model-value="setStyle('height', $event)"
        />
      </div>
    </div>

    <!-- 颜色 / 背景色 -->
    <div class="style-section">
      <div class="style-row">
        <span class="style-label">颜色</span>
        <el-color-picker
          :model-value="style.color ?? ''"
          show-alpha
          @update:model-value="setStyle('color', $event)"
        />
        <el-input
          :model-value="style.color ?? ''"
          size="small" style="flex: 1; margin-left: 6px"
          placeholder="#333333"
          @update:model-value="setStyle('color', $event)"
        />
      </div>
      <div class="style-row">
        <span class="style-label">背景色</span>
        <el-color-picker
          :model-value="style.backgroundColor ?? ''"
          show-alpha
          @update:model-value="setStyle('backgroundColor', $event)"
        />
        <el-input
          :model-value="style.backgroundColor ?? ''"
          size="small" style="flex: 1; margin-left: 6px"
          placeholder="transparent"
          @update:model-value="setStyle('backgroundColor', $event)"
        />
      </div>
    </div>

    <!-- 边框 -->
    <div class="style-section">
      <div class="section-title">边框</div>
      <div class="style-row">
        <span class="style-label">样式</span>
        <el-select
          :model-value="style.borderStyle ?? 'none'"
          size="small"
          @update:model-value="setStyle('borderStyle', $event)"
        >
          <el-option v-for="o in borderStyleOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </div>
      <div class="style-row">
        <span class="style-label">宽度</span>
        <el-input-number
          :model-value="style.borderWidth ?? 0"
          size="small" :min="0" :max="20" controls-position="right"
          @change="setStyle('borderWidth', $event ?? 0)"
        />
        <span class="unit">px</span>
      </div>
      <div class="style-row">
        <span class="style-label">颜色</span>
        <el-color-picker
          :model-value="style.borderColor ?? ''"
          @update:model-value="setStyle('borderColor', $event)"
        />
      </div>
    </div>

    <!-- 圆角 -->
    <div class="style-section">
      <div class="style-row">
        <span class="style-label">圆角</span>
        <el-input-number
          :model-value="style.borderRadius ?? 0"
          size="small" :min="0" :max="200" controls-position="right"
          @change="setStyle('borderRadius', $event ?? 0)"
        />
        <span class="unit">px</span>
      </div>
    </div>

    <!-- 字体 -->
    <div class="style-section">
      <div class="section-title">字体</div>
      <div class="style-row">
        <span class="style-label">大小</span>
        <el-input-number
          :model-value="style.fontSize ?? 14"
          size="small" :min="10" :max="72" controls-position="right"
          @change="setStyle('fontSize', $event ?? 14)"
        />
        <span class="unit">px</span>
      </div>
      <div class="style-row">
        <span class="style-label">字重</span>
        <el-select
          :model-value="style.fontWeight ?? 'normal'"
          size="small"
          @update:model-value="setStyle('fontWeight', $event)"
        >
          <el-option v-for="o in fontWeightOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
      </div>
    </div>

    <!-- 阴影 -->
    <div class="style-section">
      <div class="style-row">
        <span class="style-label">阴影</span>
        <el-input
          :model-value="style.boxShadow ?? ''"
          size="small"
          placeholder="0 2px 8px rgba(0,0,0,0.1)"
          @update:model-value="setStyle('boxShadow', $event)"
        />
      </div>
    </div>

    <!-- 透明度 -->
    <div class="style-section">
      <div class="style-row">
        <span class="style-label">透明度</span>
        <el-slider
          :model-value="style.opacity ?? 100"
          :min="0" :max="100" :step="1"
          style="flex: 1; margin: 0 8px"
          @update:model-value="setStyle('opacity', $event)"
        />
        <span class="unit-value">{{ style.opacity ?? 100 }}%</span>
      </div>
    </div>

    <!-- 样式预览 -->
    <div class="style-section">
      <div class="section-title">样式预览</div>
      <div class="preview-wrap">
        <span :style="previewStyle">示例文字 Aa</span>
      </div>
    </div>

    <div class="style-section">
      <el-button size="small" text type="danger" @click="clearStyle">清除所有样式</el-button>
    </div>
  </div>

  <div v-else class="empty-tip">请选择组件</div>
</template>

<style scoped lang="scss">
.style-setter {
  font-size: 12px;
}

.style-section {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 8px;
}

.style-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 6px;

  &:last-child {
    margin-bottom: 0;
  }

  .style-label {
    width: 44px;
    flex-shrink: 0;
    color: #888;
    font-size: 12px;
    text-align: right;
    padding-right: 4px;
  }

  .unit {
    color: #aaa;
    font-size: 11px;
    white-space: nowrap;
  }

  .unit-value {
    width: 36px;
    text-align: right;
    color: #666;
    font-size: 11px;
    flex-shrink: 0;
  }
}

.box-model-inputs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;

  .box-row {
    display: flex;
    justify-content: center;

    :deep(.el-input-number) {
      width: 76px;
    }
  }

  .box-middle-row {
    display: flex;
    align-items: center;
    gap: 4px;

    :deep(.el-input-number) {
      width: 68px;
    }

    .box-center-label {
      width: 26px;
      height: 26px;
      background: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #909399;
      flex-shrink: 0;
    }
  }
}

.preview-wrap {
  padding: 10px;
  background: #fafafa;
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.empty-tip {
  padding: 24px 0;
  text-align: center;
  color: #aaa;
  font-size: 12px;
}
</style>
