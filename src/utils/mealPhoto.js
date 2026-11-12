// 缩小手机照片再上传，减少流量。重新生成 JPEG 时不保留原照片的元数据。
export async function prepareMealPhoto(file) {
  if (file.size > 20 * 1024 * 1024) throw new Error('照片超过 20 MB，请换一张。')

  const url = URL.createObjectURL(file)
  try {
    const photo = new Image()
    photo.src = url
    await photo.decode()
    const scale = Math.min(1, 1200 / Math.max(photo.naturalWidth, photo.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(photo.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(photo.naturalHeight * scale))
    const context = canvas.getContext('2d', { alpha: false })
    context.drawImage(photo, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch {
    throw new Error('无法读取照片，请试试 JPG、PNG 或 WebP。')
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function analyzeMealPhoto(image, signal, accessCode) {
  const response = await fetch(`${import.meta.env.BASE_URL}api/meal-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessCode && { 'X-Meal-Access-Code': accessCode }),
    },
    body: JSON.stringify({ image }),
    signal,
  })
  const result = await response.json().catch(() => null)
  if (response.status === 401) return null
  if (!response.ok || !Array.isArray(result?.items)) {
    throw new Error(result?.error || '照片识别服务当前不可用，可以先手动记录。')
  }
  return result.items
}
