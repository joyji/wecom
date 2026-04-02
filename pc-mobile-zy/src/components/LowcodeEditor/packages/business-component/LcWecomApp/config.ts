/**
 * LcWecomApp - 企微应用组件配置
 * 企微自定义工作台展示组件，支持上传图片列表，多图自动轮播
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcWecomApp',
  title: '企微应用',
  icon: 'ep:office-building',
  props: [
    {
      code: 'images',
      name: '图片列表',
      propType: 'ImageList',
      value: [],
      extraProps: {
        tips: '上传工作台展示图片，多张图片自动轮播',
        maxCount: 5
      }
    },
    {
      code: 'indicatorDots',
      name: '显示指示点',
      propType: 'Switch',
      value: true
    },
    {
      code: 'indicatorActiveColor',
      name: '指示点颜色',
      propType: 'Color',
      value: '#1677ff'
    },
    {
      code: 'interval',
      name: '切换间隔(ms)',
      propType: 'Number',
      value: 3000,
      extraProps: {
        min: 1000,
        max: 10000,
        step: 500
      }
    }
  ],
  configure: {}
}
