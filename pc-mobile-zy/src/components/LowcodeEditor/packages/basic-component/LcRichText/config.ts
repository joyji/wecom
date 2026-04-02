/**
 * LcRichText - 富文本组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcRichText',
  title: '富文本',
  icon: 'ep:edit-pen',
  props: [
    {
      code: 'content',
      name: '富文本内容',
      propType: 'RichText',
      value: '<p>请输入富文本内容</p>',
      extraProps: {
        placeholder: '请输入富文本内容'
      }
    },
    {
      code: 'padding',
      name: '内边距(px)',
      propType: 'Number',
      value: 12,
      extraProps: {
        min: 0,
        max: 60,
        step: 1
      }
    },
    {
      code: 'backgroundColor',
      name: '背景颜色',
      propType: 'Color',
      value: '#ffffff',
      extraProps: {}
    }
  ],
  configure: {}
}
