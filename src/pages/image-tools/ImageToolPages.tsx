import { useEffect, useMemo, useRef, useState } from 'react'
import { formatFileSize } from '../../api/compress'
import { ImageToolShell } from '../../components/ImageToolShell'
import type { ImageToolConfig } from '../../config/imageTools'
import {
  blurImageConfig,
  cropImageConfig,
  faviconGeneratorConfig,
  imageConverterConfig,
  imageToPdfConfig,
  jpgToPngConfig,
  photoEffectsConfig,
  pngToJpgConfig,
  rotateImageConfig,
  sharpenImageConfig,
  watermarkImageConfig,
  webpToJpgConfig,
} from '../../config/imageTools'
import { generateFaviconPackage } from '../../utils/faviconGenerator'
import {
  blurImageFile,
  convertImageFormat,
  createPreviewForFile,
  cropImageFile,
  detectImageFormat,
  downloadBlob,
  formatSavings,
  rotateImageFile,
  sharpenImageFile,
  type ImageOutputFormat,
  type ProcessedImageResult,
} from '../../utils/imageCanvas'
import {
  applyPhotoEffect,
  applyWatermark,
  type PhotoEffectType,
} from '../../utils/imageEffects'
import { imagesToPdf } from '../../utils/imageToPdf'
import { getImageDimensionsFromUrl, isSupportedImageFile } from '../../utils/imagePrepare'

const MAX_FILE_BYTES = 20 * 1024 * 1024
const ACCEPT_ALL = 'image/*,.heic,.HEIC,.heif,.HEIF'

type ResultState = ProcessedImageResult & { stats: string }

function useSingleImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPreparingPreview, setIsPreparingPreview] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetPreview = (url: string | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
  }

  const handleFileChange = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (!isSupportedImageFile(file)) {
      setError('Unsupported file format.')
      setSelectedFile(null)
      resetPreview(null)
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      setError('File exceeds 20MB limit.')
      setSelectedFile(null)
      resetPreview(null)
      return
    }
    setSelectedFile(file)
    setError(null)
    setIsPreparingPreview(true)
    void createPreviewForFile(file)
      .then((url) => resetPreview(url))
      .catch(() => setError('Could not load preview.'))
      .finally(() => setIsPreparingPreview(false))
  }

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  return { selectedFile, previewUrl, isPreparingPreview, error, setError, handleFileChange, resetPreview }
}

function resultStats(result: ProcessedImageResult, extra?: string): string {
  const savings = formatSavings(result.originalSize, result.outputSize)
  return `${extra ? `${extra} ` : ''}${formatFileSize(result.originalSize)} → ${formatFileSize(result.outputSize)}${savings > 0 ? ` (${savings}% smaller)` : ''}`
}

function FormatConvertTool({
  config,
  accept,
  targetFormat,
  defaultQuality = 92,
}: {
  config: ImageToolConfig
  accept: string
  targetFormat: ImageOutputFormat
  defaultQuality?: number
}) {
  const upload = useSingleImageUpload()
  const [quality, setQuality] = useState(defaultQuality)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await convertImageFormat(
        upload.selectedFile,
        targetFormat,
        quality / 100,
      )
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Converted successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell
      config={config}
      accept={accept}
      selectedFile={upload.selectedFile}
      onFileChange={upload.handleFileChange}
      isProcessing={isProcessing}
      isPreparingPreview={upload.isPreparingPreview}
      error={upload.error}
      previewUrl={upload.previewUrl}
      resultStats={result?.stats ?? null}
      onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined}
      onAction={handleAction}
      actionDisabled={!upload.selectedFile}
    >
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="convert-quality">Quality: {quality}</label>
        <input id="convert-quality" type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </ImageToolShell>
  )
}

export function ImageConverterPage() {
  const upload = useSingleImageUpload()
  const [format, setFormat] = useState<ImageOutputFormat>('jpeg')
  const [quality, setQuality] = useState(92)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)
  const detected = upload.selectedFile ? detectImageFormat(upload.selectedFile) : null

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await convertImageFormat(upload.selectedFile, format, quality / 100)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Converted successfully!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Conversion failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={imageConverterConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile}>
      {detected && detected !== 'unknown' && (
        <p className="tool-text-counts">Detected format: {detected.toUpperCase()}</p>
      )}
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="out-format">Output format</label>
        <select id="out-format" className="tool-select" value={format} onChange={(e) => setFormat(e.target.value as ImageOutputFormat)} disabled={isProcessing}>
          <option value="jpeg">JPG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>
      {format !== 'png' && (
        <div className="tool-controls">
          <label className="tool-control-label" htmlFor="conv-quality">Quality: {quality}</label>
          <input id="conv-quality" type="range" min={10} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
        </div>
      )}
    </ImageToolShell>
  )
}

export function WebpToJpgPage() {
  return <FormatConvertTool config={webpToJpgConfig} accept="image/webp,.webp" targetFormat="jpeg" />
}

export function PngToJpgPage() {
  return <FormatConvertTool config={pngToJpgConfig} accept="image/png,.png" targetFormat="jpeg" />
}

export function JpgToPngPage() {
  return <FormatConvertTool config={jpgToPngConfig} accept="image/jpeg,image/jpg,.jpg,.jpeg" targetFormat="png" defaultQuality={100} />
}

export function RotateImagePage() {
  const upload = useSingleImageUpload()
  const [rotateLeft, setRotateLeft] = useState(false)
  const [rotateRight, setRotateRight] = useState(false)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await rotateImageFile(upload.selectedFile, { rotateLeft, rotateRight, flipHorizontal: flipH, flipVertical: flipV })
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Rotation applied!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Rotation failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={rotateImageConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile}>
      <div className="tool-editor-actions">
        <button type="button" className="tool-secondary-btn" onClick={() => { setRotateLeft((v) => !v); setRotateRight(false) }}>Rotate left</button>
        <button type="button" className="tool-secondary-btn" onClick={() => { setRotateRight((v) => !v); setRotateLeft(false) }}>Rotate right</button>
        <button type="button" className="tool-secondary-btn" onClick={() => setFlipH((v) => !v)}>Flip horizontal</button>
        <button type="button" className="tool-secondary-btn" onClick={() => setFlipV((v) => !v)}>Flip vertical</button>
      </div>
    </ImageToolShell>
  )
}

const ASPECT_PRESETS = [
  { label: 'Free', value: 'free' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '16:9', value: '16:9' },
  { label: '3:2', value: '3:2' },
]

export function CropImagePage() {
  const upload = useSingleImageUpload()
  const [imgW, setImgW] = useState(0)
  const [imgH, setImgH] = useState(0)
  const [cropX, setCropX] = useState(0)
  const [cropY, setCropY] = useState(0)
  const [cropW, setCropW] = useState(0)
  const [cropH, setCropH] = useState(0)
  const [aspect, setAspect] = useState('free')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  useEffect(() => {
    if (!upload.previewUrl) return
    void getImageDimensionsFromUrl(upload.previewUrl).then(({ width, height }: { width: number; height: number }) => {
      setImgW(width)
      setImgH(height)
      setCropX(0)
      setCropY(0)
      setCropW(width)
      setCropH(height)
    })
  }, [upload.previewUrl])

  const applyAspect = (value: string, w: number, h: number) => {
    if (value === 'free') return { w, h }
    const [aW, aH] = value.split(':').map(Number)
    const ratio = aW / aH
    let nextW = w
    let nextH = Math.round(w / ratio)
    if (nextH > h) {
      nextH = h
      nextW = Math.round(h * ratio)
    }
    return { w: nextW, h: nextH }
  }

  const handleAspectChange = (value: string) => {
    setAspect(value)
    const sized = applyAspect(value, imgW, imgH)
    setCropW(sized.w)
    setCropH(sized.h)
    setCropX(Math.round((imgW - sized.w) / 2))
    setCropY(Math.round((imgH - sized.h) / 2))
  }

  const handleAction = async () => {
    if (!upload.selectedFile || cropW <= 0 || cropH <= 0) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await cropImageFile(upload.selectedFile, { x: cropX, y: cropY, width: cropW, height: cropH })
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, `Cropped to ${cropW}×${cropH}px!`) })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Crop failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={cropImageConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile || cropW <= 0}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="aspect">Aspect ratio</label>
        <select id="aspect" className="tool-select" value={aspect} onChange={(e) => handleAspectChange(e.target.value)} disabled={!upload.selectedFile || isProcessing}>
          {ASPECT_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>
      {imgW > 0 && (
        <>
          <div className="tool-controls">
            <label className="tool-control-label">Crop X / Y</label>
            <div className="tool-qr-color-row">
              <input type="number" className="tool-select" min={0} max={imgW} value={cropX} onChange={(e) => setCropX(Number(e.target.value))} />
              <input type="number" className="tool-select" min={0} max={imgH} value={cropY} onChange={(e) => setCropY(Number(e.target.value))} />
            </div>
          </div>
          <div className="tool-controls">
            <label className="tool-control-label">Crop width / height (max {imgW}×{imgH})</label>
            <div className="tool-qr-color-row">
              <input type="number" className="tool-select" min={1} max={imgW} value={cropW} onChange={(e) => setCropW(Number(e.target.value))} />
              <input type="number" className="tool-select" min={1} max={imgH} value={cropH} onChange={(e) => setCropH(Number(e.target.value))} />
            </div>
          </div>
        </>
      )}
    </ImageToolShell>
  )
}

export function BlurImagePage() {
  const upload = useSingleImageUpload()
  const [amount, setAmount] = useState(4)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await blurImageFile(upload.selectedFile, amount)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Blur applied!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Blur failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={blurImageConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="blur">Blur amount ({amount}px)</label>
        <input id="blur" type="range" min={1} max={20} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </ImageToolShell>
  )
}

export function SharpenImagePage() {
  const upload = useSingleImageUpload()
  const [amount, setAmount] = useState(50)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await sharpenImageFile(upload.selectedFile, amount)
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Sharpening applied!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Sharpen failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={sharpenImageConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="sharp">Sharpening ({amount})</label>
        <input id="sharp" type="range" min={10} max={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </ImageToolShell>
  )
}

export function PhotoEffectsPage() {
  const upload = useSingleImageUpload()
  const [effect, setEffect] = useState<PhotoEffectType>('none')
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await applyPhotoEffect(upload.selectedFile, effect, { brightness, contrast, saturation })
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Effect applied!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Effect failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={photoEffectsConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label" htmlFor="effect">Effect</label>
        <select id="effect" className="tool-select" value={effect} onChange={(e) => setEffect(e.target.value as PhotoEffectType)} disabled={isProcessing}>
          <option value="none">Adjustments only</option>
          <option value="grayscale">Grayscale</option>
          <option value="sepia">Sepia</option>
          <option value="cartoon">Cartoon</option>
          <option value="sketch">Sketch</option>
          <option value="vivid">Vivid</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Brightness ({brightness}%)</label>
        <input type="range" min={50} max={150} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Contrast ({contrast}%)</label>
        <input type="range" min={50} max={150} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Saturation ({saturation}%)</label>
        <input type="range" min={0} max={200} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </ImageToolShell>
  )
}

export function WatermarkImagePage() {
  const upload = useSingleImageUpload()
  const [type, setType] = useState<'text' | 'logo'>('text')
  const [text, setText] = useState('© Crafvia')
  const [position, setPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'>('bottom-right')
  const [opacity, setOpacity] = useState(70)
  const [size, setSize] = useState(12)
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>()
  const logoRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await applyWatermark(upload.selectedFile, { type, text, logoDataUrl, position, opacity, size })
      upload.resetPreview(URL.createObjectURL(output.blob))
      setResult({ ...output, stats: resultStats(output, 'Watermark applied!') })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Watermark failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={watermarkImageConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile}>
      <div className="tool-controls">
        <label className="tool-control-label">Watermark type</label>
        <select className="tool-select" value={type} onChange={(e) => setType(e.target.value as 'text' | 'logo')} disabled={isProcessing}>
          <option value="text">Text</option>
          <option value="logo">Logo</option>
        </select>
      </div>
      {type === 'text' ? (
        <div className="tool-controls">
          <label className="tool-control-label">Watermark text</label>
          <input className="tool-select" value={text} onChange={(e) => setText(e.target.value)} disabled={isProcessing} />
        </div>
      ) : (
        <div className="tool-controls">
          <button type="button" className="tool-secondary-btn" onClick={() => logoRef.current?.click()} disabled={isProcessing}>Upload logo</button>
          <input ref={logoRef} type="file" accept="image/*" className="upload-input" onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = () => setLogoDataUrl(String(reader.result))
            reader.readAsDataURL(file)
          }} />
        </div>
      )}
      <div className="tool-controls">
        <label className="tool-control-label">Position</label>
        <select className="tool-select" value={position} onChange={(e) => setPosition(e.target.value as typeof position)} disabled={isProcessing}>
          <option value="top-left">Top left</option>
          <option value="top-right">Top right</option>
          <option value="bottom-left">Bottom left</option>
          <option value="bottom-right">Bottom right</option>
          <option value="center">Center</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Opacity ({opacity}%)</label>
        <input type="range" min={10} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Size ({size}%)</label>
        <input type="range" min={5} max={30} value={size} onChange={(e) => setSize(Number(e.target.value))} className="tool-slider" disabled={isProcessing} />
      </div>
    </ImageToolShell>
  )
}

export function FaviconGeneratorPage() {
  const upload = useSingleImageUpload()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ResultState | null>(null)

  const handleAction = async () => {
    if (!upload.selectedFile) return
    setIsProcessing(true)
    upload.setError(null)
    setResult(null)
    try {
      const output = await generateFaviconPackage(upload.selectedFile)
      setResult({ ...output, stats: `Favicon package generated! ${formatFileSize(output.outputSize)} ZIP` })
    } catch (err) {
      upload.setError(err instanceof Error ? err.message : 'Favicon generation failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <ImageToolShell config={faviconGeneratorConfig} accept={ACCEPT_ALL} selectedFile={upload.selectedFile} onFileChange={upload.handleFileChange} isProcessing={isProcessing} isPreparingPreview={upload.isPreparingPreview} error={upload.error} previewUrl={upload.previewUrl} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={!upload.selectedFile} />
  )
}

type PdfFileItem = { id: string; file: File; previewUrl: string | null }

export function ImageToPdfPage() {
  const [files, setFiles] = useState<PdfFileItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<{ blob: Blob; filename: string; stats: string } | null>(null)

  const handleFileChange = (list: FileList | null) => {
    if (!list) return
    const next: PdfFileItem[] = []
    for (const file of Array.from(list)) {
      if (!isSupportedImageFile(file)) continue
      if (file.size > MAX_FILE_BYTES) continue
      next.push({ id: `${file.name}-${file.size}-${Math.random()}`, file, previewUrl: URL.createObjectURL(file) })
    }
    setFiles((current) => [...current, ...next])
    setError(null)
    setResult(null)
  }

  const moveFile = (index: number, direction: -1 | 1) => {
    setFiles((current) => {
      const next = [...current]
      const target = index + direction
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const removeFile = (id: string) => {
    setFiles((current) => {
      const item = current.find((f) => f.id === id)
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      return current.filter((f) => f.id !== id)
    })
  }

  const handleAction = async () => {
    if (files.length === 0) {
      setError('Add at least one image.')
      return
    }
    setIsProcessing(true)
    setError(null)
    setResult(null)
    try {
      const output = await imagesToPdf(files.map((f) => f.file))
      setResult({
        blob: output.blob,
        filename: output.filename,
        stats: `PDF created with ${output.pageCount} page(s)! ${formatFileSize(output.originalSize)} → ${formatFileSize(output.outputSize)}`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF creation failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.file.size, 0), [files])

  return (
    <ImageToolShell config={imageToPdfConfig} accept={ACCEPT_ALL} multiple selectedFile={files[0]?.file ?? null} selectedFiles={files.map((f) => f.file)} onFileChange={handleFileChange} isProcessing={isProcessing} error={error} resultStats={result?.stats ?? null} onDownload={result ? () => downloadBlob(result.blob, result.filename) : undefined} onAction={handleAction} actionDisabled={files.length === 0}>
      {files.length > 0 && (
        <div className="tool-controls">
          <label className="tool-control-label">Images ({files.length}) — {formatFileSize(totalSize)}</label>
          <ul className="tool-faq-list">
            {files.map((item, index) => (
              <li key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {item.previewUrl && <img src={item.previewUrl} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />}
                <span style={{ flex: 1, fontSize: '0.875rem' }}>{item.file.name}</span>
                <button type="button" className="tool-secondary-btn" onClick={() => moveFile(index, -1)} disabled={index === 0}>↑</button>
                <button type="button" className="tool-secondary-btn" onClick={() => moveFile(index, 1)} disabled={index === files.length - 1}>↓</button>
                <button type="button" className="tool-secondary-btn" onClick={() => removeFile(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ImageToolShell>
  )
}
