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

// 组件样式配置（存储在 configure.style）
export interface LcComponentStyle {
  /** 外边距 top/right/bottom/left (px) */
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  /** 内边距 top/right/bottom/left (px) */
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  /** 尺寸 */
  width?: string
  height?: string
  /** 文字颜色 */
  color?: string
  /** 背景色 */
  backgroundColor?: string
  /** 边框 */
  borderWidth?: number
  borderStyle?: string
  borderColor?: string
  /** 圆角 */
  borderRadius?: number
  /** 字体 */
  fontSize?: number
  fontWeight?: string
  /** 阴影 */
  boxShadow?: string
  /** 透明度 0-100 */
  opacity?: number
}

// 组件 configure 结构（包含样式等扩展配置）
export interface LcComponentConfigure {
  /** 组件 DOM id */
  id?: string
  /** 组件 class */
  className?: string
  /** 样式配置 */
  style?: LcComponentStyle
  [key: string]: any
}

// 组件实例（存储格式 - 使用 propsMap）
export interface LcComponentInstance {
  id: number
  componentName: string
  title: string
  icon: string
  propsMap: Record<string, LcPropValue>
  configure: LcComponentConfigure
  height?: number
  /** 布局组件子槽位，二维数组：每列/每格为一组子组件 */
  children?: LcComponentInstance[][]
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
  configure: LcComponentConfigure
  height?: number
  children?: LcComponentInstance[][]
}

// 属性分组（对应右侧面板 Tab）
export type LcPropGroup = 'props' | 'event' | 'validate'

// 属性项定义
export interface LcPropItem {
  code: string
  name: string
  propType: LcPropType
  value: any
  /** 属性分组，缺省视为 'props'（基础属性） */
  group?: LcPropGroup
  extraProps?: Record<string, any>
}

// 属性类型（对应 Setter 组件）
export type LcPropType =
  | 'Text'
  | 'Image'
  | 'Select'
  | 'Color'
  | 'Number'
  | 'Switch'
  | 'RichText'
  | 'ImageList'
  | 'Event'        // 事件绑定（跳转链接/函数名）
  | 'Validate'     // 表单校验规则（单条规则）
  | 'RadioGroup'   // 单选按钮组选项编辑
  | 'CheckboxGroup'// 多选按钮组选项编辑
  | 'Textarea'     // 多行文本输入

// 组件配置定义（config.ts 导出格式）
export interface LcComponentConfig {
  componentName: string
  title: string
  icon: string
  props: LcPropItem[]
  configure: LcComponentConfigure
  /** 组件分类：basic=基础, form=表单, layout=布局, business=业务 */
  category?: 'basic' | 'form' | 'layout' | 'business'
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
