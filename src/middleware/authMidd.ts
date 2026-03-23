import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { getJwtConfig } from '../config/jwt.config'
import { AppError } from '../errors/AppError'

export interface AuthRequest extends Request {
  user?: { sub: string; email: string }
}

export const authMiddleware = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer', '').trim()

    if (!token) {
      throw new AppError(401, 'Token inválido!')
    }

    const decoded = jwt.verify(token, getJwtConfig().access.secret) as any

    if (decoded.type !== 'access') {
      throw new AppError(401, 'Token inválido!')
    }

    req.user = { sub: decoded.sub, email: decoded.email }
    next()
  } catch (_error) {
    throw new AppError(401, 'Token Inválido!')
  }
}
