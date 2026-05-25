// MuscleIllustration.jsx — 动作卡片用的紧凑肌肉示意图
// 显示正面人体轮廓，高亮主练肌群，用于动作库卡片缩略图

// ── 中文肌肉名 → SVG key 映射 ──────────────────────────────
const MUSCLE_TO_KEY = {
  '胸大肌': 'chest',  '上胸': 'chest',    '下胸': 'chest',   '胸中缝': 'chest',
  '背阔肌': 'back',   '中背': 'back',     '下背': 'back',    '背部': 'back',
  '肩前束': 'shoulders', '肩中束': 'shoulders', '肩后束': 'shoulders',
  '三角肌': 'shoulders', '斜方肌': 'shoulders',
  '三头':   'triceps',  '三头肌': 'triceps',
  '二头':   'biceps',   '二头肌': 'biceps',
  '股四头肌': 'quads',  '腿前侧': 'quads',
  '腘绳肌':  'hamstrings', '腿后侧': 'hamstrings',
  '臀大肌':  'glutes',  '臀部': 'glutes',
  '腹肌':    'abs',     '腹部': 'abs',     '核心': 'abs',     '腹横肌': 'abs',
  '腹斜肌':  'abs',
  '小腿':    'calves',
}

export function mapMusclesToKeys(chineseNames = []) {
  const keys = chineseNames
    .map(n => MUSCLE_TO_KEY[n])
    .filter(Boolean)
  return [...new Set(keys)] // 去重
}

// ── 正面人体 SVG（仅正面，用于卡片缩略图）───────────────────
// viewBox="0 0 70 148" — 只取正面那一半

export default function MuscleIllustration({ primaryMuscles = [], secondaryMuscles = [] }) {
  const primary   = new Set(mapMusclesToKeys(primaryMuscles))
  const secondary = new Set(mapMusclesToKeys(secondaryMuscles))

  // 主练：橙色；辅助：淡橙；未激活：浅灰
  function fill(m) {
    if (primary.has(m))   return '#f97316'  // orange-500
    if (secondary.has(m)) return '#fed7aa'  // orange-200
    return '#f1f5f9'                         // slate-100
  }
  function stroke(m) {
    if (primary.has(m))   return '#ea580c'  // orange-600
    if (secondary.has(m)) return '#fb923c'  // orange-400
    return '#cbd5e1'                         // slate-300
  }

  return (
    <div className="flex flex-col items-center justify-center h-full py-2">
      <svg viewBox="0 0 70 148" className="h-28 w-auto" style={{ overflow: 'visible' }}>

        {/* 头 */}
        <circle cx="35" cy="20" r="11" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.2" />
        {/* 脖子 */}
        <rect x="31" y="31" width="8" height="5" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />

        {/* 肩部 */}
        <ellipse cx="19" cy="40" rx="10" ry="8" fill={fill('shoulders')} stroke={stroke('shoulders')} strokeWidth="1.2" />
        <ellipse cx="51" cy="40" rx="10" ry="8" fill={fill('shoulders')} stroke={stroke('shoulders')} strokeWidth="1.2" />

        {/* 胸肌 */}
        <rect x="24" y="33" width="22" height="18" rx="4" fill={fill('chest')} stroke={stroke('chest')} strokeWidth="1.2" />

        {/* 二头 */}
        <rect x="11" y="48" width="11" height="20" rx="4" fill={fill('biceps')} stroke={stroke('biceps')} strokeWidth="1.2" />
        <rect x="48" y="48" width="11" height="20" rx="4" fill={fill('biceps')} stroke={stroke('biceps')} strokeWidth="1.2" />

        {/* 三头（正面隐约可见）*/}
        <rect x="10" y="49" width="6"  height="18" rx="3" fill={fill('triceps')} stroke={stroke('triceps')} strokeWidth="1.2" />
        <rect x="54" y="49" width="6"  height="18" rx="3" fill={fill('triceps')} stroke={stroke('triceps')} strokeWidth="1.2" />

        {/* 腹肌 */}
        <rect x="25" y="52" width="20" height="20" rx="3" fill={fill('abs')} stroke={stroke('abs')} strokeWidth="1.2" />

        {/* 背部（侧面隐约）*/}
        <rect x="22" y="35" width="4" height="32" rx="2" fill={fill('back')} stroke={stroke('back')} strokeWidth="1" />
        <rect x="44" y="35" width="4" height="32" rx="2" fill={fill('back')} stroke={stroke('back')} strokeWidth="1" />

        {/* 前臂 */}
        <rect x="11" y="70" width="10" height="16" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="49" y="70" width="10" height="16" rx="3" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />

        {/* 髋 */}
        <rect x="23" y="73" width="24" height="9" rx="4" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />

        {/* 臀部（正面髋关节处）*/}
        <rect x="23" y="73" width="24" height="9" rx="4" fill={fill('glutes')} stroke={stroke('glutes')} strokeWidth="1.2" />

        {/* 股四头（大腿前）*/}
        <rect x="23" y="83" width="10" height="28" rx="4" fill={fill('quads')} stroke={stroke('quads')} strokeWidth="1.2" />
        <rect x="37" y="83" width="10" height="28" rx="4" fill={fill('quads')} stroke={stroke('quads')} strokeWidth="1.2" />

        {/* 腘绳肌（大腿后，侧面）*/}
        <rect x="21" y="84" width="5" height="25" rx="2" fill={fill('hamstrings')} stroke={stroke('hamstrings')} strokeWidth="1" />
        <rect x="44" y="84" width="5" height="25" rx="2" fill={fill('hamstrings')} stroke={stroke('hamstrings')} strokeWidth="1" />

        {/* 膝盖 */}
        <ellipse cx="28" cy="113" rx="6" ry="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        <ellipse cx="42" cy="113" rx="6" ry="5" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />

        {/* 小腿 */}
        <rect x="23" y="119" width="9" height="22" rx="3" fill={fill('calves')} stroke={stroke('calves')} strokeWidth="1.2" />
        <rect x="38" y="119" width="9" height="22" rx="3" fill={fill('calves')} stroke={stroke('calves')} strokeWidth="1.2" />

      </svg>

      {/* 主练部位标签 */}
      {primaryMuscles.length > 0 && (
        <p className="text-[9px] text-orange-600 font-semibold text-center mt-1 leading-tight">
          {primaryMuscles.slice(0, 2).join(' · ')}
        </p>
      )}
    </div>
  )
}
