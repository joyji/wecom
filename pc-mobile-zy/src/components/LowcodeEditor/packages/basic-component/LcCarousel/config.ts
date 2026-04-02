/**
 * LcCarousel - 轮播图组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcCarousel',
  title: '轮播图',
  icon: 'ep:film',
  props: [
    {
      code: 'items',
      name: '图片列表',
      propType: 'Text',
      value: '[]',
      extraProps: {
        placeholder: 'JSON格式: [{"src":"url","link":"url"}]',
        tips: '轮播图片列表，JSON数组格式'
      }
    },
    {
      code: 'autoplay',
      name: '自动播放',
      propType: 'Switch',
      value: true,
      extraProps: {}
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
    },
    {
      code: 'height',
      name: '高度(px)',
      propType: 'Number',
      value: 200,
      extraProps: {
        min: 100,
        max: 600,
        step: 10
      }
    }
  ],
  configure: {}
}
