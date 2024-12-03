import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId?: string | jwt.JwtPayload
    }
  }
}

export const verifyToken = (request: Request, response: Response, next: NextFunction) => {
  const token = request.headers['authorization']

  if (!token) {
    response.status(401).json({ message: 'Access Denied. No token provided.' })
    return
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET as string)
    request.userId = decoded

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return response.status(401).json({
        message: 'Your authentication token has expired',
      })
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return response.status(403).json({
        message: 'The provided token is invalid',
      })
    }

    return response.status(500).json({
      message: 'An error occurred during authentication',
    })
  }
}

export default verifyToken
module.exports = verifyToken
