// 托管环境的 API 入口。运行时从 Netlify 的服务端环境变量读取密钥和访问码。
import { analyzeMealRequest } from '../../server/mealAnalysis.js'

export default function handleMealAnalysis(request) {
  return analyzeMealRequest(request, {
    apiKey: process.env.DEEPSEEK_API_KEY,
    accessCode: process.env.MEAL_ACCESS_CODE,
    requireAccessCode: true,
  })
}

export const config = { path: '/api/meal-analysis' }
