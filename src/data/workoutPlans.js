// workoutPlans.js — 训练计划数据
// 定义 PPL 三分化和五分化的每日训练内容

// ── PPL 三分化 ──────────────────────────────────────────
export const PPL_PLAN = {
  id: 'ppl',
  name: 'Push Pull Legs',
  chineseName: '三分化',
  description: '经典三分化计划，适合每周训练3-6天',
  days: [
    {
      id: 'push',
      name: 'Push Day',
      chineseName: '推日',
      muscles: '胸 + 肩 + 三头',
      muscleGroups: ['胸部', '肩部', '三头'],
      estimatedMinutes: 60,
      exercises: [
        { exerciseId: 'barbell_bench_press',            defaultSets: 4, repRange: '6-8'   },
        { exerciseId: 'incline_dumbbell_press',         defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'seated_dumbbell_shoulder_press', defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'dumbbell_lateral_raise',         defaultSets: 3, repRange: '12-15' },
        { exerciseId: 'cable_triceps_pushdown',         defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'pec_deck_fly',                   defaultSets: 3, repRange: '12-15' },
      ],
    },
    {
      id: 'pull',
      name: 'Pull Day',
      chineseName: '拉日',
      muscles: '背 + 二头 + 肩后束',
      muscleGroups: ['背部', '二头', '肩部'],
      estimatedMinutes: 60,
      exercises: [
        { exerciseId: 'pull_up',           defaultSets: 4, repRange: '6-10'  },
        { exerciseId: 'barbell_row',       defaultSets: 4, repRange: '6-10'  },
        { exerciseId: 'seated_cable_row',  defaultSets: 3, repRange: '10-12' },
        { exerciseId: 'lat_pulldown',      defaultSets: 3, repRange: '10-12' },
        { exerciseId: 'dumbbell_curl',     defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'face_pull',         defaultSets: 3, repRange: '15-20' },
      ],
    },
    {
      id: 'legs',
      name: 'Legs & Core',
      chineseName: '腿日',
      muscles: '腿 + 臀 + 核心',
      muscleGroups: ['腿部', '臀部', '核心'],
      estimatedMinutes: 70,
      exercises: [
        { exerciseId: 'barbell_squat',      defaultSets: 4, repRange: '5-8'   },
        { exerciseId: 'leg_press',          defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'romanian_deadlift',  defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'lying_leg_curl',     defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'barbell_hip_thrust', defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'plank',              defaultSets: 3, repRange: '30-60s'},
      ],
    },
  ],
}

// ── 五分化 ───────────────────────────────────────────────
export const FIVE_DAY_PLAN = {
  id: 'five_day',
  name: 'Five Day Split',
  chineseName: '五分化',
  description: '每周五练，适合中高阶训练者',
  days: [
    {
      id: 'chest',
      name: 'Chest Day',
      chineseName: '胸日',
      muscles: '胸 + 三头',
      muscleGroups: ['胸部', '三头'],
      estimatedMinutes: 55,
      exercises: [
        { exerciseId: 'barbell_bench_press',    defaultSets: 4, repRange: '6-8'   },
        { exerciseId: 'incline_dumbbell_press', defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'dips_chest',             defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'cable_fly',              defaultSets: 3, repRange: '12-15' },
        { exerciseId: 'cable_triceps_pushdown', defaultSets: 3, repRange: '12-15' },
      ],
    },
    {
      id: 'back',
      name: 'Back Day',
      chineseName: '背日',
      muscles: '背 + 二头',
      muscleGroups: ['背部', '二头'],
      estimatedMinutes: 55,
      exercises: [
        { exerciseId: 'pull_up',          defaultSets: 4, repRange: '6-10'  },
        { exerciseId: 'barbell_row',      defaultSets: 4, repRange: '6-10'  },
        { exerciseId: 'lat_pulldown',     defaultSets: 3, repRange: '10-12' },
        { exerciseId: 'seated_cable_row', defaultSets: 3, repRange: '10-12' },
        { exerciseId: 'dumbbell_curl',    defaultSets: 3, repRange: '10-15' },
      ],
    },
    {
      id: 'shoulders',
      name: 'Shoulder Day',
      chineseName: '肩日',
      muscles: '肩',
      muscleGroups: ['肩部'],
      estimatedMinutes: 50,
      exercises: [
        { exerciseId: 'seated_dumbbell_shoulder_press', defaultSets: 4, repRange: '8-12'  },
        { exerciseId: 'dumbbell_lateral_raise',          defaultSets: 4, repRange: '12-15' },
        { exerciseId: 'face_pull',                      defaultSets: 3, repRange: '15-20' },
        { exerciseId: 'cable_lateral_raise',            defaultSets: 3, repRange: '12-15' },
      ],
    },
    {
      id: 'legs',
      name: 'Legs Day',
      chineseName: '腿日',
      muscles: '腿 + 臀',
      muscleGroups: ['腿部', '臀部'],
      estimatedMinutes: 65,
      exercises: [
        { exerciseId: 'barbell_squat',      defaultSets: 4, repRange: '5-8'   },
        { exerciseId: 'leg_press',          defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'romanian_deadlift',  defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'lying_leg_curl',      defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'barbell_hip_thrust', defaultSets: 3, repRange: '10-15' },
      ],
    },
    {
      id: 'arms',
      name: 'Arms & Core',
      chineseName: '手臂日',
      muscles: '二头 + 三头 + 核心',
      muscleGroups: ['二头', '三头', '核心'],
      estimatedMinutes: 50,
      exercises: [
        { exerciseId: 'barbell_curl',        defaultSets: 3, repRange: '8-12'  },
        { exerciseId: 'dumbbell_curl',       defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'cable_triceps_pushdown',              defaultSets: 3, repRange: '12-15' },
        { exerciseId: 'overhead_cable_triceps_extension',   defaultSets: 3, repRange: '10-15' },
        { exerciseId: 'plank',               defaultSets: 3, repRange: '30-60s'},
        { exerciseId: 'crunch',              defaultSets: 3, repRange: '15-20' },
      ],
    },
  ],
}

// 所有可选计划
export const ALL_PLANS = [PPL_PLAN, FIVE_DAY_PLAN]

// ── 工具函数 ──────────────────────────────────────────────

// 根据今天是星期几，决定当前计划该训练哪一天
// PPL 循环：周一=Push，周三=Pull，周五=Legs（其余为休息日）
export function getTodayWorkout(plan = PPL_PLAN) {
  const dayOfWeek = new Date().getDay()  // 0=日, 1=一, ..., 6=六

  // 三分化：1→push, 3→pull, 5→legs（其余休息）
  const pplSchedule = { 1: 0, 3: 1, 5: 2 }
  // 五分化：1→chest,2→back,3→shoulder,4→legs,5→arms
  const fiveDaySchedule = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4 }

  const schedule = plan.id === 'ppl' ? pplSchedule : fiveDaySchedule
  const idx = schedule[dayOfWeek]

  if (idx === undefined) return null  // 今天是休息日
  return plan.days[idx] || null
}

// 根据用户上次训练了哪天，推断今天应该练哪天（循环轮换）
export function getNextWorkoutDay(plan = PPL_PLAN) {
  const sessions = JSON.parse(localStorage.getItem('workout_sessions') || '[]')
  if (sessions.length === 0) return plan.days[0]

  const lastSession = sessions[sessions.length - 1]
  const lastDayId = lastSession.workoutDayId
  const lastIdx = plan.days.findIndex(d => d.id === lastDayId)
  const nextIdx = (lastIdx + 1) % plan.days.length
  return plan.days[nextIdx]
}

// 读取用户当前选择的计划
export function getActivePlan() {
  const planId = localStorage.getItem('active_plan_id') || 'ppl'
  return ALL_PLANS.find(p => p.id === planId) || PPL_PLAN
}
