/**
 * LcButton - 按钮组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcButton',
  title: '按钮',
  icon: 'ep:mouse',
  props: [
    {
      code: 'text',
      name: '按钮文字',
      propType: 'Text',
      value: '按钮',
      extraProps: {
        placeholder: '请输入按钮文字'
      }
    },
    {
      code: 'type',
      name: '按钮类型',
      propType: 'Select',
      value: 'primary',
      extraProps: {
        options: [
          { label: '主要按钮', value: 'primary' },
          { label: '默认按钮', value: 'default' },
          { label: '成功按钮', value: 'success' },
          { label: '警告按钮', value: 'warning' },
          { label: '危险按钮', value: 'danger' }
        ]
      }
    },
    {
      code: 'size',
      name: '按钮尺寸',
      propType: 'Select',
      value: 'default',
      extraProps: {
        options: [
          { label: '大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
          { label: '迷你', value: 'mini' }
        ]
      }
    },
    {
      code: 'link',
      name: '跳转链接',
      propType: 'Text',
      value: '',
      extraProps: {
        placeholder: '可选，点击跳转的链接'
      }
    }
  ],
  configure: {}
}
