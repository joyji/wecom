/**
 * 低代码运行时组件自动注册
 * 参考 mobile-biz-lease variabilityComponents/index.js
 */
import { defineAsyncComponent } from 'vue'

const viewModules = import.meta.glob('./*/*.vue')
const components = {}

Object.keys(viewModules).forEach((modulePath) => {
  // 提取组件名并转为 PascalCase: lc-title -> LcTitle
  const temp = modulePath.split('/')[1]
    .replace(/-(\w)/g, (match, p1) => p1.toUpperCase())
  const componentName = temp.slice(0, 1).toUpperCase() + temp.slice(1)
  components[componentName] = defineAsyncComponent(viewModules[modulePath])
})

export { components }
