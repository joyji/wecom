/**
 * 组件库分组定义
 * 参考 pc-micro-base packages/index.ts
 * PC/移动端共用一套组件库
 */
import type { LcComponentLibrary } from '@/components/LowcodeEditor/types'

export const PAGE_LIBS: LcComponentLibrary[] = [
  {
    name: 'BasicComponent',
    label: '基础组件',
    icon: 'ep:grid',
    extended: true,
    components: [
      'LcTitle',
      'LcText',
      'LcImage',
      'LcButton',
      'LcCarousel',
      'LcDivider',
      'LcTag',
      'LcNotice',
      'LcVideo',
      'LcSpacer',
      'LcRichText'
    ]
  },
  {
    name: 'FormComponent',
    label: '表单组件',
    icon: 'ep:edit',
    extended: true,
    components: [
      'LcForm',
      'LcInput',
      'LcTextarea'
    ]
  },
  {
    name: 'LayoutComponent',
    label: '布局组件',
    icon: 'ep:grid',
    extended: true,
    components: [
      'LcCard'
    ]
  },
  {
    name: 'BusinessComponent',
    label: '业务组件',
    icon: 'ep:office-building',
    extended: true,
    components: [
      'LcWecomApp'
    ]
  }
]
