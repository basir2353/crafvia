export const MAX_QR_CONTENT_LENGTH = 4000
export const MAX_LOGO_BYTES = 2 * 1024 * 1024

export type QrContentType =
  | 'url'
  | 'text'
  | 'email'
  | 'phone'
  | 'sms'
  | 'whatsapp'
  | 'wifi'
  | 'vcard'
  | 'social'
  | 'maps'
  | 'custom'

export type QrSizePreset = 'small' | 'medium' | 'large' | 'custom'
export type QrErrorCorrection = 'low' | 'medium' | 'quartile' | 'high'

export type QrFormFields = {
  content: string
  email: string
  emailSubject: string
  emailBody: string
  phone: string
  smsBody: string
  whatsappMessage: string
  wifiSsid: string
  wifiPassword: string
  wifiEncryption: 'WPA' | 'WEP' | 'nopass'
  wifiHidden: boolean
  firstName: string
  lastName: string
  vcardPhone: string
  vcardEmail: string
  organization: string
  website: string
  socialPlatform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'youtube'
  socialHandle: string
  mapsQuery: string
}

export const QR_SIZE_PRESETS: Record<Exclude<QrSizePreset, 'custom'>, number> = {
  small: 256,
  medium: 384,
  large: 512,
}

export const ERROR_CORRECTION_MAP: Record<QrErrorCorrection, 'L' | 'M' | 'Q' | 'H'> = {
  low: 'L',
  medium: 'M',
  quartile: 'Q',
  high: 'H',
}

export const CONTENT_TYPE_OPTIONS: { value: QrContentType; label: string }[] = [
  { value: 'url', label: 'Website URL' },
  { value: 'text', label: 'Plain Text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone Number' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp Message' },
  { value: 'wifi', label: 'WiFi Credentials' },
  { value: 'vcard', label: 'Contact (vCard)' },
  { value: 'social', label: 'Social Media Link' },
  { value: 'maps', label: 'Google Maps Location' },
  { value: 'custom', label: 'Custom Data' },
]

export const SIZE_OPTIONS: { value: QrSizePreset; label: string }[] = [
  { value: 'small', label: 'Small (256px)' },
  { value: 'medium', label: 'Medium (384px)' },
  { value: 'large', label: 'Large (512px)' },
  { value: 'custom', label: 'Custom size' },
]

export const ERROR_CORRECTION_OPTIONS: { value: QrErrorCorrection; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'quartile', label: 'Quartile' },
  { value: 'high', label: 'High' },
]

export function createDefaultQrFields(): QrFormFields {
  return {
    content: '',
    email: '',
    emailSubject: '',
    emailBody: '',
    phone: '',
    smsBody: '',
    whatsappMessage: '',
    wifiSsid: '',
    wifiPassword: '',
    wifiEncryption: 'WPA',
    wifiHidden: false,
    firstName: '',
    lastName: '',
    vcardPhone: '',
    vcardEmail: '',
    organization: '',
    website: '',
    socialPlatform: 'instagram',
    socialHandle: '',
    mapsQuery: '',
  }
}

export function normalizeUrl(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

export function validateUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return 'Please enter a URL.'

  try {
    const normalized = normalizeUrl(trimmed)
    const parsed = new URL(normalized)
    if (!parsed.hostname) return 'Please enter a valid URL.'
    return null
  } catch {
    return 'Please enter a valid URL.'
  }
}

function escapeVcard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

function normalizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+]/g, '')
}

function buildSocialUrl(platform: QrFormFields['socialPlatform'], handle: string): string {
  const value = handle.trim().replace(/^@/, '')
  if (!value) return ''

  switch (platform) {
    case 'instagram':
      return `https://instagram.com/${value}`
    case 'facebook':
      return value.startsWith('http') ? value : `https://facebook.com/${value}`
    case 'twitter':
      return `https://twitter.com/${value}`
    case 'linkedin':
      return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`
    case 'tiktok':
      return `https://tiktok.com/@${value}`
    case 'youtube':
      return value.startsWith('http') ? value : `https://youtube.com/@${value}`
    default:
      return value
  }
}

export function buildQrPayload(type: QrContentType, fields: QrFormFields): string {
  switch (type) {
    case 'url':
      return normalizeUrl(fields.content)
    case 'text':
    case 'custom':
      return fields.content.trim()
    case 'email': {
      const params = new URLSearchParams()
      if (fields.emailSubject.trim()) params.set('subject', fields.emailSubject.trim())
      if (fields.emailBody.trim()) params.set('body', fields.emailBody.trim())
      const query = params.toString()
      return query
        ? `mailto:${fields.email.trim()}?${query}`
        : `mailto:${fields.email.trim()}`
    }
    case 'phone':
      return `tel:${normalizePhone(fields.phone)}`
    case 'sms': {
      const phone = normalizePhone(fields.phone)
      return fields.smsBody.trim()
        ? `sms:${phone}?body=${encodeURIComponent(fields.smsBody.trim())}`
        : `sms:${phone}`
    }
    case 'whatsapp': {
      const phone = normalizePhone(fields.phone)
      const base = `https://wa.me/${phone.replace(/^\+/, '')}`
      return fields.whatsappMessage.trim()
        ? `${base}?text=${encodeURIComponent(fields.whatsappMessage.trim())}`
        : base
    }
    case 'wifi': {
      const encryption = fields.wifiEncryption
      const hidden = fields.wifiHidden ? 'true' : 'false'
      const password =
        encryption === 'nopass' ? '' : escapeVcard(fields.wifiPassword)
      return `WIFI:T:${encryption};S:${escapeVcard(fields.wifiSsid)};P:${password};H:${hidden};;`
    }
    case 'vcard':
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escapeVcard(fields.lastName)};${escapeVcard(fields.firstName)};;;`,
        `FN:${escapeVcard(`${fields.firstName} ${fields.lastName}`.trim())}`,
        fields.organization.trim() ? `ORG:${escapeVcard(fields.organization)}` : '',
        fields.vcardPhone.trim() ? `TEL:${normalizePhone(fields.vcardPhone)}` : '',
        fields.vcardEmail.trim() ? `EMAIL:${fields.vcardEmail.trim()}` : '',
        fields.website.trim() ? `URL:${normalizeUrl(fields.website)}` : '',
        'END:VCARD',
      ]
        .filter(Boolean)
        .join('\n')
    case 'social':
      return buildSocialUrl(fields.socialPlatform, fields.socialHandle)
    case 'maps': {
      const query = fields.mapsQuery.trim()
      return `https://maps.google.com/?q=${encodeURIComponent(query)}`
    }
    default:
      return fields.content.trim()
  }
}

export function validateQrInput(
  type: QrContentType,
  fields: QrFormFields,
): string | null {
  const payload = buildQrPayload(type, fields)

  switch (type) {
    case 'url':
      return validateUrl(fields.content)
    case 'text':
    case 'custom':
      if (!fields.content.trim()) return 'Please enter content for the QR code.'
      break
    case 'email':
      if (!fields.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
        return 'Please enter a valid email address.'
      }
      break
    case 'phone':
      if (!normalizePhone(fields.phone)) return 'Please enter a valid phone number.'
      break
    case 'sms':
    case 'whatsapp':
      if (!normalizePhone(fields.phone)) return 'Please enter a valid phone number.'
      break
    case 'wifi':
      if (!fields.wifiSsid.trim()) return 'Please enter a WiFi network name.'
      if (fields.wifiEncryption !== 'nopass' && !fields.wifiPassword.trim()) {
        return 'Please enter a WiFi password.'
      }
      break
    case 'vcard':
      if (!fields.firstName.trim() && !fields.lastName.trim()) {
        return 'Please enter a first or last name for the contact.'
      }
      break
    case 'social':
      if (!fields.socialHandle.trim()) return 'Please enter a social media username or URL.'
      break
    case 'maps':
      if (!fields.mapsQuery.trim()) return 'Please enter a location or address.'
      break
    default:
      break
  }

  if (!payload) return 'Please provide valid content for the QR code.'
  if (payload.length > MAX_QR_CONTENT_LENGTH) {
    return `Content exceeds ${MAX_QR_CONTENT_LENGTH.toLocaleString()} character limit.`
  }

  if (type === 'social') {
    const socialUrl = buildSocialUrl(fields.socialPlatform, fields.socialHandle)
    if (!socialUrl) return 'Please enter a valid social media username or URL.'
  }

  return null
}

export function resolveQrSize(preset: QrSizePreset, customSize: number): number {
  if (preset === 'custom') {
    return Math.min(1024, Math.max(128, customSize || 384))
  }
  return QR_SIZE_PRESETS[preset]
}

export async function readLogoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please upload a PNG, JPG, or WebP logo image.')
  }
  if (file.size > MAX_LOGO_BYTES) {
    throw new Error('Logo image exceeds 2MB limit.')
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read logo image.'))
    reader.readAsDataURL(file)
  })
}
