// TodayPage.jsx — 今日训练页（简洁版）
// 一键打卡完成，显示今日计划、统计数字、30天日历

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
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
}

const QUOTES = [
  '每一滴汗水，都是明天更好的自己',
  '坚持下去，你已经比昨天更强了',
  '身体的极限，只是意志的起点',
  '今天的努力，是明天自信的来源',
  '痛苦是暂时的，放弃才是永远的',
  '力量不是天生的，是一次一次练出来的',
  '没有捷径，只有每天的积累',
]
function getQuote() { return QUOTES[new Date().getDate() % QUOTES.length] }

// ── 今日训练卡片 ────────────────────────────────────────

function TodayWorkoutCard({ workoutDay, isDone, onCheckIn }) {
  if (!workoutDay) {
    return (
      <div className="bg-white/8 border border-white/10 rounded-2xl p-5 text-center">
        <p className="text-3xl mb-2">😴</p>
        <p className="text-white font-bold">今天是休息日</p>
        <p className="text-slate-400 text-sm mt-1">好好恢复，明天更强</p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl overflow-hidden transition-all ${
      isDone
        ? 'bg-gradient-to-br from-orange-600/30 to-orange-500/10 border border-orange-500/40'
        : 'bg-white'
    }`}>
      <div className="px-4 pt-4 pb-4">

        {/* 标题行 */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 inline-block ${
              isDone ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600'
            }`}>
              {isDone ? '✓ 今日已完成' : '今日计划'}
            </span>
            <h2 className={`text-lg font-black leading-tight ${isDone ? 'text-white' : 'text-gray-800'}`}>
              {workoutDay.name}
            </h2>
            <p className={`text-sm mt-0.5 ${isDone ? 'text-orange-300' : 'text-gray-500'}`}>
              {workoutDay.muscles}
            </p>
          </div>
          <p className={`text-xs text-right ${isDone ? 'text-orange-300/70' : 'text-gray-400'}`}>
            {workoutDay.exercises.length} 个动作<br/>
            {workoutDay.estimatedMinutes} 分钟
          </p>
        </div>

        {/* 动作列表（紧凑）*/}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4">
          {workoutDay.exercises.map(e => {
            const ex = exerciseLibrary.find(x => x.id === e.exerciseId)
            return (
              <div key={e.exerciseId} className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full flex-shrink-0 ${isDone ? 'bg-orange-400' : 'bg-orange-300'}`} />
                <span className={`text-xs truncate ${isDone ? 'text-orange-200' : 'text-gray-600'}`}>
                  {ex?.name || e.exerciseId}
                </span>
              </div>
            )
          })}
        </div>

        {/* 一键打卡按钮 */}
        {!isDone ? (
          <button
            onClick={onCheckIn}
            className="w-full py-3.5 rounded-xl font-black text-base text-white
                       bg-orange-500 hover:bg-orange-400 active:scale-95
                       shadow-lg shadow-orange-500/30 transition-all"
          >
            完成今日训练 ✓
          </button>
        ) : (
          <div className="text-center py-2">
            <p className="text-orange-300 text-sm font-semibold">🎉 干得漂亮，明天继续！</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── 统计数字卡片 ─────────────────────────────────────────

function StatsRow({ streak, weekly, monthly }) {
  return (
    <div className="grid grid-cols-3 gap-2.5">
      {[
        { label: '连续训练', value: streak,  unit: '天', hi: true  },
        { label: '本周完成', value: weekly,  unit: '次', hi: false },
        { label: '本月打卡', value: monthly, unit: '次', hi: false },
      ].map(s => (
        <div key={s.label} className={`rounded-2xl py-3.5 text-center ${
          s.hi
            ? 'bg-orange-500/15 border border-orange-500/30'
            : 'bg-white/6 border border-white/8'
        }`}>
          <p className={`text-2xl font-black leading-none ${s.hi ? 'text-orange-400' : 'text-white'}`}>
            {s.value}
          </p>
          <p className={`text-[10px] mt-1 ${s.hi ? 'text-orange-300' : 'text-slate-400'}`}>
            {s.unit} {s.label}
          </p>
        </div>
      ))}
    </div>
  )
}

// ── 最近 PR 小卡 ─────────────────────────────────────────

function PRCard() {
  const prs = loadPRs()
  const entries = Object.entries(prs)
    .sort((a, b) => b[1].date.localeCompare(a[1].date))
    .slice(0, 2)
  if (entries.length === 0) return null

  return (
    <div className="bg-white/6 border border-white/8 rounded-2xl px-4 py-3">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
        🏆 最近 PR
      </p>
      <div className="flex flex-col gap-1.5">
        {entries.map(([exId, pr]) => {
          const ex = exerciseLibrary.find(x => x.id === exId)
          return (
            <div key={exId} className="flex justify-between items-center">
              <span className="text-sm text-slate-300">{ex?.name || exId}</span>
              <span className="text-sm font-bold text-orange-400">{pr.weight}kg × {pr.reps}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 主组件 ──────────────────────────────────────────────

export default function TodayPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const plan       = getActivePlan()
  const workoutDay = getNextWorkoutDay(plan)
  const isDone     = hasTodaySession()

  // 读取统计（每次 refreshKey 变化时重新计算）
  const streak  = getStreak()
  const weekly  = getWeeklyCount()
  const monthly = getMonthlyCount()

  // 一键打卡：保存一条简单的已完成记录
  function handleCheckIn() {
    if (!workoutDay) return
    saveSession({
      id:           Date.now().toString(),
      date:         new Date().toISOString().slice(0, 10),
      planType:     plan.id,
      workoutDayId: workoutDay.id,
      workoutName:  workoutDay.chineseName,
      muscleGroups: workoutDay.muscleGroups,
      duration:     0,
      exercises:    [],   // 快速打卡不记录详细动作
      completed:    true,
    })
    setRefreshKey(k => k + 1)
  }

  return (
    <div className="flex flex-col px-4 pt-12 pb-4 gap-4" key={refreshKey}>

      {/* 标题 */}
      <div>
        <h1 className="text-xl font-black text-white">我的健身打卡</h1>
        <p className="text-xs text-slate-400 mt-0.5">{getTodayText()}</p>
      </div>

      {/* 连续天数 + 激励语（有连续才显示）*/}
      {streak > 0 && (
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20
                        rounded-2xl px-4 py-3">
          <span className="text-2xl flex-shrink-0">🔥</span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-orange-400 leading-tight">
              已连续训练 {streak} 天
            </p>
            <p className="text-[11px] text-orange-300/60 truncate">「{getQuote()}」</p>
          </div>
        </div>
      )}

      {/* 今日训练卡 */}
      <TodayWorkoutCard
        workoutDay={workoutDay}
        isDone={isDone}
        onCheckIn={handleCheckIn}
      />

      {/* 三栏统计 */}
      <StatsRow streak={streak} weekly={weekly} monthly={monthly} />

      {/* PR 小卡 */}
      <PRCard />

      {/* 30天日历 */}
      <CheckinCalendar />

    </div>
  )
}
