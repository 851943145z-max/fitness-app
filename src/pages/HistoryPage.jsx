// HistoryPage.jsx — 历史训练记录页
// 按日期倒序列出所有打卡/训练记录，可展开查看每天的肌肉示意图

import { useState } from 'react'
import MuscleMap from '../components/MuscleMap.jsx'

// ── 工具函数 ──────────────────────────────────────────────

// 从 localStorage 读取所有打卡日期（返回 Set）
function loadCheckinDates() {
  const raw  = localStorage.getItem('checkin_dates')
  const arr  = raw ? JSON.parse(raw) : []
  const last = localStorage.getItem('checkin_date')
  const set  = new Set(arr)
  if (last) set.add(last)
  return set
}

// 从 localStorage 读取所有训练记录
function loadAllRecords() {
  const raw = localStorage.getItem('workout_records')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

// 把 "2026-05-24" 格式化成好看的中文：5月24日 周日
function formatDate(dateKey) {
  // dateKey 是 "2026-05-24"，加时区避免日期偏移
  const date = new Date(dateKey + 'T12:00:00')
  return date.toLocaleDateString('zh-CN', {
    month:   'long',
    day:     'numeric',
    weekday: 'short',
  })
}

// 计算离今天多少天（用于显示"今天""昨天""X天前"）
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

// 把所有日期的打卡 + 训练数据合并成一个列表（按日期倒序）
function buildHistory() {
  const checkinDates = loadCheckinDates()
  const allRecords   = loadAllRecords()

  // 收集所有出现过的日期
  const allDates = new Set([
    ...Array.from(checkinDates),
    ...allRecords.map(r => r.date),
  ])

  // 每个日期构建一个条目，按时间倒序排列
  return Array.from(allDates)
    .sort((a, b) => b.localeCompare(a))   // 字符串比较即可，因为格式是 YYYY-MM-DD
    .map(date => ({
      date,
      isCheckedIn: checkinDates.has(date),
      records:     allRecords.filter(r => r.date === date),
    }))
}

// ── 单天历史卡片 ──────────────────────────────────────────

function DayCard({ entry }) {
  const { date, isCheckedIn, records } = entry

  // expanded：是否展开显示当天的肌肉图
  const [expanded, setExpanded] = useState(false)

  // 把这一天所有动作的肌肉群合并成一个列表（去重）
  // 用来显示"当天整体训练了哪些部位"的综合肌肉图
  const dayMuscles = [...new Set(records.flatMap(r => r.muscles || []))]
  const hasWorkout = records.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

      {/* ── 卡片头部：日期 + 状态 ── */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between">

        {/* 左边：日期文字 + "X天前" */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{formatDate(date)}</span>
            {/* 打卡徽章 */}
            {isCheckedIn && (
              <span className="bg-emerald-100 text-emerald-600 text-xs px-2 py-0.5 rounded-full font-medium">
                ✓ 已打卡
              </span>
            )}
          </div>
          <span className="text-xs text-gray-400 mt-0.5 block">{daysAgo(date)}</span>
        </div>

        {/* 右边：展开肌肉图按钮（有训练记录才显示）*/}
        {hasWorkout && dayMuscles.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              expanded
                ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                : 'border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500'
            }`}
          >
            {expanded ? '收起' : '查看部位'}
          </button>
        )}
      </div>

      {/* ── 训练动作列表 ── */}
      {hasWorkout ? (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          {records.map(record => (
            <div key={record.id} className="flex items-center gap-2">
              {/* 小圆点 */}
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              {/* 动作名 */}
              <span className="text-sm text-gray-700 font-medium">{record.name}</span>
              {/* 组数 × 重量 */}
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
        // 打卡了但没有填训练记录
        <p className="px-4 pb-3 text-xs text-gray-400">未填写训练内容</p>
      )}

      {/* ── 展开的综合肌肉图 ── */}
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
    <div className="flex flex-col px-6 pt-10 pb-6 gap-4">

      {/* 页面标题 */}
      <h1 className="text-xl font-semibold text-gray-600 tracking-wide">训练历史</h1>

      {/* 无记录时的空状态 */}
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <span className="text-5xl">📭</span>
          <p className="text-gray-400 text-sm">还没有任何记录</p>
          <p className="text-gray-300 text-xs">去首页打个卡吧！</p>
        </div>
      ) : (
        // 有记录：按日期倒序展示
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
