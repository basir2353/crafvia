export type CalcToolSlug =
  | 'percentage-calculator'
  | 'bmi-calculator'
  | 'loan-calculator'
  | 'tip-calculator'
  | 'age-calculator'
  | 'gpa-calculator'
  | 'discount-calculator'
  | 'compound-interest'
  | 'unit-converter'

export type CalcToolRequest = {
  options?: Record<string, unknown>
}

export type CalcToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

export type PercentageMode =
  | 'percent_of'
  | 'increase'
  | 'decrease'
  | 'difference'
  | 'reverse'

export type BmiUnit = 'metric' | 'imperial'
export type CompoundFrequency = 'monthly' | 'quarterly' | 'yearly'
export type UnitCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'area' | 'time'

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : NaN
}

function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return value
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

function fmt(value: number, decimals = 2): string {
  return round(value, decimals).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function requirePositive(value: number, label: string): string | null {
  if (!Number.isFinite(value)) return `${label} must be a valid number.`
  if (value < 0) return `${label} cannot be negative.`
  return null
}

function requireNonZero(value: number, label: string): string | null {
  const err = requirePositive(value, label)
  if (err) return err
  if (value === 0) return `${label} cannot be zero.`
  return null
}

// ─── Percentage ───────────────────────────────────────────────────────────────

export function calculatePercentage(options: Record<string, unknown>): CalcToolResponse {
  const mode = (options.mode as PercentageMode) || 'percent_of'
  const percent = num(options.percent)
  const value = num(options.value)
  const valueB = num(options.valueB)

  switch (mode) {
    case 'percent_of': {
      const err = requirePositive(value, 'Value') ?? requirePositive(percent, 'Percentage')
      if (err) return { error: err }
      const result = (percent / 100) * value
      return {
        output: `${percent}% of ${fmt(value)} = ${fmt(result)}`,
        meta: { result: round(result) },
      }
    }
    case 'increase': {
      const err = requirePositive(value, 'Value') ?? requirePositive(percent, 'Percentage')
      if (err) return { error: err }
      const result = value * (1 + percent / 100)
      const change = result - value
      return {
        output: `${fmt(value)} + ${percent}% = ${fmt(result)} (increase of ${fmt(change)})`,
        meta: { result: round(result), change: round(change) },
      }
    }
    case 'decrease': {
      const err = requirePositive(value, 'Value') ?? requirePositive(percent, 'Percentage')
      if (err) return { error: err }
      const result = value * (1 - percent / 100)
      const change = value - result
      return {
        output: `${fmt(value)} − ${percent}% = ${fmt(result)} (decrease of ${fmt(change)})`,
        meta: { result: round(result), change: round(change) },
      }
    }
    case 'difference': {
      if (!Number.isFinite(value) || !Number.isFinite(valueB)) {
        return { error: 'Enter two valid numbers.' }
      }
      if (value === 0 && valueB === 0) return { error: 'Both values cannot be zero.' }
      const avg = (Math.abs(value) + Math.abs(valueB)) / 2
      const diff = ((valueB - value) / avg) * 100
      return {
        output: `Difference: ${fmt(diff)}% (${fmt(value)} → ${fmt(valueB)})`,
        meta: { percentDifference: round(diff) },
      }
    }
    case 'reverse': {
      const err =
        requireNonZero(value, 'Result value') ?? requireNonZero(percent, 'Percentage')
      if (err) return { error: err }
      const original = value / (percent / 100)
      return {
        output: `${fmt(value)} is ${percent}% of ${fmt(original)}`,
        meta: { original: round(original) },
      }
    }
    default:
      return { error: 'Unknown percentage mode.' }
  }
}

// ─── BMI ──────────────────────────────────────────────────────────────────────

export type BmiCategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export function calculateBmi(options: Record<string, unknown>): CalcToolResponse {
  const unit = (options.unit as BmiUnit) || 'metric'
  let weightKg: number
  let heightM: number

  if (unit === 'metric') {
    const weight = num(options.weightKg)
    const heightCm = num(options.heightCm)
    const wErr = requirePositive(weight, 'Weight')
    const hErr = requirePositive(heightCm, 'Height')
    if (wErr || hErr) return { error: wErr ?? hErr! }
    if (heightCm > 300) return { error: 'Height seems too large. Use centimeters.' }
    weightKg = weight
    heightM = heightCm / 100
  } else {
    const weightLb = num(options.weightLb)
    const feet = num(options.heightFt)
    const inches = num(options.heightIn) || 0
    const wErr = requirePositive(weightLb, 'Weight')
    if (wErr) return { error: wErr }
    if (!Number.isFinite(feet) || feet < 0) return { error: 'Enter valid height in feet.' }
    const totalInches = feet * 12 + inches
    if (totalInches <= 0) return { error: 'Height must be greater than zero.' }
    weightKg = weightLb * 0.45359237
    heightM = totalInches * 0.0254
  }

  const bmi = weightKg / (heightM * heightM)
  const category = getBmiCategory(bmi)
  const labels: Record<BmiCategory, string> = {
    underweight: 'Underweight (below 18.5)',
    normal: 'Normal weight (18.5 – 24.9)',
    overweight: 'Overweight (25 – 29.9)',
    obese: 'Obese (30 or above)',
  }

  return {
    output: `BMI: ${fmt(bmi, 1)}\nCategory: ${labels[category]}`,
    meta: { bmi: round(bmi, 1), category, unit },
  }
}

// ─── Loan ─────────────────────────────────────────────────────────────────────

export function calculateLoan(options: Record<string, unknown>): CalcToolResponse {
  const principal = num(options.principal)
  const annualRate = num(options.annualRate)
  const years = num(options.years)

  const pErr = requirePositive(principal, 'Loan amount')
  if (pErr) return { error: pErr }
  if (!Number.isFinite(annualRate) || annualRate < 0) {
    return { error: 'Interest rate must be zero or positive.' }
  }
  const yErr = requirePositive(years, 'Loan term')
  if (yErr) return { error: yErr }

  const n = Math.round(years * 12)
  const r = annualRate / 100 / 12

  let monthly: number
  if (r === 0) {
    monthly = principal / n
  } else {
    const factor = Math.pow(1 + r, n)
    monthly = (principal * r * factor) / (factor - 1)
  }

  const totalPayment = monthly * n
  const totalInterest = totalPayment - principal

  return {
    output: [
      `Monthly payment: $${fmt(monthly)}`,
      `Total repayment: $${fmt(totalPayment)}`,
      `Total interest: $${fmt(totalInterest)}`,
      `Payments: ${n} months`,
    ].join('\n'),
    meta: {
      monthlyPayment: round(monthly),
      totalPayment: round(totalPayment),
      totalInterest: round(totalInterest),
      months: n,
    },
  }
}

// ─── Tip ──────────────────────────────────────────────────────────────────────

export function calculateTip(options: Record<string, unknown>): CalcToolResponse {
  const bill = num(options.bill)
  const tipPercent = num(options.tipPercent)
  const people = Math.max(1, Math.round(num(options.people) || 1))

  const bErr = requirePositive(bill, 'Bill amount')
  if (bErr) return { error: bErr }
  if (!Number.isFinite(tipPercent) || tipPercent < 0) {
    return { error: 'Tip percentage must be zero or positive.' }
  }

  const tipAmount = bill * (tipPercent / 100)
  const total = bill + tipAmount
  const perPerson = total / people
  const tipPerPerson = tipAmount / people

  return {
    output: [
      `Tip (${tipPercent}%): $${fmt(tipAmount)}`,
      `Total: $${fmt(total)}`,
      `Per person (${people}): $${fmt(perPerson)}`,
      `Tip per person: $${fmt(tipPerPerson)}`,
    ].join('\n'),
    meta: {
      tipAmount: round(tipAmount),
      total: round(total),
      perPerson: round(perPerson),
      tipPerPerson: round(tipPerPerson),
      people,
    },
  }
}

// ─── Age ──────────────────────────────────────────────────────────────────────

export function calculateAge(options: Record<string, unknown>): CalcToolResponse {
  const birthStr = String(options.birthDate ?? '').trim()
  const endStr = String(options.endDate ?? '').trim()

  if (!birthStr) return { error: 'Enter your birth date.' }

  const birth = new Date(birthStr)
  const end = endStr ? new Date(endStr) : new Date()

  if (Number.isNaN(birth.getTime())) return { error: 'Invalid birth date.' }
  if (Number.isNaN(end.getTime())) return { error: 'Invalid end date.' }
  if (birth > end) return { error: 'Birth date cannot be after the end date.' }

  let years = end.getFullYear() - birth.getFullYear()
  let months = end.getMonth() - birth.getMonth()
  let days = end.getDate() - birth.getDate()

  if (days < 0) {
    months -= 1
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
  }
  if (months < 0) {
    years -= 1
    months += 12
  }

  const totalDays = Math.floor((end.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

  return {
    output: [
      `Age: ${years} years, ${months} months, ${days} days`,
      `Total days lived: ${totalDays.toLocaleString()}`,
      `From: ${birth.toLocaleDateString()}`,
      `To: ${end.toLocaleDateString()}`,
    ].join('\n'),
    meta: { years, months, days, totalDays },
  }
}

// ─── GPA ──────────────────────────────────────────────────────────────────────

export type GpaEntry = { grade: number; credits: number }

const LETTER_GRADES: Record<string, number> = {
  'A+': 4, A: 4, 'A-': 3.7,
  'B+': 3.3, B: 3, 'B-': 2.7,
  'C+': 2.3, C: 2, 'C-': 1.7,
  'D+': 1.3, D: 1, 'D-': 0.7,
  F: 0,
}

export function parseGpaEntries(raw: unknown): GpaEntry[] | string {
  if (!Array.isArray(raw)) return 'Add at least one subject.'
  const entries: GpaEntry[] = []

  for (const item of raw) {
    const row = item as Record<string, unknown>
    const credits = num(row.credits)
    let grade = num(row.grade)

    if (!Number.isFinite(grade) && typeof row.letter === 'string') {
      const letter = row.letter.trim().toUpperCase()
      grade = LETTER_GRADES[letter] ?? NaN
      if (!Number.isFinite(grade)) return `Unknown grade: ${row.letter}`
    }

    if (!Number.isFinite(grade) || grade < 0 || grade > 4) {
      return 'Grades must be between 0 and 4 (or use letter grades).'
    }
    if (!Number.isFinite(credits) || credits <= 0) {
      return 'Credits must be greater than zero.'
    }
    entries.push({ grade, credits })
  }

  if (entries.length === 0) return 'Add at least one subject.'
  return entries
}

export function calculateGpa(options: Record<string, unknown>): CalcToolResponse {
  const parsed = parseGpaEntries(options.subjects)
  if (typeof parsed === 'string') return { error: parsed }

  const totalCredits = parsed.reduce((s, e) => s + e.credits, 0)
  const weightedSum = parsed.reduce((s, e) => s + e.grade * e.credits, 0)
  const gpa = weightedSum / totalCredits

  return {
    output: [
      `GPA: ${fmt(gpa, 2)} / 4.00`,
      `Subjects: ${parsed.length}`,
      `Total credits: ${fmt(totalCredits, 1)}`,
    ].join('\n'),
    meta: { gpa: round(gpa, 2), totalCredits, subjectCount: parsed.length },
  }
}

// ─── Discount ─────────────────────────────────────────────────────────────────

export function calculateDiscount(options: Record<string, unknown>): CalcToolResponse {
  const price = num(options.price)
  const discount = num(options.discount)
  const taxRate = num(options.taxRate) || 0

  const pErr = requirePositive(price, 'Original price')
  if (pErr) return { error: pErr }
  if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
    return { error: 'Discount must be between 0 and 100.' }
  }
  if (taxRate < 0) return { error: 'Tax rate cannot be negative.' }

  const savings = price * (discount / 100)
  const discounted = price - savings
  const tax = discounted * (taxRate / 100)
  const finalPrice = discounted + tax

  const lines = [
    `Original price: $${fmt(price)}`,
    `Discount (${discount}%): −$${fmt(savings)}`,
    `Price after discount: $${fmt(discounted)}`,
  ]
  if (taxRate > 0) {
    lines.push(`Tax (${taxRate}%): +$${fmt(tax)}`)
    lines.push(`Final price: $${fmt(finalPrice)}`)
  } else {
    lines.push(`Final price: $${fmt(discounted)}`)
  }
  lines.push(`You save: $${fmt(savings)}`)

  return {
    output: lines.join('\n'),
    meta: {
      savings: round(savings),
      finalPrice: round(taxRate > 0 ? finalPrice : discounted),
      discountedPrice: round(discounted),
    },
  }
}

// ─── Compound Interest ────────────────────────────────────────────────────────

export function calculateCompoundInterest(options: Record<string, unknown>): CalcToolResponse {
  const principal = num(options.principal)
  const annualRate = num(options.annualRate)
  const years = num(options.years)
  const frequency = (options.frequency as CompoundFrequency) || 'yearly'

  const pErr = requirePositive(principal, 'Principal')
  if (pErr) return { error: pErr }
  if (!Number.isFinite(annualRate) || annualRate < 0) {
    return { error: 'Interest rate must be zero or positive.' }
  }
  const yErr = requirePositive(years, 'Time period')
  if (yErr) return { error: yErr }

  const periodsPerYear = frequency === 'monthly' ? 12 : frequency === 'quarterly' ? 4 : 1
  const r = annualRate / 100
  const n = periodsPerYear
  const t = years
  const futureValue = principal * Math.pow(1 + r / n, n * t)
  const interestEarned = futureValue - principal

  return {
    output: [
      `Future value: $${fmt(futureValue)}`,
      `Interest earned: $${fmt(interestEarned)}`,
      `Principal: $${fmt(principal)}`,
      `Compounding: ${frequency} (${periodsPerYear}× per year)`,
      `Rate: ${annualRate}% for ${years} year(s)`,
    ].join('\n'),
    meta: {
      futureValue: round(futureValue),
      interestEarned: round(interestEarned),
      frequency,
    },
  }
}

// ─── Unit Converter ───────────────────────────────────────────────────────────

const LENGTH_TO_M: Record<string, number> = {
  meter: 1,
  kilometer: 1000,
  mile: 1609.344,
  foot: 0.3048,
  inch: 0.0254,
}

const WEIGHT_TO_G: Record<string, number> = {
  gram: 1,
  kilogram: 1000,
  pound: 453.59237,
  ounce: 28.349523125,
}

const VOLUME_TO_L: Record<string, number> = {
  liter: 1,
  milliliter: 0.001,
  gallon: 3.785411784,
}

const AREA_TO_M2: Record<string, number> = {
  'square meter': 1,
  'square foot': 0.09290304,
}

const TIME_TO_S: Record<string, number> = {
  second: 1,
  minute: 60,
  hour: 3600,
  day: 86400,
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

export const UNIT_OPTIONS: Record<UnitCategory, string[]> = {
  length: Object.keys(LENGTH_TO_M),
  weight: Object.keys(WEIGHT_TO_G),
  temperature: ['celsius', 'fahrenheit', 'kelvin'],
  volume: Object.keys(VOLUME_TO_L),
  area: Object.keys(AREA_TO_M2),
  time: Object.keys(TIME_TO_S),
}

export function convertUnits(options: Record<string, unknown>): CalcToolResponse {
  const category = (options.category as UnitCategory) || 'length'
  const from = String(options.from ?? '')
  const to = String(options.to ?? '')
  const value = num(options.value)

  if (!Number.isFinite(value)) return { error: 'Enter a valid value to convert.' }

  try {
    let result: number
    switch (category) {
      case 'length':
        result = convertLinear(value, from, to, LENGTH_TO_M)
        break
      case 'weight':
        result = convertLinear(value, from, to, WEIGHT_TO_G)
        break
      case 'volume':
        result = convertLinear(value, from, to, VOLUME_TO_L)
        break
      case 'area':
        result = convertLinear(value, from, to, AREA_TO_M2)
        break
      case 'time':
        result = convertLinear(value, from, to, TIME_TO_S)
        break
      case 'temperature':
        result = convertTemperature(value, from, to)
        break
      default:
        return { error: 'Unknown unit category.' }
    }

    const decimals = category === 'temperature' ? 2 : 6
    return {
      output: `${fmt(value, 4)} ${from} = ${fmt(result, decimals)} ${to}`,
      meta: { result: round(result, decimals), from, to, category },
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Conversion failed.' }
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export function processCalcTool(slug: CalcToolSlug, request: CalcToolRequest): CalcToolResponse {
  const options = request.options ?? {}

  switch (slug) {
    case 'percentage-calculator':
      return calculatePercentage(options)
    case 'bmi-calculator':
      return calculateBmi(options)
    case 'loan-calculator':
      return calculateLoan(options)
    case 'tip-calculator':
      return calculateTip(options)
    case 'age-calculator':
      return calculateAge(options)
    case 'gpa-calculator':
      return calculateGpa(options)
    case 'discount-calculator':
      return calculateDiscount(options)
    case 'compound-interest':
      return calculateCompoundInterest(options)
    case 'unit-converter':
      return convertUnits(options)
    default:
      return { error: 'Unknown calculator.' }
  }
}
