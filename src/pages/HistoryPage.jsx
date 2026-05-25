// HistoryPage.jsx — 历史训练记录页
// 按日期倒序列出所有打卡/训练记录，可展开查看每天的肌肉示意图

import { useState } from 'react'
import MuscleMap from '../components/MuscleMap.jsx'

// ── 工具函数 ──────────────────────────────────────────────

function loadCheckinDates() {
  const raw  = localStorage.getItem('checkin_dates')
  const arr  = raw ? JSON.parse(raw) : []
  const last = localStorage.getItem('checkin_date')
  const set  = new Set(arr)
  if (last) set.add(last)
  return set
}

function loadAllRecords() {
  const raw = localStorage.getItem('workout_records')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

// 把 "2026-05-24" 格式化成好看的中文：5月24日 周日
function formatDate(dateKey) {
  const date = new Date(dateKey + 'T12:00:00')
  return date.toLocaleDateString('zh-CN', {
    month:   'long',
    day:     'numeric',
    weekday: 'short',
  })
}

function daysAgo(dateKey) {
  const today = new Date().toISOString().slice(0, 10)
  if (dateKey === today) return '今天'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateKey === yesterday.toISOString().slice(0, 10)) return '昨天'

  const diff = Math.round(
    (new Date(today) - new Date(dateKey)) / (1000 * 60 * 60 * 24)
  )
  return `${diff} 天前`
}

function buildHistory() {
  const checkinDates = loadCheckinDates()
  const allRecords   = loadAllRecords()

  const allDates = new Set([
    ...Array.from(checkinDates),
    ...allRecords.map(r => r.date),
  ])

  return Array.from(allDates)
    .sort((a, b) => b.localeCompare(a))
    .map(date => ({
      date,
      isCheckedIn: checkinDates.has(date),
      records:     allRecords.filter(r => r.date === date),
    }))
}

// ── 单天历史卡片 ──────────────────────────────────────────

function DayCard({ entry }) {
  const { date, isCheckedIn, records } = entry
  const [expanded, setExpanded] = useState(false)

  const dayMuscles = [...new Set(records.flatMap(r => r.muscles || []))]
  const hasWorkout = records.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* 卡片头部 */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{formatDate(date)}</span>
            {isCheckedIn && (
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium">
                ✓ 已打卡
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 mt-0.5 block">{daysAgo(date)}</span>
        </div>

        {hasWorkout && dayMuscles.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              expanded
                ? 'border-orange-400 text-orange-600 bg-orange-50'
                : 'border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500'
            }`}
          >
            {expanded ? '收起' : '查看部位'}
          </button>
        )}
      </div>

      {/* 训练动作列表 */}
      {hasWorkout ? (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          {records.map(record => (
            <div key={record.id} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-sm text-gray-700 font-medium">{record.name}</span>
              {(record.sets || record.weight) && (
                <span className="text-xs text-gray-400">
                  {record.sets   && `${record.sets}组`}
                  {record.sets && record.weight && ' × '}
                  {record.weight && `${record.weight}kg`}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="px-4 pb-3 text-xs text-gray-400">未填写训练内容</p>
      )}

      {/* 展开的综合肌肉图 */}
      {expanded && dayMuscles.length > 0 && (
        <div className="border-t border-gray-50 bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-400 text-center mb-1">当天训练部位</p>
          <MuscleMap muscles={dayMuscles} />
        </div>
      )}

    </div>
  )
}

// ── 主页面组件 ──────────────────────────────────────────

function HistoryPage() {
  const history = buildHistory()

  return (
    // 深色背景延伸到历史页
    <div className="flex flex-col px-6 pt-10 pb-6 gap-4">

      <h1 className="text-xl font-bold text-white tracking-wide">训练历史</h1>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">📭</span>
          <p className="text-slate-400 text-sm">还没有任何记录</p>
          <p className="text-slate-500 text-xs">去首页打个卡吧！</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {history.map(entry => (
            <DayCard key={entry.date} entry={entry} />
          ))}
        </div>
      )}

    </div>
  )
}

export default HistoryPage
