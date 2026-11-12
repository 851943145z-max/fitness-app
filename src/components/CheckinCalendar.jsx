// CheckinCalendar.jsx — 最近 30 天打卡日历，兼容旧的打卡键。
function loadCheckinDates() {
  const raw = localStorage.getItem('checkin_dates')
  const dates = new Set(raw ? JSON.parse(raw) : [])
  const lastDate = localStorage.getItem('checkin_date')
  if (lastDate) dates.add(lastDate)
  return dates
}

export default function CheckinCalendar() {
  const checkinDates = loadCheckinDates()
  const today = new Date()
  const todayKey = today.toISOString().slice(0, 10)
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - 29)

  const days = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + index)
    return { date, key: date.toISOString().slice(0, 10) }
  })
  const count = days.filter(({ key }) => checkinDates.has(key)).length
  const dateLabel = date => date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })

  return (
    <section className="rounded-2xl border border-slate-200 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold">最近 30 天</h2>
        <span className="text-xs font-semibold text-emerald-800">已打卡 {count} 天</span>
      </div>
      <p className="mb-2 text-xs text-slate-600">{dateLabel(startDate)} – {dateLabel(today)}</p>
      <div className="grid grid-cols-7 gap-1">
        {['日', '一', '二', '三', '四', '五', '六'].map(label => (
          <span key={label} className="text-center text-xs text-slate-600">{label}</span>
        ))}
        {Array.from({ length: startDate.getDay() }, (_, index) => (
          <span key={`blank-${index}`} aria-hidden="true" />
        ))}
        {days.map(({ date, key }) => {
          const checked = checkinDates.has(key)
          return (
            <time key={key} dateTime={key} aria-current={key === todayKey ? 'date' : undefined}
              aria-label={`${dateLabel(date)}${checked ? '，已打卡' : ''}`}
              className={`flex h-5 items-center justify-center rounded text-xs font-medium tabular-nums
                ${checked ? 'bg-emerald-700 text-white' : 'bg-slate-50 text-slate-600'}
                ${key === todayKey ? 'ring-1 ring-inset ring-emerald-700 font-bold' : ''}`}>
              {date.getDate()}
            </time>
          )
        })}
      </div>
    </section>
  )
}
