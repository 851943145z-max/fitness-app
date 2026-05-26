import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages 部署在 /fitness-app/ 子路径
  base: '/fitness-app/',
})
