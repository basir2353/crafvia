import { Loader2, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  fetchIpLookup,
  fetchSslCheck,
  fetchWhoisLookup,
  processSecurityLocal,
} from '../../api/securityTools'
import {
  PasswordStrengthMeter,
  SecurityOutputActions,
  SecurityToolShell,
} from '../../components/SecurityToolShell'
import {
  decryptTextConfig,
  encryptTextConfig,
  ipLookupConfig,
  passwordStrengthConfig,
  pgpKeygenConfig,
  secureDeleteConfig,
  sslCheckerConfig,
  whoisLookupConfig,
} from '../../config/securityTools'
import { generatePgpKeyPair } from '../../utils/securityPgp'
import {
  checkPasswordStrength,
  decryptTextAes,
  encryptTextAes,
  secureWipeBuffer,
} from '../../utils/securityProcess'

export function PasswordStrengthPage() {
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)

  const result = useMemo(() => checkPasswordStrength(password), [password])
  const output = useMemo(() => {
    if (!password) return ''
    return processSecurityLocal('password-strength', { text: password }).output ?? ''
  }, [password])

  return (
    <SecurityToolShell config={passwordStrengthConfig}>
      <div className="tool-controls">
        <input
          className="tool-select"
          type={show ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password to analyze"
          autoComplete="off"
        />
        <button type="button" className="tool-secondary-btn" onClick={() => setShow((v) => !v)}>
          {show ? 'Hide' : 'Show'}
        </button>
      </div>
      {password && (
        <>
          <PasswordStrengthMeter score={result.score} label={result.label} />
          <ul className="tool-checklist">
            {result.feedback.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <textarea className="tool-textarea" value={output} readOnly rows={8} />
        </>
      )}
    </SecurityToolShell>
  )
}

export function EncryptTextPage() {
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const encrypt = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await encryptTextAes(text, password)
      setOutput(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Encryption failed')
      setOutput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={encryptTextConfig}>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Plaintext to encrypt" />
      <input className="tool-select" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Encryption password" autoComplete="new-password" />
      <button type="button" className="tool-compress-btn" onClick={() => void encrypt()} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Encrypting…</> : 'Encrypt'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {output && (
        <>
          <textarea className="tool-textarea" value={output} readOnly rows={5} />
          <SecurityOutputActions output={output} downloadName="encrypted.txt" />
        </>
      )}
    </SecurityToolShell>
  )
}

export function DecryptTextPage() {
  const [text, setText] = useState('')
  const [password, setPassword] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const decrypt = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await decryptTextAes(text, password)
      setOutput(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Decryption failed')
      setOutput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={decryptTextConfig}>
      <textarea className="tool-textarea" value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Paste CRAFVIA-AES:… encrypted payload" />
      <input className="tool-select" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Decryption password" autoComplete="current-password" />
      <button type="button" className="tool-compress-btn" onClick={() => void decrypt()} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Decrypting…</> : 'Decrypt'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {output && (
        <>
          <textarea className="tool-textarea" value={output} readOnly rows={6} />
          <SecurityOutputActions output={output} downloadName="decrypted.txt" />
        </>
      )}
    </SecurityToolShell>
  )
}

export function PgpKeygenPage() {
  const [name, setName] = useState('Crafvia User')
  const [email, setEmail] = useState('user@example.com')
  const [passphrase, setPassphrase] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [meta, setMeta] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await generatePgpKeyPair({ name, email, passphrase })
      setPublicKey(result.publicKey)
      setPrivateKey(result.privateKey)
      setMeta(`Fingerprint: ${result.fingerprint}\nKey ID: ${result.keyId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Key generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={pgpKeygenConfig}>
      <input className="tool-select" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <input className="tool-select" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input className="tool-select" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Passphrase (optional)" autoComplete="new-password" />
      <button type="button" className="tool-compress-btn" onClick={() => void generate()} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Generating keys…</> : 'Generate PGP keys'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {meta && <p className="tool-result-stats" style={{ whiteSpace: 'pre-wrap' }}>{meta}</p>}
      {publicKey && (
        <>
          <label className="tool-control-label">Public key</label>
          <textarea className="tool-textarea" value={publicKey} readOnly rows={8} />
          <SecurityOutputActions output={publicKey} downloadName="public-key.asc" />
        </>
      )}
      {privateKey && (
        <>
          <label className="tool-control-label">Private key — keep secret</label>
          <textarea className="tool-textarea" value={privateKey} readOnly rows={10} />
          <SecurityOutputActions output={privateKey} downloadName="private-key.asc" />
        </>
      )}
    </SecurityToolShell>
  )
}

export function SslCheckerPage() {
  const [host, setHost] = useState('google.com')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const check = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchSslCheck(host)
      setOutput(result.output ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SSL check failed')
      setOutput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={sslCheckerConfig}>
      <input className="tool-select" value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com" />
      <button type="button" className="tool-compress-btn" onClick={() => void check()} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Checking SSL…</> : 'Check SSL'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {output && (
        <>
          <textarea className="tool-textarea" value={output} readOnly rows={12} />
          <SecurityOutputActions output={output} downloadName="ssl-report.txt" />
        </>
      )}
    </SecurityToolShell>
  )
}

export function IpLookupPage() {
  const [ip, setIp] = useState('8.8.8.8')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchIpLookup(ip)
      setOutput(result.output ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'IP lookup failed')
      setOutput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={ipLookupConfig}>
      <input className="tool-select" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="8.8.8.8" />
      <button type="button" className="tool-compress-btn" onClick={() => void lookup()} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Looking up…</> : 'Lookup IP'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {output && (
        <>
          <textarea className="tool-textarea" value={output} readOnly rows={10} />
          <SecurityOutputActions output={output} downloadName="ip-lookup.txt" />
        </>
      )}
    </SecurityToolShell>
  )
}

export function WhoisLookupPage() {
  const [domain, setDomain] = useState('example.com')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchWhoisLookup(domain)
      setOutput(result.output ?? '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'WHOIS lookup failed')
      setOutput('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={whoisLookupConfig}>
      <input className="tool-select" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" />
      <button type="button" className="tool-compress-btn" onClick={() => void lookup()} disabled={loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Looking up WHOIS…</> : 'Lookup WHOIS'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {output && (
        <>
          <textarea className="tool-textarea" value={output} readOnly rows={16} />
          <SecurityOutputActions output={output} downloadName="whois.txt" />
        </>
      )}
    </SecurityToolShell>
  )
}

export function SecureDeletePage() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null)

  const onFile = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileSize(file.size)
    setStatus(null)
    setError(null)
    setBuffer(await file.arrayBuffer())
  }

  const wipe = async () => {
    if (!buffer) return
    setLoading(true)
    setError(null)
    try {
      await secureWipeBuffer(buffer)
      setStatus(`Securely overwrote ${fileSize.toLocaleString()} bytes of "${fileName}" in browser memory (3 passes). The original file on disk is unchanged.`)
      setBuffer(null)
      setFileName('')
      setFileSize(0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Secure wipe failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SecurityToolShell config={secureDeleteConfig}>
      <button type="button" className="upload-zone" onClick={() => document.getElementById('secure-delete-input')?.click()}>
        <Upload size={24} aria-hidden />
        <span>{fileName || 'Upload file to wipe from memory'}</span>
        <input id="secure-delete-input" type="file" className="upload-input" onChange={(e) => void onFile(e.target.files)} />
      </button>
      {fileName && <p className="tool-result-stats">{fileName} · {fileSize.toLocaleString()} bytes loaded in memory</p>}
      <button type="button" className="tool-compress-btn" onClick={() => void wipe()} disabled={!buffer || loading}>
        {loading ? <><Loader2 size={18} className="spin" aria-hidden /> Wiping…</> : 'Secure wipe memory'}
      </button>
      {error && <p className="tool-error">{error}</p>}
      {status && <p className="tool-result-stats">{status}</p>}
    </SecurityToolShell>
  )
}
