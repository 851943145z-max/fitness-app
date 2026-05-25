// CheckinCalendar.jsx — 最近 30 天打卡日历
// 绿色 = 当天打卡，灰色 = 未打卡，今天有高亮边框

// ── 工具函数 ──────────────────────────────────────────────

// 从 localStorage 读取所有打卡日期，返回一个 Set（集合）
function loadCheckinDates() {
  const raw = localStorage.getItem('checkin_dates')
  const dates = new Set(raw ? JSON.parse(raw) : [])

  // 兼容旧数据：如果只有 checkin_date（旧格式），也把它加进来
  const lastDate = localStorage.getItem('checkin_date')
  if (lastDate) dates.add(lastDate)

  return dates
}

// ── 主组件 ──────────────────────────────────────────────

function CheckinCalendar() {
  const checkinDates = loadCheckinDates()
  const todayKey     = new Date().toISOString().slice(0, 10)

  // ── 生成最近 30 天的日期数组 ──────────────────────────

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 29)

  // 日历第一格是星期几（用于对齐表头）
  const startWeekday = startDate.getDay()

  const dayCells = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    return {
      key:   date.toISOString().slice(0, 10),
      day:   date.getDate(),
      month: date.getMonth() + 1,
      year:  date.getFullYear(),
    }
  })

  const checkinCount = dayCells.filter(d => checkinDates.has(d.key)).length

  // ── 计算日历跨越的月份范围，显示在标题区域 ──────────────
  // 例如：4月26日 — 5月25日
  const firstCell = dayCells[0]
  const lastCell  = dayCells[dayCells.length - 1]
  const rangeText = `${firstCell.month}月${firstCell.day}日 — ${lastCell.month}月${lastCell.day}日`

  // ── 构建网格元素数组（月份分隔行 + 日期格子）─────────────
  // 思路：遍历 30 天，当月份发生变化时，插入一个 col-span-7 的月份标题行

  let lastRenderedMonth = null
  const gridItems = []

  // 先放第一个月份标题（在空白对齐格之前，这样不影响列对齐）
  gridItems.push(
    <div key="month-first" className="col-span-7 flex items-center gap-2 pt-1 pb-0.5">
      <span className="text-xs font-bold text-orange-500 tracking-wide">
        {firstCell.month}月
      </span>
      <div className="flex-1 h-px bg-orange-200/60" />
    </div>
  )
  lastRenderedMonth = firstCell.month

  // 对齐空白格（让第一天落在正确的星期列）
  for (let i = 0; i < startWeekday; i++) {
    gridItems.push(<div key={`empty-${i}`} />)
  }

  // 30 个日期格子
  dayCells.forEach(({ key, day, month }, i) => {
    // 月份变了 → 插入新的月份标题行
    if (month !== lastRenderedMonth) {
      lastRenderedMonth = month
      gridItems.push(
        <div key={`month-${month}`} className="col-span-7 flex items-center gap-2 pt-2 pb-0.5">
          <span className="text-xs font-bold text-orange-500 tracking-wide">
            {month}月
          </span>
          <div className="flex-1 h-px bg-orange-200/60" />
        </div>
      )
    }

    const isChecked = checkinDates.has(key)
    const isToday   = key === todayKey

    gridItems.push(
      <div
        key={key}
        className={[
          'aspect-square rounded-lg',
          'flex items-center justify-center',
          'text-xs font-medium',
          isToday   ? 'ring-2 ring-orange-400 ring-offset-1' : '',
          isChecked ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400',
        ].join(' ')}
      >
        {day}
      </div>
    )
  })

  // ── 页面渲染 ──────────────────────────────────────────

  return (
    <div className="w-full max-w-sm">

      {/* 标题 + 统计 */}
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="text-base font-bold text-white tracking-wide">
          最近 30 天
        </h2>
        <span className="text-xs text-orange-400 font-medium">
          已打卡 {checkinCount} / 30 天
        </span>
      </div>

      {/* 日期范围副标题（例如：4月26日 — 5月25日）*/}
      <p className="text-xs text-slate-400 mb-3">{rangeText}</p>

      {/* 白色卡片容器 */}
      <div className="bg-white rounded-2xl shadow p-4">

        {/* 星期标题行：日 一 二 三 四 五 六 */}
        <div className="grid grid-cols-7 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(label => (
            <div key={label} className="text-center text-xs text-gray-300 py-1">
              {label}
            </div>
          ))}
        </div>

        {/* 日期格子区域（月份标题行 + 日期格子混排）*/}
        <div className="grid grid-cols-7 gap-1">
          {gridItems}
        </div>

      </div>
    </div>
  )
}

export default CheckinCalendar
