// vite.config.js
// Vite 的配置文件，告诉 Vite 这是一个 React 项目
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base 告诉 Vite 这个 App 部署在哪个路径下
  // GitHub Pages 会把 App 放在 /fitness-app/ 子路径，所以要设置这个
  base: '/fitness-app/',
})
