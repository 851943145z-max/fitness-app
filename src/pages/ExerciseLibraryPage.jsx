// ExerciseLibraryPage.jsx — 动作库页面
// 三级联动筛选：训练日（推/拉/腿/核心）× 部位 × 器械

import { useState, useMemo } from 'react'
import {
  TRAINING_SPLITS,
  BODY_PART_CATEGORIES,
  EQUIPMENT_FILTERS,
  DIFFICULTY_COLOR,
  TYPE_COLOR,
  exerciseLibrary,
} from '../data/exerciseLibrary.js'
import MuscleIllustration from '../components/MuscleIllustration.jsx'

// ── 动作卡片 ──────────────────────────────────────────────

function ExerciseCard({ exercise, onClick }) {
  const [imgError, setImgError] = useState(false)

  return (
    <button
      onClick={() => onClick(exercise)}
      className="bg-white rounded-2xl shadow-sm overflow-hidden text-left
                 active:scale-95 transition-transform w-full"
    >
      {/* 图片区域：有图显示图，无图显示紧凑占位 */}
      <div className="relative overflow-hidden">
        {!imgError ? (
          <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center relative">
            <img
              src={`${import.meta.env.BASE_URL}images/exercises/${exercise.imageKey}.png`}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
            <span className="absolute top-1.5 left-1.5 bg-black/40 text-white text-[10px]
                             px-1.5 py-0.5 rounded-full backdrop-blur-sm">
              {exercise.equipment}
            </span>
          </div>
        ) : (
          // 无图时用肌肉示意图替代
          <div className="bg-slate-50 flex items-center justify-center aspect-[4/3] relative">
            <MuscleIllustration
              primaryMuscles={exercise.primaryMuscles}
              secondaryMuscles={exercise.secondaryMuscles}
            />
            <span className="absolute top-1.5 right-1.5 bg-orange-100 text-orange-600
                             text-[9px] px-1.5 py-0.5 rounded-full font-medium">
              {exercise.equipment}
            </span>
          </div>
        )}
      </div>

      {/* 文字区域 */}
      <div className="p-2.5">
        {/* 动作名称 */}
        <p className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 mb-1.5">
          {exercise.name}
        </p>

        {/* 主练部位 + 细分 */}
        <p className="text-[10px] text-gray-400 mb-1.5">
          {exercise.primaryMuscles[0]}
          {exercise.subPart && ` · ${exercise.subPart}`}
        </p>

        {/* 难度 + 类型标签 */}
        <div className="flex flex-wrap gap-1 mb-1.5">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${DIFFICULTY_COLOR[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${TYPE_COLOR[exercise.type]}`}>
            {exercise.type}
          </span>
        </div>

        {/* 推荐组数 × 次数 */}
        <p className="text-[10px] text-blue-600 font-medium">
          {exercise.recommendedSets} × {exercise.recommendedReps}
        </p>
      </div>
    </button>
  )
}

// ── 动作详情弹窗 ──────────────────────────────────────────

function ExerciseDetailModal({ exercise, onClose }) {
  const [imgError, setImgError] = useState(false)
  // 找到该动作所属的训练日名称
  const splitName = TRAINING_SPLITS.find(s => s.id === exercise.split)?.name || exercise.split

  return (
    // 半透明遮罩层
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end"
      onClick={onClose}
    >
      {/* 弹出卡片（点击内部不关闭）*/}
      <div
        className="bg-white w-full rounded-t-3xl max-h-[85vh] overflow-y-auto pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* 顶部拖拽条 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* 图片 */}
        <div className="bg-gray-100 mx-4 rounded-2xl aspect-video flex items-center justify-center overflow-hidden mb-4">
          {!imgError ? (
            <img
              src={`${import.meta.env.BASE_URL}images/exercises/${exercise.imageKey}.png`}
              alt={exercise.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              <span className="text-sm">图片待补充</span>
            </div>
          )}
        </div>

        <div className="px-4">
          {/* 动作名 + 训练日 */}
          <h2 className="text-xl font-bold text-gray-800 mb-1">{exercise.name}</h2>
          <p className="text-sm text-gray-400 mb-4">{splitName} · {exercise.bodyPart} · {exercise.subPart}</p>

          {/* 信息网格 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <InfoBox label="器械类型" value={exercise.equipment} />
            <InfoBox label="动作类型" value={exercise.type} />
            <InfoBox label="难度"     value={exercise.difficulty} />
            <InfoBox label="推荐训练量" value={`${exercise.recommendedSets} × ${exercise.recommendedReps}`} />
          </div>

          {/* 主练肌群 */}
          <Section title="主练肌群">
            <div className="flex flex-wrap gap-2">
              {exercise.primaryMuscles.map(m => (
                <span key={m} className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                  {m}
                </span>
              ))}
            </div>
          </Section>

          {/* 辅助肌群 */}
          {exercise.secondaryMuscles.length > 0 && (
            <Section title="辅助肌群">
              <div className="flex flex-wrap gap-2">
                {exercise.secondaryMuscles.map(m => (
                  <span key={m} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* 注意事项占位 */}
          <Section title="注意事项">
            <p className="text-sm text-gray-400">详细说明待补充</p>
          </Section>
        </div>
      </div>
    </div>
  )
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{title}</h3>
      {children}
    </div>
  )
}

// ── 主页面 ──────────────────────────────────────────────

function ExerciseLibraryPage() {
  // 三个筛选状态
  const [selectedSplit,     setSelectedSplit]     = useState('all')
  const [selectedBodyPart,  setSelectedBodyPart]  = useState('all')
  const [selectedEquipment, setSelectedEquipment] = useState('all')

  // 当前打开的动作详情
  const [detailExercise, setDetailExercise] = useState(null)

  // 搜索相关状态
  const [searchQuery, setSearchQuery] = useState('')   // 搜索关键词
  const [searchOpen,  setSearchOpen]  = useState(false) // 搜索框是否展开

  // ── 当训练日切换时，若当前部位不属于新训练日则重置 ──

  function handleSplitChange(splitId) {
    setSelectedSplit(splitId)

    if (splitId === 'all') {
      // 切回全部，保留当前部位选择
      return
    }

    const split = TRAINING_SPLITS.find(s => s.id === splitId)
    // 检查当前选中的部位是否在新训练日的范围内
    if (selectedBodyPart !== 'all') {
      const currentPartName = BODY_PART_CATEGORIES.find(b => b.id === selectedBodyPart)?.name
      if (!split.bodyParts.includes(currentPartName)) {
        setSelectedBodyPart('all')   // 不属于新训练日，重置为全部
      }
    }
  }

  // ── 根据当前训练日，过滤左侧部位列表 ──

  const visibleBodyParts = useMemo(() => {
    if (selectedSplit === 'all') return BODY_PART_CATEGORIES

    const split = TRAINING_SPLITS.find(s => s.id === selectedSplit)
    // 只显示属于当前训练日的部位（+ 固定的"全部"选项）
    return BODY_PART_CATEGORIES.filter(b =>
      b.id === 'all' || split.bodyParts.includes(b.name)
    )
  }, [selectedSplit])

  // ── 三重筛选：同时满足训练日 + 部位 + 器械 ──

  const filteredExercises = useMemo(() => {
    const q = searchQuery.trim()
    return exerciseLibrary.filter(ex => {
      const splitOk     = selectedSplit     === 'all' || ex.split       === selectedSplit
      const bodyPartOk  = selectedBodyPart  === 'all' || ex.bodyPart    === BODY_PART_CATEGORIES.find(b => b.id === selectedBodyPart)?.name
      const equipmentOk = selectedEquipment === 'all' || ex.equipmentId === selectedEquipment
      // 搜索过滤：匹配动作名、部位、器械、主练肌群（空关键词则不过滤）
      const searchOk    = !q ||
        ex.name.includes(q) ||
        ex.bodyPart.includes(q) ||
        ex.equipment.includes(q) ||
        ex.primaryMuscles.some(m => m.includes(q))
      return splitOk && bodyPartOk && equipmentOk && searchOk
    })
  }, [selectedSplit, selectedBodyPart, selectedEquipment, searchQuery])

  // ── 渲染 ──────────────────────────────────────────────

  return (
    // 全屏容器，竖向 flex，底部导航栏高度已在 App.jsx 的 pb-20 中处理
    <div className="flex flex-col bg-gray-50 h-screen">

      {/* ══ 顶部筛选区（白色卡片，固定不滚动）══ */}
      <div className="bg-white border-b border-gray-100 flex-shrink-0">

        {/* 页面标题 */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-800">动作库</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{filteredExercises.length} 个动作</span>
            {/* 搜索图标按钮：点击展开/收起搜索框 */}
            <button
              onClick={() => {
                setSearchOpen(prev => !prev)
                if (searchOpen) setSearchQuery('')  // 收起时清空关键词
              }}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                searchOpen
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {/* 放大镜 SVG */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </div>

        {/* 搜索输入框（展开时显示）*/}
        {searchOpen && (
          <div className="px-4 pb-2.5 flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索动作名称、部位、器械..."
              autoFocus
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2
                         focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100
                         bg-white placeholder-gray-300"
            />
            {/* 清空按钮（有内容才显示）*/}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="w-7 h-7 flex items-center justify-center rounded-full
                           bg-gray-100 text-gray-400 hover:bg-gray-200 flex-shrink-0"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 训练日筛选（横向滚动）*/}
        <div className="overflow-x-auto px-4 pb-2 flex gap-2 scrollbar-hide">
          {TRAINING_SPLITS.map(split => (
            <button
              key={split.id}
              onClick={() => handleSplitChange(split.id)}
              className={[
                'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                selectedSplit === split.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {/* 只显示 subtitle（如"胸·肩·三头"），全部类型直接显示名称 */}
              {split.subtitle ? split.subtitle : split.name}
            </button>
          ))}
        </div>

        {/* 器械筛选（横向滚动）*/}
        <div className="overflow-x-auto px-4 pb-3 flex gap-2 scrollbar-hide">
          {EQUIPMENT_FILTERS.map(eq => (
            <button
              key={eq.id}
              onClick={() => setSelectedEquipment(eq.id)}
              className={[
                'flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors',
                selectedEquipment === eq.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ].join(' ')}
            >
              {eq.name}
            </button>
          ))}
        </div>
      </div>

      {/* ══ 主内容区：左侧部位栏 + 右侧动作网格 ══ */}
      {/* overflow-hidden 让子元素独立滚动 */}
      <div className="flex flex-1 overflow-hidden">

        {/* 左侧部位导航（独立滚动，固定宽度）*/}
        <aside className="w-16 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0 pb-20">
          {visibleBodyParts.map(part => (
            <button
              key={part.id}
              onClick={() => setSelectedBodyPart(part.id)}
              className={[
                'w-full py-3 px-1 flex flex-col items-center gap-0.5 transition-colors',
                'border-b border-gray-50',
                selectedBodyPart === part.id
                  ? 'bg-blue-50 border-l-2 border-l-blue-600'
                  : 'hover:bg-gray-50',
              ].join(' ')}
            >
              <span
                className={`text-[11px] font-medium leading-tight text-center ${
                  selectedBodyPart === part.id ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {part.name}
              </span>
            </button>
          ))}
        </aside>

        {/* 右侧动作卡片网格（独立滚动）*/}
        <main className="flex-1 overflow-y-auto p-3 pb-24">
          {filteredExercises.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredExercises.map(ex => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onClick={setDetailExercise}
                />
              ))}
            </div>
          ) : (
            // 无结果时的空状态
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <span className="text-4xl">🔍</span>
              <p className="text-sm text-gray-400">没有找到符合条件的动作</p>
              <button
                onClick={() => { setSelectedSplit('all'); setSelectedBodyPart('all'); setSelectedEquipment('all') }}
                className="text-xs text-blue-600 underline"
              >
                清除所有筛选
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ══ 动作详情弹窗 ══ */}
      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
        />
      )}
    </div>
  )
}

export default ExerciseLibraryPage
