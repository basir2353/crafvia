import { Calculator, DollarSign, Percent, Scale } from 'lucide-react'
import type { RelatedTool } from './tools'

export type CalcToolConfig = {
  path: string
  category: string
  breadcrumb: string
  title: string
  lead: string
  actionLabel?: string
  whatIsTitle: string
  whatIsBody: string
  howToTitle: string
  howToSteps: string[]
  faqs: { question: string; answer: string }[]
  popularTitle: string
  popularOptions: { label: string; href?: string }[]
  relatedTools: RelatedTool[]
}

const calcRelated: RelatedTool[] = [
  { name: 'Percentage Calculator', description: 'Calculate percentages', icon: Percent, href: '/tools/percentage-calculator' },
  { name: 'Loan Calculator', description: 'Monthly loan payments', icon: DollarSign, href: '/tools/loan-calculator' },
  { name: 'BMI Calculator', description: 'Body mass index', icon: Scale, href: '/tools/bmi-calculator' },
  { name: 'Tip Calculator', description: 'Tips and bill split', icon: Calculator, href: '/tools/tip-calculator' },
  { name: 'Unit Converter', description: 'Convert units', icon: Scale, href: '/tools/unit-converter' },
  { name: 'Discount Calculator', description: 'Sale price savings', icon: Percent, href: '/tools/discount-calculator' },
]

const baseFaq = [
  {
    question: 'Is my data sent to a server?',
    answer: 'Calculators run entirely in your browser. Your numbers stay on your device.',
  },
  {
    question: 'How accurate are the results?',
    answer: 'Formulas follow standard mathematical and financial conventions with proper rounding.',
  },
]

function cfg(
  partial: Omit<CalcToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: CalcToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: CalcToolConfig['popularOptions']
  },
): CalcToolConfig {
  return {
    category: 'Calculators',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? calcRelated,
    ...partial,
  }
}

export const percentageCalculatorConfig = cfg({
  path: '/tools/percentage-calculator',
  breadcrumb: 'Percentage Calculator',
  title: 'Percentage Calculator',
  lead: 'Calculate percentages, increases, decreases, and reverse percentage values.',
  actionLabel: 'Calculate',
  whatIsTitle: 'What is Percentage Calculator?',
  whatIsBody: 'Percentage Calculator handles common percent math — finding a percent of a number, percent change, and reverse calculations.',
  howToTitle: 'How to use Percentage Calculator',
  howToSteps: ['Choose a calculation type.', 'Enter your values.', 'Click Calculate and copy results.'],
})

export const bmiCalculatorConfig = cfg({
  path: '/tools/bmi-calculator',
  breadcrumb: 'BMI Calculator',
  title: 'BMI Calculator',
  lead: 'Calculate body mass index in metric or imperial units with health categories.',
  actionLabel: 'Calculate BMI',
  whatIsTitle: 'What is BMI Calculator?',
  whatIsBody: 'BMI Calculator uses weight and height to estimate body mass index and classification.',
  howToTitle: 'How to use BMI Calculator',
  howToSteps: ['Select metric or imperial units.', 'Enter weight and height.', 'View BMI and category.'],
})

export const loanCalculatorConfig = cfg({
  path: '/tools/loan-calculator',
  breadcrumb: 'Loan Calculator',
  title: 'Loan Calculator',
  lead: 'Calculate monthly payments, total repayment, and interest for loans.',
  actionLabel: 'Calculate Loan',
  whatIsTitle: 'What is Loan Calculator?',
  whatIsBody: 'Loan Calculator uses standard amortization to estimate monthly payments and total interest.',
  howToTitle: 'How to use Loan Calculator',
  howToSteps: ['Enter loan amount, annual interest rate, and term in years.', 'Click Calculate Loan.', 'Review monthly payment and totals.'],
})

export const tipCalculatorConfig = cfg({
  path: '/tools/tip-calculator',
  breadcrumb: 'Tip Calculator',
  title: 'Tip Calculator',
  lead: 'Calculate tips and split bills among multiple people.',
  actionLabel: 'Calculate Tip',
  whatIsTitle: 'What is Tip Calculator?',
  whatIsBody: 'Tip Calculator computes tip amount, total bill, and per-person share.',
  howToTitle: 'How to use Tip Calculator',
  howToSteps: ['Enter bill amount and tip percentage.', 'Set number of people.', 'Click Calculate Tip.'],
})

export const ageCalculatorConfig = cfg({
  path: '/tools/age-calculator',
  breadcrumb: 'Age Calculator',
  title: 'Age Calculator',
  lead: 'Calculate exact age in years, months, and days from your birth date.',
  actionLabel: 'Calculate Age',
  whatIsTitle: 'What is Age Calculator?',
  whatIsBody: 'Age Calculator computes precise age accounting for leap years.',
  howToTitle: 'How to use Age Calculator',
  howToSteps: ['Enter your birth date.', 'Optionally set an end date.', 'Click Calculate Age.'],
})

export const gpaCalculatorConfig = cfg({
  path: '/tools/gpa-calculator',
  breadcrumb: 'GPA Calculator',
  title: 'GPA Calculator',
  lead: 'Calculate weighted GPA from grades and credit hours.',
  actionLabel: 'Calculate GPA',
  whatIsTitle: 'What is GPA Calculator?',
  whatIsBody: 'GPA Calculator computes a weighted grade point average on a 4.0 scale.',
  howToTitle: 'How to use GPA Calculator',
  howToSteps: ['Add subjects with grade points and credits.', 'Click Calculate GPA.', 'Copy your GPA result.'],
})

export const discountCalculatorConfig = cfg({
  path: '/tools/discount-calculator',
  breadcrumb: 'Discount Calculator',
  title: 'Discount Calculator',
  lead: 'Calculate sale prices, savings, and optional tax.',
  actionLabel: 'Calculate Discount',
  whatIsTitle: 'What is Discount Calculator?',
  whatIsBody: 'Discount Calculator shows final price and savings from a percentage discount.',
  howToTitle: 'How to use Discount Calculator',
  howToSteps: ['Enter original price and discount percent.', 'Add tax rate if needed.', 'Click Calculate Discount.'],
})

export const compoundInterestConfig = cfg({
  path: '/tools/compound-interest',
  breadcrumb: 'Compound Interest',
  title: 'Compound Interest Calculator',
  lead: 'Calculate compound interest growth with monthly, quarterly, or yearly compounding.',
  actionLabel: 'Calculate Interest',
  whatIsTitle: 'What is Compound Interest Calculator?',
  whatIsBody: 'Compound Interest Calculator projects future value using standard compounding formulas.',
  howToTitle: 'How to use Compound Interest Calculator',
  howToSteps: ['Enter principal, rate, and time.', 'Select compounding frequency.', 'Click Calculate Interest.'],
})

export const unitConverterConfig = cfg({
  path: '/tools/unit-converter',
  breadcrumb: 'Unit Converter',
  title: 'Unit Converter',
  lead: 'Convert length, weight, temperature, volume, area, and time units.',
  whatIsTitle: 'What is Unit Converter?',
  whatIsBody: 'Unit Converter provides accurate conversions between common measurement units.',
  howToTitle: 'How to use Unit Converter',
  howToSteps: ['Select a category and units.', 'Enter a value.', 'See the converted result instantly.'],
})
