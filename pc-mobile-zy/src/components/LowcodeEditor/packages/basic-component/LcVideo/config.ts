/**
 * LcVideo - 视频组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcVideo',
  title: '视频',
  icon: 'ep:video-play',
  props: [
    {
      code: 'src',
      name: '视频地址',
      propType: 'Text',
      value: '',
      extraProps: {
        placeholder: '请输入视频URL'
      }
    },
    {
      code: 'poster',
      name: '封面图',
      propType: 'Image',
      value: '',
      extraProps: {
        placeholder: '请选择或输入封面图'
      }
    },
    {
      code: 'autoplay',
      name: '自动播放',
      propType: 'Switch',
      value: false,
      extraProps: {}
    },
    {
      code: 'controls',
      name: '显示控制栏',
      propType: 'Switch',
      value: true,
      extraProps: {}
    },
    {
      code: 'height',
      name: '高度(px)',
      propType: 'Number',
      value: 220,
      extraProps: {
        min: 120,
        max: 600,
        step: 10
      }
    }
  ],
  configure: {}
}
