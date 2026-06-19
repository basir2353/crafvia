import net from 'net'
import tls from 'tls'

export type SslCheckResult = {
  host: string
  valid: boolean
  subject: string
  issuer: string
  validFrom: string
  validTo: string
  daysRemaining: number
  serialNumber: string
  fingerprint: string
  altNames: string[]
  protocol: string
  error?: string
}

export type IpLookupResult = {
  ip: string
  country?: string
  region?: string
  city?: string
  isp?: string
  org?: string
  timezone?: string
  lat?: number
  lon?: number
  status: string
}

function sanitizeHost(input: string): string {
  const trimmed = input.trim().replace(/^https?:\/\//i, '').split('/')[0] ?? ''
  return trimmed.replace(/:\d+$/, '')
}

function isValidIpv4(ip: string): boolean {
  const parts = ip.split('.')
  if (parts.length !== 4) return false
  return parts.every((p) => {
    const n = Number(p)
    return Number.isInteger(n) && n >= 0 && n <= 255
  })
}

function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(domain)
}

function formatCertField(value: tls.PeerCertificate['subject']): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  const parts = Object.entries(value)
    .map(([key, val]) => `${key}=${Array.isArray(val) ? val.join('/') : val}`)
    .filter(Boolean)
  return parts.join(', ')
}

function whoisQuery(server: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const socket = net.createConnection({ port: 43, host: server }, () => {
      socket.write(`${query}\r\n`)
    })
    socket.setTimeout(12_000, () => {
      socket.destroy()
      reject(new Error('WHOIS query timed out.'))
    })
    socket.on('data', (chunk) => chunks.push(chunk))
    socket.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    socket.on('error', reject)
  })
}

export async function checkSslCertificate(hostInput: string): Promise<SslCheckResult> {
  const host = sanitizeHost(hostInput)
  if (!host) throw new Error('Enter a hostname to check.')

  return new Promise((resolve) => {
    const socket = tls.connect(
      { host, port: 443, servername: host, rejectUnauthorized: false },
      () => {
        const cert = socket.getPeerCertificate()
        const validTo = new Date(cert.valid_to)
        const validFrom = new Date(cert.valid_from)
        const daysRemaining = Math.ceil((validTo.getTime() - Date.now()) / 86_400_000)
        const altNames = (cert.subjectaltname ?? '')
          .split(', ')
          .map((s) => s.replace(/^DNS:/i, ''))
          .filter(Boolean)

        const authError = socket.authorizationError
        resolve({
          host,
          valid: socket.authorized,
          subject: formatCertField(cert.subject),
          issuer: formatCertField(cert.issuer),
          validFrom: validFrom.toISOString(),
          validTo: validTo.toISOString(),
          daysRemaining,
          serialNumber: cert.serialNumber ?? '',
          fingerprint: cert.fingerprint256 ?? cert.fingerprint ?? '',
          altNames,
          protocol: socket.getProtocol() ?? 'unknown',
          error: authError instanceof Error ? authError.message : authError,
        })
        socket.end()
      },
    )

    socket.on('error', (err) => {
      resolve({
        host,
        valid: false,
        subject: '',
        issuer: '',
        validFrom: '',
        validTo: '',
        daysRemaining: 0,
        serialNumber: '',
        fingerprint: '',
        altNames: [],
        protocol: '',
        error: err.message,
      })
    })

    socket.setTimeout(12_000, () => {
      socket.destroy()
      resolve({
        host,
        valid: false,
        subject: '',
        issuer: '',
        validFrom: '',
        validTo: '',
        daysRemaining: 0,
        serialNumber: '',
        fingerprint: '',
        altNames: [],
        protocol: '',
        error: 'Connection timed out.',
      })
    })
  })
}

export async function lookupIpAddress(ipInput: string): Promise<IpLookupResult> {
  const ip = ipInput.trim()
  if (!isValidIpv4(ip)) throw new Error('Enter a valid IPv4 address.')

  const response = await fetch(
    `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,isp,org,timezone,lat,lon,query`,
  )
  if (!response.ok) throw new Error('IP lookup service unavailable.')

  const data = (await response.json()) as {
    status: string
    message?: string
    country?: string
    regionName?: string
    city?: string
    isp?: string
    org?: string
    timezone?: string
    lat?: number
    lon?: number
    query?: string
  }

  if (data.status === 'fail') {
    throw new Error(data.message ?? 'IP lookup failed.')
  }

  return {
    ip: data.query ?? ip,
    country: data.country,
    region: data.regionName,
    city: data.city,
    isp: data.isp,
    org: data.org,
    timezone: data.timezone,
    lat: data.lat,
    lon: data.lon,
    status: data.status,
  }
}

export async function lookupWhois(domainInput: string): Promise<string> {
  const domain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0] ?? ''
  if (!domain || !isValidDomain(domain)) throw new Error('Enter a valid domain name.')

  let result = await whoisQuery('whois.iana.org', domain)
  const referral = result.match(/whois:\s+(\S+)/i)?.[1]
  if (referral && !referral.includes('iana.org')) {
    try {
      result = await whoisQuery(referral, domain)
    } catch {
      // keep iana result
    }
  }

  if (result.trim().length < 20) {
    throw new Error('No WHOIS data returned for this domain.')
  }

  return result.trim()
}

export function sslResultToText(result: SslCheckResult): string {
  const lines = [
    `Host: ${result.host}`,
    `Valid: ${result.valid ? 'Yes' : 'No'}`,
    `Protocol: ${result.protocol}`,
    `Subject: ${result.subject}`,
    `Issuer: ${result.issuer}`,
    `Valid from: ${result.validFrom}`,
    `Valid to: ${result.validTo}`,
    `Days remaining: ${result.daysRemaining}`,
    `Serial: ${result.serialNumber}`,
    `Fingerprint (SHA-256): ${result.fingerprint}`,
  ]
  if (result.altNames.length) lines.push(`Alt names: ${result.altNames.join(', ')}`)
  if (result.error) lines.push(`Error: ${result.error}`)
  return lines.join('\n')
}

export function ipResultToText(result: IpLookupResult): string {
  return [
    `IP: ${result.ip}`,
    `Country: ${result.country ?? '—'}`,
    `Region: ${result.region ?? '—'}`,
    `City: ${result.city ?? '—'}`,
    `ISP: ${result.isp ?? '—'}`,
    `Organization: ${result.org ?? '—'}`,
    `Timezone: ${result.timezone ?? '—'}`,
    `Coordinates: ${result.lat ?? '—'}, ${result.lon ?? '—'}`,
  ].join('\n')
}
