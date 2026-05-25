// App.jsx — 应用入口
// 管理底部导航（今日 / 动作库 / 计划 / 进步）

import { useState } from 'react'
import TodayPage           from './pages/TodayPage.jsx'
import ExerciseLibraryPage from './pages/ExerciseLibraryPage.jsx'
import PlanPage            from './pages/PlanPage.jsx'
import ProgressPage        from './pages/ProgressPage.jsx'

// 底部导航配置
const TABS = [
  { id: 'today',    icon: '🏠', label: '今日'  },
  { id: 'library',  icon: '📚', label: '动作库' },
  { id: 'plan',     icon: '📋', label: '计划'  },
  { id: 'progress', icon: '📈', label: '进步'  },
]

export default function App() {
  const [currentTab, setCurrentTab] = useState('today')

  return (
    /*
      外层：占满全屏，深色背景
      内层容器：最大宽 430px（手机宽度），水平居中
      这样在桌面上看也像手机 App，而不是横向拉伸
    */
    <div className="min-h-screen bg-slate-950 flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-gradient-to-b from-slate-900 to-slate-800
                      relative flex flex-col">

        {/* ── 主内容区（底部留出导航栏高度）── */}
        <main className="flex-1 overflow-y-auto pb-20">
          {currentTab === 'today'    && <TodayPage />}
          {currentTab === 'library'  && <ExerciseLibraryPage />}
          {currentTab === 'plan'     && <PlanPage />}
          {currentTab === 'progress' && <ProgressPage />}
        </main>

        {/* ── 底部导航栏 ── */}
        <nav className="absolute bottom-0 left-0 right-0
                        bg-slate-900/95 backdrop-blur border-t border-white/10 flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={[
                'flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors relative',
                currentTab === tab.id
                  ? 'text-orange-400'
                  : 'text-slate-500 hover:text-slate-300',
              ].join(' ')}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
              {/* 选中指示线 */}
              {currentTab === tab.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2
                                 w-6 h-0.5 bg-orange-500 rounded-full" />
              )}
            </button>
          ))}
        </nav>

      </div>
    </div>
  )
}
