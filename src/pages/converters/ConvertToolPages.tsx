import { Loader2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { fetchCurrencyRates, processConvertLocal } from '../../api/convertTools'
import { ConvertOutputActions, ConvertToolShell } from '../../components/ConvertToolShell'
import {
  angleConverterConfig,
  areaConverterConfig,
  currencyConverterConfig,
  dataConverterConfig,
  energyConverterConfig,
  lengthConverterConfig,
  pressureConverterConfig,
  speedConverterConfig,
  temperatureConverterConfig,
  timeConverterConfig,
  volumeConverterConfig,
  weightConverterConfig,
} from '../../config/convertTools'
import type { ConvertToolConfig } from '../../config/convertTools'
import type { ConvertToolSlug, DataSizeMode } from '../../utils/convertProcess'
import {
  ANGLE_UNITS,
  AREA_UNITS,
  COMMON_TIMEZONES,
  CURRENCY_CODES,
  DATA_UNITS,
  ENERGY_UNITS,
  LENGTH_UNITS,
  PRESSURE_UNITS,
  SPEED_UNITS,
  TEMPERATURE_UNITS,
  TIME_UNITS,
  VOLUME_UNITS,
  WEIGHT_UNITS,
  convertCurrencyAmount,
} from '../../utils/convertProcess'

function LinearConverterPage({
  config,
  slug,
  units,
  defaultFrom,
  defaultTo,
}: {
  config: ConvertToolConfig
  slug: ConvertToolSlug
  units: string[]
  defaultFrom: string
  defaultTo: string
}) {
  const [from, setFrom] = useState(defaultFrom)
  const [to, setTo] = useState(defaultTo)
  const [value, setValue] = useState('1')

  const result = useMemo(() => {
    if (!value.trim()) return null
    return processConvertLocal(slug, { options: { from, to, value: Number(value) } })
  }, [slug, from, to, value])

  const clear = () => {
    setValue('1')
    setFrom(defaultFrom)
    setTo(defaultTo)
  }

  return (
    <ConvertToolShell config={config}>
      <div className="tool-controls">
        <input
          className="tool-select"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Value"
        />
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
          <ConvertOutputActions output={result.output} onClear={clear} />
        </div>
      )}
    </ConvertToolShell>
  )
}

export function LengthConverterPage() {
  return (
    <LinearConverterPage
      config={lengthConverterConfig}
      slug="length-converter"
      units={LENGTH_UNITS}
      defaultFrom="meter"
      defaultTo="kilometer"
    />
  )
}

export function WeightConverterPage() {
  return (
    <LinearConverterPage
      config={weightConverterConfig}
      slug="weight-converter"
      units={WEIGHT_UNITS}
      defaultFrom="kilogram"
      defaultTo="pound"
    />
  )
}

export function SpeedConverterPage() {
  return (
    <LinearConverterPage
      config={speedConverterConfig}
      slug="speed-converter"
      units={SPEED_UNITS}
      defaultFrom="km/h"
      defaultTo="mph"
    />
  )
}

export function AreaConverterPage() {
  return (
    <LinearConverterPage
      config={areaConverterConfig}
      slug="area-converter"
      units={AREA_UNITS}
      defaultFrom="square meter"
      defaultTo="square foot"
    />
  )
}

export function VolumeConverterPage() {
  return (
    <LinearConverterPage
      config={volumeConverterConfig}
      slug="volume-converter"
      units={VOLUME_UNITS}
      defaultFrom="liter"
      defaultTo="gallon"
    />
  )
}

export function AngleConverterPage() {
  return (
    <LinearConverterPage
      config={angleConverterConfig}
      slug="angle-converter"
      units={ANGLE_UNITS}
      defaultFrom="degree"
      defaultTo="radian"
    />
  )
}

export function PressureConverterPage() {
  return (
    <LinearConverterPage
      config={pressureConverterConfig}
      slug="pressure-converter"
      units={PRESSURE_UNITS}
      defaultFrom="pascal"
      defaultTo="psi"
    />
  )
}

export function EnergyConverterPage() {
  return (
    <LinearConverterPage
      config={energyConverterConfig}
      slug="energy-converter"
      units={ENERGY_UNITS}
      defaultFrom="joule"
      defaultTo="kilocalorie"
    />
  )
}

export function TemperatureConverterPage() {
  const [from, setFrom] = useState('celsius')
  const [to, setTo] = useState('fahrenheit')
  const [value, setValue] = useState('0')

  const result = useMemo(() => {
    if (!value.trim()) return null
    return processConvertLocal('temperature-converter', { options: { from, to, value: Number(value) } })
  }, [from, to, value])

  return (
    <ConvertToolShell config={temperatureConverterConfig}>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Temperature" />
        <select className="tool-select" value={from} onChange={(e) => setFrom(e.target.value)}>
          {TEMPERATURE_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select className="tool-select" value={to} onChange={(e) => setTo(e.target.value)}>
          {TEMPERATURE_UNITS.map((u) => (
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
          <ConvertOutputActions output={result.output} onClear={() => setValue('0')} />
        </div>
      )}
    </ConvertToolShell>
  )
}

export function TimeConverterPage() {
  const [mode, setMode] = useState<'duration' | 'timezone'>('duration')
  const [from, setFrom] = useState('hour')
  const [to, setTo] = useState('minute')
  const [value, setValue] = useState('1')
  const [dateTime, setDateTime] = useState('2024-06-15T14:30')
  const [fromZone, setFromZone] = useState('America/New_York')
  const [toZone, setToZone] = useState('Europe/London')

  const result = useMemo(() => {
    if (mode === 'duration') {
      if (!value.trim()) return null
      return processConvertLocal('time-converter', { options: { mode: 'duration', from, to, value: Number(value) } })
    }
    return processConvertLocal('time-converter', { options: { mode: 'timezone', dateTime, fromZone, toZone } })
  }, [mode, from, to, value, dateTime, fromZone, toZone])

  return (
    <ConvertToolShell config={timeConverterConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Mode</label>
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as 'duration' | 'timezone')}>
          <option value="duration">Duration</option>
          <option value="timezone">Timezone</option>
        </select>
      </div>
      {mode === 'duration' ? (
        <div className="tool-controls">
          <input className="tool-select" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          <select className="tool-select" value={from} onChange={(e) => setFrom(e.target.value)}>
            {TIME_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <select className="tool-select" value={to} onChange={(e) => setTo(e.target.value)}>
            {TIME_UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <>
          <div className="tool-controls">
            <label className="tool-control-label">Date & time</label>
            <input className="tool-select" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>
          <div className="tool-controls">
            <select className="tool-select" value={fromZone} onChange={(e) => setFromZone(e.target.value)}>
              {COMMON_TIMEZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <select className="tool-select" value={toZone} onChange={(e) => setToZone(e.target.value)}>
              {COMMON_TIMEZONES.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
      {result?.error && <p className="tool-error">{result.error}</p>}
      {result?.output && !result.error && (
        <div className="tool-controls">
          <span className="pdf-file-meta" style={{ whiteSpace: 'pre-line' }}>
            {result.output}
          </span>
          <ConvertOutputActions output={result.output} />
        </div>
      )}
    </ConvertToolShell>
  )
}

export function DataConverterPage() {
  const [mode, setMode] = useState<DataSizeMode>('binary')
  const [from, setFrom] = useState('byte')
  const [to, setTo] = useState('KB')
  const [value, setValue] = useState('1024')

  const result = useMemo(() => {
    if (!value.trim()) return null
    return processConvertLocal('data-converter', { options: { mode, from, to, value: Number(value) } })
  }, [mode, from, to, value])

  return (
    <ConvertToolShell config={dataConverterConfig}>
      <div className="tool-controls">
        <label className="tool-control-label">Prefix system</label>
        <select className="tool-select" value={mode} onChange={(e) => setMode(e.target.value as DataSizeMode)}>
          <option value="binary">Binary (1024)</option>
          <option value="decimal">Decimal (1000)</option>
        </select>
      </div>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
        <select className="tool-select" value={from} onChange={(e) => setFrom(e.target.value)}>
          {DATA_UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select className="tool-select" value={to} onChange={(e) => setTo(e.target.value)}>
          {DATA_UNITS.map((u) => (
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
          <ConvertOutputActions output={result.output} onClear={() => setValue('1024')} />
        </div>
      )}
    </ConvertToolShell>
  )
}

export function CurrencyConverterPage() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('USD')
  const [to, setTo] = useState('EUR')
  const [base, setBase] = useState('USD')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [updatedAt, setUpdatedAt] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRates = async (baseCode: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCurrencyRates(baseCode)
      setRates(data.rates)
      setBase(data.base)
      setUpdatedAt(data.updatedAt)
      setProvider(data.provider)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load exchange rates.')
      setRates({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRates(base)
  }, [])

  const result = useMemo(() => {
    if (loading || !Object.keys(rates).length) return null
    return convertCurrencyAmount(Number(amount), from, to, rates, base)
  }, [amount, from, to, rates, base, loading])

  const currencyList = useMemo(() => {
    const codes = new Set<string>([...CURRENCY_CODES, ...Object.keys(rates), base, from, to])
    return [...codes].sort()
  }, [rates, base, from, to])

  return (
    <ConvertToolShell config={currencyConverterConfig}>
      {loading && (
        <p className="tool-result-stats">
          <Loader2 size={16} className="spin" aria-hidden /> Loading live exchange rates…
        </p>
      )}
      {error && (
        <>
          <p className="tool-error">{error}</p>
          <button type="button" className="tool-secondary-btn" onClick={() => void loadRates(base)}>
            Retry
          </button>
        </>
      )}
      {!loading && !error && updatedAt && (
        <p className="tool-result-stats">
          Rates from {provider} · base {base} · updated {updatedAt}
        </p>
      )}
      <div className="tool-controls">
        <label className="tool-control-label">Rate base currency</label>
        <select
          className="tool-select"
          value={base}
          onChange={(e) => {
            setBase(e.target.value)
            void loadRates(e.target.value)
          }}
        >
          {currencyList.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="tool-controls">
        <input className="tool-select" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />
        <select className="tool-select" value={from} onChange={(e) => setFrom(e.target.value)}>
          {currencyList.map((c) => (
            <option key={`from-${c}`} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="tool-select" value={to} onChange={(e) => setTo(e.target.value)}>
          {currencyList.map((c) => (
            <option key={`to-${c}`} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      {result?.error && <p className="tool-error">{result.error}</p>}
      {result?.output && !result.error && (
        <div className="tool-controls">
          <span className="pdf-file-meta">{result.output}</span>
          <ConvertOutputActions output={result.output} onClear={() => setAmount('100')} />
        </div>
      )}
    </ConvertToolShell>
  )
}
