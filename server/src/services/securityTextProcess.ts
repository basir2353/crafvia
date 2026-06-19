export type PasswordStrengthResult = {
  score: number
  label: string
  feedback: string[]
  length: number
  hasLower: boolean
  hasUpper: boolean
  hasDigit: boolean
  hasSymbol: boolean
}

const COMMON_PASSWORDS = new Set([
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password1',
  '111111',
  '123456789',
  'letmein',
  'welcome',
  'admin',
  'iloveyou',
])

export function checkPasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = []
  let score = 0

  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      feedback: ['Enter a password to analyze.'],
      length: 0,
      hasLower: false,
      hasUpper: false,
      hasDigit: false,
      hasSymbol: false,
    }
  }

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSymbol = /[^A-Za-z0-9]/.test(password)

  if (password.length >= 8) score += 15
  else feedback.push('Use at least 8 characters.')
  if (password.length >= 12) score += 15
  if (password.length >= 16) score += 10
  if (hasLower) score += 10
  else feedback.push('Add lowercase letters.')
  if (hasUpper) score += 10
  else feedback.push('Add uppercase letters.')
  if (hasDigit) score += 10
  else feedback.push('Add numbers.')
  if (hasSymbol) score += 15
  else feedback.push('Add symbols (!@#$…).')
  if (new Set(password).size >= password.length * 0.6) score += 10

  const lower = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) {
    score = Math.min(score, 20)
    feedback.push('This is a commonly used password.')
  }
  if (/(.)\1{2,}/.test(password)) {
    score -= 10
    feedback.push('Avoid repeated characters.')
  }
  if (/^[0-9]+$/.test(password)) {
    score -= 15
    feedback.push('Avoid numbers-only passwords.')
  }

  score = Math.max(0, Math.min(100, score))

  let label = 'Very Weak'
  if (score >= 80) label = 'Very Strong'
  else if (score >= 60) label = 'Strong'
  else if (score >= 40) label = 'Fair'
  else if (score >= 20) label = 'Weak'

  if (!feedback.length) feedback.push('Good password composition.')

  return { score, label, feedback, length: password.length, hasLower, hasUpper, hasDigit, hasSymbol }
}
