/**
 * 组件配置自动加载
 * 参考 pc-micro-base packages/api.ts
 * 使用 import.meta.glob 自动发现所有组件 config.ts
 */

// 导入配置模块
const configModules: Record<string, any> = import.meta.glob('./**/config.ts', { eager: true })

// 组件配置 Map: { [componentName]: componentConfig }
const config: Record<string, any> = {}

// 注册所有组件配置
Object.keys(configModules).forEach((modulePath: string) => {
  const component = configModules[modulePath].componentConfig
  if (component?.componentName) {
    config[component.componentName] = component
  }
})

export { config }
