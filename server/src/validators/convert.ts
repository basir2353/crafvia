import { z } from 'zod'

export const convertToolSlugSchema = z.enum([
  'length-converter',
  'weight-converter',
  'temperature-converter',
  'speed-converter',
  'area-converter',
  'volume-converter',
  'time-converter',
  'data-converter',
  'angle-converter',
  'pressure-converter',
  'energy-converter',
  'currency-converter',
])

export const convertToolRequestSchema = z.object({
  text: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
})

export const currencyRatesQuerySchema = z.object({
  base: z.string().length(3).default('USD'),
})

export const currencyConvertSchema = z.object({
  amount: z.coerce.number(),
  from: z.string().length(3),
  to: z.string().length(3),
  base: z.string().length(3).default('USD'),
})
