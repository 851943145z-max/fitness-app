// TodayPage.jsx — 今天的训练、快捷打卡、统计和最近记录。
import { useState } from 'react'
import CheckinCalendar from '../components/CheckinCalendar.jsx'
import {
  getStreak, getWeeklyCount, getMonthlyCount,
  hasTodaySession, loadPRs, saveSession,
} from '../utils/workoutStats.js'
import { getActivePlan, getNextWorkoutDay } from '../data/workoutPlans.js'
import { exerciseLibrary } from '../data/exerciseLibrary.js'

function getTodayText() {
  return new Date().toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'long',
  })
}

function TodayWorkoutCard({ workoutDay, isDone, onCheckIn }) {
  if (!workoutDay) {
    return (
      <section className="rounded-3xl bg-emerald-50 p-5">
        <h2 className="text-xl font-bold">今天是休息日</h2>
      </section>
    )
  }

  return (
    <section className="rounded-3xl bg-emerald-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-emerald-800">
        <span>{isDone ? '今日已完成' : '今日计划'}</span>
        <span className="font-medium">{workoutDay.exercises.length} 个动作 · {workoutDay.estimatedMinutes} 分钟</span>
      </div>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{workoutDay.name}</h2>
      <p className="mt-1 text-sm text-slate-600">{workoutDay.muscles}</p>

      <ul className="my-4 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-emerald-100 pt-3">
        {workoutDay.exercises.map(({ exerciseId }, index) => {
          const exercise = exerciseLibrary.find(entry => entry.id === exerciseId)
          return (
            <li key={`${exerciseId}-${index}`} className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-700">
              <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 rounded-full bg-emerald-600" />
              {exercise?.name || exerciseId}
            </li>
          )
        })}
      </ul>

      {!isDone && (
        <button type="button" onClick={onCheckIn}
          className="min-h-11 w-full rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-800">
          完成今日训练
        </button>
      )}
    </section>
  )
}

function StatsRow({ streak, weekly, monthly }) {
  return (
    <dl className="grid grid-cols-3 divide-x divide-slate-200 rounded-2xl border border-slate-200 py-3 text-center">
      {[
        { label: '连续训练', value: streak, unit: '天' },
        { label: '本周完成', value: weekly, unit: '次' },
        { label: '本月打卡', value: monthly, unit: '次' },
      ].map(({ label, value, unit }) => (
        <div key={label} className="flex flex-col-reverse gap-0.5">
          <dt className="text-xs text-slate-600">{label}</dt>
          <dd className="text-2xl font-bold tabular-nums text-slate-950">
            {value} <span className="text-xs font-medium text-slate-600">{unit}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

function PRCard() {
  const entries = Object.entries(loadPRs())
    .sort((first, second) => second[1].date.localeCompare(first[1].date))
    .slice(0, 2)
  if (entries.length === 0) return null

  return (
    <section>
      <h2 className="mb-2 text-base font-bold">最近最佳记录</h2>
      <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
        {entries.map(([exerciseId, record]) => {
          const exercise = exerciseLibrary.find(entry => entry.id === exerciseId)
          return (
            <li key={exerciseId} className="flex items-center justify-between gap-2 py-3 text-sm">
              <span>{exercise?.name || exerciseId}</span>
              <span className="shrink-0 font-semibold text-emerald-800">{record.weight} kg × {record.reps}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export default function TodayPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const plan = getActivePlan()
  const workoutDay = getNextWorkoutDay(plan)
  const isDone = hasTodaySession()

  // 一键打卡保存已完成记录，供统计、日历和进步页读取。
  function handleCheckIn() {
    if (!workoutDay) return
    saveSession({
      id: Date.now().toString(),
      date: new Date().toISOString().slice(0, 10),
      planType: plan.id,
      workoutDayId: workoutDay.id,
      workoutName: workoutDay.chineseName,
      muscleGroups: workoutDay.muscleGroups,
      duration: 0,
      exercises: [],
      completed: true,
    })
    setRefreshKey(key => key + 1)
  }

  return (
    <div className="space-y-5 px-5 pt-7" key={refreshKey}>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">我的健身打卡</h1>
        <p className="mt-1 text-sm text-slate-600">{getTodayText()}</p>
      </header>
      <TodayWorkoutCard workoutDay={workoutDay} isDone={isDone} onCheckIn={handleCheckIn} />
      <StatsRow streak={getStreak()} weekly={getWeeklyCount()} monthly={getMonthlyCount()} />
      <PRCard />
      <CheckinCalendar />
    </div>
  )
}
