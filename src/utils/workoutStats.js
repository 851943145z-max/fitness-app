// workoutStats.js — 训练数据统计工具函数
// 所有数据读写 localStorage，无需后端

// ── localStorage 键名常量 ──────────────────────────────────
const KEY_SESSIONS  = 'workout_sessions'   // 完整训练记录数组
const KEY_PRS       = 'workout_prs'        // 个人最佳记录 { exerciseId: { weight, reps, date } }
const KEY_CHECKIN   = 'checkin_dates'      // 旧版打卡日期数组（兼容保留）

// ── 读写训练记录 ───────────────────────────────────────────

export function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(KEY_SESSIONS) || '[]')
  } catch {
    return []
  }
}

// 根据 session.id 删除一条记录，同步更新 checkin_dates
export function deleteSession(sessionId) {
  const sessions = loadSessions().filter(s => s.id !== sessionId)
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions))

  // 重新生成 checkin_dates（只保留还有记录的日期）
  const remainingDates = [...new Set(sessions.map(s => s.date))]
  localStorage.setItem(KEY_CHECKIN, JSON.stringify(remainingDates))
  // 更新最近一次打卡日期
  const lastDate = remainingDates.sort().pop() || ''
  localStorage.setItem('checkin_date', lastDate)

  // 重新计算连续天数
  if (sessions.length > 0) updateStreak(sessions[sessions.length - 1].date)
  else localStorage.setItem('checkin_streak', '0')
}

export function saveSession(session) {
  const sessions = loadSessions()
  // 如果同一天同类型已有记录，替换；否则追加
  const existingIdx = sessions.findIndex(
    s => s.date === session.date && s.workoutDayId === session.workoutDayId
  )
  if (existingIdx >= 0) {
    sessions[existingIdx] = session
  } else {
    sessions.push(session)
  }
  localStorage.setItem(KEY_SESSIONS, JSON.stringify(sessions))

  // 同步更新旧版 checkin_dates，让 CheckinCalendar 可以正常显示
  const checkinDates = JSON.parse(localStorage.getItem(KEY_CHECKIN) || '[]')
  if (!checkinDates.includes(session.date)) {
    checkinDates.push(session.date)
    localStorage.setItem(KEY_CHECKIN, JSON.stringify(checkinDates))
    localStorage.setItem('checkin_date', session.date)
  }

  // 更新连续天数
  updateStreak(session.date)

  // 更新 PR 记录
  updatePRs(session)
}

// ── 连续训练天数 ──────────────────────────────────────────

export function updateStreak(newDate) {
  const sessions = loadSessions()
  const dates = [...new Set(sessions.map(s => s.date))].sort()

  let streak = 0
  let current = new Date()
  current.setHours(0, 0, 0, 0)

  // 从今天往前数，计算连续天数
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = new Date(dates[i] + 'T12:00:00')
    const diffDays = Math.round((current - d) / (1000 * 60 * 60 * 24))
    if (diffDays === 0 || diffDays === streak) {
      streak++
      current = d
    } else {
      break
    }
  }

  localStorage.setItem('checkin_streak', String(streak))
  return streak
}

export function getStreak() {
  return parseInt(localStorage.getItem('checkin_streak') || '0', 10)
}

// ── 周/月统计 ─────────────────────────────────────────────

export function getWeeklyCount() {
  const sessions = loadSessions()
  const now = new Date()
  // 本周一的日期
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  return sessions.filter(s => new Date(s.date + 'T12:00:00') >= monday).length
}

export function getMonthlyCount() {
  const sessions = loadSessions()
  const now = new Date()
  const yyyyMM = now.toISOString().slice(0, 7)  // "2026-05"
  return sessions.filter(s => s.date.startsWith(yyyyMM)).length
}

export function getTotalCount() {
  return loadSessions().length
}

// ── 总训练量（volume = 重量 × 次数 × 组数）─────────────────

export function getTotalVolume() {
  return loadSessions().reduce((total, session) => {
    const sessionVolume = (session.exercises || []).reduce((t, ex) => {
      const exVolume = (ex.sets || []).reduce((s, set) => {
        if (set.completed) s += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0)
        return s
      }, 0)
      return t + exVolume
    }, 0)
    return total + sessionVolume
  }, 0)
}

// ── PR 记录 ──────────────────────────────────────────────

export function loadPRs() {
  try {
    return JSON.parse(localStorage.getItem(KEY_PRS) || '{}')
  } catch {
    return {}
  }
}

// 遍历本次训练所有动作，更新 PR
export function updatePRs(session) {
  const prs = loadPRs()
  const newPRs = []

  ;(session.exercises || []).forEach(ex => {
    ;(ex.sets || []).filter(s => s.completed).forEach(set => {
      const w = parseFloat(set.weight) || 0
      const r = parseInt(set.reps) || 0
      if (w === 0 || r === 0) return

      const existing = prs[ex.exerciseId]
      // 判断是否是 PR：重量更大，或者相同重量下次数更多
      if (!existing || w > existing.weight || (w === existing.weight && r > existing.reps)) {
        prs[ex.exerciseId] = { weight: w, reps: r, date: session.date }
        newPRs.push({ exerciseId: ex.exerciseId, weight: w, reps: r })
      }
    })
  })

  localStorage.setItem(KEY_PRS, JSON.stringify(prs))
  return newPRs  // 返回本次新创建的 PR 列表
}

export function getPRForExercise(exerciseId) {
  return loadPRs()[exerciseId] || null
}

// ── 最近训练记录（倒序）─────────────────────────────────────

export function getRecentSessions(limit = 10) {
  return loadSessions()
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit)
}

// ── 今天是否已完成训练 ──────────────────────────────────────

export function hasTodaySession() {
  const today = new Date().toISOString().slice(0, 10)
  return loadSessions().some(s => s.date === today && s.completed)
}

// ── 身体部位训练频率（近30天）──────────────────────────────

export function getBodyPartFrequency() {
  const sessions = loadSessions()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const freq = {}
  sessions
    .filter(s => new Date(s.date + 'T12:00:00') >= thirtyDaysAgo)
    .forEach(s => {
      (s.muscleGroups || []).forEach(mg => {
        freq[mg] = (freq[mg] || 0) + 1
      })
    })
  return freq  // { "胸部": 4, "背部": 3, ... }
}

// ── 生成新训练 session 对象（空模板）──────────────────────

export function createSessionTemplate(workoutDay, planId) {
  return {
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
    completed:    false,
    startTime:    Date.now(),
  }
}
