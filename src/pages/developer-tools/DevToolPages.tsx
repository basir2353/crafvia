import { useMemo, useState, type ReactNode } from 'react'
import { processDevLocal } from '../../api/devTools'
import { DevOutputActions, DevToolShell } from '../../components/DevToolShell'
import {
  apiTesterConfig,
  base64EncodeConfig,
  colorConverterConfig,
  cronGeneratorConfig,
  csvToJsonConfig,
  diffCheckerConfig,
  hashGeneratorConfig,
  htmlEntityConfig,
  htmlFormatterConfig,
  jsonGeneratorConfig,
  jsonToCsvConfig,
  jsFormatterConfig,
  jwtDecoderConfig,
  markdownPreviewConfig,
  regexTesterConfig,
  sqlFormatterConfig,
  timestampConverterConfig,
  urlEncoderConfig,
  uuidGeneratorConfig,
  yamlValidatorConfig,
  cssFormatterConfig,
} from '../../config/devTools'
import { base64FromFile, diffToSideBySide, hashFileData, hashText, type HashAlgorithm, type RegexMatch } from '../../utils/devProcess'
import { markdownToHtml } from '../../utils/markdownToHtml'
import type { DiffLine } from '../../utils/textProcess'

function useDevState() {
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const reset = () => { setError(null); setSuccess(null) }
  return { output, setOutput, error, setError, success, setSuccess, reset }
}

function Status({ error, success }: { error: string | null; success: string | null }) {
  return (
    <>
      {error && <p className="tool-error">{error}</p>}
      {success && <p className="tool-result-stats">{success}</p>}
    </>
  )
}

function renderDevMarkdown(md: string): string {
  let html = markdownToHtml(md)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  return html
}

function highlightRegex(text: string, matches: RegexMatch[]): ReactNode {
  if (!matches.length) return text
  const parts: ReactNode[] = []
  let last = 0
  matches.forEach((m, i) => {
    if (m.start > last) parts.push(text.slice(last, m.start))
    parts.push(<mark key={i}>{text.slice(m.start, m.end)}</mark>)
    last = m.end
  })
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

// ─── Base64 ───────────────────────────────────────────────────────────────────

export function Base64EncodePage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const run = () => {
    reset()
    const r = processDevLocal('base64-encode', { text, options: { mode } })
    if (r.error) { setError(r.error); setOutput(''); return }
    setOutput(r.output ?? ''); setSuccess('Converted.')
  }

  const onFile = async (file: File) => {
    reset()
    const r = await base64FromFile(file, mode)
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess(`Processed ${file.name}.`)
  }

  return (
    <DevToolShell config={base64EncodeConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Mode</label>
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}>
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </select>
      </div>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Text to convert…" rows={6} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Or upload a file</label>
        <input className="tool-select" type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f) }} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{base64EncodeConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={8} />
          <DevOutputActions output={output} downloadFilename="base64.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Regex ────────────────────────────────────────────────────────────────────

export function RegexTesterPage() {
  const [text, setText] = useState('Hello world 123')
  const [pattern, setPattern] = useState('\\d+')
  const [flags, setFlags] = useState('g')
  const result = useMemo(() => {
    const r = processDevLocal('regex-tester', { text, options: { pattern, flags } })
    if (r.error) return { error: r.error, matches: [] as RegexMatch[], matchCount: 0 }
    const meta = r.meta as { matches: RegexMatch[]; matchCount: number }
    return { error: null as string | null, ...meta }
  }, [text, pattern, flags])

  return (
    <DevToolShell config={regexTesterConfig}>
      <div className="tool-controls">
        <input className="tool-select" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="Pattern" />
        <input className="tool-select" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="Flags (g, i, m)" />
      </div>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      </div>
      {result.error && <p className="tool-error">{result.error}</p>}
      {!result.error && (
        <div className="tool-controls">
          <span className="pdf-file-meta">{result.matchCount} match(es)</span>
          <div className="tool-textarea" style={{ minHeight: '80px', whiteSpace: 'pre-wrap' }}>
            {highlightRegex(text, result.matches)}
          </div>
        </div>
      )}
    </DevToolShell>
  )
}

// ─── UUID ─────────────────────────────────────────────────────────────────────

export function UuidGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [count, setCount] = useState('5')

  const run = () => {
    reset()
    const r = processDevLocal('uuid-generator', { options: { count: Number(count) } })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess(`Generated ${count} UUID(s).`)
  }

  return (
    <DevToolShell config={uuidGeneratorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Count (1–100)</label>
        <input className="tool-select" type="number" min={1} max={100} value={count} onChange={(e) => setCount(e.target.value)} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{uuidGeneratorConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={6} />
          <DevOutputActions output={output} downloadFilename="uuids.txt" onClear={() => setOutput('')} />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Hash ─────────────────────────────────────────────────────────────────────

export function HashGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')
  const [algo, setAlgo] = useState<HashAlgorithm>('SHA-256')

  const runText = async () => {
    reset()
    const r = await hashText(text, algo)
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess(`${algo} hash generated.`)
  }

  const onFile = async (file: File) => {
    reset()
    const buf = await file.arrayBuffer()
    const r = await hashFileData(buf, algo)
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess(`${algo} hash of ${file.name}.`)
  }

  return (
    <DevToolShell config={hashGeneratorConfig}>
      <div className="tool-controls">
        <select className="tool-select" value={algo} onChange={(e) => setAlgo(e.target.value as HashAlgorithm)}>
          {(['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const).map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="Text to hash…" />
      </div>
      <div className="tool-controls">
        <input className="tool-select" type="file" onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f) }} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={() => void runText()}>{hashGeneratorConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <input className="tool-select" value={output} readOnly />
          <DevOutputActions output={output} onClear={() => setOutput('')} />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── URL Encoder ──────────────────────────────────────────────────────────────

export function UrlEncoderPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const live = useMemo(() => {
    if (!text) return ''
    const r = processDevLocal('url-encoder', { text, options: { mode, component: true } })
    return r.error ? '' : (r.output ?? '')
  }, [text, mode])

  const run = () => {
    reset()
    const r = processDevLocal('url-encoder', { text, options: { mode, component: true } })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess('Converted.')
  }

  return (
    <DevToolShell config={urlEncoderConfig}>
      <div className="tool-controls">
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}>
          <option value="encode">Encode</option>
          <option value="decode">Decode</option>
        </select>
      </div>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
        {live && <span className="pdf-file-meta">Preview: {live}</span>}
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{urlEncoderConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && <div className="tool-controls"><textarea className="tool-textarea" value={output} readOnly rows={3} /><DevOutputActions output={output} /></div>}
    </DevToolShell>
  )
}

// ─── HTML / CSS / JS formatters ───────────────────────────────────────────────

function FormatterPage({
  config,
  slug,
  modes,
}: {
  config: typeof htmlFormatterConfig
  slug: 'html-formatter' | 'css-formatter' | 'js-formatter'
  modes: { beautify: string; minify: string }
}) {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'beautify' | 'minify'>('beautify')

  const run = () => {
    reset()
    const r = processDevLocal(slug, { text, options: { mode } })
    if (r.error) { setError(r.error); setOutput(''); return }
    setOutput(r.output ?? '')
    const issues = (r.meta?.issues as string[]) ?? []
    const syntaxError = r.meta?.syntaxError as string | undefined
    if (issues.length) setError(issues.join(' '))
    if (syntaxError) setError(`Syntax: ${syntaxError}`)
    setSuccess(mode === 'beautify' ? 'Beautified.' : 'Minified.')
  }

  return (
    <DevToolShell config={config}>
      <div className="tool-controls">
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as 'beautify' | 'minify')}>
          <option value="beautify">{modes.beautify}</option>
          <option value="minify">{modes.minify}</option>
        </select>
      </div>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={10} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{config.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={12} spellCheck={false} />
          <DevOutputActions output={output} onClear={() => setOutput('')} />
        </div>
      )}
    </DevToolShell>
  )
}

export const HtmlFormatterPage = () => (
  <FormatterPage config={htmlFormatterConfig} slug="html-formatter" modes={{ beautify: 'Beautify', minify: 'Minify' }} />
)
export const CssFormatterPage = () => (
  <FormatterPage config={cssFormatterConfig} slug="css-formatter" modes={{ beautify: 'Beautify', minify: 'Minify' }} />
)
export const JsFormatterPage = () => (
  <FormatterPage config={jsFormatterConfig} slug="js-formatter" modes={{ beautify: 'Beautify', minify: 'Minify' }} />
)

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function JwtDecoderPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [token, setToken] = useState('')

  const run = () => {
    reset()
    const r = processDevLocal('jwt-decoder', { text: token })
    if (r.error) { setError(r.error); setOutput(''); return }
    setOutput(r.output ?? ''); setSuccess('JWT decoded (signature not verified).')
  }

  return (
    <DevToolShell config={jwtDecoderConfig}>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste JWT token…" rows={4} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{jwtDecoderConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={14} spellCheck={false} />
          <DevOutputActions output={output} onClear={() => setOutput('')} />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Cron ─────────────────────────────────────────────────────────────────────

export function CronGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [minute, setMinute] = useState('0')
  const [hour, setHour] = useState('9')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('1-5')
  const [explanation, setExplanation] = useState('')

  const run = () => {
    reset()
    const r = processDevLocal('cron-generator', { options: { minute, hour, dayOfMonth, month, dayOfWeek } })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? '')
    setExplanation(String(r.meta?.explanation ?? ''))
    setSuccess('Cron expression generated.')
  }

  const fields = [
    { label: 'Minute (0-59)', value: minute, set: setMinute, ph: '0 or */5' },
    { label: 'Hour (0-23)', value: hour, set: setHour, ph: '9' },
    { label: 'Day of month', value: dayOfMonth, set: setDayOfMonth, ph: '*' },
    { label: 'Month', value: month, set: setMonth, ph: '*' },
    { label: 'Day of week (0-7)', value: dayOfWeek, set: setDayOfWeek, ph: '1-5' },
  ]

  return (
    <DevToolShell config={cronGeneratorConfig}>
      {fields.map((f) => (
        <div key={f.label} className="tool-controls">
          <label className="tool-control-label">{f.label}</label>
          <input className="tool-select" value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.ph} />
        </div>
      ))}
      <button type="button" className="tool-compress-btn" onClick={run}>{cronGeneratorConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <input className="tool-select" value={output} readOnly />
          {explanation && <span className="pdf-file-meta">{explanation}</span>}
          <DevOutputActions output={output} onClear={() => { setOutput(''); setExplanation('') }} />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Color ────────────────────────────────────────────────────────────────────

export function ColorConverterPage() {
  const [input, setInput] = useState('#3b82f6')
  const [from, setFrom] = useState<'hex' | 'rgb' | 'hsl'>('hex')
  const result = useMemo(() => processDevLocal('color-converter', { options: { input, from } }), [input, from])
  const meta = result.meta as { hex?: string; rgb?: { r: number; g: number; b: number } } | undefined

  return (
    <DevToolShell config={colorConverterConfig}>
      <div className="tool-controls">
        <select className="tool-select" value={from} onChange={(e) => setFrom(e.target.value as 'hex' | 'rgb' | 'hsl')}>
          <option value="hex">HEX</option>
          <option value="rgb">RGB</option>
          <option value="hsl">HSL</option>
        </select>
        <input className="tool-select" value={input} onChange={(e) => setInput(e.target.value)} />
      </div>
      {result.error && <p className="tool-error">{result.error}</p>}
      {meta?.hex && (
        <div className="tool-controls">
          <div className="tool-preview">
            <div style={{ width: '100%', height: '80px', background: meta.hex, borderRadius: '8px' }} />
          </div>
          <span className="pdf-file-meta">{result.output}</span>
          <DevOutputActions output={result.output ?? ''} />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

export function DiffCheckerPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [textA, setTextA] = useState('')
  const [textB, setTextB] = useState('')
  const [sideBySide, setSideBySide] = useState<ReturnType<typeof diffToSideBySide>>([])

  const run = () => {
    reset()
    const r = processDevLocal('diff-checker', { textA, textB })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? '')
    setSideBySide(diffToSideBySide((r.meta?.diff as DiffLine[]) ?? []))
    setSuccess(`+${r.meta?.added ?? 0} / -${r.meta?.removed ?? 0} lines`)
  }

  return (
    <DevToolShell config={diffCheckerConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Original</label>
        <textarea className="tool-textarea" value={textA} onChange={(e) => setTextA(e.target.value)} rows={6} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Updated</label>
        <textarea className="tool-textarea" value={textB} onChange={(e) => setTextB(e.target.value)} rows={6} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{diffCheckerConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {sideBySide.length > 0 && (
        <div className="tool-controls">
          <label className="tool-control-label">Side-by-side</label>
          {sideBySide.map((row, i) => (
            <div key={i} className="pdf-file-info">
              <span className="pdf-file-meta" style={row.leftType === 'remove' ? { background: '#fef2f2' } : undefined}>{row.left || ' '}</span>
              <span className="pdf-file-meta" style={row.rightType === 'add' ? { background: '#f0fdf4' } : undefined}>{row.right || ' '}</span>
            </div>
          ))}
        </div>
      )}
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <DevOutputActions output={output} downloadFilename="diff.txt" />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Markdown ─────────────────────────────────────────────────────────────────

export function MarkdownPreviewPage() {
  const [md, setMd] = useState('# Hello\n\nWrite **markdown** here.')
  const html = useMemo(() => renderDevMarkdown(md), [md])
  const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Preview</title></head><body>${html}</body></html>`

  return (
    <DevToolShell config={markdownPreviewConfig}>
      <div className="tool-controls">
        <textarea className="tool-textarea" value={md} onChange={(e) => setMd(e.target.value)} rows={8} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Preview</label>
        <div className="tool-textarea" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <DevOutputActions output={fullHtml} downloadFilename="preview.html" downloadMime="text/html;charset=utf-8" downloadLabel="Download HTML" />
    </DevToolShell>
  )
}

// ─── SQL / YAML ───────────────────────────────────────────────────────────────

export function SqlFormatterPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')

  const run = () => {
    reset()
    const r = processDevLocal('sql-formatter', { text })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess('SQL formatted.')
  }

  return (
    <DevToolShell config={sqlFormatterConfig}>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="SELECT * FROM users WHERE…" />
      <button type="button" className="tool-compress-btn" onClick={run}>{sqlFormatterConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && <div className="tool-controls"><textarea className="tool-textarea" value={output} readOnly rows={10} /><DevOutputActions output={output} /></div>}
    </DevToolShell>
  )
}

export function YamlValidatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')

  const validate = () => {
    reset()
    const r = processDevLocal('yaml-validator', { text, options: { mode: 'validate' } })
    if (r.error) { setError(r.error); setOutput(''); return }
    setOutput(r.output ?? ''); setSuccess('YAML is valid.')
  }

  const toJson = () => {
    reset()
    const r = processDevLocal('yaml-validator', { text, options: { mode: 'json' } })
    if (r.error) { setError(r.error); setOutput(''); return }
    setOutput(r.output ?? ''); setSuccess('Converted to JSON.')
  }

  return (
    <DevToolShell config={yamlValidatorConfig}>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={10} />
      <div className="tool-editor-actions">
        <button type="button" className="tool-compress-btn" onClick={validate}>Validate</button>
        <button type="button" className="tool-secondary-btn" onClick={toJson}>Convert to JSON</button>
      </div>
      <Status error={error} success={success} />
      {output && <div className="tool-controls"><textarea className="tool-textarea" value={output} readOnly rows={10} /><DevOutputActions output={output} downloadFilename="output.json" downloadMime="application/json" downloadLabel="Download JSON" /></div>}
    </DevToolShell>
  )
}

// ─── API Tester ───────────────────────────────────────────────────────────────

export function ApiTesterPage() {
  const [url, setUrl] = useState('https://httpbin.org/get')
  const [method, setMethod] = useState('GET')
  const [headers, setHeaders] = useState('Content-Type: application/json')
  const [body, setBody] = useState('')
  const [response, setResponse] = useState('')
  const [status, setStatus] = useState<number | null>(null)
  const [time, setTime] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const send = async () => {
    setError(null); setLoading(true)
    const start = performance.now()
    try {
      const headerObj: Record<string, string> = {}
      headers.split('\n').forEach((line) => {
        const idx = line.indexOf(':')
        if (idx > 0) headerObj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
      })
      const opts: RequestInit = { method, headers: headerObj }
      if (!['GET', 'HEAD'].includes(method) && body.trim()) opts.body = body
      const res = await fetch(url, opts)
      const text = await res.text()
      setStatus(res.status)
      setTime(Math.round(performance.now() - start))
      setResponse(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Check URL and CORS policy.')
      setResponse('')
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DevToolShell config={apiTesterConfig}>
      <div className="tool-controls">
        <select className="tool-select" value={method} onChange={(e) => setMethod(e.target.value)}>
          {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="tool-select" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.example.com/endpoint" />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">Headers (Key: Value per line)</label>
        <textarea className="tool-textarea" value={headers} onChange={(e) => setHeaders(e.target.value)} rows={3} />
      </div>
      {!['GET', 'HEAD'].includes(method) && (
        <div className="tool-controls">
          <label className="tool-control-label">Request body</label>
          <textarea className="tool-textarea" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
        </div>
      )}
      <button type="button" className="tool-compress-btn" onClick={() => void send()} disabled={loading}>
        {loading ? 'Sending…' : apiTesterConfig.actionLabel}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {status !== null && (
        <div className="tool-controls">
          <span className="pdf-file-meta">Status: {status} · Time: {time}ms</span>
          <textarea className="tool-textarea" value={response} readOnly rows={12} />
          <DevOutputActions output={response} downloadFilename="response.txt" />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── JSON Generator ───────────────────────────────────────────────────────────

export function JsonGeneratorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [depth, setDepth] = useState('2')
  const [arraySize, setArraySize] = useState('3')

  const run = () => {
    reset()
    const r = processDevLocal('lorem-json', { options: { depth: Number(depth), arraySize: Number(arraySize) } })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess('JSON generated.')
  }

  return (
    <DevToolShell config={jsonGeneratorConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" min={1} max={5} value={depth} onChange={(e) => setDepth(e.target.value)} placeholder="Nesting depth" />
        <input className="tool-select" type="number" min={1} max={10} value={arraySize} onChange={(e) => setArraySize(e.target.value)} placeholder="Array size" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{jsonGeneratorConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={14} />
          <DevOutputActions output={output} downloadFilename="sample.json" downloadMime="application/json" downloadLabel="Download JSON" />
        </div>
      )}
    </DevToolShell>
  )
}

// ─── Timestamp ────────────────────────────────────────────────────────────────

export function TimestampConverterPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'toDate' | 'toTimestamp'>('toDate')

  const run = () => {
    reset()
    const r = processDevLocal('timestamp-converter', { text, options: { mode } })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess('Converted.')
  }

  const now = () => setText(String(Math.floor(Date.now() / 1000)))

  return (
    <DevToolShell config={timestampConverterConfig}>
      <div className="tool-controls">
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as 'toDate' | 'toTimestamp')}>
          <option value="toDate">Timestamp → Date</option>
          <option value="toTimestamp">Date → Timestamp</option>
        </select>
        <input className="tool-select" value={text} onChange={(e) => setText(e.target.value)} placeholder={mode === 'toDate' ? '1699999999' : '2024-01-15T12:00:00Z'} />
        <button type="button" className="tool-secondary-btn" onClick={now}>Use now</button>
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>{timestampConverterConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && <div className="tool-controls"><textarea className="tool-textarea" value={output} readOnly rows={5} /><DevOutputActions output={output} /></div>}
    </DevToolShell>
  )
}

// ─── HTML Entity ──────────────────────────────────────────────────────────────

export function HtmlEntityPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const live = useMemo(() => {
    if (!text) return ''
    const r = processDevLocal('html-entity', { text, options: { mode } })
    return r.error ? '' : (r.output ?? '')
  }, [text, mode])

  const run = () => {
    reset()
    const r = processDevLocal('html-entity', { text, options: { mode } })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess('Converted.')
  }

  return (
    <DevToolShell config={htmlEntityConfig}>
      <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as 'encode' | 'decode')}>
        <option value="encode">Encode</option>
        <option value="decode">Decode</option>
      </select>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={4} />
      {live && <span className="pdf-file-meta">Preview: {live}</span>}
      <button type="button" className="tool-compress-btn" onClick={run}>{htmlEntityConfig.actionLabel}</button>
      <Status error={error} success={success} />
      {output && <DevOutputActions output={output} />}
    </DevToolShell>
  )
}

// ─── CSV ↔ JSON ───────────────────────────────────────────────────────────────

function CsvJsonPage({
  config,
  slug,
  downloadName,
  mime,
}: {
  config: typeof csvToJsonConfig
  slug: 'csv-to-json' | 'json-to-csv'
  downloadName: string
  mime: string
}) {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useDevState()
  const [text, setText] = useState('')

  const run = () => {
    reset()
    const r = processDevLocal(slug, { text })
    if (r.error) { setError(r.error); setOutput(''); return }
    setOutput(r.output ?? ''); setSuccess('Converted.')
  }

  const onFile = async (file: File) => {
    reset()
    const content = await file.text()
    setText(content)
    const r = processDevLocal(slug, { text: content })
    if (r.error) { setError(r.error); return }
    setOutput(r.output ?? ''); setSuccess(`Converted ${file.name}.`)
  }

  return (
    <DevToolShell config={config}>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={8} />
      <input className="tool-select" type="file" accept={slug === 'csv-to-json' ? '.csv,text/csv' : '.json,application/json'} onChange={(e) => { const f = e.target.files?.[0]; if (f) void onFile(f) }} />
      <button type="button" className="tool-compress-btn" onClick={run}>{config.actionLabel}</button>
      <Status error={error} success={success} />
      {output && (
        <div className="tool-controls">
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <DevOutputActions output={output} downloadFilename={downloadName} downloadMime={mime} downloadLabel={`Download ${downloadName.split('.').pop()?.toUpperCase()}`} />
        </div>
      )}
    </DevToolShell>
  )
}

export const CsvToJsonPage = () => (
  <CsvJsonPage config={csvToJsonConfig} slug="csv-to-json" downloadName="data.json" mime="application/json" />
)
export const JsonToCsvPage = () => (
  <CsvJsonPage config={jsonToCsvConfig} slug="json-to-csv" downloadName="data.csv" mime="text/csv" />
)
