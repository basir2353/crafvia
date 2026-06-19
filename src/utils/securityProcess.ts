export type SecurityToolSlug =
  | 'password-strength'
  | 'encrypt-text'
  | 'decrypt-text'
  | 'pgp-keygen'
  | 'ssl-checker'
  | 'ip-lookup'
  | 'whois-lookup'
  | 'secure-delete'

export type SecurityToolRequest = {
  text?: string
  options?: Record<string, unknown>
}

export type SecurityToolResponse = {
  output?: string
  error?: string
  meta?: Record<string, unknown>
}

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

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function deriveAesKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const saltBytes = new Uint8Array(salt)
  const material = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: 120_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

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

export async function encryptTextAes(plaintext: string, password: string): Promise<string> {
  if (!plaintext) throw new Error('Enter text to encrypt.')
  if (!password) throw new Error('Enter an encryption password.')

  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveAesKey(password, salt)
  const ivBytes = new Uint8Array(iv)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    new TextEncoder().encode(plaintext),
  )

  const payload = {
    v: 1,
    alg: 'AES-GCM',
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(new Uint8Array(ciphertext)),
  }
  return `CRAFVIA-AES:${btoa(JSON.stringify(payload))}`
}

export async function decryptTextAes(ciphertext: string, password: string): Promise<string> {
  if (!ciphertext.trim()) throw new Error('Enter encrypted text to decrypt.')
  if (!password) throw new Error('Enter the decryption password.')

  const trimmed = ciphertext.trim()
  const encoded = trimmed.startsWith('CRAFVIA-AES:') ? trimmed.slice('CRAFVIA-AES:'.length) : trimmed

  let payload: { salt: string; iv: string; data: string }
  try {
    payload = JSON.parse(atob(encoded)) as { salt: string; iv: string; data: string }
  } catch {
    throw new Error('Invalid encrypted payload format.')
  }

  const salt = base64ToBytes(payload.salt)
  const iv = new Uint8Array(base64ToBytes(payload.iv))
  const data = new Uint8Array(base64ToBytes(payload.data))
  const key = await deriveAesKey(password, salt)

  try {
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(plain)
  } catch {
    throw new Error('Decryption failed. Wrong password or corrupted data.')
  }
}

export async function secureWipeBuffer(buffer: ArrayBuffer): Promise<void> {
  const view = new Uint8Array(buffer)
  for (let pass = 0; pass < 3; pass++) {
    crypto.getRandomValues(view)
    view.fill(0)
  }
}

export function processSecurityTool(slug: SecurityToolSlug, request: SecurityToolRequest): SecurityToolResponse {
  switch (slug) {
    case 'password-strength': {
      const password = request.text ?? ''
      const result = checkPasswordStrength(password)
      const lines = [
        `Strength: ${result.label} (${result.score}/100)`,
        `Length: ${result.length}`,
        `Lowercase: ${result.hasLower ? 'Yes' : 'No'}`,
        `Uppercase: ${result.hasUpper ? 'Yes' : 'No'}`,
        `Numbers: ${result.hasDigit ? 'Yes' : 'No'}`,
        `Symbols: ${result.hasSymbol ? 'Yes' : 'No'}`,
        '',
        'Suggestions:',
        ...result.feedback.map((f) => `• ${f}`),
      ]
      return { output: lines.join('\n'), meta: { ...result } }
    }
    case 'encrypt-text':
    case 'decrypt-text':
    case 'pgp-keygen':
    case 'ssl-checker':
    case 'ip-lookup':
    case 'whois-lookup':
    case 'secure-delete':
      return { error: 'This security tool runs interactively in the browser or via the security API.' }
    default:
      return { error: 'Unknown security tool.' }
  }
}
