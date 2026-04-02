/*
 * @Description: 
 * @version: 1.0.0
 * @Author: jiying
 * @Date: 2025-06-11 14:59:28
 * @LastEditors: jiying
 * @LastEditTime: 2025-06-11 17:03:25
 */
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()]
});
