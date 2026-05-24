// vite.config.js
// Vite 的配置文件，告诉 Vite 这是一个 React 项目
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
