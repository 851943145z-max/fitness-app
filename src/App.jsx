// App.jsx — 应用入口
// 管理底部导航（打卡页 / 历史页）和全局打卡状态

import { useState } from 'react'
import WorkoutLog          from './components/WorkoutLog.jsx'
import CheckinCalendar     from './components/CheckinCalendar.jsx'
import HistoryPage         from './pages/HistoryPage.jsx'
import ExerciseLibraryPage from './pages/ExerciseLibraryPage.jsx'

// ── 工具函数 ──────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getTodayText() {
  return new Date().toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
}

// ── 主组件 ──────────────────────────────────────────────

function App() {
  const todayKey = getTodayKey()

  const [currentPage, setCurrentPage] = useState('home')

  const savedDate   = localStorage.getItem('checkin_date')
  const savedStreak = parseInt(localStorage.getItem('checkin_streak') || '0', 10)

  const [isCheckedIn, setIsCheckedIn] = useState(savedDate === todayKey)
  const [streak,      setStreak]      = useState(savedStreak)

  function handleCheckin() {
    if (isCheckedIn) return
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const newStreak = savedDate === yesterdayKey ? streak + 1 : 1
    localStorage.setItem('checkin_date',   todayKey)
    localStorage.setItem('checkin_streak', String(newStreak))
    const rawDates = localStorage.getItem('checkin_dates')
    const allDates = rawDates ? JSON.parse(rawDates) : []
    if (!allDates.includes(todayKey)) {
      allDates.push(todayKey)
      localStorage.setItem('checkin_dates', JSON.stringify(allDates))
    }
    setIsCheckedIn(true)
    setStreak(newStreak)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-100 pb-20">
      {currentPage === 'home' && (
        <div className="flex flex-col items-center px-6 pt-12 gap-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-600 tracking-wide">该的健身打卡</h1>
            <p className="text-sm text-gray-400 mt-1">{getTodayText()}</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-5 py-2">
              <span className="text-xl">🔥</span>
              <span className="text-base font-semibold text-orange-500">巰辞续打卡 {streak}天！</span>
            </div>
          )}
          <button onClick={handleCheckin} disabled={isCheckedIn}
            className={['W-56 h-56 rounded-full','flex flex-col items-center justify-center gap-3','text-white font-bold transition-all duration-300 select-none',isCheckedIn?'bg-emerald-300 cursor-default shadow-inner':'bg-emerald-500 shadow-2xl hover:bg-emerald-600 active:scale-95 cursor-pointer'].join(' ')}>
            <span className="text-6xl leading-none">{isCheckedIn ? '✅' : '🏋️'}</span>
            <span className="text-xl tracking-widest">{isCheckedIn ? '嶲打卡' : '打卡'}</span>
          </button>
          <p className="text-sm text-gray-500 text-center">{isCheckedIn ? '🎉 今撩完成了！显撩继续加油' : '点击上方按钮，讯录今日论׻�'}</p>
          <div className="w-full max-w-sm border-t border-emerald-200" />
          <CheckinCalendar />
          {isCheckedIn && (<><div className="w-full max-w-sm border-t border-emerald-200" /><WorkoutLog /></>)}
          <div className="h-4" />
        </div>
      )}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'library' && <ExerciseLibraryPage />}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex shadow-lg">
        {[{id:'home',icon:'🏋️',label:'打卡'},{id:'library',icon:'📚',label:'动作库'},{id:'history',icon:'📋',label:'历史'}].map(tab => (
          <button key={tab.id} onClick={() => setCurrentPage(tab.id)}
            className={['flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors relative',currentPage===tab.id?'text-emerald-600':'text-gray-400 hover:text-gray-600'].join(' ')}>
            <span className="text-2xl leading-none">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
            {currentPage===tab.id && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />}
          </button>
        ))}
      </nav>
    </div>
  )
}
export default App
