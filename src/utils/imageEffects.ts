import {
  canvasToBlob,
  createCanvas,
  drawFileToCanvas,
  type ImageOutputFormat,
  type ProcessedImageResult,
  buildFilename,
} from './imageCanvas'

export type PhotoEffectType =
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'cartoon'
  | 'sketch'
  | 'vivid'

export type PhotoAdjustments = {
  brightness: number
  contrast: number
  saturation: number
}

export async function applyPhotoEffect(
  file: File,
  effect: PhotoEffectType,
  adjustments: PhotoAdjustments,
  format: ImageOutputFormat = 'jpeg',
  quality = 0.92,
): Promise<ProcessedImageResult> {
  const { canvas, ctx, img } = await drawFileToCanvas(file)
  const { brightness, contrast, saturation } = adjustments

  ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`
  ctx.drawImage(img, 0, 0)
  ctx.filter = 'none'

  if (effect === 'grayscale') {
    applyGrayscale(ctx, canvas.width, canvas.height)
  } else if (effect === 'sepia') {
    applySepia(ctx, canvas.width, canvas.height)
  } else if (effect === 'cartoon') {
    applyCartoon(ctx, canvas, img)
  } else if (effect === 'sketch') {
    applySketch(ctx, canvas, img)
  } else if (effect === 'vivid') {
    applyVivid(ctx, canvas.width, canvas.height)
  }

  const blob = await canvasToBlob(canvas, format, quality)
  const ext = format === 'jpeg' ? 'jpg' : format

  return {
    blob,
    filename: buildFilename(file.name, ext),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

function applyGrayscale(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = avg
    data[i + 1] = avg
    data[i + 2] = avg
  }
  ctx.putImageData(imageData, 0, 0)
}

function applySepia(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
    data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
    data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyVivid(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * 1.15)
    data[i + 1] = Math.min(255, data[i + 1] * 1.1)
    data[i + 2] = Math.min(255, data[i + 2] * 1.2)
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyCartoon(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
): void {
  ctx.filter = 'blur(2px)'
  ctx.drawImage(img, 0, 0)
  ctx.filter = 'none'
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const levels = 6
  const step = 255 / levels
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.round(data[i] / step) * step
    data[i + 1] = Math.round(data[i + 1] / step) * step
    data[i + 2] = Math.round(data[i + 2] / step) * step
  }
  ctx.putImageData(imageData, 0, 0)
}

function applySketch(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
): void {
  const { canvas: grayCanvas, ctx: grayCtx } = createCanvas(canvas.width, canvas.height)
  grayCtx.drawImage(img, 0, 0)
  const grayData = grayCtx.getImageData(0, 0, canvas.width, canvas.height)
  const data = grayData.data
  for (let i = 0; i < data.length; i += 4) {
    const avg = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
    data[i] = avg
    data[i + 1] = avg
    data[i + 2] = avg
  }
  grayCtx.putImageData(grayData, 0, 0)
  grayCtx.filter = 'invert(1) blur(3px)'
  grayCtx.drawImage(grayCanvas, 0, 0)
  grayCtx.filter = 'none'

  ctx.globalCompositeOperation = 'color-dodge'
  ctx.drawImage(grayCanvas, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
}

export type WatermarkOptions = {
  type: 'text' | 'logo'
  text?: string
  logoDataUrl?: string
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
  opacity: number
  size: number
}

export async function applyWatermark(
  file: File,
  options: WatermarkOptions,
  format: ImageOutputFormat = 'png',
  quality = 0.92,
): Promise<ProcessedImageResult> {
  const { canvas, ctx } = await drawFileToCanvas(file)
  ctx.globalAlpha = options.opacity / 100

  if (options.type === 'text' && options.text?.trim()) {
    const fontSize = Math.max(12, Math.round((canvas.width * options.size) / 100))
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = Math.max(1, fontSize / 16)
    const metrics = ctx.measureText(options.text)
    const { x, y } = getWatermarkPosition(
      options.position,
      canvas.width,
      canvas.height,
      metrics.width,
      fontSize,
    )
    ctx.strokeText(options.text, x, y)
    ctx.fillText(options.text, x, y)
  } else if (options.type === 'logo' && options.logoDataUrl) {
    const logo = await loadLogo(options.logoDataUrl)
    const logoWidth = Math.round((canvas.width * options.size) / 100)
    const logoHeight = Math.round((logo.naturalHeight / logo.naturalWidth) * logoWidth)
    const { x, y } = getWatermarkPosition(
      options.position,
      canvas.width,
      canvas.height,
      logoWidth,
      logoHeight,
    )
    ctx.drawImage(logo, x, y, logoWidth, logoHeight)
  }

  ctx.globalAlpha = 1
  const blob = await canvasToBlob(canvas, format, quality)
  const ext = format === 'jpeg' ? 'jpg' : format

  return {
    blob,
    filename: buildFilename(file.name, ext),
    originalSize: file.size,
    outputSize: blob.size,
  }
}

function getWatermarkPosition(
  position: WatermarkOptions['position'],
  canvasW: number,
  canvasH: number,
  itemW: number,
  itemH: number,
): { x: number; y: number } {
  const pad = Math.round(Math.min(canvasW, canvasH) * 0.03)
  switch (position) {
    case 'top-left':
      return { x: pad, y: pad + itemH }
    case 'top-right':
      return { x: canvasW - itemW - pad, y: pad + itemH }
    case 'bottom-left':
      return { x: pad, y: canvasH - pad }
    case 'bottom-right':
      return { x: canvasW - itemW - pad, y: canvasH - pad }
    case 'center':
    default:
      return { x: (canvasW - itemW) / 2, y: (canvasH + itemH) / 2 }
  }
}

function loadLogo(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load logo image.'))
    img.src = dataUrl
  })
}
