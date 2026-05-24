// generate-icons.js — 把 SVG 图标转成手机需要的 PNG 格式
// 运行方式：node scripts/generate-icons.js

import sharp from 'sharp'
import path  from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function generate() {
  const svgPath = path.join(__dirname, '../public/icon.svg')

  // 180x180：苹果设备的"添加到主屏幕"图标尺寸
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/icon-180.png'))

  // 512x512：Android 设备和 PWA 标准图标尺寸
  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/icon-512.png'))

  console.log('✅ 图标生成完成！')
}

generate().catch(err => {
  console.error('❌ 生成失败：', err.message)
})
