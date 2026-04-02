/**
 * LcTag - 标签组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcTag',
  title: '标签',
  icon: 'ep:price-tag',
  props: [
    {
      code: 'text',
      name: '标签文字',
      propType: 'Text',
      value: '标签',
      extraProps: {
        placeholder: '请输入标签文字'
      }
    },
    {
      code: 'type',
      name: '标签类型',
      propType: 'Select',
      value: 'primary',
      extraProps: {
        options: [
          { label: '主要', value: 'primary' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '危险', value: 'danger' },
          { label: '信息', value: 'info' }
        ]
      }
    },
    {
      code: 'size',
      name: '标签尺寸',
      propType: 'Select',
      value: 'default',
      extraProps: {
        options: [
          { label: '默认', value: 'default' },
          { label: '小', value: 'small' },
          { label: '大', value: 'large' }
        ]
      }
    }
  ],
  configure: {}
}
