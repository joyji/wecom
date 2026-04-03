<!--
 * @Description: 富文本 Setter
 * propType: 'RichText'
 * 使用原生 contenteditable 做轻量富文本编辑，避免引入重量级库
 * 工具栏：加粗/斜体/下划线/对齐/链接/清除格式
-->
<script lang="ts" setup>
defineOptions({ name: 'LcEditorRichTextSetter' })

const props = defineProps({
  item: {
    type: Object as () => any,
    default: () => ({})
  },
  value: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:item', 'update:value'])

const editorRef = ref<HTMLDivElement>()
const isFocused = ref(false)

// 初始化内容
onMounted(() => {
  if (editorRef.value && props.value) {
    editorRef.value.innerHTML = props.value
  }
})

// 外部 value 变化时同步（非用户输入引起）
watch(
  () => props.value,
  (newVal) => {
    if (editorRef.value && !isFocused.value) {
      editorRef.value.innerHTML = newVal || ''
    }
  }
)

const onInput = () => {
  const html = editorRef.value?.innerHTML || ''
  emit('update:value', html)
}

const execCmd = (cmd: string, value?: string) => {
  editorRef.value?.focus()
  document.execCommand(cmd, false, value)
  onInput()
}

const insertLink = () => {
  const url = prompt('请输入链接地址', 'https://')
  if (url) execCmd('createLink', url)
}
</script>

<template>
  <div class="rich-text-setter">
    <div class="rt-label">{{ item?.name }}</div>

    <!-- 工具栏 -->
    <div class="rt-toolbar">
      <el-tooltip content="加粗">
        <button class="tb-btn" @click.prevent="execCmd('bold')"><b>B</b></button>
      </el-tooltip>
      <el-tooltip content="斜体">
        <button class="tb-btn" @click.prevent="execCmd('italic')"><i>I</i></button>
      </el-tooltip>
      <el-tooltip content="下划线">
        <button class="tb-btn" @click.prevent="execCmd('underline')"><u>U</u></button>
      </el-tooltip>
      <span class="tb-divider"></span>
      <el-tooltip content="左对齐">
        <button class="tb-btn" @click.prevent="execCmd('justifyLeft')">
          <Icon icon="ep:align-left" :size="12" />
        </button>
      </el-tooltip>
      <el-tooltip content="居中">
        <button class="tb-btn" @click.prevent="execCmd('justifyCenter')">
          <Icon icon="ep:aim" :size="12" />
        </button>
      </el-tooltip>
      <el-tooltip content="右对齐">
        <button class="tb-btn" @click.prevent="execCmd('justifyRight')">
          <Icon icon="ep:right" :size="12" />
        </button>
      </el-tooltip>
      <span class="tb-divider"></span>
      <el-tooltip content="插入链接">
        <button class="tb-btn" @click.prevent="insertLink">
          <Icon icon="ep:link" :size="12" />
        </button>
      </el-tooltip>
      <el-tooltip content="清除格式">
        <button class="tb-btn" @click.prevent="execCmd('removeFormat')">
          <Icon icon="ep:brush" :size="12" />
        </button>
      </el-tooltip>
    </div>

    <!-- 编辑区 -->
    <div
      ref="editorRef"
      class="rt-editor"
      contenteditable="true"
      @input="onInput"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />

    <!-- 字符数提示 -->
    <div class="rt-footer">
      <span class="rt-tip">支持基础富文本格式</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.rich-text-setter {
  padding: 4px 0 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.rt-label {
  font-size: 12px;
  color: #888;
  margin-bottom: 6px;
}

.rt-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 4px 6px;
  background: #f7f8fa;
  border: 1px solid #e4e7ed;
  border-bottom: none;
  border-radius: 4px 4px 0 0;

  .tb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    color: #555;
    padding: 0;

    &:hover {
      background: #e6e8ed;
    }
  }

  .tb-divider {
    width: 1px;
    height: 16px;
    background: #ddd;
    margin: 0 2px;
  }
}

.rt-editor {
  min-height: 100px;
  max-height: 300px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 0 0 4px 4px;
  font-size: 13px;
  line-height: 1.6;
  outline: none;
  word-break: break-all;

  &:focus {
    border-color: #409eff;
  }

  &:empty::before {
    content: '请输入富文本内容...';
    color: #c0c4cc;
    pointer-events: none;
  }
}

.rt-footer {
  margin-top: 4px;

  .rt-tip {
    font-size: 11px;
    color: #c0c4cc;
  }
}
</style>
