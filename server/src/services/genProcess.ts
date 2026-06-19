export type GenToolSlug =
  | 'password-generator'
  | 'barcode-generator'
  | 'color-palette'
  | 'logo-maker'
  | 'meme-generator'
  | 'name-generator'

export type GenToolRequest = {
  text?: string
  options?: Record<string, unknown>
}

export type GenToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'
export type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC'
export type PaletteMode = 'random' | 'harmonious' | 'complementary' | 'analogous' | 'triadic'
export type LogoIcon = 'circle' | 'square' | 'star' | 'hexagon' | 'bolt' | 'heart'
export type LogoFont = 'sans' | 'serif' | 'mono'
export type NameCategory = 'project' | 'business' | 'startup' | 'brand'

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SPECIAL = '!@#$%^&*()-_=+[]{}|;:,.<>?'

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function num(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function secureRandomInt(max: number): number {
  if (max <= 0) return 0
  return Math.floor(Math.random() * max)
}

function pickRandom(chars: string, count: number): string {
  let result = ''
  for (let i = 0; i < count; i += 1) {
    result += chars[secureRandomInt(chars.length)]
  }
  return result
}

function shuffleSecure(input: string): string {
  const chars = input.split('')
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = secureRandomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

export function scorePasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak'
  let score = 0
  if (password.length >= 12) score += 1
  if (password.length >= 16) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 2) return 'weak'
  if (score <= 4) return 'fair'
  if (score <= 5) return 'good'
  return 'strong'
}

export function generatePasswords(options: {
  length: number
  count: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  special: boolean
}): { passwords: string[]; strength: PasswordStrength } | { error: string } {
  const length = Math.round(options.length)
  const count = Math.round(options.count)

  if (length < 4 || length > 128) return { error: 'Password length must be between 4 and 128.' }
  if (count < 1 || count > 50) return { error: 'Generate between 1 and 50 passwords at a time.' }

  let charset = ''
  const required: string[] = []
  if (options.uppercase) {
    charset += UPPER
    required.push(UPPER[secureRandomInt(UPPER.length)])
  }
  if (options.lowercase) {
    charset += LOWER
    required.push(LOWER[secureRandomInt(LOWER.length)])
  }
  if (options.numbers) {
    charset += DIGITS
    required.push(DIGITS[secureRandomInt(DIGITS.length)])
  }
  if (options.special) {
    charset += SPECIAL
    required.push(SPECIAL[secureRandomInt(SPECIAL.length)])
  }
  if (!charset) return { error: 'Select at least one character type.' }

  const passwords: string[] = []
  for (let i = 0; i < count; i += 1) {
    const remaining = length - required.length
    const body = pickRandom(charset, Math.max(0, remaining))
    passwords.push(shuffleSecure(required.join('') + body))
  }

  return { passwords, strength: scorePasswordStrength(passwords[0] ?? '') }
}

function eanCheckDigit(digits: string): number {
  let sum = 0
  for (let i = 0; i < digits.length; i += 1) {
    const n = Number(digits[i])
    sum += i % 2 === 0 ? n : n * 3
  }
  return (10 - (sum % 10)) % 10
}

export function validateBarcodeData(format: BarcodeFormat, data: string): string | null {
  const value = data.trim()
  if (!value) return 'Enter barcode data.'

  if (format === 'CODE128') {
    if (!/^[\x20-\x7E]+$/.test(value)) return 'CODE128 supports printable ASCII characters only.'
    if (value.length > 80) return 'CODE128 data is too long (max 80 characters).'
    return null
  }

  if (format === 'EAN13') {
    if (!/^\d{12,13}$/.test(value)) {
      return 'EAN-13 requires 12 digits (check digit added) or 13 digits with valid check digit.'
    }
    const body = value.length === 13 ? value.slice(0, 12) : value
    const expected = String(eanCheckDigit(body))
    const actual = value.length === 13 ? value[12] : null
    if (actual !== null && actual !== expected) return `Invalid EAN-13 check digit. Expected ${expected}.`
    return null
  }

  if (format === 'UPC') {
    if (!/^\d{11,12}$/.test(value)) {
      return 'UPC requires 11 digits (check digit added) or 12 digits with valid check digit.'
    }
    const body = value.length === 12 ? value.slice(0, 11) : value
    const expected = String(eanCheckDigit(body))
    const actual = value.length === 12 ? value[11] : null
    if (actual !== null && actual !== expected) return `Invalid UPC check digit. Expected ${expected}.`
    return null
  }

  return 'Unsupported barcode format.'
}

export function normalizeBarcodeData(format: BarcodeFormat, data: string): string {
  const value = data.trim()
  if (format === 'EAN13' && /^\d{12}$/.test(value)) return value + String(eanCheckDigit(value))
  if (format === 'UPC' && /^\d{11}$/.test(value)) return value + String(eanCheckDigit(value))
  return value
}

function hslToHex(h: number, s: number, l: number): string {
  const sat = s / 100
  const light = l / 100
  const c = (1 - Math.abs(2 * light - 1)) * sat
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = light - c / 2
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) {
    r = c
    g = x
  } else if (h < 120) {
    r = x
    g = c
  } else if (h < 180) {
    g = c
    b = x
  } else if (h < 240) {
    g = x
    b = c
  } else if (h < 300) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  }
}

function paletteFromHue(baseHue: number, mode: PaletteMode): string[] {
  const hues: number[] = []
  switch (mode) {
    case 'complementary':
      hues.push(baseHue, (baseHue + 180) % 360)
      break
    case 'analogous':
      hues.push((baseHue + 330) % 360, baseHue, (baseHue + 30) % 360)
      break
    case 'triadic':
      hues.push(baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360)
      break
    case 'harmonious':
      hues.push(baseHue, baseHue, baseHue, baseHue, baseHue)
      break
    default:
      for (let i = 0; i < 5; i += 1) hues.push(secureRandomInt(360))
      break
  }

  return hues.map((hue, index) => {
    const saturation = mode === 'harmonious' ? 55 + index * 8 : 65 + secureRandomInt(20)
    const lightness = mode === 'harmonious' ? 35 + index * 12 : 40 + secureRandomInt(25)
    return hslToHex(hue, Math.min(95, saturation), Math.min(85, lightness))
  })
}

export function generateColorPalette(options: { mode: PaletteMode; baseColor?: string }) {
  let baseHue = secureRandomInt(360)
  const base = str(options.baseColor)
  if (base && /^#[0-9A-Fa-f]{6}$/.test(base)) {
    const { r, g, b } = hexToRgb(base)
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const d = max - min
    if (d > 0) {
      if (max === r) baseHue = ((g - b) / d) % 6
      else if (max === g) baseHue = (b - r) / d + 2
      else baseHue = (r - g) / d + 4
      baseHue = Math.round(baseHue * 60)
      if (baseHue < 0) baseHue += 360
    }
  }

  const hexes =
    options.mode === 'random'
      ? paletteFromHue(secureRandomInt(360), 'random')
      : paletteFromHue(baseHue, options.mode)

  return {
    colors: hexes.map((hex) => {
      const { r, g, b } = hexToRgb(hex)
      return { hex, rgb: `rgb(${r}, ${g}, ${b})` }
    }),
  }
}

function logoIconSvg(icon: LogoIcon, primary: string, size: number): string {
  const cx = size / 2
  const cy = size * 0.38
  switch (icon) {
    case 'square':
      return `<rect x="${cx - 70}" y="${cy - 70}" width="140" height="140" rx="16" fill="${primary}"/>`
    case 'star':
      return `<polygon points="${cx},${cy - 80} ${cx + 24},${cy - 20} ${cx + 84},${cy - 20} ${cx + 36},${cy + 16} ${cx + 56},${cy + 76} ${cx},${cy + 44} ${cx - 56},${cy + 76} ${cx - 36},${cy + 16} ${cx - 84},${cy - 20} ${cx - 24},${cy - 20}" fill="${primary}"/>`
    case 'hexagon':
      return `<polygon points="${cx},${cy - 80} ${cx + 70},${cy - 40} ${cx + 70},${cy + 40} ${cx},${cy + 80} ${cx - 70},${cy + 40} ${cx - 70},${cy - 40}" fill="${primary}"/>`
    case 'bolt':
      return `<path d="M${cx + 10} ${cy - 80} L${cx - 30} ${cy + 4} H${cx + 6} L${cx - 14} ${cy + 80} L${cx + 50} ${cy - 10} H${cx + 18} Z" fill="${primary}"/>`
    case 'heart':
      return `<path d="M${cx} ${cy + 70} C${cx - 90} ${cy + 10} ${cx - 50} ${cy - 70} ${cx} ${cy - 20} C${cx + 50} ${cy - 70} ${cx + 90} ${cy + 10} ${cx} ${cy + 70} Z" fill="${primary}"/>`
    default:
      return `<circle cx="${cx}" cy="${cy}" r="78" fill="${primary}"/>`
  }
}

const LOGO_FONTS: Record<LogoFont, string> = {
  sans: 'Arial, Helvetica, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"Courier New", Courier, monospace',
}

export function generateLogoSvg(options: {
  text: string
  icon: LogoIcon
  primaryColor: string
  secondaryColor: string
  font: LogoFont
  size?: number
}): { svg: string } | { error: string } {
  const text = str(options.text)
  if (!text) return { error: 'Enter logo text.' }
  if (text.length > 40) return { error: 'Logo text must be 40 characters or fewer.' }

  const primary = /^#[0-9A-Fa-f]{6}$/.test(str(options.primaryColor)) ? str(options.primaryColor) : '#4f46e5'
  const secondary = /^#[0-9A-Fa-f]{6}$/.test(str(options.secondaryColor)) ? str(options.secondaryColor) : '#111827'
  const size = Math.min(1024, Math.max(256, num(options.size, 512)))
  const fontFamily = LOGO_FONTS[options.font] ?? LOGO_FONTS.sans
  const fontSize = Math.max(28, Math.round(size * 0.09))
  const safeText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  ${logoIconSvg(options.icon, primary, size)}
  <text x="${size / 2}" y="${size * 0.78}" text-anchor="middle" font-family="${fontFamily}" font-size="${fontSize}" font-weight="700" fill="${secondary}">${safeText}</text>
</svg>`

  return { svg }
}

const NAME_PARTS: Record<NameCategory, { prefixes: string[]; cores: string[]; suffixes: string[] }> = {
  project: {
    prefixes: ['Nova', 'Swift', 'Bright', 'Clear', 'Prime', 'Core', 'Pulse', 'Spark'],
    cores: ['Flow', 'Stack', 'Grid', 'Sync', 'Forge', 'Craft', 'Link', 'Wave'],
    suffixes: ['Hub', 'Kit', 'Lab', 'Works', 'Base', 'Desk', 'Box', 'Pad'],
  },
  business: {
    prefixes: ['Summit', 'Harbor', 'Cedar', 'Silver', 'Golden', 'North', 'Urban', 'Prime'],
    cores: ['Consulting', 'Partners', 'Solutions', 'Group', 'Associates', 'Services', 'Studio', 'Collective'],
    suffixes: ['Co.', 'LLC', 'Inc.', 'Ltd.', '& Co.', 'International', 'Worldwide', ''],
  },
  startup: {
    prefixes: ['Launch', 'Orbit', 'Rocket', 'Nimbus', 'Vertex', 'Apex', 'Kite', 'Beam'],
    cores: ['AI', 'Cloud', 'Data', 'Fin', 'Health', 'Eco', 'Dev', 'Mobility'],
    suffixes: ['Labs', 'Tech', 'IO', 'HQ', 'Works', 'Systems', 'App', 'Platform'],
  },
  brand: {
    prefixes: ['Luma', 'Vero', 'Kora', 'Mira', 'Zeno', 'Arlo', 'Nexo', 'Vela'],
    cores: ['Wear', 'Home', 'Fit', 'Glow', 'Pure', 'Bold', 'Nest', 'Peak'],
    suffixes: ['Co', 'Studio', 'Supply', 'Market', 'Goods', 'Life', 'Style', ''],
  },
}

export function generateNamesLocal(options: {
  category: NameCategory
  keyword?: string
  count: number
}): string[] {
  const bank = NAME_PARTS[options.category]
  const keyword = str(options.keyword)
  const count = Math.min(30, Math.max(1, Math.round(options.count)))
  const names = new Set<string>()

  while (names.size < count) {
    const prefix = bank.prefixes[secureRandomInt(bank.prefixes.length)]
    const core = bank.cores[secureRandomInt(bank.cores.length)]
    const suffix = bank.suffixes[secureRandomInt(bank.suffixes.length)]
    const parts = keyword ? [keyword, core, suffix].filter(Boolean) : [prefix, core, suffix].filter(Boolean)
    names.add(parts.join(suffix && !keyword ? '' : ' ').replace(/\s+/g, ' ').trim())
  }

  return [...names]
}

export function processGenTool(slug: GenToolSlug, request: GenToolRequest): GenToolResponse {
  const options = request.options ?? {}

  switch (slug) {
    case 'password-generator': {
      const result = generatePasswords({
        length: num(options.length, 16),
        count: num(options.count, 1),
        uppercase: bool(options.uppercase, true),
        lowercase: bool(options.lowercase, true),
        numbers: bool(options.numbers, true),
        special: bool(options.special, true),
      })
      if ('error' in result) return { error: result.error }
      return { output: result.passwords.join('\n'), meta: { strength: result.strength, count: result.passwords.length } }
    }
    case 'barcode-generator': {
      const format = (str(options.format).toUpperCase() || 'CODE128') as BarcodeFormat
      const data = str(options.data) || str(request.text)
      const validation = validateBarcodeData(format, data)
      if (validation) return { error: validation }
      return { output: normalizeBarcodeData(format, data), meta: { format } }
    }
    case 'color-palette': {
      const palette = generateColorPalette({ mode: (str(options.mode) as PaletteMode) || 'random', baseColor: str(options.baseColor) })
      const lines = palette.colors.map((c, i) => `Color ${i + 1}: ${c.hex}  ${c.rgb}`)
      return { output: lines.join('\n'), meta: { colors: palette.colors } }
    }
    case 'logo-maker': {
      const result = generateLogoSvg({
        text: str(options.text) || str(request.text),
        icon: (str(options.icon) as LogoIcon) || 'circle',
        primaryColor: str(options.primaryColor) || '#4f46e5',
        secondaryColor: str(options.secondaryColor) || '#111827',
        font: (str(options.font) as LogoFont) || 'sans',
        size: num(options.size, 512),
      })
      if ('error' in result) return { error: result.error }
      return { output: result.svg, meta: { format: 'svg' } }
    }
    case 'name-generator': {
      const names = generateNamesLocal({
        category: (str(options.category) as NameCategory) || 'project',
        keyword: str(options.keyword),
        count: num(options.count, 10),
      })
      return { output: names.join('\n'), meta: { count: names.length } }
    }
    case 'meme-generator':
      return { error: 'Meme rendering is handled client-side.' }
    default:
      return { error: 'Unknown generation tool.' }
  }
}
