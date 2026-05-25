// WorkoutSession.jsx — 训练进行中的页面（全屏覆盖）
// 用户点击"开始训练"后进入，逐个记录每个动作的组数/重量/次数

import { useState, useEffect } from 'react'
import { exerciseLibrary } from '../data/exerciseLibrary.js'
import { saveSession, getPRForExercise } from '../utils/workoutStats.js'

// 根据 exerciseId 找到动作数据
function findExercise(id) {
  return exerciseLibrary.find(e => e.id === id) || { name: id, primaryMuscles: [] }
}

// 格式化秒数为 mm:ss
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ── 单个动作的记录卡片 ───────────────────────────────────

function ExerciseBlock({ exData, exerciseIndex, onUpdate }) {
  const exercise = findExercise(exData.exerciseId)
  const pr = getPRForExercise(exData.exerciseId)

  // 更新某一组的字段（weight / reps / completed）
  function updateSet(setIdx, field, value) {
    const newSets = exData.sets.map((s, i) =>
      i === setIdx ? { ...s, [field]: value } : s
    )
    onUpdate(exerciseIndex, { ...exData, sets: newSets })
  }

  // 添加一组
  function addSet() {
    const lastSet = exData.sets[exData.sets.length - 1] || { weight: '', reps: '10' }
    onUpdate(exerciseIndex, {
      ...exData,
      sets: [...exData.sets, { weight: lastSet.weight, reps: lastSet.reps, completed: false }],
    })
  }

  const completedCount = exData.sets.filter(s => s.completed).length

  return (
    <div className="bg-white rounded-2xl overflow-hidden mb-3">
      {/* 动作标题 */}
      <div className="px-4 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p className="font-bold text-gray-800 text-base">{exercise.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {exercise.primaryMuscles?.[0]} · {exercise.equipment}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-orange-500 font-semibold">
            {completedCount}/{exData.sets.length} 组
          </span>
          {pr && (
            <p className="text-[10px] text-gray-400 mt-0.5">
              历史最佳 {pr.weight}kg × {pr.reps}
            </p>
          )}
        </div>
      </div>

      {/* 表头 */}
      <div className="grid grid-cols-[32px_1fr_1fr_48px] gap-2 px-4 pb-1">
        <span className="text-[10px] text-gray-400 text-center">组</span>
        <span className="text-[10px] text-gray-400 text-center">重量(kg)</span>
        <span className="text-[10px] text-gray-400 text-center">次数</span>
        <span className="text-[10px] text-gray-400 text-center">完成</span>
      </div>

      {/* 每一组 */}
      <div className="px-4 pb-3 flex flex-col gap-2">
        {exData.sets.map((set, i) => (
          <div
            key={i}
            className={`grid grid-cols-[32px_1fr_1fr_48px] gap-2 items-center rounded-xl py-1.5 px-2 transition-colors ${
              set.completed ? 'bg-orange-50' : 'bg-gray-50'
            }`}
          >
            {/* 组号 */}
            <span className="text-xs font-semibold text-gray-500 text-center">{i + 1}</span>

            {/* 重量 */}
            <input
              type="number"
              value={set.weight}
              onChange={e => updateSet(i, 'weight', e.target.value)}
              placeholder="0"
              className="text-sm text-center border border-gray-200 rounded-lg py-1.5
                         focus:outline-none focus:border-orange-400 bg-white w-full"
            />

            {/* 次数 */}
            <input
              type="number"
              value={set.reps}
              onChange={e => updateSet(i, 'reps', e.target.value)}
              placeholder="0"
              className="text-sm text-center border border-gray-200 rounded-lg py-1.5
                         focus:outline-none focus:border-orange-400 bg-white w-full"
            />

            {/* 完成按钮 */}
            <button
              onClick={() => updateSet(i, 'completed', !set.completed)}
              className={`w-10 h-8 rounded-lg text-sm font-bold transition-all ${
                set.completed
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
            >
              {set.completed ? '✓' : '○'}
            </button>
          </div>
        ))}

        {/* 添加一组 */}
        <button
          onClick={addSet}
          className="text-xs text-orange-500 hover:text-orange-700 py-1 text-center"
        >
          + 添加一组
        </button>
      </div>
    </div>
  )
}

// ── 训练完成总结弹窗 ─────────────────────────────────────

function WorkoutSummary({ session, workoutDay, newPRs, onClose }) {
  const totalSets = session.exercises.reduce(
    (t, ex) => t + ex.sets.filter(s => s.completed).length, 0
  )
  const totalVolume = session.exercises.reduce((t, ex) =>
    t + ex.sets.filter(s => s.completed).reduce((sv, set) =>
      sv + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0
    ), 0
  )
  const durationMin = Math.round(session.duration / 60)

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🎉</div>
          <h2 className="text-xl font-bold text-gray-800">训练完成！</h2>
          <p className="text-sm text-gray-400 mt-1">{workoutDay.chineseName} · {workoutDay.muscles}</p>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <StatBox label="时长" value={`${durationMin}分钟`} />
          <StatBox label="完成组数" value={`${totalSets}组`} />
          <StatBox label="总训练量" value={`${totalVolume.toFixed(0)}kg`} />
        </div>

        {/* PR 提示 */}
        {newPRs.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-5">
            <p className="text-xs font-semibold text-orange-600 mb-1">🏆 新纪录！</p>
            {newPRs.map((pr, i) => {
              const ex = findExercise(pr.exerciseId)
              return (
                <p key={i} className="text-xs text-orange-500">
                  {ex.name} — {pr.weight}kg × {pr.reps}次
                </p>
              )
            })}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold
                     rounded-xl py-3 transition-all"
        >
          完成
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-bold text-gray-800">{value}</p>
    </div>
  )
}

// ── 主组件 ──────────────────────────────────────────────

export default function WorkoutSession({ workoutDay, planId, onFinish, onCancel }) {
  // session：训练数据对象，随用户输入实时更新
  const [session, setSession] = useState(() => ({
    id:           Date.now().toString(),
    date:         new Date().toISOString().slice(0, 10),
    planType:     planId,
    workoutDayId: workoutDay.id,
    workoutName:  workoutDay.chineseName,
    muscleGroups: workoutDay.muscleGroups,
    duration:     0,
    exercises:    workoutDay.exercises.map(e => ({
      exerciseId: e.exerciseId,
      sets: Array.from({ length: e.defaultSets }, () => ({
        weight: '', reps: e.repRange.split('-')[0], completed: false,
      })),
    })),
    completed: false,
    startTime: Date.now(),
  }))

  const [elapsed, setElapsed]     = useState(0)    // 已训练秒数
  const [showSummary, setShowSummary] = useState(false)
  const [newPRs, setNewPRs]       = useState([])

  // 计时器：每秒 +1
  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(timer)
  }, [])

  // 更新某个动作的数据
  function handleExerciseUpdate(idx, newEx) {
    setSession(prev => {
      const exercises = [...prev.exercises]
      exercises[idx] = newEx
      return { ...prev, exercises }
    })
  }

  // 完成训练
  function handleFinish() {
    const finalSession = {
      ...session,
      duration:  elapsed,
      completed: true,
    }
    const prs = saveSession(finalSession)
    setNewPRs(prs || [])
    setSession(finalSession)
    setShowSummary(true)
  }

  const completedExCount = session.exercises.filter(
    ex => ex.sets.some(s => s.completed)
  ).length

  return (
    <div className="fixed inset-0 z-40 bg-slate-900 flex flex-col overflow-hidden">

      {/* ── 顶部 Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-12 pb-4
                      border-b border-white/10">
        <div>
          <p className="text-white font-bold text-lg">{workoutDay.chineseName}</p>
          <p className="text-slate-400 text-xs">{workoutDay.muscles}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 计时器 */}
          <span className="text-orange-400 font-mono text-sm font-semibold">
            {formatDuration(elapsed)}
          </span>
          {/* 取消按钮 */}
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white text-sm px-3 py-1.5
                       border border-slate-600 rounded-lg transition-colors"
          >
            放弃
          </button>
        </div>
      </div>

      {/* 进度提示 */}
      <div className="flex-shrink-0 px-4 py-2 bg-slate-800/50">
        <p className="text-xs text-slate-400">
          {completedExCount}/{session.exercises.length} 个动作已开始
          · {workoutDay.estimatedMinutes} 分钟预计
        </p>
      </div>

      {/* ── 动作列表（可滚动）── */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-32">
        {session.exercises.map((ex, idx) => (
          <ExerciseBlock
            key={ex.exerciseId}
            exData={ex}
            exerciseIndex={idx}
            onUpdate={handleExerciseUpdate}
          />
        ))}
      </div>

      {/* ── 底部完成按钮（固定）── */}
      <div className="flex-shrink-0 absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4
                      bg-gradient-to-t from-slate-900 to-transparent">
        <button
          onClick={handleFinish}
          className="w-full bg-orange-500 hover:bg-orange-400 active:scale-95
                     text-white font-bold rounded-2xl py-4 text-base
                     transition-all shadow-lg shadow-orange-500/30"
        >
          完成训练
        </button>
      </div>

      {/* ── 完成弹窗 ── */}
      {showSummary && (
        <WorkoutSummary
          session={session}
          workoutDay={workoutDay}
          newPRs={newPRs}
          onClose={() => { setShowSummary(false); onFinish() }}
        />
      )}
    </div>
  )
}
