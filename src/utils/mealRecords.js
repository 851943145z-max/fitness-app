// 用独立的本地存储键保存餐食记录，原有训练数据继续使用原来的键。
const MEAL_RECORDS_KEY = 'fitness_meal_records_v1'

export function getMealDate(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

export function loadMealRecords() {
  const records = JSON.parse(localStorage.getItem(MEAL_RECORDS_KEY) ?? '[]')
  if (!Array.isArray(records)) throw new Error('Invalid meal records')
  return records
}

export function saveMealRecord(record) {
  const records = [record, ...loadMealRecords()]
  localStorage.setItem(MEAL_RECORDS_KEY, JSON.stringify(records))
  return records
}

export function deleteMealRecord(recordId) {
  const records = loadMealRecords().filter(record => record.id !== recordId)
  localStorage.setItem(MEAL_RECORDS_KEY, JSON.stringify(records))
  return records
}
