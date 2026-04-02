/**
 * 低代码页面构建器 - 核心类型定义
 */

// 平台模式
export type PlatformMode = 'pc' | 'mobile'

// 项目状态
export type ProjectStatus = 'draft' | 'published'

// 项目
export interface LcProject {
  projectKey: string
  name: string
  description?: string
  status: ProjectStatus
  pageList: LcPage[]
  configure?: Record<string, any>
}

// 页面
export interface LcPage {
  pageKey: string
  name: string
  /** 当前活跃的组件列表（跟随 platformMode 切换） */
  componentList: LcComponentInstance[]
  /** 移动端组件列表（平台切换时的备份存储） */
  mobileComponentList: LcComponentInstance[]
  /** PC端组件列表（平台切换时的备份存储） */
  pcComponentList: LcComponentInstance[]
  configure: LcPageConfigure
}

// 页面配置
export interface LcPageConfigure {
  backgroundColor?: string
  backgroundImage?: string
  /** 高度模式：auto=自动高度, fixed=固定高度 */
  heightMode?: 'auto' | 'fixed'
  /** 固定高度值(px)，仅 heightMode='fixed' 时生效 */
  height?: number
}

// 组件实例（存储格式 - 使用 propsMap）
export interface LcComponentInstance {
  id: number
  componentName: string
  title: string
  icon: string
  propsMap: Record<string, LcPropValue>
  configure: Record<string, any>
  height?: number
}

// 属性值（存储格式）
export interface LcPropValue {
  value: any
  extraProps?: Record<string, any>
}

// 组件实例（编辑器内部格式 - 使用 props 数组）
export interface LcComponentEditorInstance {
  id: number
  componentName: string
  title: string
  icon: string
  props: LcPropItem[]
  configure: Record<string, any>
  height?: number
}

// 属性项定义
export interface LcPropItem {
  code: string
  name: string
  propType: LcPropType
  value: any
  extraProps?: Record<string, any>
}

// 属性类型（对应 Setter 组件）
export type LcPropType = 'Text' | 'Image' | 'Select' | 'Color' | 'Number' | 'Switch' | 'RichText' | 'ImageList'

// 组件配置定义（config.ts 导出格式）
export interface LcComponentConfig {
  componentName: string
  title: string
  icon: string
  props: LcPropItem[]
  configure: Record<string, any>
}

// 组件库分组
export interface LcComponentLibrary {
  name: string
  label: string
  icon: string
  extended?: boolean
  components: string[]
}

// PostMessage 编辑器 → 模拟器
export interface LcEditorMessage {
  even: 'init' | 'list' | 'move' | 'drop' | 'changeCurrWidget' | 'platform'
  params: any
}

// PostMessage 模拟器 → 编辑器
export interface LcSimulatorMessage {
  type: 'setList' | 'setHeight' | 'setCurrWidget'
  params: any
}
