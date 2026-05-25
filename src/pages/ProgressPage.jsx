// ProgressPage.jsx — 进步页
// 展示总训练统计、PR 记录、近期训练记录、身体部位频率

import { useState } from 'react'
import {
  getStreak, getWeeklyCount, getMonthlyCount, getTotalCount,
  getTotalVolume, getRecentSessions, loadPRs, getBodyPartFrequency,
  deleteSession,
} from '../utils/workoutStats.js'
import { exerciseLibrary } from '../data/exerciseLibrary.js'

// 格式化日期为"5月25日 周一"
function formatDate(dateKey) {
  const d = new Date(dateKey + 'T12:00:00')
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' })
}

function daysAgo(dateKey) {
  const today = new Date().toISOString().slice(0, 10)
  if (dateKey === today) return '今天'
  const diff = Math.round(
    (new Date(today) - new Date(dateKey + 'T12:00:00')) / 86400000
  )
  return diff === 1 ? '昨天' : `${diff}天前`
}

// ── 顶部统计卡片行 ───────────────────────────────────────

function StatsHeader() {
  const streak  = getStreak()
  const weekly  = getWeeklyCount()
  const monthly = getMonthlyCount()
  const total   = getTotalCount()
  const volume  = getTotalVolume()

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <BigStatCard label="总训练次数" value={total} unit="次" icon="🏋️" />
        <BigStatCard label="连续训练" value={streak} unit="天" icon="🔥" highlight />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SmallStatCard label="本周" value={weekly} unit="次" />
        <SmallStatCard label="本月" value={monthly} unit="次" />
        <SmallStatCard label="总训练量" value={`${(volume / 1000).toFixed(1)}`} unit="吨" />
      </div>
    </div>
  )
}

function BigStatCard({ label, value, unit, icon, highlight }) {
  return (
    <div className={`rounded-2xl p-4 ${
      highlight
        ? 'bg-orange-500/20 border border-orange-500/30'
        : 'bg-white/8 border border-white/10'
    }`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className={`text-3xl font-black ${highlight ? 'text-orange-400' : 'text-white'}`}>
        {value}
        <span className="text-base font-normal ml-1">{unit}</span>
      </p>
      <p className={`text-xs mt-0.5 ${highlight ? 'text-orange-300' : 'text-slate-400'}`}>{label}</p>
    </div>
  )
}

function SmallStatCard({ label, value, unit }) {
  return (
    <div className="bg-white/8 border border-white/10 rounded-2xl p-3 text-center">
      <p className="text-xl font-black text-white">
        {value}<span className="text-xs font-normal ml-0.5">{unit}</span>
      </p>
      <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

// ── PR 列表 ──────────────────────────────────────────────

function PRSection() {
  const prs = loadPRs()
  const entries = Object.entries(prs).sort((a, b) => b[1].date.localeCompare(a[1].date))

  if (entries.length === 0) {
    return (
      <div className="bg-white/8 border border-white/10 rounded-2xl p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
          🏆 个人最佳记录
        </p>
        <p className="text-sm text-slate-500 text-center py-4">
          完成训练后自动记录 PR
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white/8 border border-white/10 rounded-2xl p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        🏆 个人最佳记录
      </p>
      <div className="flex flex-col gap-2.5">
        {entries.map(([exerciseId, pr]) => {
          const ex = exerciseLibrary.find(x => x.id === exerciseId)
          return (
            <div key={exerciseId} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white font-medium">{ex?.name || exerciseId}</p>
                <p className="text-[10px] text-slate-500">{pr.date}</p>
              </div>
              <span className="text-sm text-orange-400 font-bold bg-orange-500/10
                               px-3 py-1 rounded-full">
                {pr.weight}kg × {pr.reps}次
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 身体部位训练频率 ─────────────────────────────────────

function BodyPartFrequency() {
  const freq = getBodyPartFrequency()
  const entries = Object.entries(freq).sort((a, b) => b[1] - a[1])
  if (entries.length === 0) return null

  const max = entries[0]?.[1] || 1

  return (
    <div className="bg-white/8 border border-white/10 rounded-2xl p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        近30天部位频率
      </p>
      <div className="flex flex-col gap-2">
        {entries.map(([part, count]) => (
          <div key={part} className="flex items-center gap-3">
            <span className="text-xs text-slate-300 w-12 flex-shrink-0">{part}</span>
            <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-orange-400 font-semibold w-6 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 单次训练记录卡片 ─────────────────────────────────────

function SessionCard({ session, onDelete }) {
  const [expanded,    setExpanded]    = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)  // 二次确认删除

  const totalSets = (session.exercises || []).reduce(
    (t, ex) => t + (ex.sets || []).filter(s => s.completed).length, 0
  )
  const totalVolume = (session.exercises || []).reduce((t, ex) =>
    t + (ex.sets || []).filter(s => s.completed).reduce(
      (sv, set) => sv + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
    ), 0
  )
  const durationMin = session.duration ? Math.round(session.duration / 60) : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        {/* 顶部信息 */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {session.workoutName || '训练'}
              </span>
            </div>
            <p className="font-semibold text-gray-800">{formatDate(session.date)}</p>
            <p className="text-xs text-gray-400">{daysAgo(session.date)}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* 详情展开 */}
            {session.exercises?.length > 0 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-gray-400 hover:text-orange-500 border border-gray-200
                           px-2.5 py-1 rounded-full transition-colors"
              >
                {expanded ? '收起' : '详情'}
              </button>
            )}
            {/* 删除按钮 */}
            {!confirmDel ? (
              <button
                onClick={() => setConfirmDel(true)}
                className="text-xs text-gray-300 hover:text-red-400 border border-gray-100
                           hover:border-red-200 px-2.5 py-1 rounded-full transition-colors"
              >
                删除
              </button>
            ) : (
              // 二次确认：防止误删
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(session.id)}
                  className="text-xs text-white bg-red-500 hover:bg-red-600
                             px-2.5 py-1 rounded-full transition-colors"
                >
                  确认删除
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 统计 */}
        <div className="flex gap-4 text-xs text-gray-500">
          {totalSets > 0   && <span>📦 {totalSets} 组</span>}
          {totalVolume > 0 && <span>🏋️ {totalVolume.toFixed(0)}kg</span>}
          {durationMin     && <span>⏱ {durationMin}分钟</span>}
          {session.muscleGroups?.length > 0 && (
            <span>💪 {session.muscleGroups.slice(0, 2).join('·')}</span>
          )}
        </div>
      </div>

      {/* 展开：动作列表 */}
      {expanded && session.exercises?.length > 0 && (
        <div className="border-t border-gray-50 px-4 pb-3 pt-2 flex flex-col gap-1.5">
          {session.exercises.map(ex => {
            const exercise = exerciseLibrary.find(x => x.id === ex.exerciseId)
            const completedSets = ex.sets?.filter(s => s.completed) || []
            if (completedSets.length === 0) return null
            return (
              <div key={ex.exerciseId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{exercise?.name || ex.exerciseId}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {completedSets.length}组
                  {completedSets[0]?.weight ? ` · ${completedSets[0].weight}kg` : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 主页面 ──────────────────────────────────────────────

export default function ProgressPage() {
  const [version, setVersion] = useState(0)  // 删除后强制刷新
  const sessions = getRecentSessions(20)

  function handleDelete(sessionId) {
    deleteSession(sessionId)
    setVersion(v => v + 1)
  }

  return (
    <div className="flex flex-col px-4 pt-10 pb-6 gap-5" key={version}>

      <h1 className="text-xl font-black text-white tracking-wide">我的进步</h1>

      {/* 统计头部 */}
      <StatsHeader />

      {/* PR 记录 */}
      <PRSection />

      {/* 部位频率 */}
      <BodyPartFrequency />

      {/* 最近训练记录 */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          最近训练记录
        </p>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <span className="text-5xl">📭</span>
            <p className="text-slate-400 text-sm">还没有训练记录</p>
            <p className="text-slate-500 text-xs">去「今日」页面开始第一次训练吧</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sessions.map(s => (
              <SessionCard key={s.id} session={s} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
