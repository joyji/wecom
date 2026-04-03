/**
 * LcTextarea - 多行文本输入框组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcTextarea',
  title: '多行输入框',
  icon: 'ep:document',
  category: 'form',
  props: [
    // 基础属性
    { code: 'label', name: '字段标签', propType: 'Text', value: '多行输入框', group: 'props', extraProps: { placeholder: '请输入标签名' } },
    { code: 'fieldKey', name: '字段Key', propType: 'Text', value: 'textarea', group: 'props', extraProps: { placeholder: '用于表单提交的字段名' } },
    { code: 'placeholder', name: '占位文字', propType: 'Text', value: '请输入内容', group: 'props', extraProps: { placeholder: '输入框提示文字' } },
    { code: 'defaultValue', name: '默认值', propType: 'Textarea', value: '', group: 'props', extraProps: { placeholder: '默认填充值', rows: 3 } },
    { code: 'rows', name: '显示行数', propType: 'Number', value: 4, group: 'props', extraProps: { min: 2, max: 20, step: 1 } },
    { code: 'disabled', name: '是否禁用', propType: 'Switch', value: false, group: 'props' },
    { code: 'clearable', name: '可清除', propType: 'Switch', value: true, group: 'props' },
    { code: 'showLabel', name: '显示标签', propType: 'Switch', value: true, group: 'props' },
    { code: 'autosize', name: '自适应高度', propType: 'Switch', value: false, group: 'props' },
    // 事件
    { code: 'onChange', name: '值变化', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' },
    { code: 'onFocus', name: '获得焦点', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' },
    { code: 'onBlur', name: '失去焦点', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' },
    // 校验
    { code: 'required', name: '是否必填', propType: 'Switch', value: false, group: 'validate' },
    { code: 'requiredMsg', name: '必填提示', propType: 'Text', value: '此项不能为空', group: 'validate', extraProps: { placeholder: '必填校验提示语' } },
    { code: 'minLength', name: '最小长度', propType: 'Number', value: 0, group: 'validate', extraProps: { placeholder: '0=不限制', min: 0 } },
    { code: 'maxLength', name: '最大长度', propType: 'Number', value: 0, group: 'validate', extraProps: { placeholder: '0=不限制', min: 0 } },
    { code: 'pattern', name: '正则校验', propType: 'Text', value: '', group: 'validate', extraProps: { placeholder: '如 ^[0-9]+$' } },
    { code: 'patternMsg', name: '格式提示', propType: 'Text', value: '格式不正确', group: 'validate', extraProps: { placeholder: '正则不匹配时的提示' } }
  ],
  configure: {}
}
