import { Globe, Key, Lock, Search, Shield } from 'lucide-react'
import type { RelatedTool } from './tools'

export type SecurityToolConfig = {
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

const securityRelated: RelatedTool[] = [
  { name: 'Password Strength', description: 'Check password security', icon: Shield, href: '/tools/password-strength' },
  { name: 'Encrypt Text', description: 'AES encryption', icon: Lock, href: '/tools/encrypt-text' },
  { name: 'Decrypt Text', description: 'AES decryption', icon: Lock, href: '/tools/decrypt-text' },
  { name: 'PGP Key Generator', description: 'OpenPGP key pairs', icon: Key, href: '/tools/pgp-keygen' },
  { name: 'SSL Checker', description: 'Certificate details', icon: Globe, href: '/tools/ssl-checker' },
  { name: 'IP Lookup', description: 'IP geolocation', icon: Search, href: '/tools/ip-lookup' },
]

const baseFaq = [
  {
    question: 'Is my data sent to a server?',
    answer: 'Password checks, AES encryption, PGP key generation, and secure delete run in your browser. SSL, IP, and WHOIS lookups use the Crafvia API.',
  },
  {
    question: 'How secure is AES encryption here?',
    answer: 'Text is encrypted with AES-256-GCM and PBKDF2 key derivation (120,000 iterations). Keep your password secret — we cannot recover it.',
  },
]

function cfg(
  partial: Omit<SecurityToolConfig, 'category' | 'popularTitle' | 'faqs' | 'relatedTools' | 'popularOptions'> & {
    faqs?: SecurityToolConfig['faqs']
    relatedTools?: RelatedTool[]
    popularOptions?: SecurityToolConfig['popularOptions']
  },
): SecurityToolConfig {
  return {
    category: 'Security Tools',
    popularTitle: `Popular ${partial.breadcrumb} Options`,
    popularOptions: partial.popularOptions ?? [{ label: `${partial.breadcrumb} Online Free`, href: partial.path }],
    faqs: partial.faqs ?? baseFaq,
    relatedTools: partial.relatedTools ?? securityRelated,
    ...partial,
  }
}

export const passwordStrengthConfig = cfg({
  path: '/tools/password-strength',
  breadcrumb: 'Password Strength',
  title: 'Password Strength Checker',
  lead: 'Analyze password strength and get actionable security feedback instantly.',
  whatIsTitle: 'What is Password Strength Checker?',
  whatIsBody: 'Password Strength Checker scores your password based on length, character variety, and common-password detection.',
  howToTitle: 'How to check password strength',
  howToSteps: ['Enter a password.', 'View strength score and suggestions.', 'Improve based on feedback.'],
})

export const encryptTextConfig = cfg({
  path: '/tools/encrypt-text',
  breadcrumb: 'Encrypt Text',
  title: 'Encrypt Text (AES)',
  lead: 'Encrypt text with AES-256-GCM using a password. Output is safe to store or share.',
  whatIsTitle: 'What is Encrypt Text?',
  whatIsBody: 'Encrypt Text uses Web Crypto AES-GCM with PBKDF2 key derivation entirely in your browser.',
  howToTitle: 'How to encrypt text',
  howToSteps: ['Enter plaintext and a strong password.', 'Click Encrypt.', 'Copy the encrypted payload.'],
})

export const decryptTextConfig = cfg({
  path: '/tools/decrypt-text',
  breadcrumb: 'Decrypt Text',
  title: 'Decrypt Text (AES)',
  lead: 'Decrypt text encrypted with the Crafvia AES encrypt tool.',
  whatIsTitle: 'What is Decrypt Text?',
  whatIsBody: 'Decrypt Text reverses AES payloads created by this site using your password.',
  howToTitle: 'How to decrypt text',
  howToSteps: ['Paste the encrypted payload.', 'Enter the same password used to encrypt.', 'Click Decrypt.'],
})

export const pgpKeygenConfig = cfg({
  path: '/tools/pgp-keygen',
  breadcrumb: 'PGP Key Generator',
  title: 'PGP Key Generator',
  lead: 'Generate OpenPGP RSA key pairs for email and file encryption.',
  whatIsTitle: 'What is PGP Key Generator?',
  whatIsBody: 'PGP Key Generator creates 2048-bit RSA OpenPGP public and private keys using OpenPGP.js in your browser.',
  howToTitle: 'How to generate PGP keys',
  howToSteps: ['Enter name and email.', 'Optionally set a passphrase.', 'Generate and download keys.'],
})

export const sslCheckerConfig = cfg({
  path: '/tools/ssl-checker',
  breadcrumb: 'SSL Checker',
  title: 'SSL Certificate Checker',
  lead: 'Check SSL/TLS certificate details, expiry, and issuer for any hostname.',
  whatIsTitle: 'What is SSL Checker?',
  whatIsBody: 'SSL Checker connects to port 443 and reads the server certificate chain and validity dates.',
  howToTitle: 'How to check SSL',
  howToSteps: ['Enter a domain (e.g. example.com).', 'Click Check SSL.', 'Review certificate details and expiry.'],
})

export const ipLookupConfig = cfg({
  path: '/tools/ip-lookup',
  breadcrumb: 'IP Lookup',
  title: 'IP Address Lookup',
  lead: 'Look up geolocation and ISP information for any IPv4 address.',
  whatIsTitle: 'What is IP Lookup?',
  whatIsBody: 'IP Lookup queries ip-api.com for country, city, ISP, and timezone data.',
  howToTitle: 'How to look up an IP',
  howToSteps: ['Enter an IPv4 address.', 'Click Lookup.', 'View location and network details.'],
})

export const whoisLookupConfig = cfg({
  path: '/tools/whois-lookup',
  breadcrumb: 'WHOIS Lookup',
  title: 'WHOIS Domain Lookup',
  lead: 'Look up WHOIS registration records for any domain name.',
  whatIsTitle: 'What is WHOIS Lookup?',
  whatIsBody: 'WHOIS Lookup queries authoritative WHOIS servers for domain registration data.',
  howToTitle: 'How to look up WHOIS',
  howToSteps: ['Enter a domain name.', 'Click Lookup WHOIS.', 'Review registrar and registration details.'],
})

export const secureDeleteConfig = cfg({
  path: '/tools/secure-delete',
  breadcrumb: 'Secure File Delete',
  title: 'Secure File Delete',
  lead: 'Overwrite file data in browser memory before releasing it.',
  whatIsTitle: 'What is Secure File Delete?',
  whatIsBody: 'Secure File Delete overwrites uploaded file bytes in memory multiple times. It does not delete files from your disk — browsers cannot do that.',
  howToTitle: 'How to securely wipe a file in memory',
  howToSteps: ['Upload a file.', 'Click Secure wipe.', 'Confirm the in-memory data was overwritten.'],
  relatedTools: [
    { name: 'File Hash Checker', description: 'Verify file checksums', icon: Shield, href: '/tools/file-hash' },
    ...securityRelated,
  ],
})
