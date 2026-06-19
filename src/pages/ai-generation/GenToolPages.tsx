import { Download, Loader2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  generateAiImageRemote,
  generateNamesRemote,
  processGenLocal,
} from '../../api/genTools'
import { GenOutputActions, GenToolShell } from '../../components/GenToolShell'
import {
  barcodeGeneratorConfig,
  colorPaletteConfig,
  imageGeneratorConfig,
  logoMakerConfig,
  memeGeneratorConfig,
  nameGeneratorConfig,
  passwordGeneratorConfig,
} from '../../config/genTools'
import type {
  BarcodeFormat,
  ImageAspectRatio,
  LogoFont,
  LogoIcon,
  NameCategory,
  PaletteMode,
  PasswordStrength,
} from '../../utils/genProcess'
import {
  renderBarcodeSvg,
  renderMemeImage,
  scorePasswordStrength,
  svgToPngBlob,
} from '../../utils/genProcess'
import { downloadBlob } from '../../utils/imageCanvas'

function useGenState() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const reset = () => {
    setError(null)
    setSuccess(null)
  }
  return { error, setError, success, setSuccess, reset }
}

function Status({ error, success }: { error: string | null; success: string | null }) {
  return (
    <>
      {error && <p className="tool-error">{error}</p>}
      {success && <p className="tool-result-stats">{success}</p>}
    </>
  )
}

function strengthLabel(strength: PasswordStrength): string {
  return strength.charAt(0).toUpperCase() + strength.slice(1)
}

const MEME_TEMPLATES = [
  { id: 'classic', label: 'Classic blue', color: '#2563eb' },
  { id: 'sunset', label: 'Sunset', color: '#ea580c' },
  { id: 'forest', label: 'Forest', color: '#15803d' },
  { id: 'night', label: 'Night', color: '#1e293b' },
] as const

function createTemplateDataUrl(color: string): string {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 600
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, '#111827')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

async function svgStringToPngBlob(svg: string, scale = 2): Promise<Blob> {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svg, 'image/svg+xml')
  const svgEl = doc.documentElement
  const width = Number(svgEl.getAttribute('width') ?? 400)
  const height = Number(svgEl.getAttribute('height') ?? 120)
  return svgToPngBlob(svg, Math.round(width * scale), Math.round(height * scale))
}

export function PasswordGeneratorPage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [length, setLength] = useState(16)
  const [count, setCount] = useState(1)
  const [uppercase, setUppercase] = useState(true)
  const [lowercase, setLowercase] = useState(true)
  const [numbers, setNumbers] = useState(true)
  const [special, setSpecial] = useState(true)
  const [output, setOutput] = useState('')
  const [strength, setStrength] = useState<PasswordStrength>('good')

  const run = () => {
    reset()
    const r = processGenLocal('password-generator', {
      options: { length, count, uppercase, lowercase, numbers, special },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setStrength((r.meta?.strength as PasswordStrength) ?? scorePasswordStrength(r.output?.split('\n')[0] ?? ''))
    setSuccess(`Generated ${count} password${count > 1 ? 's' : ''}. Strength: ${strengthLabel((r.meta?.strength as PasswordStrength) ?? 'good')}.`)
  }

  const clear = () => {
    setOutput('')
    reset()
  }

  return (
    <GenToolShell config={passwordGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Length ({length})</label>
        <input type="range" className="tool-slider" min={4} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Count</label>
        <input className="tool-select" type="number" min={1} max={50} value={count} onChange={(e) => setCount(Number(e.target.value))} />
      </div>
      <div className="tool-controls">
        <label className="tool-text-counts">
          <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} /> Uppercase
        </label>
        <label className="tool-text-counts">
          <input type="checkbox" checked={lowercase} onChange={(e) => setLowercase(e.target.checked)} /> Lowercase
        </label>
        <label className="tool-text-counts">
          <input type="checkbox" checked={numbers} onChange={(e) => setNumbers(e.target.checked)} /> Numbers
        </label>
        <label className="tool-text-counts">
          <input type="checkbox" checked={special} onChange={(e) => setSpecial(e.target.checked)} /> Special characters
        </label>
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {passwordGeneratorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <label className="tool-control-label">Passwords (strength: {strengthLabel(strength)})</label>
          <textarea className="tool-textarea" value={output} readOnly rows={Math.min(10, count)} />
          <GenOutputActions output={output} onClear={clear} downloadFilename="passwords.txt" />
        </div>
      )}
    </GenToolShell>
  )
}

export function ImageGeneratorPage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1')
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [providerNote, setProviderNote] = useState('')

  const run = async () => {
    reset()
    if (!prompt.trim()) {
      setError('Please enter an image prompt.')
      return
    }
    if (prompt.length > 1000) {
      setError('Prompt must be 1000 characters or fewer.')
      return
    }

    setIsProcessing(true)
    setPreviewUrl(null)
    try {
      const result = await generateAiImageRemote(prompt.trim(), aspectRatio)
      const mime = result.mimeType || 'image/png'
      const url = `data:${mime};base64,${result.imageBase64}`
      setPreviewUrl(url)
      if (result.fallback) {
        setProviderNote(
          `Placeholder preview (${result.provider}). Add GEMINI_API_KEY, OPENAI_API_KEY, or HUGGINGFACE_API_KEY in server/.env for real AI images.`,
        )
        setSuccess('Placeholder image generated. Configure an image API key for AI-generated art.')
      } else {
        setProviderNote(`Generated with ${result.provider}.`)
        setSuccess('Image generated successfully.')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image generation failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const download = () => {
    if (!previewUrl) return
    const anchor = document.createElement('a')
    anchor.href = previewUrl
    anchor.download = 'generated-image.png'
    anchor.click()
  }

  return (
    <GenToolShell config={imageGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Prompt</label>
        <textarea className="tool-textarea" value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="A serene mountain landscape at sunset…" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Aspect ratio</label>
        <select className="tool-select" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as ImageAspectRatio)}>
          <option value="1:1">Square (1:1)</option>
          <option value="16:9">Landscape (16:9)</option>
          <option value="9:16">Portrait (9:16)</option>
          <option value="4:3">Standard (4:3)</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={() => void run()} disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden />
            {imageGeneratorConfig.processingLabel}
          </>
        ) : (
          imageGeneratorConfig.actionLabel
        )}
      </button>
      <Status error={error} success={success} />
      {providerNote && <p className="tool-result-stats">{providerNote}</p>}
      {previewUrl && (
        <div className="tool-controls">
          <label className="tool-control-label">Preview</label>
          <div className="tool-qr-preview tool-qr-preview-ready">
            <img src={previewUrl} alt="Generated" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          <div className="tool-editor-actions">
            <button type="button" className="tool-secondary-btn" onClick={download}>
              <Download size={16} aria-hidden />
              Download PNG
            </button>
          </div>
        </div>
      )}
    </GenToolShell>
  )
}

export function BarcodeGeneratorPage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [format, setFormat] = useState<BarcodeFormat>('CODE128')
  const [data, setData] = useState('Crafvia-2024')
  const [svgMarkup, setSvgMarkup] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const run = () => {
    reset()
    const r = processGenLocal('barcode-generator', { options: { format, data } })
    if (r.error) {
      setError(r.error)
      setSvgMarkup('')
      return
    }
    const rendered = renderBarcodeSvg(format, r.output ?? data, { height: 100 })
    if ('error' in rendered) {
      setError(rendered.error)
      setSvgMarkup('')
      return
    }
    setSvgMarkup(rendered.svg)
    setSuccess(`${format} barcode generated.`)
  }

  useEffect(() => {
    if (previewRef.current) {
      previewRef.current.innerHTML = svgMarkup
    }
  }, [svgMarkup])

  const downloadSvg = () => {
    if (!svgMarkup) return
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    downloadBlob(blob, 'barcode.svg')
  }

  const downloadPng = async () => {
    if (!svgMarkup) return
    try {
      const blob = await svgStringToPngBlob(svgMarkup)
      downloadBlob(blob, 'barcode.png')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG export failed.')
    }
  }

  return (
    <GenToolShell config={barcodeGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Format</label>
        <select className="tool-select" value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)}>
          <option value="CODE128">CODE128</option>
          <option value="EAN13">EAN-13</option>
          <option value="UPC">UPC</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Data</label>
        <input className="tool-select" value={data} onChange={(e) => setData(e.target.value)} placeholder={format === 'CODE128' ? 'Product SKU or text' : 'Numeric code'} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {barcodeGeneratorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      {svgMarkup && (
        <>
          <div className="tool-controls">
            <label className="tool-control-label">Barcode preview</label>
            <div className={`tool-qr-preview ${svgMarkup ? 'tool-qr-preview-ready' : ''}`}>
              <div ref={previewRef} className="tool-qr-preview-canvas" />
            </div>
          </div>
          <div className="tool-editor-actions">
            <button type="button" className="tool-secondary-btn" onClick={downloadSvg}>
              <Download size={16} aria-hidden />
              SVG
            </button>
            <button type="button" className="tool-secondary-btn" onClick={() => void downloadPng()}>
              <Download size={16} aria-hidden />
              PNG
            </button>
          </div>
        </>
      )}
    </GenToolShell>
  )
}

export function ColorPalettePage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [mode, setMode] = useState<PaletteMode>('random')
  const [baseColor, setBaseColor] = useState('#4f46e5')
  const [output, setOutput] = useState('')
  const [colors, setColors] = useState<Array<{ hex: string; rgb: string }>>([])

  const run = () => {
    reset()
    const r = processGenLocal('color-palette', {
      options: { mode, baseColor: mode === 'random' ? undefined : baseColor },
    })
    if (r.error) {
      setError(r.error)
      return
    }
    setOutput(r.output ?? '')
    setColors((r.meta?.colors as Array<{ hex: string; rgb: string }>) ?? [])
    setSuccess('Palette generated.')
  }

  const exportCss = () => {
    if (!colors.length) return
    const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' })
    downloadBlob(blob, 'palette.css')
  }

  return (
    <GenToolShell config={colorPaletteConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Palette mode</label>
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as PaletteMode)}>
          <option value="random">Random</option>
          <option value="harmonious">Harmonious</option>
          <option value="complementary">Complementary</option>
          <option value="analogous">Analogous</option>
          <option value="triadic">Triadic</option>
        </select>
      </div>
      {mode !== 'random' && (
        <div className="tool-controls">
          <label className="tool-control-label">Base color</label>
          <input type="color" value={baseColor} onChange={(e) => setBaseColor(e.target.value)} />
        </div>
      )}
      <button type="button" className="tool-compress-btn" onClick={run}>
        {colorPaletteConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      {colors.length > 0 && (
        <div className="tool-controls">
          <label className="tool-control-label">Palette</label>
          <div className="tool-qr-color-row">
            {colors.map((c) => (
              <button
                key={c.hex}
                type="button"
                className="tool-qr-color-field"
                title={`${c.hex} — click to copy`}
                onClick={() => void navigator.clipboard.writeText(c.hex)}
                style={{ background: c.hex, minHeight: 48, border: '1px solid #e5e7eb', borderRadius: 8 }}
              >
                <span style={{ color: '#fff', textShadow: '0 1px 2px #000' }}>{c.hex}</span>
              </button>
            ))}
          </div>
          <textarea className="tool-textarea" value={output} readOnly rows={5} />
          <GenOutputActions output={output} onClear={() => { setOutput(''); setColors([]); reset() }} downloadFilename="palette.txt" />
          <div className="tool-editor-actions">
            <button type="button" className="tool-secondary-btn" onClick={exportCss}>
              Export CSS
            </button>
          </div>
        </div>
      )}
    </GenToolShell>
  )
}

export function LogoMakerPage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [text, setText] = useState('Crafvia')
  const [icon, setIcon] = useState<LogoIcon>('circle')
  const [primaryColor, setPrimaryColor] = useState('#4f46e5')
  const [secondaryColor, setSecondaryColor] = useState('#111827')
  const [font, setFont] = useState<LogoFont>('sans')
  const [svg, setSvg] = useState('')

  const run = () => {
    reset()
    const r = processGenLocal('logo-maker', {
      options: { text, icon, primaryColor, secondaryColor, font, size: 512 },
    })
    if (r.error) {
      setError(r.error)
      setSvg('')
      return
    }
    setSvg(r.output ?? '')
    setSuccess('Logo generated.')
  }

  const downloadSvg = () => {
    if (!svg) return
    downloadBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), 'logo.svg')
  }

  const downloadPng = async () => {
    if (!svg) return
    try {
      const blob = await svgToPngBlob(svg, 1024, 1024)
      downloadBlob(blob, 'logo.png')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PNG export failed.')
    }
  }

  const previewUrl = useMemo(() => (svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : ''), [svg])

  return (
    <GenToolShell config={logoMakerConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Logo text</label>
        <input className="tool-select" value={text} onChange={(e) => setText(e.target.value)} maxLength={40} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Icon</label>
        <select className="tool-select" value={icon} onChange={(e) => setIcon(e.target.value as LogoIcon)}>
          <option value="circle">Circle</option>
          <option value="square">Square</option>
          <option value="star">Star</option>
          <option value="hexagon">Hexagon</option>
          <option value="bolt">Bolt</option>
          <option value="heart">Heart</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Font</label>
        <select className="tool-select" value={font} onChange={(e) => setFont(e.target.value as LogoFont)}>
          <option value="sans">Sans-serif</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Colors</label>
        <div className="tool-qr-color-row">
          <label className="tool-qr-color-field">
            <span>Icon</span>
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          </label>
          <label className="tool-qr-color-field">
            <span>Text</span>
            <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          </label>
        </div>
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {logoMakerConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      {previewUrl && (
        <>
          <div className="tool-controls">
            <label className="tool-control-label">Logo preview</label>
            <div className="tool-qr-preview tool-qr-preview-ready">
              <img src={previewUrl} alt="Logo preview" style={{ maxWidth: 280, height: 'auto' }} />
            </div>
          </div>
          <div className="tool-editor-actions">
            <button type="button" className="tool-secondary-btn" onClick={downloadSvg}>
              <Download size={16} aria-hidden />
              SVG
            </button>
            <button type="button" className="tool-secondary-btn" onClick={() => void downloadPng()}>
              <Download size={16} aria-hidden />
              PNG (1024px)
            </button>
          </div>
        </>
      )}
    </GenToolShell>
  )
}

export function MemeGeneratorPage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [topText, setTopText] = useState('TOP TEXT')
  const [bottomText, setBottomText] = useState('BOTTOM TEXT')
  const [templateId, setTemplateId] = useState<string>('classic')
  const [uploadUrl, setUploadUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [memeBlob, setMemeBlob] = useState<Blob | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const imageSource = uploadUrl ?? createTemplateDataUrl(
    MEME_TEMPLATES.find((t) => t.id === templateId)?.color ?? '#2563eb',
  )

  const run = async () => {
    reset()
    try {
      const result = await renderMemeImage({ imageSource, topText, bottomText })
      setPreviewUrl(result.dataUrl)
      setMemeBlob(result.blob)
      setSuccess('Meme generated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Meme generation failed.')
    }
  }

  const onFile = (file: File | undefined) => {
    if (!file) return
    if (uploadUrl) URL.revokeObjectURL(uploadUrl)
    setUploadUrl(URL.createObjectURL(file))
  }

  return (
    <GenToolShell config={memeGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Upload image (optional)</label>
        <button type="button" className="tool-secondary-btn" onClick={() => fileRef.current?.click()}>
          Choose image
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="upload-input" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {!uploadUrl && (
        <div className="tool-controls">
          <label className="tool-control-label">Template</label>
          <select className="tool-select" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
            {MEME_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      )}
      <div className="tool-controls">
        <label className="tool-control-label">Top text</label>
        <input className="tool-select" value={topText} onChange={(e) => setTopText(e.target.value)} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Bottom text</label>
        <input className="tool-select" value={bottomText} onChange={(e) => setBottomText(e.target.value)} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={() => void run()}>
        {memeGeneratorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      {previewUrl && (
        <div className="tool-controls">
          <label className="tool-control-label">Meme preview</label>
          <div className="tool-qr-preview tool-qr-preview-ready">
            <img src={previewUrl} alt="Meme preview" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
          <div className="tool-editor-actions">
            <button
              type="button"
              className="tool-secondary-btn"
              onClick={() => memeBlob && downloadBlob(memeBlob, 'meme.png')}
              disabled={!memeBlob}
            >
              <Download size={16} aria-hidden />
              Download PNG
            </button>
          </div>
        </div>
      )}
    </GenToolShell>
  )
}

export function NameGeneratorPage() {
  const { error, setError, success, setSuccess, reset } = useGenState()
  const [category, setCategory] = useState<NameCategory>('project')
  const [keyword, setKeyword] = useState('')
  const [count, setCount] = useState(10)
  const [useAi, setUseAi] = useState(false)
  const [output, setOutput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const run = async () => {
    reset()
    setIsProcessing(true)
    try {
      if (useAi) {
        const r = await generateNamesRemote({ category, keyword: keyword || undefined, count, useAi: true })
        if (r.error) {
          setError(r.error)
          return
        }
        setOutput(r.output ?? '')
        setSuccess(`Generated ${(r.meta?.count as number) ?? count} names (${String(r.meta?.provider ?? 'ai')}).`)
      } else {
        const r = processGenLocal('name-generator', { options: { category, keyword, count } })
        if (r.error) {
          setError(r.error)
          return
        }
        setOutput(r.output ?? '')
        setSuccess(`Generated ${count} names.`)
      }
    } catch (err) {
      const r = processGenLocal('name-generator', { options: { category, keyword, count } })
      if (r.error) {
        setError(err instanceof Error ? err.message : 'Name generation failed.')
      } else {
        setOutput(r.output ?? '')
        setSuccess('Generated names with local fallback.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <GenToolShell config={nameGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Category</label>
        <select className="tool-select" value={category} onChange={(e) => setCategory(e.target.value as NameCategory)}>
          <option value="project">Project names</option>
          <option value="business">Business names</option>
          <option value="startup">Startup names</option>
          <option value="brand">Brand names</option>
        </select>
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Keyword (optional)</label>
        <input className="tool-select" value={keyword} onChange={(e) => setKeyword(e.target.value)} maxLength={40} placeholder="e.g. cloud, eco, fit" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Count</label>
        <input className="tool-select" type="number" min={1} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} />
      </div>
      <div className="tool-controls">
        <label className="tool-text-counts">
          <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} /> Use AI (when configured)
        </label>
      </div>
      <button type="button" className="tool-compress-btn" onClick={() => void run()} disabled={isProcessing}>
        {isProcessing ? (
          <>
            <Loader2 size={18} className="spin" aria-hidden />
            {nameGeneratorConfig.processingLabel}
          </>
        ) : (
          nameGeneratorConfig.actionLabel
        )}
      </button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={8} />
          <GenOutputActions output={output} onClear={() => { setOutput(''); reset() }} downloadFilename="names.txt" />
        </div>
      )}
    </GenToolShell>
  )
}
