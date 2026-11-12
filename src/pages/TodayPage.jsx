// TodayPage.jsx — 今天的训练、快捷打卡、统计和最近记录。
import { useState } from 'react'
import CheckinCalendar from '../components/CheckinCalendar.jsx'
import {
  getStreak, getWeeklyCount, getMonthlyCount,
  getTodaySession, loadPRs, saveSession,
} from '../utils/workoutStats.js'
import { ALL_PLANS, getActivePlan, getNextWorkoutDay } from '../data/workoutPlans.js'
import { exerciseLibrary } from '../data/exerciseLibrary.js'

function getTodayText() {
  return new Date().toLocaleDateString('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'long',
  })
}

function TodayPlan({ workoutDay }) {
  if (!workoutDay) {
    return (
      <section className="rounded-2xl bg-emerald-50 p-4">
        <h2 className="text-base font-semibold text-emerald-800">今日计划</h2>
        <p className="mt-1 text-xl font-bold text-slate-950">今天是休息日</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-emerald-50 p-4">
      <h2 className="text-base font-semibold text-emerald-800">今日计划</h2>
      <p className="mt-1 text-2xl font-bold leading-tight tracking-tight text-slate-950">{workoutDay.name}</p>
      <p className="mt-1 text-base text-slate-600">{workoutDay.muscles}</p>
      <details className="group mt-2">
        <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between gap-2 rounded-lg
                            border-t border-emerald-100 text-sm font-medium text-emerald-900 [&::-webkit-details-marker]:hidden">
          <span>{workoutDay.exercises.length} 个动作 · {workoutDay.estimatedMinutes} 分钟</span>
          <span className="group-open:hidden">查看动作</span>
          <span className="hidden group-open:inline">收起动作</span>
        </summary>
        <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 pb-1">
          {workoutDay.exercises.map(({ exerciseId }, index) => {
            const exercise = exerciseLibrary.find(entry => entry.id === exerciseId)
            return (
              <li key={`${exerciseId}-${index}`} className="flex items-start gap-1.5 text-sm leading-snug text-slate-700">
                <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-emerald-600" />
                {exercise?.name || exerciseId}
              </li>
            )
          })}
        </ul>
      </details>
    </section>
  )
}

function CheckInButton({ isDone, onCheckIn }) {
  return (
    <div className="flex justify-center py-3">
      <button type="button" onClick={onCheckIn} aria-disabled={isDone}
        className={`flex size-[clamp(8.75rem,42vw,11rem)] flex-col items-center justify-center gap-1
          rounded-full border-4 border-white font-bold ring-4 ring-emerald-100 transition
          ${isDone ? 'bg-emerald-50 text-emerald-800' :
            'bg-emerald-700 text-white shadow-lg shadow-emerald-900/15 hover:bg-emerald-800 motion-safe:active:scale-95'}`}>
        {isDone && <span aria-hidden="true" className="text-3xl leading-none">✓</span>}
        <span aria-live="polite" className={isDone ? 'text-xl' : 'text-4xl tracking-wider'}>
          {isDone ? '已打卡' : '打卡'}
        </span>
      </button>
    </div>
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
          <dt className="text-sm text-slate-600">{label}</dt>
          <dd className="text-[1.65rem] font-bold tabular-nums text-slate-950">
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
  const [, setRefreshKey] = useState(0)
  const plan = getActivePlan()
  const todaySession = getTodaySession()
  // 打卡后继续展示今天完成的训练，下一套计划留给下次打卡。
  const completedPlan = ALL_PLANS.find(entry => entry.id === todaySession?.planType) ?? plan
  const completedDay = completedPlan.days.find(day => day.id === todaySession?.workoutDayId)
  const workoutDay = completedDay ?? getNextWorkoutDay(plan)

  // 一键打卡保存已完成记录，供统计、日历和进步页读取。
  function handleCheckIn() {
    if (!workoutDay || getTodaySession()) return
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
    <div className="space-y-4 px-5 pt-6">
      <header>
        <h1 className="text-[2rem] font-bold leading-tight tracking-tight">我的健身打卡</h1>
        <p className="mt-1 text-base text-slate-600">{getTodayText()}</p>
      </header>
      <TodayPlan workoutDay={workoutDay} />
      {workoutDay && <CheckInButton isDone={Boolean(todaySession)} onCheckIn={handleCheckIn} />}
      <StatsRow streak={getStreak()} weekly={getWeeklyCount()} monthly={getMonthlyCount()} />
      <PRCard />
      <CheckinCalendar />
    </div>
  )
}
