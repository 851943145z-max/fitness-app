// 手机与 Mac 连在同一个 Wi-Fi 时，开放一个带临时访问码的试用地址。
import { randomBytes } from 'node:crypto'
import { createServer } from 'vite'

// 每次启动只生成一个试用访问码。DeepSeek 密钥仍从项目的本地配置读取。
const accessCode = randomBytes(12).toString('hex')
process.env.MEAL_ACCESS_CODE = accessCode

const server = await createServer({ server: { host: '0.0.0.0' } })
try {
  await server.listen()
  server.printUrls()
  console.log('手机拍照识别访问码：%s', accessCode)
} catch (error) {
  await server.close()
  throw error
}
