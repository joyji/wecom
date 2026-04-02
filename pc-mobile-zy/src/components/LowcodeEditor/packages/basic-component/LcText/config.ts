/**
 * LcText - 文本组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcText',
  title: '文本',
  icon: 'ep:document-copy',
  props: [
    {
      code: 'text',
      name: '文本内容',
      propType: 'Text',
      value: '这是一段文本内容',
      extraProps: {
        placeholder: '请输入文本内容'
      }
    },
    {
      code: 'fontSize',
      name: '字体大小',
      propType: 'Number',
      value: 14,
      extraProps: {
        min: 12,
        max: 48,
        step: 1
      }
    },
    {
      code: 'color',
      name: '文字颜色',
      propType: 'Color',
      value: '#4d4d4d',
      extraProps: {}
    },
    {
      code: 'lineHeight',
      name: '行高',
      propType: 'Number',
      value: 1.8,
      extraProps: {
        min: 1,
        max: 3,
        step: 0.1
      }
    }
  ],
  configure: {}
}
