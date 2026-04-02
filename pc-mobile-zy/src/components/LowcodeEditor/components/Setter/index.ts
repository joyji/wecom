/**
 * Setter 组件注册
 * 参考 pc-micro-base Setter/index.ts
 * 通过 import.meta.glob 自动发现并注册所有 Setter 组件
 */

// 导入 Setter 界面模块
const viewModules: Record<string, any> = import.meta.glob('./*/*.vue')

// Setter 组件集合
const components: Record<string, any> = {}

// 自动注册所有 Setter 组件
Object.keys(viewModules).forEach((modulePath: string) => {
  const componentName = modulePath.split('/')[1]
  components[`LcEditor${componentName}`] = defineAsyncComponent(viewModules[modulePath])
})

export { components }
