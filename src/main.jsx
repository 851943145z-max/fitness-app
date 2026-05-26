// main.jsx — 整个 App 的启动文件
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// 注册 Service Worker（让 App 可以安装到手机桌面）
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/fitness-app/sw.js')
      .then(r => console.log('[PWA] 注册成功', r.scope))
      .catch(e => console.log('[PWA] 注册失败', e))
  })
}
