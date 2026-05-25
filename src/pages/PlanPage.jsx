// PlanPage.jsx — 训练计划页（支持自定义编辑）
// 可选择 PPL / 五分化，每天的动作支持增删自定义

import { useState, useMemo } from 'react'
import { ALL_PLANS, getActivePlan } from '../data/workoutPlans.js'
import { exerciseLibrary } from '../data/exerciseLibrary.js'

// ── 自定义计划的读写 ──────────────────────────────────────

function loadCustomDayExercises(planId, dayId) {
  const raw = localStorage.getItem(`custom_${planId}_${dayId}`)
  return raw ? JSON.parse(raw) : null  // null 表示使用默认
}

function saveCustomDayExercises(planId, dayId, exercises) {
  localStorage.setItem(`custom_${planId}_${dayId}`, JSON.stringify(exercises))
}

// 获取某天的动作列表（先查自定义，没有就用默认）
function getDayExercises(plan, dayId) {
  const custom = loadCustomDayExercises(plan.id, dayId)
  if (custom) return custom
  const day = plan.days.find(d => d.id === dayId)
  return day?.exercises || []
}

// ── 动作搜索下拉 ─────────────────────────────────────────

function ExerciseSearchDropdown({ onSelect, excludeIds = [] }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return exerciseLibrary
      .filter(ex => !excludeIds.includes(ex.id))
      .filter(ex => ex.name.includes(query) || ex.bodyPart.includes(query) || ex.equipment.includes(query))
      .slice(0, 8)
  }, [query, excludeIds])

  return (
    <div className="mt-2">
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="搜索动作名称、部位或器械..."
        autoFocus
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5
                   focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
      />
      {results.length > 0 && (
        <div className="mt-1 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {results.map(ex => (
            <button
              key={ex.id}
              onClick={() => { onSelect(ex); setQuery('') }}
              className="w-full text-left px-3 py-2.5 flex items-center justify-between
                         hover:bg-orange-50 border-b border-gray-50 last:border-0 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{ex.name}</p>
                <p className="text-[10px] text-gray-400">
                  {ex.bodyPart} · {ex.equipment} · {ex.recommendedSets} × {ex.recommendedReps}
                </p>
              </div>
              <span className="text-orange-400 text-xs ml-2 flex-shrink-0">+ 添加</span>
            </button>
          ))}
        </div>
      )}
      {query.trim() && results.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-3">没有找到匹配的动作</p>
      )}
    </div>
  )
}

// ── 单日训练编辑器 ───────────────────────────────────────

function DayEditor({ plan, day, onSaved }) {
  const defaultExercises = day.exercises
  const custom = loadCustomDayExercises(plan.id, day.id)
  const [exercises, setExercises] = useState(custom || defaultExercises)
  const [showSearch, setShowSearch] = useState(false)

  function addExercise(ex) {
    // 用该动作的推荐组数次数
    const entry = {
      exerciseId:  ex.id,
      defaultSets: parseInt(ex.recommendedSets?.match(/\d+/)?.[0] || '3'),
      repRange:    ex.recommendedReps || '8-12',
    }
    setExercises(prev => [...prev, entry])
    setShowSearch(false)
  }

  function removeExercise(idx) {
    setExercises(prev => prev.filter((_, i) => i !== idx))
  }

  function updateSets(idx, val) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, defaultSets: parseInt(val) || 3 } : e))
  }

  function updateReps(idx, val) {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, repRange: val } : e))
  }

  function handleSave() {
    saveCustomDayExercises(plan.id, day.id, exercises)
    onSaved()
  }

  function handleReset() {
    saveCustomDayExercises(plan.id, day.id, defaultExercises)
    setExercises(defaultExercises)
    onSaved()
  }

  const excludeIds = exercises.map(e => e.exerciseId)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      {/* 标题栏 */}
      <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-800">{day.name} <span className="text-orange-500">编辑中</span></p>
          <p className="text-xs text-gray-500">{day.muscles}</p>
        </div>
        <button onClick={handleReset} className="text-xs text-gray-400 hover:text-gray-600">
          恢复默认
        </button>
      </div>

      {/* 动作列表 */}
      <div className="px-4 pt-3 pb-1">
        {exercises.map((e, idx) => {
          const ex = exerciseLibrary.find(x => x.id === e.exerciseId)
          return (
            <div key={`${e.exerciseId}-${idx}`}
                 className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
              {/* 删除按钮 */}
              <button
                onClick={() => removeExercise(idx)}
                className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100
                           text-sm flex items-center justify-center flex-shrink-0 font-bold"
              >
                ×
              </button>

              {/* 动作名 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {ex?.name || e.exerciseId}
                </p>
                <p className="text-[10px] text-gray-400">{ex?.bodyPart} · {ex?.equipment}</p>
              </div>

              {/* 组数 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="number"
                  value={e.defaultSets}
                  onChange={ev => updateSets(idx, ev.target.value)}
                  className="w-10 text-center text-xs border border-gray-200 rounded-lg py-1
                             focus:outline-none focus:border-orange-400"
                />
                <span className="text-[10px] text-gray-400">组</span>
              </div>

              {/* 次数范围 */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <input
                  type="text"
                  value={e.repRange}
                  onChange={ev => updateReps(idx, ev.target.value)}
                  className="w-16 text-center text-xs border border-gray-200 rounded-lg py-1
                             focus:outline-none focus:border-orange-400"
                />
                <span className="text-[10px] text-gray-400">次</span>
              </div>
            </div>
          )
        })}

        {/* 添加动作 */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="w-full mt-2 py-2 text-sm text-orange-500 hover:text-orange-700
                     border border-dashed border-orange-300 rounded-xl transition-colors"
        >
          {showSearch ? '收起搜索' : '＋ 添加动作'}
        </button>

        {showSearch && (
          <ExerciseSearchDropdown
            onSelect={addExercise}
            excludeIds={excludeIds}
          />
        )}
      </div>

      {/* 保存/取消 */}
      <div className="px-4 py-3 flex gap-2">
        <button
          onClick={onSaved}
          className="flex-1 py-2.5 text-sm text-gray-500 border border-gray-200
                     rounded-xl hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 text-sm font-bold text-white bg-orange-500
                     hover:bg-orange-600 rounded-xl transition-colors"
        >
          保存
        </button>
      </div>
    </div>
  )
}

// ── 单日展示卡（非编辑状态）────────────────────────────────

function DayCard({ plan, day, onEdit }) {
  const [open, setOpen] = useState(false)
  const exercises = getDayExercises(plan, day.id)
  const isCustomized = !!loadCustomDayExercises(plan.id, day.id)

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <button
        className="w-full px-4 py-3.5 flex items-center justify-between text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-gray-800 text-sm">{day.name}</p>
              {isCustomized && (
                <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5
                                 rounded-full font-semibold">自定义</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{day.muscles} · {exercises.length}个动作 · {day.estimatedMinutes}分钟</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onEdit() }}
            className="text-xs text-orange-500 hover:text-orange-700 px-2.5 py-1
                       border border-orange-200 rounded-lg transition-colors"
          >
            编辑
          </button>
          <span className="text-gray-300 text-sm">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-50 px-4 pb-3 pt-2">
          {exercises.map((e, i) => {
            const ex = exerciseLibrary.find(x => x.id === e.exerciseId)
            return (
              <div key={i} className="flex items-center justify-between py-1.5
                                      border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700">{ex?.name || e.exerciseId}</p>
                    <p className="text-[10px] text-gray-400">{ex?.primaryMuscles?.[0]} · {ex?.equipment}</p>
                  </div>
                </div>
                <span className="text-xs text-orange-500 font-medium">
                  {e.defaultSets}组 × {e.repRange}次
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── 计划选择卡 ────────────────────────────────────────────

function PlanSelectorCard({ plan, isActive, onSelect }) {
  return (
    <button
      onClick={() => onSelect(plan.id)}
      className={`w-full text-left rounded-2xl p-4 border-2 transition-all ${
        isActive
          ? 'border-orange-500 bg-orange-500/10'
          : 'border-white/10 bg-white/5 hover:border-white/20'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className={`font-bold text-sm ${isActive ? 'text-orange-400' : 'text-white'}`}>
            {plan.name}
          </p>
          <p className="text-[11px] text-slate-400">{plan.chineseName} · {plan.description}</p>
        </div>
        {isActive && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            使用中
          </span>
        )}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {plan.days.map(day => (
          <span key={day.id} className={`text-[10px] px-2 py-0.5 rounded-lg ${
            isActive ? 'bg-orange-500/20 text-orange-300' : 'bg-white/10 text-slate-400'
          }`}>
            {day.chineseName}
          </span>
        ))}
      </div>
    </button>
  )
}

// ── 主组件 ──────────────────────────────────────────────

export default function PlanPage() {
  const [selectedPlanId, setSelectedPlanId] = useState(getActivePlan().id)
  const [editingDayId,   setEditingDayId]   = useState(null)
  const [version,        setVersion]        = useState(0) // 强制刷新

  const selectedPlan = ALL_PLANS.find(p => p.id === selectedPlanId) || ALL_PLANS[0]

  function handleSelectPlan(planId) {
    setSelectedPlanId(planId)
    localStorage.setItem('active_plan_id', planId)
    setEditingDayId(null)
  }

  function handleEditSaved() {
    setEditingDayId(null)
    setVersion(v => v + 1)
  }

  return (
    <div className="flex flex-col px-4 pt-10 pb-6 gap-4" key={version}>

      <div>
        <h1 className="text-xl font-black text-white">训练计划</h1>
        <p className="text-xs text-slate-400 mt-1">选择分化方式，自定义每天的动作</p>
      </div>

      {/* 计划选择 */}
      <div className="flex flex-col gap-2.5">
        {ALL_PLANS.map(plan => (
          <PlanSelectorCard
            key={plan.id}
            plan={plan}
            isActive={plan.id === selectedPlanId}
            onSelect={handleSelectPlan}
          />
        ))}
      </div>

      <div className="border-t border-white/10" />

      {/* 当前计划详情 + 编辑 */}
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-3">
          {selectedPlan.name} — 每日动作
        </p>
        <div className="flex flex-col gap-2.5">
          {selectedPlan.days.map(day => (
            editingDayId === day.id
              ? <DayEditor
                  key={day.id}
                  plan={selectedPlan}
                  day={day}
                  onSaved={handleEditSaved}
                />
              : <DayCard
                  key={day.id}
                  plan={selectedPlan}
                  day={day}
                  onEdit={() => setEditingDayId(day.id)}
                />
          ))}
        </div>
      </div>

      {/* 提示 */}
      <div className="bg-white/5 border border-white/8 rounded-2xl p-3.5">
        <p className="text-xs text-slate-400 leading-relaxed">
          💡 点击「编辑」可自定义每天的动作和组数，支持搜索全部 53 个动作。修改后会自动保存。
        </p>
      </div>

    </div>
  )
}
