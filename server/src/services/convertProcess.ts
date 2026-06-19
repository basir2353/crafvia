export type ConvertToolSlug =
  | 'length-converter'
  | 'weight-converter'
  | 'temperature-converter'
  | 'speed-converter'
  | 'area-converter'
  | 'volume-converter'
  | 'time-converter'
  | 'data-converter'
  | 'angle-converter'
  | 'pressure-converter'
  | 'energy-converter'
  | 'currency-converter'

export type ConvertToolRequest = {
  text?: string
  options?: Record<string, unknown>
}

export type ConvertToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

export type DataSizeMode = 'binary' | 'decimal'

const PI = Math.PI

function num(value: unknown): number {
  const n = Number(value)
  return n
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function fmt(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return '—'
  if (Math.abs(value) >= 1e9 || (Math.abs(value) > 0 && Math.abs(value) < 1e-6)) {
    return value.toExponential(6)
  }
  return round(value, decimals).toLocaleString('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  })
}

function convertLinear(
  value: number,
  from: string,
  to: string,
  table: Record<string, number>,
): number {
  const fromFactor = table[from]
  const toFactor = table[to]
  if (!fromFactor || !toFactor) throw new Error('Unsupported unit.')
  return (value * fromFactor) / toFactor
}

// ─── Length (base: meter) ─────────────────────────────────────────────────────

const LENGTH_TO_M: Record<string, number> = {
  meter: 1,
  kilometer: 1000,
  centimeter: 0.01,
  millimeter: 0.001,
  mile: 1609.344,
  yard: 0.9144,
  foot: 0.3048,
  inch: 0.0254,
}

export const LENGTH_UNITS = Object.keys(LENGTH_TO_M)

// ─── Weight (base: gram) ──────────────────────────────────────────────────────

const WEIGHT_TO_G: Record<string, number> = {
  kilogram: 1000,
  gram: 1,
  milligram: 0.001,
  pound: 453.59237,
  ounce: 28.349523125,
  ton: 1_000_000,
}

export const WEIGHT_UNITS = Object.keys(WEIGHT_TO_G)

// ─── Speed (base: m/s) ────────────────────────────────────────────────────────

const SPEED_TO_MS: Record<string, number> = {
  'km/h': 1000 / 3600,
  mph: 1609.344 / 3600,
  'm/s': 1,
  knot: 1852 / 3600,
}

export const SPEED_UNITS = Object.keys(SPEED_TO_MS)

// ─── Area (base: m²) ────────────────────────────────────────────────────────

const AREA_TO_M2: Record<string, number> = {
  'square meter': 1,
  'square kilometer': 1_000_000,
  'square foot': 0.09290304,
  'square yard': 0.83612736,
  acre: 4046.8564224,
  hectare: 10_000,
}

export const AREA_UNITS = Object.keys(AREA_TO_M2)

// ─── Volume (base: liter) ───────────────────────────────────────────────────

const VOLUME_TO_L: Record<string, number> = {
  liter: 1,
  milliliter: 0.001,
  'cubic meter': 1000,
  gallon: 3.785411784,
  quart: 0.946352946,
  pint: 0.473176473,
}

export const VOLUME_UNITS = Object.keys(VOLUME_TO_L)

// ─── Time duration (base: second) ───────────────────────────────────────────

const TIME_TO_S: Record<string, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86_400,
  week: 604_800,
  month: 2_629_800,
  year: 31_557_600,
}

export const TIME_UNITS = Object.keys(TIME_TO_S)

// ─── Data size (base: byte) ─────────────────────────────────────────────────

function dataTable(mode: DataSizeMode): Record<string, number> {
  const base = mode === 'binary' ? 1024 : 1000
  return {
    bit: 0.125,
    byte: 1,
    KB: base,
    MB: base ** 2,
    GB: base ** 3,
    TB: base ** 4,
    PB: base ** 5,
  }
}

export const DATA_UNITS = ['bit', 'byte', 'KB', 'MB', 'GB', 'TB', 'PB']

// ─── Angle (base: radian) ─────────────────────────────────────────────────────

const ANGLE_TO_RAD: Record<string, number> = {
  degree: PI / 180,
  radian: 1,
  gradian: PI / 200,
}

export const ANGLE_UNITS = Object.keys(ANGLE_TO_RAD)

// ─── Pressure (base: pascal) ──────────────────────────────────────────────────

const PRESSURE_TO_PA: Record<string, number> = {
  pascal: 1,
  kilopascal: 1000,
  bar: 100_000,
  psi: 6894.757293168,
  atmosphere: 101_325,
}

export const PRESSURE_UNITS = Object.keys(PRESSURE_TO_PA)

// ─── Energy (base: joule) ─────────────────────────────────────────────────────

const ENERGY_TO_J: Record<string, number> = {
  joule: 1,
  kilojoule: 1000,
  calorie: 4.184,
  kilocalorie: 4184,
  'watt hour': 3600,
  'kilowatt hour': 3_600_000,
}

export const ENERGY_UNITS = Object.keys(ENERGY_TO_J)

// ─── Temperature ────────────────────────────────────────────────────────────

function convertTemperature(value: number, from: string, to: string): number {
  let celsius: number
  switch (from) {
    case 'celsius':
      celsius = value
      break
    case 'fahrenheit':
      celsius = ((value - 32) * 5) / 9
      break
    case 'kelvin':
      celsius = value - 273.15
      break
    default:
      throw new Error('Unsupported temperature unit.')
  }
  switch (to) {
    case 'celsius':
      return celsius
    case 'fahrenheit':
      return (celsius * 9) / 5 + 32
    case 'kelvin':
      return celsius + 273.15
    default:
      throw new Error('Unsupported temperature unit.')
  }
}

export const TEMPERATURE_UNITS = ['celsius', 'fahrenheit', 'kelvin']

// ─── Timezone ─────────────────────────────────────────────────────────────────

export const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
] as const

function parseDateTimeParts(isoLocal: string): {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
} | null {
  const match = isoLocal.trim().match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/)
  if (!match) return null
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: Number(match[6] ?? 0),
  }
}

function partsInTimeZone(utcMs: number, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = formatter.formatToParts(new Date(utcMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string,
): number {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second)
  for (let offsetMin = -16 * 60; offsetMin <= 16 * 60; offsetMin += 1) {
    const candidate = utcGuess - offsetMin * 60_000
    const parts = partsInTimeZone(candidate, timeZone)
    if (
      parts.year === year &&
      parts.month === month &&
      parts.day === day &&
      parts.hour === hour &&
      parts.minute === minute &&
      parts.second === second
    ) {
      return candidate
    }
  }
  return utcGuess
}

function formatInTimeZone(utcMs: number, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date(utcMs))
}

export function convertTimeZone(options: Record<string, unknown>): ConvertToolResponse {
  const mode = String(options.mode ?? 'duration')
  if (mode === 'timezone') {
    const isoLocal = String(options.dateTime ?? '')
    const fromZone = String(options.fromZone ?? 'UTC')
    const toZone = String(options.toZone ?? 'UTC')
    const parts = parseDateTimeParts(isoLocal)
    if (!parts) return { error: 'Enter a valid date and time (YYYY-MM-DDTHH:MM).' }

    try {
      const utcMs = zonedLocalToUtc(
        parts.year,
        parts.month,
        parts.day,
        parts.hour,
        parts.minute,
        parts.second,
        fromZone,
      )
      const fromFormatted = formatInTimeZone(utcMs, fromZone)
      const toFormatted = formatInTimeZone(utcMs, toZone)
      return {
        output: `${fromFormatted}\n→\n${toFormatted}`,
        meta: { utcMs, fromZone, toZone },
      }
    } catch {
      return { error: 'Timezone conversion failed. Check timezone names.' }
    }
  }

  const from = String(options.from ?? 'hour')
  const to = String(options.to ?? 'minute')
  const value = num(options.value)
  if (!Number.isFinite(value)) return { error: 'Enter a valid value to convert.' }

  try {
    const result = convertLinear(value, from, to, TIME_TO_S)
    return {
      output: `${fmt(value, 4)} ${from} = ${fmt(result, 6)} ${to}`,
      meta: { result: round(result, 8), from, to },
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Conversion failed.' }
  }
}

// ─── Linear converter helper ──────────────────────────────────────────────────

function linearConvert(
  options: Record<string, unknown>,
  table: Record<string, number>,
  decimals = 6,
): ConvertToolResponse {
  const from = String(options.from ?? '')
  const to = String(options.to ?? '')
  const value = num(options.value)
  if (!Number.isFinite(value)) return { error: 'Enter a valid value to convert.' }

  try {
    const result = convertLinear(value, from, to, table)
    return {
      output: `${fmt(value, 4)} ${from} = ${fmt(result, decimals)} ${to}`,
      meta: { result: round(result, decimals), from, to },
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Conversion failed.' }
  }
}

export function convertCurrencyAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>,
  base: string,
): ConvertToolResponse {
  if (!Number.isFinite(amount)) return { error: 'Enter a valid amount.' }
  const fromCode = from.toUpperCase()
  const toCode = to.toUpperCase()
  const baseCode = base.toUpperCase()

  if (!rates[fromCode] && fromCode !== baseCode) {
    return { error: `Exchange rate unavailable for ${fromCode}.` }
  }
  if (!rates[toCode] && toCode !== baseCode) {
    return { error: `Exchange rate unavailable for ${toCode}.` }
  }

  const fromRate = fromCode === baseCode ? 1 : rates[fromCode]
  const toRate = toCode === baseCode ? 1 : rates[toCode]
  if (!fromRate || !toRate) return { error: 'Exchange rate unavailable.' }

  const inBase = amount / fromRate
  const result = inBase * toRate

  return {
    output: `${fmt(amount, 2)} ${fromCode} = ${fmt(result, 4)} ${toCode}`,
    meta: { result: round(result, 6), from: fromCode, to: toCode, rate: toRate / fromRate },
  }
}

export const CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'PKR',
  'AED',
  'SAR',
  'INR',
  'CAD',
  'AUD',
  'JPY',
  'CHF',
  'CNY',
  'SGD',
  'NZD',
  'ZAR',
  'TRY',
  'MXN',
  'BRL',
  'KRW',
  'HKD',
] as const

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function processConvertTool(slug: ConvertToolSlug, request: ConvertToolRequest): ConvertToolResponse {
  const options = request.options ?? {}

  switch (slug) {
    case 'length-converter':
      return linearConvert(options, LENGTH_TO_M)
    case 'weight-converter':
      return linearConvert(options, WEIGHT_TO_G)
    case 'speed-converter':
      return linearConvert(options, SPEED_TO_MS)
    case 'area-converter':
      return linearConvert(options, AREA_TO_M2)
    case 'volume-converter':
      return linearConvert(options, VOLUME_TO_L)
    case 'angle-converter':
      return linearConvert(options, ANGLE_TO_RAD, 8)
    case 'pressure-converter':
      return linearConvert(options, PRESSURE_TO_PA)
    case 'energy-converter':
      return linearConvert(options, ENERGY_TO_J)
    case 'temperature-converter': {
      const from = String(options.from ?? 'celsius')
      const to = String(options.to ?? 'fahrenheit')
      const value = num(options.value)
      if (!Number.isFinite(value)) return { error: 'Enter a valid value to convert.' }
      try {
        const result = convertTemperature(value, from, to)
        return {
          output: `${fmt(value, 2)} ${from} = ${fmt(result, 2)} ${to}`,
          meta: { result: round(result, 4), from, to },
        }
      } catch (err) {
        return { error: err instanceof Error ? err.message : 'Conversion failed.' }
      }
    }
    case 'time-converter':
      return convertTimeZone(options)
    case 'data-converter': {
      const mode = (String(options.mode ?? 'binary') as DataSizeMode) === 'decimal' ? 'decimal' : 'binary'
      return linearConvert(options, dataTable(mode))
    }
    case 'currency-converter':
      return { error: 'Currency conversion requires live exchange rates from the API.' }
    default:
      return { error: 'Unknown converter tool.' }
  }
}
