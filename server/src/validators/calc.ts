import { z } from 'zod'

export const calcToolSlugSchema = z.enum([
  'percentage-calculator',
  'bmi-calculator',
  'loan-calculator',
  'tip-calculator',
  'age-calculator',
  'gpa-calculator',
  'discount-calculator',
  'compound-interest',
  'unit-converter',
])

export const calcToolRequestSchema = z.object({
  options: z.record(z.string(), z.unknown()).optional(),
})
