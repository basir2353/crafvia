import { useMemo, useState } from 'react'
import { processCalcLocal } from '../../api/calcTools'
import { CalcOutputActions, CalcToolShell } from '../../components/CalcToolShell'
import {
  ageCalculatorConfig,
  bmiCalculatorConfig,
  compoundInterestConfig,
  discountCalculatorConfig,
  gpaCalculatorConfig,
  loanCalculatorConfig,
  percentageCalculatorConfig,
  tipCalculatorConfig,
  unitConverterConfig,
} from '../../config/calcTools'
import type {
  BmiUnit,
  CompoundFrequency,
  PercentageMode,
  UnitCategory,
} from '../../utils/calcProcess'
import { UNIT_OPTIONS } from '../../utils/calcProcess'

function useCalcState() {
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const reset = () => {
    setError(null)
    setSuccess(null)
  }
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

function ResultBox({ output, onClear }: { output: string; onClear?: () => void }) {
  if (!output) return null
  return (
    <div className="tool-controls">
      <label className="tool-control-label">Result</label>
      <textarea className="tool-textarea" value={output} readOnly rows={5} />
      <CalcOutputActions output={output} onClear={onClear} />
    </div>
  )
}

export function PercentageCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [mode, setMode] = useState<PercentageMode>('percent_of')
  const [percent, setPercent] = useState('15')
  const [value, setValue] = useState('200')
  const [valueB, setValueB] = useState('250')

  const run = () => {
    reset()
    const r = processCalcLocal('percentage-calculator', {
      options: { mode, percent: Number(percent), value: Number(value), valueB: Number(valueB) },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('Calculated.')
  }

  const clear = () => {
    setOutput('')
    setPercent('15')
    setValue('200')
    setValueB('250')
    reset()
  }

  return (
    <CalcToolShell config={percentageCalculatorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Calculation type</label>
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as PercentageMode)}>
          <option value="percent_of">X% of a number</option>
          <option value="increase">Percentage increase</option>
          <option value="decrease">Percentage decrease</option>
          <option value="difference">Percentage difference</option>
          <option value="reverse">Reverse (X is Y% of what?)</option>
        </select>
      </div>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="Percentage" />
        <input className="tool-select" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
        {mode === 'difference' && (
          <input className="tool-select" type="number" value={valueB} onChange={(e) => setValueB(e.target.value)} placeholder="Second value" />
        )}
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {percentageCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={clear} />
    </CalcToolShell>
  )
}

export function BmiCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [unit, setUnit] = useState<BmiUnit>('metric')
  const [weightKg, setWeightKg] = useState('70')
  const [heightCm, setHeightCm] = useState('175')
  const [weightLb, setWeightLb] = useState('154')
  const [heightFt, setHeightFt] = useState('5')
  const [heightIn, setHeightIn] = useState('9')

  const run = () => {
    reset()
    const r = processCalcLocal('bmi-calculator', {
      options: {
        unit,
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        weightLb: Number(weightLb),
        heightFt: Number(heightFt),
        heightIn: Number(heightIn),
      },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('BMI calculated.')
  }

  return (
    <CalcToolShell config={bmiCalculatorConfig}>
      <div className="tool-controls">
        <select className="tool-select" value={unit} onChange={(e) => setUnit(e.target.value as BmiUnit)}>
          <option value="metric">Metric (kg, cm)</option>
          <option value="imperial">Imperial (lb, ft/in)</option>
        </select>
      </div>
      {unit === 'metric' ? (
        <div className="tool-controls">
          <input className="tool-select" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="Weight (kg)" />
          <input className="tool-select" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} placeholder="Height (cm)" />
        </div>
      ) : (
        <div className="tool-controls">
          <input className="tool-select" type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} placeholder="Weight (lb)" />
          <input className="tool-select" type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} placeholder="Feet" />
          <input className="tool-select" type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} placeholder="Inches" />
        </div>
      )}
      <button type="button" className="tool-compress-btn" onClick={run}>
        {bmiCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); reset() }} />
    </CalcToolShell>
  )
}

export function LoanCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [principal, setPrincipal] = useState('250000')
  const [annualRate, setAnnualRate] = useState('6.5')
  const [years, setYears] = useState('30')

  const run = () => {
    reset()
    const r = processCalcLocal('loan-calculator', {
      options: { principal: Number(principal), annualRate: Number(annualRate), years: Number(years) },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('Loan calculated.')
  }

  return (
    <CalcToolShell config={loanCalculatorConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="Loan amount ($)" />
        <input className="tool-select" type="number" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} placeholder="Annual interest rate (%)" />
        <input className="tool-select" type="number" step="0.5" value={years} onChange={(e) => setYears(e.target.value)} placeholder="Term (years)" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {loanCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); reset() }} />
    </CalcToolShell>
  )
}

export function TipCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [bill, setBill] = useState('100')
  const [tipPercent, setTipPercent] = useState('18')
  const [people, setPeople] = useState('2')

  const run = () => {
    reset()
    const r = processCalcLocal('tip-calculator', {
      options: { bill: Number(bill), tipPercent: Number(tipPercent), people: Number(people) },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('Tip calculated.')
  }

  return (
    <CalcToolShell config={tipCalculatorConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={bill} onChange={(e) => setBill(e.target.value)} placeholder="Bill amount ($)" />
        <input className="tool-select" type="number" value={tipPercent} onChange={(e) => setTipPercent(e.target.value)} placeholder="Tip (%)" />
        <input className="tool-select" type="number" min={1} value={people} onChange={(e) => setPeople(e.target.value)} placeholder="Number of people" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {tipCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); reset() }} />
    </CalcToolShell>
  )
}

export function AgeCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [birthDate, setBirthDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const run = () => {
    reset()
    const r = processCalcLocal('age-calculator', { options: { birthDate, endDate } })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('Age calculated.')
  }

  return (
    <CalcToolShell config={ageCalculatorConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Birth date</label>
        <input className="tool-select" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>
      <div className="tool-controls">
        <label className="tool-control-label">End date (optional, defaults to today)</label>
        <input className="tool-select" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {ageCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); setBirthDate(''); setEndDate(''); reset() }} />
    </CalcToolShell>
  )
}

type GpaRow = { id: number; grade: string; credits: string }

export function GpaCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [rows, setRows] = useState<GpaRow[]>([
    { id: 1, grade: '4', credits: '3' },
    { id: 2, grade: '3.7', credits: '4' },
  ])
  const [nextId, setNextId] = useState(3)

  const addRow = () => {
    setRows([...rows, { id: nextId, grade: '3', credits: '3' }])
    setNextId(nextId + 1)
  }

  const run = () => {
    reset()
    const subjects = rows.map((r) => ({
      grade: Number(r.grade),
      credits: Number(r.credits),
    }))
    const r = processCalcLocal('gpa-calculator', { options: { subjects } })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('GPA calculated.')
  }

  return (
    <CalcToolShell config={gpaCalculatorConfig}>
      {rows.map((row, index) => (
        <div key={row.id} className="tool-controls">
          <label className="tool-control-label">Subject {index + 1}</label>
          <input
            className="tool-select"
            type="number"
            step="0.1"
            min={0}
            max={4}
            value={row.grade}
            onChange={(e) => {
              const next = [...rows]
              next[index] = { ...row, grade: e.target.value }
              setRows(next)
            }}
            placeholder="Grade (0–4)"
          />
          <input
            className="tool-select"
            type="number"
            min={0.5}
            step="0.5"
            value={row.credits}
            onChange={(e) => {
              const next = [...rows]
              next[index] = { ...row, credits: e.target.value }
              setRows(next)
            }}
            placeholder="Credits"
          />
        </div>
      ))}
      <div className="tool-controls">
        <button type="button" className="tool-secondary-btn" onClick={addRow}>
          Add subject
        </button>
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {gpaCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); reset() }} />
    </CalcToolShell>
  )
}

export function DiscountCalculatorPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [price, setPrice] = useState('100')
  const [discount, setDiscount] = useState('25')
  const [taxRate, setTaxRate] = useState('0')

  const run = () => {
    reset()
    const r = processCalcLocal('discount-calculator', {
      options: { price: Number(price), discount: Number(discount), taxRate: Number(taxRate) },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('Discount calculated.')
  }

  return (
    <CalcToolShell config={discountCalculatorConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Original price ($)" />
        <input className="tool-select" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="Discount (%)" />
        <input className="tool-select" type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="Tax rate (%, optional)" />
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {discountCalculatorConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); reset() }} />
    </CalcToolShell>
  )
}

export function CompoundInterestPage() {
  const { output, setOutput, error, setError, success, setSuccess, reset } = useCalcState()
  const [principal, setPrincipal] = useState('10000')
  const [annualRate, setAnnualRate] = useState('5')
  const [years, setYears] = useState('10')
  const [frequency, setFrequency] = useState<CompoundFrequency>('yearly')

  const run = () => {
    reset()
    const r = processCalcLocal('compound-interest', {
      options: {
        principal: Number(principal),
        annualRate: Number(annualRate),
        years: Number(years),
        frequency,
      },
    })
    if (r.error) {
      setError(r.error)
      setOutput('')
      return
    }
    setOutput(r.output ?? '')
    setSuccess('Interest calculated.')
  }

  return (
    <CalcToolShell config={compoundInterestConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} placeholder="Principal ($)" />
        <input className="tool-select" type="number" step="0.01" value={annualRate} onChange={(e) => setAnnualRate(e.target.value)} placeholder="Annual rate (%)" />
        <input className="tool-select" type="number" value={years} onChange={(e) => setYears(e.target.value)} placeholder="Years" />
        <select className="tool-select" value={frequency} onChange={(e) => setFrequency(e.target.value as CompoundFrequency)}>
          <option value="yearly">Yearly</option>
          <option value="quarterly">Quarterly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>
      <button type="button" className="tool-compress-btn" onClick={run}>
        {compoundInterestConfig.actionLabel}
      </button>
      <Status error={error} success={success} />
      <ResultBox output={output} onClear={() => { setOutput(''); reset() }} />
    </CalcToolShell>
  )
}

export function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>('length')
  const [from, setFrom] = useState('meter')
  const [to, setTo] = useState('kilometer')
  const [value, setValue] = useState('1')

  const units = UNIT_OPTIONS[category]

  const result = useMemo(() => {
    if (!value.trim()) return null
    return processCalcLocal('unit-converter', {
      options: { category, from, to, value: Number(value) },
    })
  }, [category, from, to, value])

  const handleCategoryChange = (next: UnitCategory) => {
    setCategory(next)
    const opts = UNIT_OPTIONS[next]
    setFrom(opts[0] ?? '')
    setTo(opts[1] ?? opts[0] ?? '')
  }

  return (
    <CalcToolShell config={unitConverterConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Category</label>
        <select className="tool-select" value={category} onChange={(e) => handleCategoryChange(e.target.value as UnitCategory)}>
          <option value="length">Length</option>
          <option value="weight">Weight</option>
          <option value="temperature">Temperature</option>
          <option value="volume">Volume</option>
          <option value="area">Area</option>
          <option value="time">Time</option>
        </select>
      </div>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Value" />
        <select className="tool-select" value={from} onChange={(e) => setFrom(e.target.value)}>
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select className="tool-select" value={to} onChange={(e) => setTo(e.target.value)}>
          {units.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
      {result?.error && <p className="tool-error">{result.error}</p>}
      {result?.output && !result.error && (
        <div className="tool-controls">
          <span className="pdf-file-meta">{result.output}</span>
          <CalcOutputActions output={result.output} />
        </div>
      )}
    </CalcToolShell>
  )
}
