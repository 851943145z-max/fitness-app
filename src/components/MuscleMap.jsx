// MuscleMap.jsx — 人体肌肉示意图
const MUSCLE_LABELS = {chest:'胸肌',shoulders:'芩部',biceps:'二头肌',triceps:'三头肌,abs:'腹肌�back:'~�部',glutes:'臀部',quads:'股四头肌',hamstrings:'腘绳肌',calves:'小腿'}
function MuscleMap({ muscles = [] }) {
  const activated = new Set(muscles)
  const fill = m => activated.has(m) ? '#10b981' : '#e5e7eb'
  const stroke = m => activated.has(m) ? '#059669' : '#d1d5db'
  const hasActivated = muscles.length > 0
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <svg viewBox="0 0 160 148" className="w/52" style={{overflow:'visible'}}>
        <text x="35" y="6" textAnchor="middle" fill="#9ca3af" fontSize="7">正面</text>
        <text x="125" y="6" textAnchor="middle" fill="#9ca3af" fontSize="7">背面</text>
        <line x1="80" y1="2" x2="80" y2="146" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3,3" />
        <circle cx="35" cy="20" r="11" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="31" y="31" width="8" height="5" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <ellipse cx="19" cy="40" rx="10" ry="8" fill={fill('shoulders')} stroke={stroke('shoulders')} strokeWidth="1" />
        <ellipse cx="51" cy="40" rx="10" ry="8" fill={fill('shoulders')} stroke={stroke('shoulders')} strokeWidth="1" />
        <rect x="24" y="33" width="22" height="18" rx="4" fill={fill('chest')} stroke={stroke('chest')} strokeWidth="1" />
        <rect x="11" y="48" width="11" height="20" rx="4" fill={fill('biceps')} stroke={stroke('biceps')} strokeWidth="1" />
        <rect x="48" y="48" width="11" height="20" rx="4" fill={fill('biceps')} stroke={stroke('biceps')} strokeWidth="1" />
        <rect x="25" y="52" width="20" height="20" rx="3" fill={fill('abs')} stroke={stroke('abs')} strokeWidth="1" />
        <rect x="11" y="70" width="10" height="16" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="49" y="70" width="10" height="16" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="23" y="73" width="24" height="9" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="23" y="83" width="10" height="28" rx="4" fill={fill('quads')} stroke={stroke('quads')} strokeWidth="1" />
        <rect x="37" y="83" width="10" height="28" rx="4" fill={fill('quads')} stroke={stroke('quads')} strokeWidth="1" />
        <ellipse cx="28" cy="113" rx="6" ry="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <ellipse cx="42" cy="113" rx="6" ry="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="23" y="119" width="9" height="22" rx="3" fill={fill('calves')} stroke={stroke('calves')} strokeWidth="1" />
        <rect x="38" y="119" width="9" height="22" rx="3" fill={fill('calves')} stroke={stroke('calves')} strokeWidth="1" />
        <circle cx="125" cy="20" r="11" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="121" y="31" width="8" height="5" rx="2" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <ellipse cx="109" cy="40" rx="10" ry="8" fill={fill('shoulders')} stroke={stroke('shoulders')} strokeWidth="1" />
        <ellipse cx="141" cy="40" rx="10" ry="8" fill={fill('shoulders')} stroke={stroke('shoulders')} strokeWidth="1" />
        <rect x="114" y="33" width="22" height="18" rx="4" fill={fill('back')} stroke={stroke('back')} strokeWidth="1" />
        <rect x="115" y="52" width="20" height="20" rx="3" fill={fill('back')} stroke={stroke('back')} strokeWidth="1" />
        <rect x="101" y="48" width="11" height="20" rx="4" fill={fill('triceps')} stroke={stroke('triceps')} strokeWidth="1" />
        <rect x="138" y="48" width="11" height="20" rx="4" fill={fill('triceps')} stroke={stroke('triceps')} strokeWidth="1" />
        <rect x="101" y="70" width="10" height="16" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="139" y="70" width="10" height="16" rx="3" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="113" y="73" width="24" height="10" rx="4" fill={fill('glutes')} stroke={stroke('glutes')} strokeWidth="1" />
        <rect x="113" y="84" width="10" height="27" rx="4" fill={fill('hamstrings')} stroke={stroke('hamstrings')} strokeWidth="1" />
        <rect x="127" y="84" width="10" height="27" rx="4" fill={fill('hamstrings')} stroke={stroke('hamstrings')} strokeWidth="1" />
        <ellipse cx="118" cy="113" rx="6" ry="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <ellipse cx="132" cy="113" rx="6" ry="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" />
        <rect x="113" y="119" width="9" height="22" rx="3" fill={fill('calves')} stroke={stroke('calves')} strokeWidth="1" />
        <rect x="128" y="119" width="9" height="22" rx="3" fill={fill('calves')} stroke={stroke('calves')} strokeWidth="1" />
      </svg>
      {hasActivated && <div className="flex flex-wrap justify-center gap-1.5">{muscles.map(m => <span key={m} className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{MUSCLE_LABELS[m]||m}</span>)}</div>}
    </div>
  )
}
export default MuscleMap
