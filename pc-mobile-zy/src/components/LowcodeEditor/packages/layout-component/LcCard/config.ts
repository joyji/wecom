/**
 * LcCard - 卡片容器组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcCard',
  title: '卡片',
  icon: 'ep:document',
  category: 'layout',
  props: [
    // 基础属性
    { code: 'title', name: '卡片标题', propType: 'Text', value: '', group: 'props', extraProps: { placeholder: '可选，显示在卡片顶部' } },
    { code: 'showHeader', name: '显示头部', propType: 'Switch', value: false, group: 'props' },
    { code: 'shadow', name: '阴影效果', propType: 'Select', value: 'always', group: 'props', extraProps: {
      options: [
        { label: '总是显示', value: 'always' },
        { label: '悬停显示', value: 'hover' },
        { label: '从不显示', value: 'never' }
      ]
    } },
    { code: 'bodyPadding', name: '内容内边距', propType: 'Text', value: '20px', group: 'props', extraProps: { placeholder: '如 20px 或 10px 20px' } },
    { code: 'bordered', name: '显示边框', propType: 'Switch', value: true, group: 'props' },
    // 事件
    { code: 'onClick', name: '点击事件', propType: 'Event', value: { type: 'none', url: '', fn: '' }, group: 'event' }
  ],
  configure: {}
}
