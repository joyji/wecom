/**
 * LcNotice - 公告组件配置
 */
import type { LcComponentConfig } from '@/components/LowcodeEditor/types'

export const componentConfig: LcComponentConfig = {
  componentName: 'LcNotice',
  title: '公告',
  icon: 'ep:notification',
  props: [
    {
      code: 'title',
      name: '公告标题',
      propType: 'Text',
      value: '系统公告',
      extraProps: {
        placeholder: '请输入公告标题'
      }
    },
    {
      code: 'content',
      name: '公告内容',
      propType: 'Text',
      value: '这是一条公告内容',
      extraProps: {
        placeholder: '请输入公告内容'
      }
    },
    {
      code: 'showIcon',
      name: '显示图标',
      propType: 'Switch',
      value: true,
      extraProps: {}
    },
    {
      code: 'type',
      name: '公告类型',
      propType: 'Select',
      value: 'info',
      extraProps: {
        options: [
          { label: '信息', value: 'info' },
          { label: '成功', value: 'success' },
          { label: '警告', value: 'warning' },
          { label: '错误', value: 'error' }
        ]
      }
    }
  ],
  configure: {}
}
