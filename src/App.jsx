// App.jsx — 应用入口和五个页面的底部导航。
import { useState } from 'react'
import TodayPage from './pages/TodayPage.jsx'
import ExerciseLibraryPage from './pages/ExerciseLibraryPage.jsx'
import PlanPage from './pages/PlanPage.jsx'
import NutritionPage from './pages/NutritionPage.jsx'
import ProgressPage from './pages/ProgressPage.jsx'

const TABS = [
  { id: 'today', label: '今日', Page: TodayPage },
  { id: 'library', label: '动作库', Page: ExerciseLibraryPage },
  { id: 'plan', label: '计划', Page: PlanPage },
  { id: 'nutrition', label: '饮食', Page: NutritionPage },
  { id: 'progress', label: '进步', Page: ProgressPage },
]

export default function App() {
  const [currentTab, setCurrentTab] = useState(TABS[0])
  const Page = currentTab.Page

  return (
    <div className="min-h-dvh bg-slate-100">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-white pt-[env(safe-area-inset-top)] sm:border-x sm:border-slate-200">
        <main className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
          <Page key={currentTab.id} />
        </main>

        <nav aria-label="主导航"
          className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md border-t border-slate-200 bg-white/95 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur">
          {TABS.map(tab => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setCurrentTab(tab)}
              aria-current={currentTab.id === tab.id ? 'page' : undefined}
              className="flex min-h-11 flex-1 items-center justify-center text-sm font-medium text-slate-600 transition-colors hover:text-emerald-800"
            >
              <span className={`rounded-full px-2.5 py-2 ${currentTab.id === tab.id ? 'bg-emerald-50 font-bold text-emerald-800' : ''}`}>
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
