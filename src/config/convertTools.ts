import { ArrowRightLeft, Clock, DollarSign, Gauge, Ruler, Scale, Thermometer } from 'lucide-react'
import type { RelatedTool } from './tools'

export type ConvertToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const convertRelated: RelatedTool[] = [
  { name: 'Length Converter', description: 'Meters, miles, feet, inches', icon: Ruler, href: '/tools/length-converter' },
  { name: 'Weight Converter', description: 'Kilograms, pounds, ounces', icon: Scale, href: '/tools/weight-converter' },
  { name: 'Temperature Converter', description: 'Celsius, Fahrenheit, Kelvin', icon: Thermometer, href: '/tools/temperature-converter' },
  { name: 'Currency Converter', description: 'Live exchange rates', icon: DollarSign, href: '/tools/currency-converter' },
  { name: 'Speed Converter', description: 'KM/H, MPH, knots', icon: Gauge, href: '/tools/speed-converter' },
  { name: 'Time Converter', description: 'Durations and time zones', icon: Clock, href: '/tools/time-converter' },
]

const baseFaq = [
  {
    question: 'Is my data sent to a server?',
    answer: 'Most converters run entirely in your browser. Only the Currency Converter fetches live exchange rates from the API.',
  },
  {
    question: 'How accurate are conversions?',
    answer: 'Formulas use standard international conversion factors. Currency rates are fetched live and cached for one hour.',
  },
]

function cfg(
  partial: Omit<ConvertToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: ConvertToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: ConvertToolConfig['popularOptions']
  },
): ConvertToolConfig {
  return {
    category: 'Converters',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? convertRelated,
    ...partial,
  }
}

export const lengthConverterConfig = cfg({
  path: '/tools/length-converter',
  breadcrumb: 'Length Converter',
  title: 'Length Converter',
  lead: 'Convert between meters, kilometers, miles, yards, feet, inches, and more.',
  whatIsTitle: 'What is Length Converter?',
  whatIsBody: 'Length Converter provides accurate conversions between metric and imperial length units using standard factors.',
  howToTitle: 'How to use Length Converter',
  howToSteps: ['Enter a value.', 'Select from and to units.', 'View the converted result instantly.', 'Copy or reset as needed.'],
})

export const weightConverterConfig = cfg({
  path: '/tools/weight-converter',
  breadcrumb: 'Weight Converter',
  title: 'Weight Converter',
  lead: 'Convert kilograms, grams, pounds, ounces, milligrams, and metric tons.',
  whatIsTitle: 'What is Weight Converter?',
  whatIsBody: 'Weight Converter converts mass units with precise international standards.',
  howToTitle: 'How to use Weight Converter',
  howToSteps: ['Enter a weight value.', 'Choose source and target units.', 'See the result update instantly.'],
})

export const temperatureConverterConfig = cfg({
  path: '/tools/temperature-converter',
  breadcrumb: 'Temperature Converter',
  title: 'Temperature Converter',
  lead: 'Convert Celsius, Fahrenheit, and Kelvin including negative and extreme values.',
  whatIsTitle: 'What is Temperature Converter?',
  whatIsBody: 'Temperature Converter uses exact formulas for °C, °F, and K with support for decimals and negative values.',
  howToTitle: 'How to use Temperature Converter',
  howToSteps: ['Enter a temperature.', 'Select from and to scales.', 'View the converted value instantly.'],
})

export const speedConverterConfig = cfg({
  path: '/tools/speed-converter',
  breadcrumb: 'Speed Converter',
  title: 'Speed Converter',
  lead: 'Convert KM/H, MPH, meters per second, and knots.',
  whatIsTitle: 'What is Speed Converter?',
  whatIsBody: 'Speed Converter handles common speed units for travel, science, and engineering.',
  howToTitle: 'How to use Speed Converter',
  howToSteps: ['Enter a speed value.', 'Pick from and to units.', 'Copy the result.'],
})

export const areaConverterConfig = cfg({
  path: '/tools/area-converter',
  breadcrumb: 'Area Converter',
  title: 'Area Converter',
  lead: 'Convert square meters, square feet, acres, hectares, and more.',
  whatIsTitle: 'What is Area Converter?',
  whatIsBody: 'Area Converter converts land and surface area units with standard factors.',
  howToTitle: 'How to use Area Converter',
  howToSteps: ['Enter an area value.', 'Select units.', 'View the converted result.'],
})

export const volumeConverterConfig = cfg({
  path: '/tools/volume-converter',
  breadcrumb: 'Volume Converter',
  title: 'Volume Converter',
  lead: 'Convert liters, milliliters, gallons, quarts, pints, and cubic meters.',
  whatIsTitle: 'What is Volume Converter?',
  whatIsBody: 'Volume Converter handles liquid and bulk volume units with US gallon definitions.',
  howToTitle: 'How to use Volume Converter',
  howToSteps: ['Enter a volume.', 'Choose from and to units.', 'Copy the result.'],
})

export const timeConverterConfig = cfg({
  path: '/tools/time-converter',
  breadcrumb: 'Time Converter',
  title: 'Time Converter',
  lead: 'Convert durations (seconds to years) and convert datetimes between time zones.',
  whatIsTitle: 'What is Time Converter?',
  whatIsBody: 'Time Converter supports duration math and timezone conversion using IANA zones with daylight saving handled by the browser Intl API.',
  howToTitle: 'How to use Time Converter',
  howToSteps: [
    'Choose Duration or Timezone mode.',
    'Enter a value or datetime.',
    'Select units or time zones.',
    'View the converted result.',
  ],
  faqs: [
    ...baseFaq,
    {
      question: 'How are months and years calculated?',
      answer: 'Duration mode uses average values: 1 month ≈ 30.4375 days and 1 year ≈ 365.25 days.',
    },
    {
      question: 'Does timezone conversion handle daylight saving?',
      answer: 'Yes. Conversions use the browser Intl API which applies DST rules for the selected IANA time zones.',
    },
  ],
})

export const dataConverterConfig = cfg({
  path: '/tools/data-converter',
  breadcrumb: 'Data Size Converter',
  title: 'Data Size Converter',
  lead: 'Convert bits, bytes, KB, MB, GB, TB, and PB in binary (1024) or decimal (1000) mode.',
  whatIsTitle: 'What is Data Size Converter?',
  whatIsBody: 'Data Size Converter supports both binary (KiB-style labels as KB) and decimal (SI) prefixes.',
  howToTitle: 'How to use Data Size Converter',
  howToSteps: ['Choose binary or decimal mode.', 'Enter a data size.', 'Select from and to units.', 'Copy the result.'],
})

export const angleConverterConfig = cfg({
  path: '/tools/angle-converter',
  breadcrumb: 'Angle Converter',
  title: 'Angle Converter',
  lead: 'Convert degrees, radians, and gradians.',
  whatIsTitle: 'What is Angle Converter?',
  whatIsBody: 'Angle Converter uses exact trigonometric relationships between degree, radian, and gradian units.',
  howToTitle: 'How to use Angle Converter',
  howToSteps: ['Enter an angle.', 'Select from and to units.', 'View the precise result.'],
})

export const pressureConverterConfig = cfg({
  path: '/tools/pressure-converter',
  breadcrumb: 'Pressure Converter',
  title: 'Pressure Converter',
  lead: 'Convert pascal, kilopascal, bar, PSI, and atmosphere.',
  whatIsTitle: 'What is Pressure Converter?',
  whatIsBody: 'Pressure Converter uses standard physics conversion factors between common pressure units.',
  howToTitle: 'How to use Pressure Converter',
  howToSteps: ['Enter a pressure value.', 'Select units.', 'Copy the converted result.'],
})

export const energyConverterConfig = cfg({
  path: '/tools/energy-converter',
  breadcrumb: 'Energy Converter',
  title: 'Energy Converter',
  lead: 'Convert joules, calories, kilocalories, watt hours, and kilowatt hours.',
  whatIsTitle: 'What is Energy Converter?',
  whatIsBody: 'Energy Converter translates between SI and common energy units including food calories and electricity units.',
  howToTitle: 'How to use Energy Converter',
  howToSteps: ['Enter an energy value.', 'Select from and to units.', 'View the result instantly.'],
})

export const currencyConverterConfig = cfg({
  path: '/tools/currency-converter',
  breadcrumb: 'Currency Converter',
  title: 'Currency Converter',
  lead: 'Convert world currencies with live exchange rates. Supports USD, EUR, GBP, PKR, AED, SAR, INR, and more.',
  whatIsTitle: 'What is Currency Converter?',
  whatIsBody: 'Currency Converter fetches real-time exchange rates from open.er-api.com. Rates are cached for one hour with stale-cache fallback on API errors.',
  howToTitle: 'How to use Currency Converter',
  howToSteps: [
    'Wait for live rates to load.',
    'Enter an amount.',
    'Select from and to currencies.',
    'View the converted amount and copy the result.',
  ],
  faqs: [
    ...baseFaq,
    {
      question: 'Where do exchange rates come from?',
      answer: 'Rates are fetched live from open.er-api.com and updated regularly. No hardcoded or fake values are used.',
    },
    {
      question: 'What happens if rates cannot load?',
      answer: 'The tool shows an error with a retry option. Cached rates are used when available during temporary API outages.',
    },
  ],
  relatedTools: [
    ...convertRelated.filter((t) => t.href !== '/tools/currency-converter'),
    { name: 'Unit Converter', description: 'General unit conversions', icon: ArrowRightLeft, href: '/tools/unit-converter' },
  ],
})
