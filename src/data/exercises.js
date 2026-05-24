// exercises.js — 常见动作数据库
// 每个动作记录：中文名、激活的肌肉群、简短说明
// muscles 数组里的字符串要和 MuscleMap.jsx 里的 ID 对应

export const EXERCISES = [
  // ── 胸部 ──────────────────────────────────────────────
  { name: '卧推',     muscles: ['chest', 'shoulders', 'triceps'], desc: '平躺推起杠铃，胸肌训练基础动作' },
  { name: '上斜卧推', muscles: ['chest', 'shoulders', 'triceps'], desc: '斜板上推杠铃，强化胸部上沿' },
  { name: '哑铃飞鸟', muscles: ['chest'],                         desc: '两侧画弧聚拢，孤立刺激胸肌' },
  { name: '俯卧撑',   muscles: ['chest', 'shoulders', 'triceps'], desc: '经典徒手动作，练胸、肩、三头' },

  // ── 背部 ──────────────────────────────────────────────
  { name: '硬拉',     muscles: ['back', 'glutes', 'hamstrings'],  desc: '从地面拉起杠铃，复合全身' },
  { name: '引体向上', muscles: ['back', 'biceps'],                desc: '双手握杠向上拉，练背宽' },
  { name: '坐姿划船', muscles: ['back', 'biceps'],                desc: '坐姿向后拉绳，练背厚' },
  { name: '高位下拉', muscles: ['back', 'biceps'],                desc: '将把手拉至胸前，增加背宽' },

  // ── 腿部 ──────────────────────────────────────────────
  { name: '深蹲',     muscles: ['quads', 'glutes', 'hamstrings'], desc: '负重蹲下站起，腿部王者动作' },
  { name: '腿举',     muscles: ['quads', 'glutes'],               desc: '在腿举机上推重，适合大重量' },
  { name: '腿弯举',   muscles: ['hamstrings'],                    desc: '趴着向后弯腿，孤立腘绳肌' },
  { name: '腿屈伸',   muscles: ['quads'],                         desc: '坐姿向前伸腿，孤立股四头肌' },
  { name: '提踵',     muscles: ['calves'],                        desc: '踮起脚尖，专练小腿腓肠肌' },

  // ── 肩部 ──────────────────────────────────────────────
  { name: '肩推',     muscles: ['shoulders', 'triceps'],          desc: '杠铃/哑铃推过头顶，练三角肌' },
  { name: '侧平举',   muscles: ['shoulders'],                     desc: '手臂侧面抬起，强化三角肌中束' },
  { name: '前平举',   muscles: ['shoulders'],                     desc: '手臂向前抬起，强化三角肌前束' },

  // ── 手臂 ──────────────────────────────────────────────
  { name: '二头弯举', muscles: ['biceps'],                        desc: '弯举哑铃，孤立肱二头肌' },
  { name: '三头下压', muscles: ['triceps'],                       desc: '向下推绳索，孤立肱三头肌' },
  { name: '锤式弯举', muscles: ['biceps'],                        desc: '握姿像锤头，练二头和前臂' },

  // ── 核心 ──────────────────────────────────────────────
  { name: '卷腹',     muscles: ['abs'],                           desc: '小幅卷起上身，精准刺激腹肌' },
  { name: '平板支撑', muscles: ['abs'],                           desc: '撑住不动，强化核心稳定性' },
  { name: '仰卧起坐', muscles: ['abs'],                           desc: '躺下卷起上身，练腹直肌' },
]

// 根据输入文字搜索动作（最多返回 5 个）
export function searchExercises(keyword) {
  if (!keyword.trim()) return []
  return EXERCISES.filter(ex => ex.name.includes(keyword.trim())).slice(0, 5)
}

// 根据名字精确找到动作（找不到返回 null）
export function findExercise(name) {
  return EXERCISES.find(ex => ex.name === name.trim()) || null
}
