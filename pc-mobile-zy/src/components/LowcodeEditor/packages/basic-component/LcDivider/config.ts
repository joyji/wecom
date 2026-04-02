/**
 * LcDivider - 分割线组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcDivider',
  title: '分割线',
  icon: 'ep:semi-select',
  props: [
    {
      code: 'borderStyle',
      name: '线条样式',
      propType: 'Select',
      value: 'solid',
      extraProps: {
        options: [
          { label: '实线', value: 'solid' },
          { label: '虚线', value: 'dashed' },
          { label: '点线', value: 'dotted' }
        ]
      }
    },
    {
      code: 'color',
      name: '线条颜色',
      propType: 'Color',
      value: '#e5e5e5',
      extraProps: {}
    },
    {
      code: 'marginY',
      name: '上下间距(px)',
      propType: 'Number',
      value: 16,
      extraProps: {
        min: 0,
        max: 60,
        step: 2
      }
    }
  ],
  configure: {}
}
