/**
 * LcSpacer - 间距组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcSpacer',
  title: '间距',
  icon: 'ep:minus',
  props: [
    {
      code: 'height',
      name: '高度(px)',
      propType: 'Number',
      value: 20,
      extraProps: {
        min: 0,
        max: 200,
        step: 2
      }
    },
    {
      code: 'backgroundColor',
      name: '背景颜色',
      propType: 'Color',
      value: 'transparent',
      extraProps: {}
    }
  ],
  configure: {}
}
