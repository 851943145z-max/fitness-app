// 饮食页：选择餐食照片，核对估算结果，再保存到当天。
import { useEffect, useRef, useState } from 'react'
import { analyzeMealPhoto, prepareMealPhoto } from '../utils/mealPhoto.js'
import { deleteMealRecord, getMealDate, loadMealRecords, saveMealRecord } from '../utils/mealRecords.js'

const MEALS = ['早餐', '午餐', '晚餐', '加餐']
const EMPTY_ITEM = { id: 'first', name: '', portion: '', calories: '', fromPhoto: false }
const card = 'space-y-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4'
const field = 'w-full min-w-0 rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-white placeholder:text-slate-400'
const primary = 'rounded-xl bg-orange-400 px-3 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-50'
const secondary = 'rounded-xl border border-white/15 px-3 py-2.5 text-sm font-semibold focus-within:ring-2 focus-within:ring-orange-200'
const formatCalories = value => value.toLocaleString('zh-CN')
const hasFoodDetails = item => item.name.trim() || item.portion.trim() || item.calories !== ''

function getDefaultMeal() {
  const hour = new Date().getHours()
  if (hour < 10) return '早餐'
  if (hour < 15) return '午餐'
  return '晚餐'
}

export default function NutritionPage() {
  const [records, setRecords] = useState([])
  const [date, setDate] = useState(getMealDate)
  const [meal, setMeal] = useState(getDefaultMeal)
  const [items, setItems] = useState([EMPTY_ITEM])
  const [photo, setPhoto] = useState('')
  const [accessCode, setAccessCode] = useState('')
  const [needsAccessCode, setNeedsAccessCode] = useState(false)
  const [busy, setBusy] = useState('')
  const [photoMessage, setPhotoMessage] = useState('')
  const [recordMessage, setRecordMessage] = useState('')
  const activeOperation = useRef(null)

  useEffect(() => {
    function refreshRecords() {
      try {
        setRecords(loadMealRecords())
      } catch {
        setRecordMessage('暂时无法读取此浏览器的饮食记录。')
      }
    }
    refreshRecords()
    window.addEventListener('storage', refreshRecords)
    return () => {
      activeOperation.current?.abort()
      window.removeEventListener('storage', refreshRecords)
    }
  }, [])

  const today = getMealDate()
  const visibleRecords = records.filter(record => record.date === date)
  const dailyCalories = visibleRecords.reduce((total, record) => total + record.calories, 0)
  const draftCalories = items.reduce((total, item) => total + (Number(item.calories) || 0), 0)

  // 每次选择或识别都取消上一次操作，避免旧结果覆盖新的照片。
  function startPhotoOperation(message) {
    activeOperation.current?.abort()
    const operation = new AbortController()
    activeOperation.current = operation
    setBusy(message)
    setPhotoMessage('')
    return operation
  }

  function finishPhotoOperation(operation) {
    if (activeOperation.current === operation) {
      activeOperation.current = null
      setBusy('')
    }
  }

  async function handleSelectPhoto(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const operation = startPhotoOperation('正在读取照片…')
    setPhoto('')
    try {
      const image = await prepareMealPhoto(file)
      if (!operation.signal.aborted) setPhoto(image)
    } catch (error) {
      if (!operation.signal.aborted) setPhotoMessage(error.message)
    } finally {
      finishPhotoOperation(operation)
    }
  }

  async function handleAnalyzePhoto() {
    if (!photo || busy) return
    const operation = startPhotoOperation('DeepSeek 正在估算热量…')
    try {
      const estimate = await analyzeMealPhoto(photo, operation.signal, accessCode.trim())
      if (operation.signal.aborted) return
      if (estimate === null) {
        setNeedsAccessCode(true)
        setPhotoMessage('请输入照片识别访问码后重试。')
        return
      }
      setNeedsAccessCode(false)
      if (!estimate.length) {
        setPhotoMessage('这张照片里没有辨认出食物，可以换一张或手动填写。')
        return
      }
      const estimatedItems = estimate.map(item => ({ ...item, id: crypto.randomUUID(), fromPhoto: true }))
      setItems(previous => [...previous.filter(item => !item.fromPhoto && hasFoodDetails(item)), ...estimatedItems])
      setPhotoMessage('已填入估算结果。核对菜名、份量和热量后即可保存。')
    } catch (error) {
      if (!operation.signal.aborted) setPhotoMessage(error.message || '识别失败，可以重试或手动记录。')
    } finally {
      finishPhotoOperation(operation)
    }
  }

  function handleItemChange(itemId, key, value) {
    setItems(previous => previous.map(item => item.id === itemId ? { ...item, [key]: value } : item))
  }

  function handleSave(event) {
    event.preventDefault()
    if (busy) return
    const food = items.filter(hasFoodDetails).map(({ name, portion, calories }) => ({
      name: name.trim(),
      portion: portion.trim(),
      calories: calories === '' ? NaN : Number(calories),
    }))
    if (!food.length || food.some(item =>
      !item.name || !Number.isInteger(item.calories) || item.calories < 0 || item.calories > 10000
    )) {
      setRecordMessage('请为每项食物填写菜名和 0 到 10000 之间的整数热量。')
      return
    }

    const savedAt = new Date()
    const mealDate = getMealDate(savedAt)
    try {
      setRecords(saveMealRecord({
        id: crypto.randomUUID(),
        date: mealDate,
        timestamp: savedAt.toISOString(),
        type: meal,
        items: food,
        calories: food.reduce((total, item) => total + item.calories, 0),
      }))
      setDate(mealDate)
      setItems([EMPTY_ITEM])
      setPhoto('')
      setPhotoMessage('')
      setRecordMessage('已保存到今天的饮食记录。')
    } catch {
      setRecordMessage('保存失败，请检查浏览器是否允许本地存储。')
    }
  }

  function handleDelete(recordId) {
    if (!window.confirm('删除这条饮食记录？')) return
    try {
      setRecords(deleteMealRecord(recordId))
      setRecordMessage('已删除这条饮食记录。')
    } catch {
      setRecordMessage('删除失败，请重试。')
    }
  }

  return (
    <section className="space-y-5 px-4 py-6 text-slate-100">
      <h1 className="text-2xl font-bold">饮食记录</h1>
      <section className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-orange-200">{date === today ? '今日摄入' : '当日摄入'}</h2>
          <input aria-label="查看饮食记录日期" type="date" max={today} value={date}
            onChange={event => setDate(event.target.value || today)}
            className="max-w-[145px] rounded-lg bg-slate-950 px-2 py-1 text-xs [color-scheme:dark]" />
        </div>
        <p className="mt-2 text-3xl font-bold text-orange-300" aria-live="polite">
          {formatCalories(dailyCalories)} <span className="text-sm font-medium">千卡</span>
        </p>
      </section>

      <form onSubmit={handleSave} className={card}>
        <h2 className="text-lg font-semibold">记录今天的一餐</h2>
        <div className="grid grid-cols-2 gap-2 text-center">
          <label className={`${secondary} cursor-pointer`}>
            拍照
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleSelectPhoto} />
          </label>
          <label className={`${secondary} cursor-pointer`}>
            从相册选择
            <input type="file" accept="image/*" className="sr-only" onChange={handleSelectPhoto} />
          </label>
        </div>

        {photo && (
          <div className="space-y-2">
            <img src={photo} alt="本餐照片预览" className="max-h-44 w-full rounded-xl bg-slate-950 object-contain" />
            <p className="text-xs leading-relaxed text-slate-300">点击估算会将照片发给 DeepSeek。热量是估计值，份量和用油都会影响结果。</p>
            {needsAccessCode && (
              <label className="block space-y-1 text-sm">
                <span>照片识别访问码</span>
                <input className={field} type="password" autoComplete="off" maxLength={120}
                  value={accessCode} onChange={event => setAccessCode(event.target.value)} />
              </label>
            )}
            <button type="button" onClick={handleAnalyzePhoto} disabled={Boolean(busy)} className={`${primary} w-full`}>
              用 DeepSeek 估算热量
            </button>
          </div>
        )}
        {(busy || photoMessage) && <p role="status" className="text-sm text-orange-200">{busy || photoMessage}</p>}

        <fieldset disabled={Boolean(busy)} className="min-w-0 space-y-3 disabled:opacity-60">
          <label className="block space-y-1 text-sm">
            <span>餐别</span>
            <select className={field} value={meal} onChange={event => setMeal(event.target.value)}>
              {MEALS.map(type => <option key={type}>{type}</option>)}
            </select>
          </label>
          {items.map((item, index) => (
            <div key={item.id} className="space-y-2 rounded-xl border border-white/10 p-2.5">
              <div className="flex items-center gap-2">
                <input aria-label={`食物 ${index + 1} 名称`} placeholder="菜名或食物名称" className={field}
                  maxLength={80} value={item.name} onChange={event => handleItemChange(item.id, 'name', event.target.value)} />
                {items.length > 1 && (
                  <button type="button" aria-label={`移除食物 ${index + 1}`} className="shrink-0 px-1 text-xs text-slate-300"
                    onClick={() => setItems(previous => previous.filter(row => row.id !== item.id))}>移除</button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input aria-label={`食物 ${index + 1} 份量`} placeholder="份量（选填）" className={field}
                  maxLength={80} value={item.portion} onChange={event => handleItemChange(item.id, 'portion', event.target.value)} />
                <input aria-label={`食物 ${index + 1} 热量（千卡）`} placeholder="热量（千卡）" className={field}
                  type="number" inputMode="numeric" min="0" max="10000" step="1" value={item.calories}
                  onChange={event => handleItemChange(item.id, 'calories', event.target.value)} />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button type="button" className="text-sm font-semibold text-orange-300"
              onClick={() => setItems(previous => [...previous, { ...EMPTY_ITEM, id: crypto.randomUUID() }])}>＋ 添加食物</button>
            <span className="text-sm text-slate-300">本餐合计 {formatCalories(draftCalories)} 千卡</span>
          </div>
          <button type="submit" className={`${primary} w-full`}>保存这餐</button>
        </fieldset>
        {recordMessage && <p role="status" className="text-sm text-orange-200">{recordMessage}</p>}
      </form>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">{date === today ? '今日已记录' : '当日已记录'}</h2>
        {!visibleRecords.length && <p className="text-sm text-slate-400">这一天还没有饮食记录。</p>}
        {visibleRecords.map(record => (
          <article key={record.id} className={card}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium">
                {record.type} <time dateTime={record.timestamp} className="ml-1 text-xs text-slate-400">
                  {new Date(record.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </h3>
              <span className="text-sm font-semibold text-orange-300">{formatCalories(record.calories)} 千卡</span>
            </div>
            <ul className="space-y-1 text-sm text-slate-300">
              {record.items.map((item, index) => (
                <li key={index} className="flex justify-between gap-2">
                  <span className="break-all">{item.name}{item.portion && ` · ${item.portion}`}</span>
                  <span className="shrink-0">{formatCalories(item.calories)} 千卡</span>
                </li>
              ))}
            </ul>
            <button type="button" className="text-xs text-slate-400 underline" onClick={() => handleDelete(record.id)}>删除这餐</button>
          </article>
        ))}
      </section>
    </section>
  )
}
