/**
 * LcImage - 图片组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcImage',
  title: '图片',
  icon: 'ep:picture',
  props: [
    {
      code: 'src',
      name: '图片地址',
      propType: 'Image',
      value: '',
      extraProps: {
        placeholder: '请输入图片URL'
      }
    },
    {
      code: 'mode',
      name: '显示模式',
      propType: 'Select',
      value: 'widthFix',
      extraProps: {
        options: [
          { label: '宽度撑满', value: 'widthFix' },
          { label: '高度撑满', value: 'heightFix' },
          { label: '裁剪', value: 'aspectFill' },
          { label: '缩放', value: 'aspectFit' }
        ]
      }
    },
    {
      code: 'link',
      name: '跳转链接',
      propType: 'Text',
      value: '',
      extraProps: {
        placeholder: '可选，点击图片跳转的链接'
      }
    }
  ],
  configure: {}
}
