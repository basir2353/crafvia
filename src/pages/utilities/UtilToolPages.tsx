import JSZip from 'jszip'
import { Download, Loader2, Trash2, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { formatFileSize } from '../../api/compress'
import { processUtilLocal } from '../../api/utilTools'
import { UtilToolShell } from '../../components/UtilToolShell'
import {
  bulkRenameConfig,
  clipboardManagerConfig,
  coinFlipConfig,
  colorPickerToolConfig,
  countdownTimerConfig,
  decisionMakerConfig,
  diceRollerConfig,
  exifViewerConfig,
  fileHashConfig,
  notepadConfig,
  pixelRulerConfig,
  pomodoroTimerConfig,
  randomNumberConfig,
  screenColorConfig,
  stopwatchConfig,
} from '../../config/utilTools'
import { hashFileData, type HashAlgorithm } from '../../utils/devProcess'
import { exifToText, readExifFromFile } from '../../utils/utilExif'
import {
  applyBulkRename,
  formatCountdown,
  formatElapsed,
  playBeep,
  rgbToHex,
  rgbToHsl,
} from '../../utils/utilProcess'

const NOTEPAD_KEY = 'crafvia-notepad'
const CLIPBOARD_KEY = 'crafvia-clipboard-snippets'

type Snippet = { id: string; label: string; text: string }

function colorReport(r: number, g: number, b: number): string {
  const hex = rgbToHex(r, g, b)
  const hsl = rgbToHsl(r, g, b)
  return `HEX: ${hex}\nRGB: ${r}, ${g}, ${b}\nHSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`
}

// ─── Stopwatch ────────────────────────────────────────────────────────────────

export function StopwatchPage() {
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [laps, setLaps] = useState<number[]>([])
  const startRef = useRef(0)
  const accumulatedRef = useRef(0)

  useEffect(() => {
    if (!running) return
    startRef.current = performance.now()
    const id = window.setInterval(() => {
      setElapsed(accumulatedRef.current + (performance.now() - startRef.current))
    }, 47)
    return () => window.clearInterval(id)
  }, [running])

  const start = () => setRunning(true)
  const stop = () => {
    accumulatedRef.current += performance.now() - startRef.current
    setElapsed(accumulatedRef.current)
    setRunning(false)
  }
  const lap = () => setLaps((prev) => [elapsed, ...prev])
  const reset = () => {
    setRunning(false)
    accumulatedRef.current = 0
    setElapsed(0)
    setLaps([])
  }

  return (
    <UtilToolShell config={stopwatchConfig}>
      <div className="util-timer-display">{formatElapsed(elapsed)}</div>
      <div className="util-timer-actions">
        {!running ? (
          <button type="button" className="tool-compress-btn" onClick={start}>Start</button>
        ) : (
          <button type="button" className="tool-compress-btn" onClick={stop}>Stop</button>
        )}
        <button type="button" className="tool-secondary-btn" onClick={lap} disabled={!running && elapsed === 0}>Lap</button>
        <button type="button" className="tool-secondary-btn" onClick={reset}>Reset</button>
      </div>
      {laps.length > 0 && (
        <ol className="util-lap-list">
          {laps.map((lapMs, i) => (
            <li key={`${lapMs}-${i}`}>
              <span>Lap {laps.length - i}</span>
              <span>{formatElapsed(lapMs)}</span>
            </li>
          ))}
        </ol>
      )}
    </UtilToolShell>
  )
}

// ─── Countdown ────────────────────────────────────────────────────────────────

export function CountdownTimerPage() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(false)
  const endRef = useRef(0)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        setRunning(false)
        playBeep()
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [running])

  const start = () => {
    const total = hours * 3600 + minutes * 60 + seconds
    if (total <= 0) return
    endRef.current = Date.now() + total * 1000
    setRemaining(total)
    setRunning(true)
  }

  return (
    <UtilToolShell config={countdownTimerConfig}>
      {!running && remaining === 0 ? (
        <div className="tool-controls">
          <label className="tool-control-label">Hours</label>
          <input className="tool-select" type="number" min={0} max={99} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          <label className="tool-control-label">Minutes</label>
          <input className="tool-select" type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />
          <label className="tool-control-label">Seconds</label>
          <input className="tool-select" type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(Number(e.target.value))} />
        </div>
      ) : (
        <div className="util-timer-display">{formatCountdown(remaining)}</div>
      )}
      <div className="util-timer-actions">
        {!running ? (
          <button type="button" className="tool-compress-btn" onClick={start}>Start</button>
        ) : (
          <button type="button" className="tool-secondary-btn" onClick={() => setRunning(false)}>Pause</button>
        )}
        <button type="button" className="tool-secondary-btn" onClick={() => { setRunning(false); setRemaining(0) }}>Reset</button>
      </div>
    </UtilToolShell>
  )
}

// ─── Pomodoro ─────────────────────────────────────────────────────────────────

type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

export function PomodoroTimerPage() {
  const [phase, setPhase] = useState<PomodoroPhase>('work')
  const [sessions, setSessions] = useState(0)
  const [remaining, setRemaining] = useState(25 * 60)
  const [running, setRunning] = useState(false)
  const endRef = useRef(0)

  const phaseSeconds = (p: PomodoroPhase) => {
    if (p === 'work') return 25 * 60
    if (p === 'shortBreak') return 5 * 60
    return 15 * 60
  }

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endRef.current - Date.now()) / 1000))
      setRemaining(left)
      if (left <= 0) {
        setRunning(false)
        playBeep()
        if (phase === 'work') {
          const nextSessions = sessions + 1
          setSessions(nextSessions)
          const nextPhase = nextSessions % 4 === 0 ? 'longBreak' : 'shortBreak'
          setPhase(nextPhase)
          setRemaining(phaseSeconds(nextPhase))
        } else {
          setPhase('work')
          setRemaining(phaseSeconds('work'))
        }
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [running, phase, sessions])

  const start = () => {
    endRef.current = Date.now() + remaining * 1000
    setRunning(true)
  }

  const skip = () => {
    setRunning(false)
    const next: PomodoroPhase =
      phase === 'work' ? (sessions % 4 === 3 ? 'longBreak' : 'shortBreak') : 'work'
    setPhase(next)
    setRemaining(phaseSeconds(next))
  }

  const phaseLabel = phase === 'work' ? 'Work' : phase === 'shortBreak' ? 'Short break' : 'Long break'

  return (
    <UtilToolShell config={pomodoroTimerConfig}>
      <p className="tool-result-stats">Phase: {phaseLabel} · Sessions completed: {sessions}</p>
      <div className="util-timer-display">{formatCountdown(remaining)}</div>
      <div className="util-timer-actions">
        {!running ? (
          <button type="button" className="tool-compress-btn" onClick={start}>Start</button>
        ) : (
          <button type="button" className="tool-secondary-btn" onClick={() => setRunning(false)}>Pause</button>
        )}
        <button type="button" className="tool-secondary-btn" onClick={skip}>Skip phase</button>
        <button type="button" className="tool-secondary-btn" onClick={() => { setRunning(false); setPhase('work'); setSessions(0); setRemaining(25 * 60) }}>Reset</button>
      </div>
    </UtilToolShell>
  )
}

// ─── Random / Dice / Coin / Decision ──────────────────────────────────────────

export function RandomNumberPage() {
  const [min, setMin] = useState('1')
  const [max, setMax] = useState('100')
  const [count, setCount] = useState('1')
  const [output, setOutput] = useState('')

  const generate = () => {
    const r = processUtilLocal('random-number', { options: { min: Number(min), max: Number(max), count: Number(count) } })
    setOutput(r.error ? '' : (r.output ?? ''))
  }

  return (
    <UtilToolShell config={randomNumberConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" />
        <input className="tool-select" type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max" />
        <input className="tool-select" type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} placeholder="Count" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={generate}>Generate</button>
      {output && <textarea className="tool-textarea" value={output} readOnly rows={4} />}
    </UtilToolShell>
  )
}

export function DiceRollerPage() {
  const [sides, setSides] = useState('6')
  const [count, setCount] = useState('2')
  const [output, setOutput] = useState('')
  const [total, setTotal] = useState<number | null>(null)

  const roll = () => {
    const r = processUtilLocal('dice-roller', { options: { sides: Number(sides), count: Number(count) } })
    if (r.error) { setOutput(''); setTotal(null); return }
    setOutput(r.output ?? '')
    setTotal((r.meta?.total as number) ?? null)
  }

  return (
    <UtilToolShell config={diceRollerConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" min={2} max={100} value={sides} onChange={(e) => setSides(e.target.value)} placeholder="Sides" />
        <input className="tool-select" type="number" min={1} max={20} value={count} onChange={(e) => setCount(e.target.value)} placeholder="Dice count" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={roll}>Roll dice</button>
      {output && <p className="util-timer-display" style={{ fontSize: '2rem' }}>{output}</p>}
      {total != null && <p className="tool-result-stats">Total: {total}</p>}
    </UtilToolShell>
  )
}

export function CoinFlipPage() {
  const [result, setResult] = useState<string | null>(null)
  const [spinning, setSpinning] = useState(false)

  const flip = () => {
    setSpinning(true)
    window.setTimeout(() => {
      const r = processUtilLocal('coin-flip', {})
      setResult(r.output ?? 'Heads')
      setSpinning(false)
    }, 400)
  }

  return (
    <UtilToolShell config={coinFlipConfig}>
      <div className={`util-coin ${spinning ? 'spin' : ''}`}>{spinning ? '…' : (result ?? '?')}</div>
      <button type="button" className="tool-compress-btn" onClick={flip} disabled={spinning}>Flip coin</button>
    </UtilToolShell>
  )
}

export function DecisionMakerPage() {
  const [options, setOptions] = useState('Pizza\nSushi\nTacos')
  const [pick, setPick] = useState('')

  const [error, setError] = useState<string | null>(null)

  const decide = () => {
    const r = processUtilLocal('decision-maker', { text: options })
    if (r.error) {
      setError(r.error)
      setPick('')
      return
    }
    setError(null)
    setPick(r.output ?? '')
  }

  return (
    <UtilToolShell config={decisionMakerConfig}>
      <textarea className="tool-textarea" value={options} onChange={(e) => setOptions(e.target.value)} rows={6} placeholder="One option per line" />
      <button type="button" className="tool-compress-btn" onClick={decide}>Decide</button>
      {error && <p className="tool-error">{error}</p>}
      {pick && <p className="util-timer-display" style={{ fontSize: '2rem' }}>{pick}</p>}
    </UtilToolShell>
  )
}

// ─── Notepad / Clipboard ──────────────────────────────────────────────────────

export function NotepadPage() {
  const [text, setText] = useState(() => localStorage.getItem(NOTEPAD_KEY) ?? '')

  useEffect(() => {
    localStorage.setItem(NOTEPAD_KEY, text)
  }, [text])

  return (
    <UtilToolShell config={notepadConfig}>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={16} placeholder="Start typing…" />
      <div className="tool-editor-actions">
        <button type="button" className="tool-secondary-btn" onClick={() => void navigator.clipboard.writeText(text)} disabled={!text}>Copy</button>
        <button type="button" className="tool-secondary-btn" onClick={() => {
          const blob = new Blob([text], { type: 'text/plain' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'notes.txt'
          a.click()
          URL.revokeObjectURL(url)
        }} disabled={!text}>Download</button>
        <button type="button" className="tool-secondary-btn" onClick={() => setText('')}>Clear</button>
      </div>
      <p className="tool-result-stats">{text.length.toLocaleString()} characters · auto-saved locally</p>
    </UtilToolShell>
  )
}

export function ClipboardManagerPage() {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(CLIPBOARD_KEY) ?? '[]') as Snippet[]
    } catch {
      return []
    }
  })
  const [label, setLabel] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(snippets))
  }, [snippets])

  const add = () => {
    if (!text.trim()) return
    setSnippets((prev) => [...prev, { id: crypto.randomUUID(), label: label.trim() || 'Snippet', text }])
    setLabel('')
    setText('')
  }

  return (
    <UtilToolShell config={clipboardManagerConfig}>
      <input className="tool-select" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (optional)" />
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Snippet text" />
      <button type="button" className="tool-compress-btn" onClick={add}>Save snippet</button>
      <ul className="util-snippet-list">
        {snippets.map((s) => (
          <li key={s.id} className="util-snippet-item">
            <strong>{s.label}</strong>
            <span className="pdf-file-meta">{s.text.slice(0, 120)}{s.text.length > 120 ? '…' : ''}</span>
            <div className="tool-editor-actions">
              <button type="button" className="tool-secondary-btn" onClick={() => void navigator.clipboard.writeText(s.text)}>Copy</button>
              <button type="button" className="tool-secondary-btn" onClick={() => setSnippets((prev) => prev.filter((x) => x.id !== s.id))}>
                <Trash2 size={14} aria-hidden /> Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </UtilToolShell>
  )
}

// ─── File Hash / EXIF ─────────────────────────────────────────────────────────

export function FileHashPage() {
  const [algo, setAlgo] = useState<HashAlgorithm>('SHA-256')
  const [hash, setHash] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setLoading(true)
    setError(null)
    setFileName(file.name)
    try {
      const buf = await file.arrayBuffer()
      const r = await hashFileData(buf, algo)
      setHash(r.error ? '' : (r.output ?? ''))
      if (r.error) setError(r.error)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hash failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <UtilToolShell config={fileHashConfig}>
      <select className="tool-select" value={algo} onChange={(e) => setAlgo(e.target.value as HashAlgorithm)}>
        {(['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as HashAlgorithm[]).map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
      <button type="button" className="upload-zone" onClick={() => document.getElementById('file-hash-input')?.click()}>
        <Upload size={24} aria-hidden />
        <span>{fileName || 'Upload file to hash'}</span>
        <input id="file-hash-input" type="file" className="upload-input" onChange={(e) => void onFile(e.target.files)} />
      </button>
      {loading && <p className="tool-result-stats"><Loader2 size={16} className="spin" aria-hidden /> Computing hash…</p>}
      {error && <p className="tool-error">{error}</p>}
      {hash && (
        <>
          <textarea className="tool-textarea" value={hash} readOnly rows={2} />
          <button type="button" className="tool-secondary-btn" onClick={() => void navigator.clipboard.writeText(hash)}>Copy hash</button>
        </>
      )}
    </UtilToolShell>
  )
}

export function ExifViewerPage() {
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)

  const onFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const entries = await readExifFromFile(file)
      setOutput(exifToText(entries))
    } catch {
      setOutput('Failed to read image metadata.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <UtilToolShell config={exifViewerConfig}>
      <button type="button" className="upload-zone" onClick={() => document.getElementById('exif-input')?.click()}>
        <Upload size={24} aria-hidden />
        <span>Upload image to view EXIF</span>
        <input id="exif-input" type="file" accept="image/*" className="upload-input" onChange={(e) => void onFile(e.target.files)} />
      </button>
      {loading && <p className="tool-result-stats"><Loader2 size={16} className="spin" aria-hidden /> Reading metadata…</p>}
      {output && (
        <>
          <textarea className="tool-textarea" value={output} readOnly rows={14} />
          <button type="button" className="tool-secondary-btn" onClick={() => void navigator.clipboard.writeText(output)}>Copy</button>
        </>
      )}
    </UtilToolShell>
  )
}

// ─── Color / Screen / Ruler ───────────────────────────────────────────────────

function useImageCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const loadFile = (file: File) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
    }
    img.src = url
  }

  const loadUrl = (url: string) => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(url)
    const img = new Image()
    img.onload = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0)
    }
    img.src = url
  }

  const sample = (x: number, y: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return null
    const data = ctx.getImageData(x, y, 1, 1).data
    return { r: data[0]!, g: data[1]!, b: data[2]! }
  }

  return { canvasRef, imageUrl, loadFile, loadUrl, sample }
}

export function ColorPickerToolPage() {
  const { canvasRef, loadFile, sample } = useImageCanvas()
  const [color, setColor] = useState('#3b82f6')
  const [report, setReport] = useState('')

  const onCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = e.currentTarget.width / rect.width
    const scaleY = e.currentTarget.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    const rgb = sample(x, y)
    if (!rgb) return
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b)
    setColor(hex)
    setReport(colorReport(rgb.r, rgb.g, rgb.b))
  }

  const onHexChange = (hex: string) => {
    setColor(hex)
    setReport(hex)
  }

  return (
    <UtilToolShell config={colorPickerToolConfig}>
      <div className="tool-controls" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <input type="color" value={color.startsWith('#') && color.length >= 7 ? color : '#3b82f6'} onChange={(e) => onHexChange(e.target.value)} />
        <input className="tool-select" value={color} onChange={(e) => onHexChange(e.target.value)} placeholder="#RRGGBB" />
        <span className="util-color-swatch" style={{ background: color.startsWith('#') ? color : '#3b82f6' }} />
      </div>
      <button type="button" className="tool-secondary-btn" onClick={() => document.getElementById('color-picker-file')?.click()}>
        <Upload size={16} aria-hidden /> Upload image
      </button>
      <input id="color-picker-file" type="file" accept="image/*" className="upload-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f) }} />
      <div className="util-canvas-wrap">
        <canvas ref={canvasRef} onClick={onCanvasClick} />
      </div>
      {report && (
        <>
          <textarea className="tool-textarea" value={report} readOnly rows={3} />
          <button type="button" className="tool-secondary-btn" onClick={() => void navigator.clipboard.writeText(report)}>Copy</button>
        </>
      )}
    </UtilToolShell>
  )
}

export function ScreenColorPage() {
  const { canvasRef, loadUrl, sample } = useImageCanvas()
  const [report, setReport] = useState('')
  const [error, setError] = useState<string | null>(null)

  const capture = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      stream.getTracks().forEach((t) => t.stop())
      const url = canvas.toDataURL('image/png')
      loadUrl(url)
    } catch {
      setError('Screen capture was cancelled or not permitted.')
    }
  }

  const onCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = e.currentTarget.width / rect.width
    const scaleY = e.currentTarget.height / rect.height
    const x = Math.floor((e.clientX - rect.left) * scaleX)
    const y = Math.floor((e.clientY - rect.top) * scaleY)
    const rgb = sample(x, y)
    if (!rgb) return
    setReport(colorReport(rgb.r, rgb.g, rgb.b))
  }

  return (
    <UtilToolShell config={screenColorConfig}>
      <button type="button" className="tool-compress-btn" onClick={() => void capture()}>Capture screen</button>
      {error && <p className="tool-error">{error}</p>}
      <div className="util-canvas-wrap">
        <canvas ref={canvasRef} onClick={onCanvasClick} />
      </div>
      {report && (
        <>
          <textarea className="tool-textarea" value={report} readOnly rows={3} />
          <button type="button" className="tool-secondary-btn" onClick={() => void navigator.clipboard.writeText(report)}>Copy</button>
        </>
      )}
    </UtilToolShell>
  )
}

export function PixelRulerPage() {
  const { canvasRef, loadFile, loadUrl } = useImageCanvas()
  const [start, setStart] = useState<{ x: number; y: number } | null>(null)
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const getCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const scaleX = e.currentTarget.width / rect.width
    const scaleY = e.currentTarget.height / rect.height
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY),
    }
  }

  const distance = useMemo(() => {
    if (!start || !end) return null
    const dx = end.x - start.x
    const dy = end.y - start.y
    return Math.round(Math.hypot(dx, dy))
  }, [start, end])

  const onCanvasClick = (e: MouseEvent<HTMLCanvasElement>) => {
    const pt = getCoords(e)
    if (!start || end) {
      setStart(pt)
      setEnd(null)
    } else {
      setEnd(pt)
    }
  }

  const capture = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      canvas.getContext('2d')?.drawImage(video, 0, 0)
      stream.getTracks().forEach((t) => t.stop())
      loadUrl(canvas.toDataURL('image/png'))
      setStart(null)
      setEnd(null)
    } catch {
      setError('Screen capture was cancelled or not permitted.')
    }
  }

  return (
    <UtilToolShell config={pixelRulerConfig}>
      <div className="tool-controls">
        <button type="button" className="tool-secondary-btn" onClick={() => document.getElementById('ruler-file')?.click()}>
          <Upload size={16} aria-hidden /> Upload image
        </button>
        <button type="button" className="tool-secondary-btn" onClick={() => void capture()}>Capture screen</button>
        <button type="button" className="tool-secondary-btn" onClick={() => { setStart(null); setEnd(null) }}>Clear points</button>
      </div>
      <input id="ruler-file" type="file" accept="image/*" className="upload-input" onChange={(e) => { const f = e.target.files?.[0]; if (f) { loadFile(f); setStart(null); setEnd(null) } }} />
      {error && <p className="tool-error">{error}</p>}
      <p className="tool-result-stats">Click two points to measure. {start && !end ? 'Select end point…' : ''}</p>
      <div className="util-canvas-wrap">
        <canvas ref={canvasRef} onClick={onCanvasClick} />
      </div>
      {distance != null && (
        <p className="util-timer-display" style={{ fontSize: '1.5rem' }}>
          {distance} px
          {start && end && ` (${start.x},${start.y}) → (${end.x},${end.y})`}
        </p>
      )}
    </UtilToolShell>
  )
}

// ─── Bulk Rename ──────────────────────────────────────────────────────────────

export function BulkRenamePage() {
  const [files, setFiles] = useState<File[]>([])
  const [pattern, setPattern] = useState('{name}-{index}')
  const [startIndex, setStartIndex] = useState('1')
  const [loading, setLoading] = useState(false)

  const preview = useMemo(
    () => applyBulkRename(files, pattern, Number(startIndex) || 1),
    [files, pattern, startIndex],
  )

  const downloadZip = async () => {
    if (!files.length) return
    setLoading(true)
    try {
      const zip = new JSZip()
      for (let i = 0; i < files.length; i++) {
        const entry = preview[i]
        if (!entry) continue
        zip.file(entry.newName, await files[i]!.arrayBuffer())
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'renamed-files.zip'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UtilToolShell config={bulkRenameConfig}>
      <button type="button" className="upload-zone" onClick={() => document.getElementById('bulk-files')?.click()}>
        <Upload size={24} aria-hidden />
        <span>{files.length ? `${files.length} files selected` : 'Select files to rename'}</span>
        <input id="bulk-files" type="file" multiple className="upload-input" onChange={(e) => setFiles(e.target.files ? [...e.target.files] : [])} />
      </button>
      <div className="tool-controls">
        <label className="tool-control-label">Rename pattern</label>
        <input className="tool-select" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="{name}-{index}" />
        <p className="pdf-file-meta">Tokens: {'{name}'}, {'{ext}'}, {'{index}'}, {'{index:03}'}</p>
        <label className="tool-control-label">Start index</label>
        <input className="tool-select" type="number" min={0} value={startIndex} onChange={(e) => setStartIndex(e.target.value)} />
      </div>
      {preview.length > 0 && (
        <table className="util-rename-table">
          <thead>
            <tr><th>Original</th><th>New name</th></tr>
          </thead>
          <tbody>
            {preview.map((row) => (
              <tr key={row.originalName}>
                <td>{row.originalName}</td>
                <td>{row.newName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" className="tool-compress-btn" onClick={() => void downloadZip()} disabled={!files.length || loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Creating ZIP…</> : <><Download size={18} aria-hidden /> Download renamed ZIP</>}
      </button>
      {files.length > 0 && <p className="tool-result-stats">Total input size: {formatFileSize(files.reduce((s, f) => s + f.size, 0))}</p>}
    </UtilToolShell>
  )
}
