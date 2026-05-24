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
