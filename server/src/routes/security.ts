import { Router } from 'express'
import { AppError } from '../middleware/errorHandler.js'
import {
  checkSslCertificate,
  ipResultToText,
  lookupIpAddress,
  lookupWhois,
  sslResultToText,
} from '../services/securityProcess.js'
import {
  ipLookupSchema,
  securityToolRequestSchema,
  securityToolSlugSchema,
  sslCheckSchema,
  whoisLookupSchema,
} from '../validators/security.js'
import { checkPasswordStrength } from '../services/securityTextProcess.js'

export const securityRouter = Router()

securityRouter.post('/ssl-check', async (req, res, next) => {
  try {
    const parsed = sslCheckSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Enter a hostname to check.' })
      return
    }
    const result = await checkSslCertificate(parsed.data.host)
    res.json({ output: sslResultToText(result), meta: result })
  } catch (error) {
    next(error)
  }
})

securityRouter.get('/ip-lookup', async (req, res, next) => {
  try {
    const parsed = ipLookupSchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Enter a valid IP address.' })
      return
    }
    const result = await lookupIpAddress(parsed.data.ip)
    res.json({ output: ipResultToText(result), meta: result })
  } catch (error) {
    next(error)
  }
})

securityRouter.get('/whois-lookup', async (req, res, next) => {
  try {
    const parsed = whoisLookupSchema.safeParse(req.query)
    if (!parsed.success) {
      res.status(400).json({ error: 'Enter a valid domain name.' })
      return
    }
    const output = await lookupWhois(parsed.data.domain)
    res.json({ output, meta: { domain: parsed.data.domain } })
  } catch (error) {
    next(error)
  }
})

securityRouter.post('/:slug', (req, res, next) => {
  try {
    const slugResult = securityToolSlugSchema.safeParse(req.params.slug)
    if (!slugResult.success) {
      throw new AppError('Unknown security tool.', 404)
    }

    const bodyResult = securityToolRequestSchema.safeParse(req.body)
    if (!bodyResult.success) {
      res.status(400).json({
        error: 'Invalid request',
        details: bodyResult.error.issues.map((issue) => issue.message),
      })
      return
    }

    if (slugResult.data === 'password-strength') {
      const password = bodyResult.data.text ?? ''
      const result = checkPasswordStrength(password)
      const lines = [
        `Strength: ${result.label} (${result.score}/100)`,
        `Length: ${result.length}`,
        '',
        'Suggestions:',
        ...result.feedback.map((f) => `• ${f}`),
      ]
      res.json({ output: lines.join('\n'), meta: result })
      return
    }

    res.status(400).json({ error: 'This security tool runs in the browser.' })
  } catch (error) {
    next(error)
  }
})
