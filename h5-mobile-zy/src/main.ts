/*
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-06-11 14:59:27
 * @LastEditors: jiying
 * @LastEditTime: 2025-10-15 14:57:44
 */
import { createSSRApp } from "vue";
import App from "./App.vue";
// import {initTracker, exTriggerEvent} from './utils/tracker'

// initTracker(); // 初始化埋点
// // 将 exTriggerEvent 挂载到 window 对象上
// (window as any).triggerEvent = exTriggerEvent;

// 只在开发环境启用 eruda 调试工具
const env = import.meta.env.MODE
// if (env != 'prod') {
//   import('eruda').then(eruda => {
//     eruda.default.init();
//   });
// }
// 新增全局变量
const globalVars = {
  isTransition: 0, // 0: 不展示过渡动画 1: 展示过渡动画
  isBack: false, // 0: 不展示过渡动画 1: 展示过渡动画
};export function createApp() {
  const app = createSSRApp(App);
  // 将全局变量挂载到app实例上
  app.config.globalProperties.$global = globalVars;
  return {
    app,
  };
}
