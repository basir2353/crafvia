import { z } from 'zod'

export const securityToolSlugSchema = z.enum([
  'password-strength',
  'encrypt-text',
  'decrypt-text',
  'pgp-keygen',
  'ssl-checker',
  'ip-lookup',
  'whois-lookup',
  'secure-delete',
])

export const securityToolRequestSchema = z.object({
  text: z.string().optional(),
  options: z.record(z.string(), z.unknown()).optional(),
})

export const sslCheckSchema = z.object({
  host: z.string().min(1),
})

export const ipLookupSchema = z.object({
  ip: z.string().min(1),
})

export const whoisLookupSchema = z.object({
  domain: z.string().min(1),
})
