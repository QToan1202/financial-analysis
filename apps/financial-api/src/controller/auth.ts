import { NextFunction, Response } from 'express'
import { HydratedDocument } from 'mongoose'
import jwt, { JsonWebTokenError, Secret } from 'jsonwebtoken'

import { IUser, IUserMethods } from '../models/user/type'
import User from '../models/user'
import { IRequest, Token } from '../types'

export const register = async (
  request: IRequest<IUser>,
  response: Response,
  next: NextFunction
) => {
  try {
    const user: HydratedDocument<IUser> = new User(request.body)
    const token: Token = generateToken({ id: user._id })

    await user.save()
    response.json(
      user.toJSON({
        transform: (_, ret) => ({ ...ret, ...token }),
      })
    )
  } catch (error) {
    next(error)
  }
}

export const login = async (
  request: IRequest<Pick<IUser, 'email' | 'password'>>,
  response: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = request.body
    const findUser: (IUser & IUserMethods) | null = await User.findOne({ email })
      .select('+password')
      .exec()

    if (!findUser) {
      response.status(401).json({ message: 'Wrong credentials, check your email or password' })
      return
    }

    const matchPassword: boolean = await findUser.matchPassword(password)

    if (!matchPassword) {
      response.status(401).json({ message: 'Wrong credentials, check your email or password' })
      return
    }

    const token: Token = generateToken({ id: findUser._id })

    response.json(
      findUser.toJSON({
        transform: (_, ret) => ({ ...ret, ...token }),
      })
    )
  } catch (error) {
    next(error)
  }
}

const generateToken = (payload: object | string | Buffer): Token => {
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET as Secret, {
    expiresIn: process.env.JWT_EXPIRE,
  })

  const refreshToken = jwt.sign(payload, process.env.SECRET as Secret, {
    expiresIn: process.env.EXPIRE,
  })

  return { accessToken, refreshToken }
}

export const verifyToken = (request: IRequest, response: Response, next: NextFunction) => {
  const token = request.headers['authorization']

  if (!token) {
    response.status(401).json({ message: 'Access Denied. No token provided.' })
    return
  }

  try {
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET as string)
    next()
  } catch (err) {
    response.status(403).json({ message: 'Invalid token.' })
  }
}

export const refreshToken = (
  request: IRequest<{ token: string }>,
  response: Response,
  next: NextFunction
) => {
  const { token } = request.body
  try {
    // Verify refresh token
    const decoded = jwt.verify(token, process.env.SECRET as Secret)
    const { accessToken } =
      typeof decoded === 'string' ? generateToken(decoded) : generateToken({ id: decoded.id })

    response.json({ token: accessToken })
  } catch (error) {
    if (!(error instanceof JsonWebTokenError)) next(error)
  }
}
