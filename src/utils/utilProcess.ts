export type UtilToolSlug =
  | 'stopwatch'
  | 'countdown-timer'
  | 'pomodoro-timer'
  | 'random-number'
  | 'dice-roller'
  | 'coin-flip'
  | 'decision-maker'
  | 'notepad'
  | 'clipboard-manager'
  | 'file-hash'
  | 'exif-viewer'
  | 'color-picker-tool'
  | 'screen-color'
  | 'pixel-ruler'
  | 'bulk-rename'

export type UtilToolRequest = {
  text?: string
  options?: Record<string, unknown>
}

export type UtilToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

function num(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function secureRandomInt(min: number, max: number): number {
  const low = Math.ceil(min)
  const high = Math.floor(max)
  if (high < low) throw new Error('Invalid range: min must be ≤ max.')
  const range = high - low + 1
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return low + (buf[0]! % range)
}

export function formatElapsed(ms: number): string {
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  const seconds = Math.floor((ms % 60_000) / 1000)
  const centis = Math.floor((ms % 1000) / 10)
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centis).padStart(2, '0')}`
}

export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export function playBeep(): void {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.value = 0.15
    osc.start()
    osc.stop(ctx.currentTime + 0.25)
    osc.onended = () => void ctx.close()
  } catch {
    // audio optional
  }
}

export function randomNumberInRange(min: number, max: number, count: number): number[] {
  const results: number[] = []
  for (let i = 0; i < count; i++) {
    results.push(secureRandomInt(min, max))
  }
  return results
}

export function rollDice(sides: number, count: number): number[] {
  if (sides < 2) throw new Error('Dice must have at least 2 sides.')
  return randomNumberInRange(1, sides, count)
}

export function flipCoin(): 'Heads' | 'Tails' {
  return secureRandomInt(0, 1) === 0 ? 'Heads' : 'Tails'
}

export function pickDecision(options: string[]): string {
  const cleaned = options.map((o) => o.trim()).filter(Boolean)
  if (!cleaned.length) throw new Error('Add at least one option.')
  return cleaned[secureRandomInt(0, cleaned.length - 1)]!
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${c(r)}${c(g)}${c(b)}`
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '').trim()
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(cleaned)) return null
  const full = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  }
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export type BulkRenameEntry = {
  originalName: string
  newName: string
}

export function applyBulkRename(
  files: File[],
  pattern: string,
  startIndex = 1,
): BulkRenameEntry[] {
  if (!files.length) return []
  const pad = String(files.length).length
  return files.map((file, index) => {
    const dot = file.name.lastIndexOf('.')
    const base = dot > 0 ? file.name.slice(0, dot) : file.name
    const ext = dot > 0 ? file.name.slice(dot) : ''
    const n = startIndex + index
    const newName = pattern
      .replace(/\{name\}/gi, base)
      .replace(/\{ext\}/gi, ext.replace(/^\./, ''))
      .replace(/\{index\}/gi, String(n))
      .replace(/\{index:\d+\}/gi, (m) => {
        const width = Number(m.match(/\d+/)?.[0] ?? pad)
        return String(n).padStart(width, '0')
      })
    return { originalName: file.name, newName: newName.includes('.') ? newName : `${newName}${ext}` }
  })
}

export function processUtilTool(slug: UtilToolSlug, request: UtilToolRequest): UtilToolResponse {
  const options = request.options ?? {}

  switch (slug) {
    case 'random-number': {
      const min = num(options.min, 1)
      const max = num(options.max, 100)
      const count = Math.min(100, Math.max(1, num(options.count, 1)))
      try {
        const values = randomNumberInRange(min, max, count)
        return {
          output: values.join('\n'),
          meta: { values, min, max, count },
        }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Generation failed.' }
      }
    }
    case 'dice-roller': {
      const sides = Math.min(100, Math.max(2, num(options.sides, 6)))
      const count = Math.min(20, Math.max(1, num(options.count, 1)))
      try {
        const rolls = rollDice(sides, count)
        const total = rolls.reduce((a, b) => a + b, 0)
        return {
          output: rolls.join(', '),
          meta: { rolls, total, sides, count },
        }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Roll failed.' }
      }
    }
    case 'coin-flip': {
      const result = flipCoin()
      return { output: result, meta: { result } }
    }
    case 'decision-maker': {
      const optionsList = String(request.text ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      try {
        const pick = pickDecision(optionsList)
        return { output: pick, meta: { pick, options: optionsList } }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Decision failed.' }
      }
    }
    default:
      return { error: 'This utility runs interactively in the browser.' }
  }
}
