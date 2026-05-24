// CheckinCalendar.jsx — 最近 30 天打卡日历
// 绿色 = 当天打卡，灰色 = 未打卡，今天有高亮边框

// ── 工具函数 ──────────────────────────────────────────────

// 从 localStorage 读取所有打卡日期，返回一个 Set（集合）
// Set 的特点：查询"某个日期在不在里面"非常快
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
  // 读取所有打卡日期（Set 类型）
  const checkinDates = loadCheckinDates()

  // 今天的日期字符串，用于高亮今天
  const todayKey = new Date().toISOString().slice(0, 10)

  // ── 生成最近 30 天的日期数组 ──────────────────────────

  // 30 天前的那一天（作为起点）
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 29)

  // startDate 是星期几？(0=周日, 1=周一, ..., 6=周六)
  // 用来在日历第一行前面填充空格，让日期对齐到正确的列
  const startWeekday = startDate.getDay()

  // 生成 30 个日期格子的数据
  const dayCells = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    return {
      key:   date.toISOString().slice(0, 10),  // 如 "2026-05-24"
      day:   date.getDate(),                    // 如 24
      month: date.getMonth() + 1,               // 如 5（月份从0开始所以+1）
    }
  })

  // 统计这 30 天里打卡了几天
  const checkinCount = dayCells.filter(d => checkinDates.has(d.key)).length

  // ── 页面渲染 ──────────────────────────────────────────

  return (
    <div className="w-full max-w-sm">

      {/* 标题 + 统计 */}
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-500 tracking-wide">
          最近 30 天
        </h2>
        <span className="text-xs text-emerald-600 font-medium">
          已打卡 {checkinCount} / 30 天
        </span>
      </div>

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

        {/* 日期格子区域 */}
        <div className="grid grid-cols-7 gap-1">

          {/* 第一行前面的空格（让日期对齐到正确的星期列）*/}
          {Array.from({ length: startWeekday }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* 30 个日期格子 */}
          {dayCells.map(({ key, day, month }) => {
            const isChecked = checkinDates.has(key)
            const isToday   = key === todayKey

            // 判断是否是每月 1 号，用于在格子上方显示月份数字
            const isFirstOfMonth = day === 1

            return (
              <div key={key} className="flex flex-col items-center">

                {/* 月份小标签（只在每月1号显示）*/}
                {isFirstOfMonth && (
                  <span className="text-gray-300 text-[9px] leading-none mb-0.5">
                    {month}月
                  </span>
                )}

                {/* 日期格子本体 */}
                <div
                  className={[
                    'w-full aspect-square rounded-lg',
                    'flex items-center justify-center',
                    'text-xs font-medium',
                    // 今天：加绿色描边
                    isToday ? 'ring-2 ring-emerald-400 ring-offset-1' : '',
                    // 打卡了：绿底白字；没打卡：灰底灰字
                    isChecked
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-400',
                  ].join(' ')}
                >
                  {day}
                </div>

              </div>
            )
          })}

        </div>
      </div>
    </div>
  )
}

export default CheckinCalendar
