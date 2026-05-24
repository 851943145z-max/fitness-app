// tailwind.config.js
// 告诉 Tailwind CSS 去哪里找需要处理的文件
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",  // src 文件夹下所有 .js 和 .jsx 文件
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
