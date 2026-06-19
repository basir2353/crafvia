import { Router } from 'express'
import { prisma } from '../db/client.js'
import { AppError } from '../middleware/errorHandler.js'
import { authRateLimit } from '../middleware/rateLimit.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.js'
import { syncAdminRole } from '../utils/adminAccess.js'
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from '../validators/auth.js'

export const authRouter = Router()

function userResponse(user: {
  id: string
  email: string
  name: string | null
  plan: 'FREE' | 'PRO'
  role: 'USER' | 'ADMIN'
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    plan: user.plan,
    role: user.role,
  }
}

function accessTokenFor(user: {
  id: string
  email: string
  plan: 'FREE' | 'PRO'
  role: 'USER' | 'ADMIN'
}) {
  return signAccessToken({
    sub: user.id,
    email: user.email,
    plan: user.plan,
    role: user.role,
  })
}

authRouter.post('/register', authRateLimit, async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })
    if (existing) {
      throw new AppError('Email already registered', 409)
    }

    const passwordHash = await hashPassword(body.password)
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        passwordHash,
        name: body.name,
      },
    })
    const role = await syncAdminRole(user)
    const authUser = { ...user, role }

    const refreshToken = signRefreshToken(user.id)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })

    res.status(201).json({
      user: userResponse(authUser),
      accessToken: accessTokenFor(authUser),
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/login', authRateLimit, async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    })
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      throw new AppError('Invalid email or password', 401)
    }

    const role = await syncAdminRole(user)
    const authUser = { ...user, role }

    const refreshToken = signRefreshToken(user.id)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    })

    res.json({
      user: userResponse(authUser),
      accessToken: accessTokenFor(authUser),
      refreshToken,
    })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const body = refreshSchema.parse(req.body)
    const payload = verifyRefreshToken(body.refreshToken)
    const stored = await prisma.refreshToken.findUnique({
      where: { token: body.refreshToken },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
      throw new AppError('Invalid refresh token', 401)
    }

    res.json({
      accessToken: signAccessToken({
        sub: stored.user.id,
        email: stored.user.email,
        plan: stored.user.plan,
        role: stored.user.role,
      }),
    })
  } catch (error) {
    next(error)
  }
})

authRouter.post('/logout', async (req, res, next) => {
  try {
    const body = refreshSchema.parse(req.body)
    await prisma.refreshToken.deleteMany({ where: { token: body.refreshToken } })
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

authRouter.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
    })
    if (!user) throw new AppError('User not found', 404)
    const role = await syncAdminRole(user)
    res.json({ user: userResponse({ ...user, role }) })
  } catch (error) {
    next(error)
  }
})
