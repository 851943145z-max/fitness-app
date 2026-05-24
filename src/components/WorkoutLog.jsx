// WorkoutLog.jsx — 今日训练记录组件
// 新增：输入动作名时自动提示，选中后显示肌肉示意图

import { useState } from 'react'
import MuscleMap from './MuscleMap.jsx'
import { searchExercises, findExercise } from '../data/exercises.js'

// ── 工具函数 ──────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function loadRecords() {
  const raw = localStorage.getItem('workout_records')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

function saveRecords(records) {
  localStorage.setItem('workout_records', JSON.stringify(records))
}

// ── 主组件 ──────────────────────────────────────────────

function WorkoutLog() {
  const todayKey = getTodayKey()

  const [allRecords,  setAllRecords]  = useState(loadRecords)
  const [inputName,   setInputName]   = useState('')
  const [inputSets,   setInputSets]   = useState('')
  const [inputWeight, setInputWeight] = useState('')

  // currentExercise：当前选中/匹配到的动作对象（来自数据库），用于显示肌肉图
  // 如果用户输入的动作名不在数据库里，这里是 null
  const [currentExercise, setCurrentExercise] = useState(null)

  // suggestions：根据输入文字实时过滤出的动作建议列表
  const [suggestions, setSuggestions] = useState([])

  const todayRecords = allRecords.filter(r => r.date === todayKey)

  // ── 动作名输入框变化时 ──────────────────────────────

  function handleNameChange(e) {
    const value = e.target.value
    setInputName(value)

    // 实时搜索匹配的动作（最多5条）
    setSuggestions(searchExercises(value))

    // 如果输入的名字和数据库精确匹配，直接显示肌肉图
    const matched = findExercise(value)
    setCurrentExercise(matched)
  }

  // ── 点击动作建议时 ──────────────────────────────────

  function handleSelectSuggestion(exercise) {
    setInputName(exercise.name)
    setCurrentExercise(exercise)
    setSuggestions([])   // 收起建议列表
  }

  // ── 添加记录 ──────────────────────────────────────────

  function handleAdd() {
    if (!inputName.trim()) return

    const newRecord = {
      id:      Date.now(),
      date:    todayKey,
      name:    inputName.trim(),
      sets:    inputSets.trim(),
      weight:  inputWeight.trim(),
      muscles: currentExercise ? currentExercise.muscles : [],  // 保存激活的肌肉群
    }

    const updated = [...allRecords, newRecord]
    setAllRecords(updated)
    saveRecords(updated)

    // 清空输入框和状态
    setInputName('')
    setInputSets('')
    setInputWeight('')
    setCurrentExercise(null)
    setSuggestions([])
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAdd()
  }

  // ── 删除记录 ──────────────────────────────────────────

  function handleDelete(id) {
    const updated = allRecords.filter(r => r.id !== id)
    setAllRecords(updated)
    saveRecords(updated)
  }

  // ── 页面渲染 ──────────────────────────────────────────

  return (
    <div className="w-full max-w-sm">

      <h2 className="text-base font-semibold text-gray-500 mb-3 text-center tracking-wide">
        今日训练记录
      </h2>

      {/* ── 输入区 ── */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-3">

        {/* 动作名称输入框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="动作名称（如：卧推、深蹲）"
            value={inputName}
            onChange={handleNameChange}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm
                       focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
          />

          {/* 动作建议下拉列表（输入时出现）*/}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1
                            bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              {suggestions.map(ex => (
                <button
                  key={ex.name}
                  onClick={() => handleSelectSuggestion(ex)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50
                             flex items-center justify-between border-b border-gray-50 last:border-0"
                >
                  <span className="font-medium text-gray-700">{ex.name}</span>
                  <span className="text-xs text-gray-400 ml-2 truncate max-w-[120px]">{ex.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 肌肉示意图（选中动作后显示）*/}
        {currentExercise && (
          <div className="bg-gray-50 rounded-xl p-3">
            {/* 动作简介 */}
            <p className="text-xs text-gray-500 text-center mb-1">{currentExercise.desc}</p>
            {/* 人体肌肉图 */}
            <MuscleMap muscles={currentExercise.muscles} />
          </div>
        )}

        {/* 组数 + 重量 */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="组数"
            value={inputSets}
            onChange={e => setInputSets(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-1/2 border border-gray-200 rounded-xl px-4 py-2 text-sm
                       focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
          />
          <input
            type="number"
            placeholder="重量 (kg)"
            value={inputWeight}
            onChange={e => setInputWeight(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-1/2 border border-gray-200 rounded-xl px-4 py-2 text-sm
                       focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
          />
        </div>

        {/* 添加按钮 */}
        <button
          onClick={handleAdd}
          className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95
                     text-white font-semibold rounded-xl py-2 text-sm
                     transition-all duration-150"
        >
          + 添加记录
        </button>

      </div>

      {/* ── 今日记录列表 ── */}
      {todayRecords.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          {todayRecords.map(record => (
            <RecordCard
              key={record.id}
              record={record}
              onDelete={() => handleDelete(record.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 text-xs mt-4">
          还没有记录，添加今天的训练吧 💪
        </p>
      )}

    </div>
  )
}

// ── 单条训练记录卡片 ──────────────────────────────────────
// 独立成小组件，让代码更清晰

function RecordCard({ record, onDelete }) {
  // expanded：是否展开显示肌肉图
  const [expanded, setExpanded] = useState(false)

  const hasMuscles = record.muscles && record.muscles.length > 0

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">

      {/* 顶部：动作名 + 组数重量 + 展开/删除按钮 */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-700 text-sm">{record.name}</span>
          {(record.sets || record.weight) && (
            <span className="text-gray-400 text-xs">
              {record.sets   && `${record.sets}组`}
              {record.sets && record.weight && ' × '}
              {record.weight && `${record.weight}kg`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 展开肌肉图按钮（只有数据库里有的动作才显示）*/}
          {hasMuscles && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-emerald-500 hover:text-emerald-700 transition-colors"
              title="查看训练部位"
            >
              {expanded ? '收起' : '部位'}
            </button>
          )}
          {/* 删除按钮 */}
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors"
            title="删除"
          >
            ×
          </button>
        </div>
      </div>

      {/* 展开的肌肉图区域（点击"部位"按钮后显示）*/}
      {expanded && hasMuscles && (
        <div className="border-t border-gray-50 bg-gray-50 px-4 pb-3 pt-2">
          <MuscleMap muscles={record.muscles} />
        </div>
      )}

    </div>
  )
}

export default WorkoutLog
