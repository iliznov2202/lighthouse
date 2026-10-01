export async function prepareAvatar(file: File): Promise<string> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Выбери фото JPG, PNG или WebP.')
  if (file.size > 8 * 1024 * 1024) throw new Error('Фото должно быть не больше 8 МБ.')
  let bitmap: ImageBitmap
  try { bitmap = await createImageBitmap(file) } catch { throw new Error('Не получилось открыть фото. Попробуй другой файл.') }
  try {
    const size = Math.min(bitmap.width, bitmap.height)
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Браузер не смог подготовить фото.')
    context.fillStyle = '#ffffff'; context.fillRect(0, 0, 256, 256)
    context.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 256, 256)
    return canvas.toDataURL('image/jpeg', .8)
  } finally { bitmap.close() }
}
