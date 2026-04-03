/**
 * LcForm - 表单容器组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcForm',
  title: '表单',
  icon: 'ep:document-checked',
  category: 'form',
  props: [
    // 基础属性
    { code: 'formName', name: '表单名称', propType: 'Text', value: '表单', group: 'props', extraProps: { placeholder: '用于标识表单' } },
    { code: 'labelWidth', name: '标签宽度', propType: 'Text', value: '80px', group: 'props', extraProps: { placeholder: '如 80px 或 auto' } },
    { code: 'labelPosition', name: '标签位置', propType: 'Select', value: 'left', group: 'props', extraProps: {
      options: [
        { label: '左侧', value: 'left' },
        { label: '右侧', value: 'right' },
        { label: '顶部', value: 'top' }
      ]
    } },
    { code: 'submitText', name: '提交按钮文字', propType: 'Text', value: '提交', group: 'props', extraProps: { placeholder: '提交按钮显示文字' } },
    { code: 'resetText', name: '重置按钮文字', propType: 'Text', value: '重置', group: 'props', extraProps: { placeholder: '重置按钮显示文字' } },
    { code: 'showSubmit', name: '显示提交按钮', propType: 'Switch', value: true, group: 'props' },
    { code: 'showReset', name: '显示重置按钮', propType: 'Switch', value: true, group: 'props' },
    { code: 'disabled', name: '全局禁用', propType: 'Switch', value: false, group: 'props' },
    // 事件
    { code: 'onSubmit', name: '提交事件', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' },
    { code: 'onReset', name: '重置事件', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' },
    { code: 'onValidateFail', name: '校验失败', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' }
  ],
  configure: {}
}
