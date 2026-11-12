// Vite 配置：提供本机开发入口，GitHub Pages 构建仍然使用原来的子路径。
import { Readable } from 'node:stream'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { analyzeMealRequest } from './server/mealAnalysis.js'

export default defineConfig(({ mode }) => {
  const { DEEPSEEK_API_KEY } = loadEnv(mode, process.cwd(), 'DEEPSEEK_')
  const { MEAL_ACCESS_CODE } = loadEnv(mode, process.cwd(), 'MEAL_')
  const base = process.env.NETLIFY ? '/' : '/fitness-app/'

  function addMealAnalysis(server) {
    server.middlewares.use(`${base}api/meal-analysis`, async (request, response, next) => {
      try {
        const method = request.method
        const input = new Request('http://localhost/api/meal-analysis', {
          method,
          headers: request.headers,
          ...(method === 'POST' && { body: Readable.toWeb(request), duplex: 'half' }),
        })
        const result = await analyzeMealRequest(input, {
          apiKey: DEEPSEEK_API_KEY,
          accessCode: MEAL_ACCESS_CODE,
        })
        response.writeHead(result.status, Object.fromEntries(result.headers))
        response.end(await result.text())
      } catch (error) {
        next(error)
      }
    })
  }

  return {
    base,
    plugins: [
      react(),
      {
        name: 'meal-analysis',
        configureServer: addMealAnalysis,
        configurePreviewServer: addMealAnalysis,
      },
    ],
  }
})
