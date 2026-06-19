import { diffText, type DiffLine } from './textProcess'

export type DevToolSlug =
  | 'base64-encode'
  | 'regex-tester'
  | 'uuid-generator'
  | 'hash-generator'
  | 'url-encoder'
  | 'html-formatter'
  | 'css-formatter'
  | 'js-formatter'
  | 'jwt-decoder'
  | 'cron-generator'
  | 'color-converter'
  | 'diff-checker'
  | 'markdown-preview'
  | 'sql-formatter'
  | 'yaml-validator'
  | 'lorem-json'
  | 'timestamp-converter'
  | 'html-entity'
  | 'csv-to-json'
  | 'json-to-csv'

export type DevToolRequest = {
  text?: string
  textA?: string
  textB?: string
  options?: Record<string, unknown>
}

export type DevToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

export type RegexMatch = { start: number; end: number; match: string; groups: string[] }

export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

// ─── Base64 ───────────────────────────────────────────────────────────────────

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64.replace(/\s/g, ''))
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function processBase64(text: string, options: Record<string, unknown>): DevToolResponse {
  const mode = str(options.mode) || 'encode'
  const input = text.trim()
  if (!input) return { error: 'Enter text to encode or decode.' }

  try {
    if (mode === 'decode') {
      const cleaned = input.replace(/^data:[^;]+;base64,/, '')
      return { output: base64ToUtf8(cleaned) }
    }
    return { output: utf8ToBase64(input) }
  } catch {
    return { error: 'Invalid Base64 input. Check padding and characters.' }
  }
}

export async function base64FromFile(
  file: File,
  mode: 'encode' | 'decode',
): Promise<DevToolResponse> {
  try {
    if (mode === 'encode') {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ''
      for (const b of bytes) binary += String.fromCharCode(b)
      return { output: btoa(binary), meta: { filename: file.name, size: file.size } }
    }
    const text = await file.text()
    const cleaned = text.trim().replace(/^data:[^;]+;base64,/, '')
    const binary = atob(cleaned)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return {
      output: new TextDecoder().decode(bytes),
      meta: { filename: file.name },
    }
  } catch {
    return { error: 'Failed to process file as Base64.' }
  }
}

// ─── Regex ────────────────────────────────────────────────────────────────────

export function testRegex(text: string, options: Record<string, unknown>): DevToolResponse {
  const pattern = str(options.pattern)
  const flags = str(options.flags) || 'g'
  if (!pattern) return { error: 'Enter a regex pattern.' }

  try {
    const matches: RegexMatch[] = []
    let m: RegExpExecArray | null
    const testFlags = flags.includes('g') ? flags : `${flags}g`
    const globalRegex = new RegExp(pattern, testFlags)
    while ((m = globalRegex.exec(text)) !== null) {
      matches.push({
        start: m.index,
        end: m.index + m[0].length,
        match: m[0],
        groups: m.slice(1),
      })
      if (!testFlags.includes('g')) break
      if (m[0].length === 0) globalRegex.lastIndex++
    }
    return {
      output: matches.map((x) => `"${x.match}" @ ${x.start}`).join('\n') || 'No matches found.',
      meta: { matches, matchCount: matches.length, valid: true },
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Invalid regular expression.' }
  }
}

// ─── UUID ─────────────────────────────────────────────────────────────────────

export function generateUuids(options: Record<string, unknown>): DevToolResponse {
  const count = Math.min(Math.max(num(options.count, 1), 1), 100)
  const uuids: string[] = []
  for (let i = 0; i < count; i++) {
    uuids.push(crypto.randomUUID())
  }
  return { output: uuids.join('\n'), meta: { uuids, count } }
}

// ─── Hash ─────────────────────────────────────────────────────────────────────

function md5Bytes(data: Uint8Array): string {
  const rotl = (x: number, n: number) => (x << n) | (x >>> (32 - n))
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0')

  const bytes = data.length
  const words = new Uint32Array(Math.ceil((bytes + 9) / 64) * 16)
  for (let i = 0; i < bytes; i++) words[i >> 2]! |= data[i]! << ((i % 4) * 8)
  words[bytes >> 2]! |= 0x80 << ((bytes % 4) * 8)
  words[words.length - 2] = bytes * 8

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476
  const K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32))
  const S = [7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21]

  for (let i = 0; i < words.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d
    for (let j = 0; j < 64; j++) {
      let f: number, g: number
      if (j < 16) { f = (b & c) | (~b & d); g = j }
      else if (j < 32) { f = (d & b) | (~d & c); g = (5 * j + 1) % 16 }
      else if (j < 48) { f = b ^ c ^ d; g = (3 * j + 5) % 16 }
      else { f = c ^ (b | ~d); g = (7 * j) % 16 }
      const t = d
      d = c; c = b
      b = (b + rotl((a + f + K[j]! + words[i + g]!) | 0, S[j]!)) | 0
      a = t
    }
    a = (a + oa) | 0; b = (b + ob) | 0; c = (c + oc) | 0; d = (d + od) | 0
  }
  return [a, b, c, d].map(toHex).join('')
}

async function shaHash(data: ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  const map: Record<string, string> = {
    'SHA-1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
  }
  const digest = await crypto.subtle.digest(map[algorithm]!, data)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<DevToolResponse> {
  if (!text) return { error: 'Enter text to hash.' }
  const bytes = new TextEncoder().encode(text)
  if (algorithm === 'MD5') {
    return { output: md5Bytes(bytes), meta: { algorithm } }
  }
  const hash = await shaHash(bytes.buffer, algorithm)
  return { output: hash, meta: { algorithm } }
}

export async function hashFileData(
  buffer: ArrayBuffer,
  algorithm: HashAlgorithm,
): Promise<DevToolResponse> {
  if (algorithm === 'MD5') {
    return { output: md5Bytes(new Uint8Array(buffer)), meta: { algorithm } }
  }
  const hash = await shaHash(buffer, algorithm)
  return { output: hash, meta: { algorithm } }
}

// ─── URL encode/decode ────────────────────────────────────────────────────────

export function processUrlCodec(text: string, options: Record<string, unknown>): DevToolResponse {
  const mode = str(options.mode) || 'encode'
  const component = options.component === true
  if (!text) return { error: 'Enter text to convert.' }
  try {
    if (mode === 'decode') {
      return { output: component ? decodeURIComponent(text) : decodeURI(text) }
    }
    return { output: component ? encodeURIComponent(text) : encodeURI(text) }
  } catch {
    return { error: 'Invalid URL-encoded sequence.' }
  }
}

// ─── HTML formatter ───────────────────────────────────────────────────────────

export function beautifyHtml(html: string): string {
  const formatted: string[] = []
  let indent = 0
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])
  const tokens = html.replace(/>\s+</g, '><').split(/(<[^>]+>)/g).filter(Boolean)

  for (const token of tokens) {
    const trimmed = token.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('</')) {
      indent = Math.max(0, indent - 1)
      formatted.push('  '.repeat(indent) + trimmed)
    } else if (trimmed.startsWith('<')) {
      formatted.push('  '.repeat(indent) + trimmed)
      const tag = trimmed.match(/^<([a-zA-Z0-9-]+)/)?.[1]?.toLowerCase()
      if (tag && !voidTags.has(tag) && !trimmed.endsWith('/>') && !trimmed.startsWith('</')) {
        indent++
      }
    } else {
      formatted.push('  '.repeat(indent) + trimmed)
    }
  }
  return formatted.join('\n')
}

export function minifyHtml(html: string): string {
  return html.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()
}

export function validateHtmlStructure(html: string): string[] {
  const issues: string[] = []
  const stack: string[] = []
  const tags = [...html.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g)]
  const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

  for (const m of tags) {
    const full = m[0]
    const name = m[1]!.toLowerCase()
    if (voidTags.has(name) || full.endsWith('/>')) continue
    if (full.startsWith('</')) {
      const last = stack.pop()
      if (last !== name) issues.push(`Mismatched tag: expected </${last}>, found </${name}>`)
    } else {
      stack.push(name)
    }
  }
  if (stack.length) issues.push(`Unclosed tags: ${stack.join(', ')}`)
  return issues
}

export function processHtmlFormat(text: string, options: Record<string, unknown>): DevToolResponse {
  if (!text.trim()) return { error: 'Enter HTML to format.' }
  const mode = str(options.mode) || 'beautify'
  const issues = validateHtmlStructure(text)
  if (mode === 'minify') return { output: minifyHtml(text), meta: { issues } }
  return { output: beautifyHtml(text), meta: { issues } }
}

// ─── CSS formatter ────────────────────────────────────────────────────────────

export function beautifyCss(css: string): string {
  let result = ''
  let indent = 0
  const chars = css.replace(/\s+/g, ' ').trim()
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!
    if (ch === '{') { result += ' {\n' + '  '.repeat(++indent); continue }
    if (ch === '}') { result += '\n' + '  '.repeat(--indent) + '}\n' + '  '.repeat(indent); continue }
    if (ch === ';') { result += ';\n' + '  '.repeat(indent); continue }
    result += ch
  }
  return result.trim()
}

export function minifyCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim()
}

export function processCssFormat(text: string, options: Record<string, unknown>): DevToolResponse {
  if (!text.trim()) return { error: 'Enter CSS to format.' }
  const mode = str(options.mode) || 'beautify'
  const braceBalance = (text.match(/{/g)?.length ?? 0) - (text.match(/}/g)?.length ?? 0)
  const issues = braceBalance !== 0 ? [`Unbalanced braces (${braceBalance > 0 ? 'missing }' : 'extra }'})`] : []
  if (mode === 'minify') return { output: minifyCss(text), meta: { issues } }
  return { output: beautifyCss(text), meta: { issues } }
}

// ─── JS formatter ─────────────────────────────────────────────────────────────

export function beautifyJs(js: string): string {
  let result = ''
  let indent = 0
  let inString: string | null = null
  for (let i = 0; i < js.length; i++) {
    const ch = js[i]!
    const prev = js[i - 1]
    if (inString) {
      result += ch
      if (ch === inString && prev !== '\\') inString = null
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = ch; result += ch; continue }
    if (ch === '{') { result += ' {\n' + '  '.repeat(++indent); continue }
    if (ch === '}') { result += '\n' + '  '.repeat(--indent) + '}'; continue }
    if (ch === ';') { result += ';\n' + '  '.repeat(indent); continue }
    result += ch
  }
  return result.trim()
}

export function minifyJs(js: string): string {
  return js
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}();,:])\s*/g, '$1')
    .trim()
}

export function validateJsSyntax(js: string): string | null {
  try {
    // eslint-disable-next-line no-new-func
    new Function(js)
    return null
  } catch (err) {
    return err instanceof Error ? err.message : 'Syntax error'
  }
}

export function processJsFormat(text: string, options: Record<string, unknown>): DevToolResponse {
  if (!text.trim()) return { error: 'Enter JavaScript to format.' }
  const mode = str(options.mode) || 'beautify'
  const syntaxError = validateJsSyntax(text)
  if (mode === 'minify') {
    if (syntaxError) return { error: `Syntax error: ${syntaxError}` }
    return { output: minifyJs(text) }
  }
  return { output: beautifyJs(text), meta: { syntaxError } }
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? padded : padded + '='.repeat(4 - (padded.length % 4))
  return base64ToUtf8(pad)
}

export function decodeJwt(token: string): DevToolResponse {
  const trimmed = token.trim().replace(/^Bearer\s+/i, '')
  const parts = trimmed.split('.')
  if (parts.length < 2) return { error: 'Invalid JWT structure. Expected header.payload[.signature].' }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]!))
    const payload = JSON.parse(base64UrlDecode(parts[1]!))
    const exp = typeof payload.exp === 'number' ? payload.exp : null
    const now = Math.floor(Date.now() / 1000)
    const expiration = exp
      ? {
          exp,
          expired: exp < now,
          expiresAt: new Date(exp * 1000).toISOString(),
          remainingSeconds: exp - now,
        }
      : null

    const report = [
      'HEADER',
      JSON.stringify(header, null, 2),
      '',
      'PAYLOAD',
      JSON.stringify(payload, null, 2),
      '',
      'SIGNATURE',
      parts[2] ? '(present — not verified)' : '(none)',
      '',
      'NOTE: This tool decodes JWTs only. It does NOT verify signatures.',
      ...(expiration
        ? [
            '',
            'EXPIRATION',
            `Expires: ${expiration.expiresAt}`,
            `Status: ${expiration.expired ? 'EXPIRED' : 'Valid (by time)'}`,
          ]
        : ['', 'EXPIRATION', 'No exp claim found.']),
    ]

    return {
      output: report.join('\n'),
      meta: { header, payload, expiration, hasSignature: Boolean(parts[2]) },
    }
  } catch {
    return { error: 'Failed to decode JWT. Check that segments are valid Base64URL.' }
  }
}

// ─── Cron ─────────────────────────────────────────────────────────────────────

export function buildCronExpression(options: Record<string, unknown>): DevToolResponse {
  const minute = str(options.minute) || '*'
  const hour = str(options.hour) || '*'
  const dayOfMonth = str(options.dayOfMonth) || '*'
  const month = str(options.month) || '*'
  const dayOfWeek = str(options.dayOfWeek) || '*'
  const expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

  const parts = expression.split(' ')
  if (parts.length !== 5) return { error: 'Cron expression must have exactly 5 fields.' }

  const explain: string[] = []
  const describe = (field: string, label: string) => {
    if (field === '*') explain.push(`Every ${label}`)
    else if (field.startsWith('*/')) explain.push(`Every ${field.slice(2)} ${label}s`)
    else explain.push(`${label}: ${field}`)
  }
  describe(minute, 'minute')
  describe(hour, 'hour')
  describe(dayOfMonth, 'day of month')
  describe(month, 'month')
  describe(dayOfWeek, 'day of week')

  return {
    output: expression,
    meta: { expression, explanation: explain.join('; ') },
  }
}

// ─── Color ────────────────────────────────────────────────────────────────────

export type Rgb = { r: number; g: number; b: number }
export type Hsl = { h: number; s: number; l: number }

export function hexToRgb(hex: string): Rgb | null {
  const cleaned = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(cleaned)) return null
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break
      case gn: h = ((bn - rn) / d + 2) / 6; break
      default: h = ((rn - gn) / d + 4) / 6
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const sn = s / 100, ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  let rp = 0, gp = 0, bp = 0
  if (h < 60) { rp = c; gp = x }
  else if (h < 120) { rp = x; gp = c }
  else if (h < 180) { gp = c; bp = x }
  else if (h < 240) { gp = x; bp = c }
  else if (h < 300) { rp = x; bp = c }
  else { rp = c; bp = x }
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  }
}

export function convertColor(options: Record<string, unknown>): DevToolResponse {
  const input = str(options.input)
  const from = str(options.from) || 'hex'
  if (!input) return { error: 'Enter a color value.' }

  let rgb: Rgb | null = null
  if (from === 'hex') {
    rgb = hexToRgb(input)
    if (!rgb) return { error: 'Invalid HEX color (use #RGB or #RRGGBB).' }
  } else if (from === 'rgb') {
    const m = input.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (!m) return { error: 'Invalid RGB (use r, g, b).' }
    rgb = { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) }
  } else if (from === 'hsl') {
    const m = input.match(/(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?/)
    if (!m) return { error: 'Invalid HSL (use h, s, l).' }
    rgb = hslToRgb({ h: Number(m[1]), s: Number(m[2]), l: Number(m[3]) })
  }

  if (!rgb) return { error: 'Could not parse color.' }
  const hsl = rgbToHsl(rgb)
  const hex = rgbToHex(rgb)

  return {
    output: `HEX: ${hex}\nRGB: ${rgb.r}, ${rgb.g}, ${rgb.b}\nHSL: ${hsl.h}, ${hsl.s}%, ${hsl.l}%`,
    meta: { hex, rgb, hsl },
  }
}

// ─── Diff ─────────────────────────────────────────────────────────────────────

export function processDiff(textA: string, textB: string): DevToolResponse {
  const diff = diffText(textA, textB)
  const added = diff.filter((d) => d.type === 'add').length
  const removed = diff.filter((d) => d.type === 'remove').length
  return {
    output: diff.map((d) => `${d.type === 'add' ? '+' : d.type === 'remove' ? '-' : ' '} ${d.line}`).join('\n'),
    meta: { diff, added, removed, unchanged: diff.filter((d) => d.type === 'equal').length },
  }
}

export type SideBySideLine = { left: string; right: string; leftType: DiffLine['type'] | 'pad'; rightType: DiffLine['type'] | 'pad' }

export function diffToSideBySide(diff: DiffLine[]): SideBySideLine[] {
  const rows: SideBySideLine[] = []
  let i = 0
  while (i < diff.length) {
    const cur = diff[i]!
    if (cur.type === 'equal') {
      rows.push({ left: cur.line, right: cur.line, leftType: 'equal', rightType: 'equal' })
      i++
    } else if (cur.type === 'remove' && diff[i + 1]?.type === 'add') {
      rows.push({ left: cur.line, right: diff[i + 1]!.line, leftType: 'remove', rightType: 'add' })
      i += 2
    } else if (cur.type === 'remove') {
      rows.push({ left: cur.line, right: '', leftType: 'remove', rightType: 'pad' })
      i++
    } else {
      rows.push({ left: '', right: cur.line, leftType: 'pad', rightType: 'add' })
      i++
    }
  }
  return rows
}

// ─── SQL formatter ────────────────────────────────────────────────────────────

const SQL_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
  'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'AS', 'DISTINCT', 'UNION',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'NOT', 'NULL', 'IS', 'IN', 'EXISTS', 'BETWEEN',
])

export function formatSql(sql: string): string {
  let result = sql.replace(/\s+/g, ' ').trim()
  for (const kw of SQL_KEYWORDS) {
    result = result.replace(new RegExp(`\\b${kw}\\b`, 'gi'), `\n${kw.toUpperCase()}`)
  }
  return result.replace(/^\n/, '').replace(/\n+/g, '\n').trim()
}

export function processSqlFormat(text: string): DevToolResponse {
  if (!text.trim()) return { error: 'Enter a SQL query to format.' }
  return { output: formatSql(text) }
}

// ─── YAML ─────────────────────────────────────────────────────────────────────

function parseYamlValue(raw: string): unknown {
  const v = raw.trim()
  if (v === 'true') return true
  if (v === 'false') return false
  if (v === 'null' || v === '~') return null
  if (/^-?\d+$/.test(v)) return Number(v)
  if (/^-?\d+\.\d+$/.test(v)) return Number(v)
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1)
  }
  return v
}

export function parseSimpleYaml(text: string): { value?: unknown; error?: string } {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const stack: { indent: number; obj: Record<string, unknown> }[] = [{ indent: -1, obj: {} }]
  let root: unknown = {}
  let currentArray: unknown[] | null = null
  let arrayKey: string | null = null

  for (let lineNo = 0; lineNo < lines.length; lineNo++) {
    const line = lines[lineNo]!
    if (!line.trim() || line.trim().startsWith('#')) continue

    const indent = line.search(/\S/)
    const trimmed = line.trim()

    if (trimmed.startsWith('- ')) {
      const item = parseYamlValue(trimmed.slice(2))
      if (!currentArray) {
        return { error: `Line ${lineNo + 1}: list item without parent array.` }
      }
      currentArray.push(item)
      continue
    }

    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) return { error: `Line ${lineNo + 1}: invalid YAML syntax.` }

    const key = trimmed.slice(0, colonIdx).trim()
    const rest = trimmed.slice(colonIdx + 1).trim()

    while (stack.length > 1 && indent <= stack[stack.length - 1]!.indent) {
      stack.pop()
      currentArray = null
    }

    const parent = stack[stack.length - 1]!.obj
    if (!rest) {
      const child: Record<string, unknown> = {}
      parent[key] = child
      stack.push({ indent, obj: child })
      root = stack[1]?.obj ?? child
      currentArray = null
    } else if (rest === '|' || rest === '>') {
      const block: string[] = []
      for (let j = lineNo + 1; j < lines.length; j++) {
        if (lines[j]!.search(/\S/) <= indent) break
        block.push(lines[j]!.trim())
        lineNo = j
      }
      parent[key] = block.join('\n')
    } else {
      parent[key] = parseYamlValue(rest)
      currentArray = null
    }

    if (Array.isArray(parent[key])) {
      currentArray = parent[key] as unknown[]
      arrayKey = key
    } else if (rest === '' && !Array.isArray(parent[key])) {
      // check next line for array
      const next = lines[lineNo + 1]
      if (next?.trim().startsWith('- ')) {
        const arr: unknown[] = []
        parent[key] = arr
        currentArray = arr
        arrayKey = key
      }
    }
    void arrayKey
    root = stack[1]?.obj ?? root
  }

  return { value: root }
}

export function processYaml(text: string, options: Record<string, unknown>): DevToolResponse {
  if (!text.trim()) return { error: 'Enter YAML to validate.' }
  const parsed = parseSimpleYaml(text)
  if (parsed.error) return { error: parsed.error }

  const mode = str(options.mode) || 'validate'
  if (mode === 'json') {
    return { output: JSON.stringify(parsed.value, null, 2), meta: { valid: true } }
  }
  return {
    output: 'YAML is valid.',
    meta: { valid: true, parsed: parsed.value },
  }
}

// ─── JSON generator ───────────────────────────────────────────────────────────

export function generateSampleJson(options: Record<string, unknown>): DevToolResponse {
  const depth = Math.min(num(options.depth, 2), 5)
  const arraySize = Math.min(num(options.arraySize, 3), 10)
  const includeNull = options.includeNull === true

  const sampleNames = ['Alice', 'Bob', 'Carol', 'Dave', 'Eve']
  const sampleWords = ['alpha', 'beta', 'gamma', 'delta']

  function gen(level: number): unknown {
    if (level <= 0) {
      const types: unknown[] = [
        sampleNames[Math.floor(Math.random() * sampleNames.length)],
        Math.floor(Math.random() * 1000),
        Math.random() > 0.5,
      ]
      if (includeNull) types.push(null)
      return types[Math.floor(Math.random() * types.length)]
    }
    const obj: Record<string, unknown> = {
      id: crypto.randomUUID(),
      name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
      active: Math.random() > 0.3,
      score: Math.round(Math.random() * 100),
      tags: Array.from({ length: arraySize }, () => sampleWords[Math.floor(Math.random() * sampleWords.length)]),
      nested: gen(level - 1),
    }
    if (includeNull) obj.optional = null
    return obj
  }

  const data = Array.from({ length: arraySize }, () => gen(depth))
  const output = JSON.stringify(options.wrap === false ? gen(depth) : data, null, 2)
  return { output, meta: { depth, arraySize } }
}

// ─── Timestamp ────────────────────────────────────────────────────────────────

export function convertTimestamp(text: string, options: Record<string, unknown>): DevToolResponse {
  const mode = str(options.mode) || 'toDate'
  const tzOffset = num(options.tzOffsetMinutes, -new Date().getTimezoneOffset())

  if (mode === 'toDate') {
    const raw = text.trim()
    if (!raw) return { error: 'Enter a Unix timestamp.' }
    let ms = Number(raw)
    if (!Number.isFinite(ms)) return { error: 'Invalid timestamp.' }
    if (raw.length <= 10) ms *= 1000
    const date = new Date(ms + tzOffset * 60 * 1000)
    return {
      output: [
        `UTC: ${new Date(ms).toISOString()}`,
        `Local (offset ${tzOffset}min): ${date.toISOString()}`,
        `Readable: ${date.toLocaleString()}`,
        `Milliseconds: ${ms}`,
      ].join('\n'),
      meta: { ms, date: new Date(ms).toISOString() },
    }
  }

  const raw = text.trim()
  if (!raw) return { error: 'Enter a date string.' }
  const ms = Date.parse(raw)
  if (!Number.isFinite(ms)) return { error: 'Invalid date format.' }
  return {
    output: `Unix (seconds): ${Math.floor(ms / 1000)}\nUnix (ms): ${ms}`,
    meta: { seconds: Math.floor(ms / 1000), ms },
  }
}

// ─── HTML entities ────────────────────────────────────────────────────────────

const ENTITY_MAP: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}

export function encodeHtmlEntities(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ENTITY_MAP[c] ?? c)
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
}

export function processHtmlEntities(text: string, options: Record<string, unknown>): DevToolResponse {
  if (!text) return { error: 'Enter text to convert.' }
  const mode = str(options.mode) || 'encode'
  return { output: mode === 'decode' ? decodeHtmlEntities(text) : encodeHtmlEntities(text) }
}

// ─── CSV ↔ JSON ───────────────────────────────────────────────────────────────

export function parseCsv(text: string): { rows?: Record<string, string>[]; error?: string } {
  const lines = text.replace(/\r\n/g, '\n').split('\n').filter((l) => l.trim())
  if (!lines.length) return { error: 'CSV is empty.' }

  const parseRow = (line: string): string[] => {
    const cells: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]!
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++ }
        else inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur.trim())
        cur = ''
      } else cur += ch
    }
    cells.push(cur.trim())
    return cells
  }

  const headers = parseRow(lines[0]!)
  if (!headers.length) return { error: 'CSV header row is missing.' }

  const rows = lines.slice(1).map((line, idx) => {
    const cells = parseRow(line)
    if (cells.length !== headers.length) {
      throw new Error(`Row ${idx + 2}: expected ${headers.length} columns, got ${cells.length}.`)
    }
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = cells[i] ?? '' })
    return row
  })

  return { rows }
}

export function csvToJson(text: string): DevToolResponse {
  try {
    const parsed = parseCsv(text)
    if (parsed.error) return { error: parsed.error }
    return { output: JSON.stringify(parsed.rows, null, 2), meta: { rowCount: parsed.rows?.length } }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'CSV parse failed.' }
  }
}

export function jsonToCsv(text: string): DevToolResponse {
  const trimmed = text.trim()
  if (!trimmed) return { error: 'Enter JSON to convert.' }
  try {
    const data = JSON.parse(trimmed) as unknown
    const rows = Array.isArray(data) ? data : [data]
    if (!rows.length || typeof rows[0] !== 'object' || rows[0] === null) {
      return { error: 'JSON must be an array of objects or a single object.' }
    }
    const headers = [...new Set(rows.flatMap((r) => Object.keys(r as object)))]
    const escape = (v: unknown) => {
      const s = String(v ?? '')
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escape((r as Record<string, unknown>)[h])).join(',')),
    ]
    return { output: lines.join('\n'), meta: { rowCount: rows.length, columns: headers.length } }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Invalid JSON.' }
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function processDevTool(slug: DevToolSlug, request: DevToolRequest): DevToolResponse {
  const text = request.text ?? ''
  const options = request.options ?? {}

  switch (slug) {
    case 'base64-encode':
      return processBase64(text, options)
    case 'regex-tester':
      return testRegex(text, options)
    case 'uuid-generator':
      return generateUuids(options)
    case 'url-encoder':
      return processUrlCodec(text, options)
    case 'html-formatter':
      return processHtmlFormat(text, options)
    case 'css-formatter':
      return processCssFormat(text, options)
    case 'js-formatter':
      return processJsFormat(text, options)
    case 'jwt-decoder':
      return decodeJwt(text)
    case 'cron-generator':
      return buildCronExpression(options)
    case 'color-converter':
      return convertColor(options)
    case 'diff-checker':
      return processDiff(request.textA ?? '', request.textB ?? '')
    case 'sql-formatter':
      return processSqlFormat(text)
    case 'yaml-validator':
      return processYaml(text, options)
    case 'lorem-json':
      return generateSampleJson(options)
    case 'timestamp-converter':
      return convertTimestamp(text, options)
    case 'html-entity':
      return processHtmlEntities(text, options)
    case 'csv-to-json':
      return csvToJson(text)
    case 'json-to-csv':
      return jsonToCsv(text)
    case 'hash-generator':
      return { error: 'Use async hashText() or hashFileData() for hashing.' }
    case 'markdown-preview':
      return { error: 'Use markdownToHtml() in the preview component.' }
    default:
      return { error: 'Unknown developer tool.' }
  }
}
