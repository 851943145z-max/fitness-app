// main.jsx — 整个 App 的启动文件
// 它只做一件事：把 App 组件"贴"到 index.html 里的 <div id="root"> 上

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'   // 加载全局样式（包含 Tailwind CSS）

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// ── 注册 Service Worker（让 App 可以安装到手机桌面）──
// 只有在正式部署环境（https）才注册，本地开发时不用
if ('serviceWorker' in navigator) {
  // window.addEventListener('load') 表示等页面加载完再注册，不影响首屏速度
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker 注册成功！', registration.scope)
      })
      .catch((error) => {
        console.log('[PWA] Service Worker 注册失败：', error)
      })
  })
}
