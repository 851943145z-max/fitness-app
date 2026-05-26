// sw.js — Service Worker（服务工人）
// 作用：让 App 能离线使用，让浏览器知道这是一个可安装的 PWA
// Service Worker 相当于在浏览器后台运行的一个"小管家"

// 缓存版本号 —— 每次更新代码时改一下这个数字，让旧缓存失效
const CACHE_VERSION = 'v2.0.0'
const CACHE_NAME = `jianshendaka-${CACHE_VERSION}`

// 安装阶段：把关键文件存进缓存，这样断网也能用
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...')
  // 安装完马上激活，不等旧版本退出
  self.skipWaiting()
})

// 激活阶段：删除旧版本缓存
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME) // 找到不是当前版本的缓存
          .map((name) => caches.delete(name))    // 把旧缓存删掉
      )
    })
  )
  // 立刻接管所有页面
  self.clients.claim()
})

// 拦截网络请求：先尝试从网络获取，失败了再从缓存取
// 这叫 "Network First" 策略，确保数据是最新的
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求（查询数据，不处理提交表单等操作）
  if (event.request.method !== 'GET') return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 网络请求成功，把结果存一份到缓存里
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
      .catch(() => {
        // 网络失败了，从缓存里找
        return caches.match(event.request)
      })
  )
})
