/**
 * LcTitle - 标题组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcTitle',
  title: '标题',
  icon: 'ep:document',
  props: [
    {
      code: 'text',
      name: '标题文本',
      propType: 'Text',
      value: '标题文本',
      extraProps: {
        placeholder: '请输入标题'
      }
    },
    {
      code: 'level',
      name: '标题级别',
      propType: 'Select',
      value: 'h2',
      extraProps: {
        options: [
          { label: 'H1 一级标题', value: 'h1' },
          { label: 'H2 二级标题', value: 'h2' },
          { label: 'H3 三级标题', value: 'h3' },
          { label: 'H4 四级标题', value: 'h4' }
        ]
      }
    },
    {
      code: 'align',
      name: '对齐方式',
      propType: 'Select',
      value: 'left',
      extraProps: {
        options: [
          { label: '左对齐', value: 'left' },
          { label: '居中', value: 'center' },
          { label: '右对齐', value: 'right' }
        ]
      }
    },
    {
      code: 'color',
      name: '文字颜色',
      propType: 'Color',
      value: '#333333',
      extraProps: {}
    }
  ],
  configure: {}
}
