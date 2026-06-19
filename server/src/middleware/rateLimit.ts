import rateLimit from 'express-rate-limit'

const isDev = process.env.NODE_ENV !== 'production'

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => {
    if (!isDev) return false
    const ip = req.ip ?? ''
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'
  },
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts, please try again later.' },
})

export const compressRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Compression rate limit exceeded.' },
})

export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI generation rate limit exceeded. Please try again later.' },
})
