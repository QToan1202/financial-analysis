import { OAuth2Client } from 'google-auth-library'
import { IRequest, Token } from '../types'
import { NextFunction, Response } from 'express'

import { generateToken } from './auth'
import User from '../models/user'
import { IUser } from '../models/user/type'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, 'postmessage')

const verifyGoogleToken = async (token: string) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    })
    return { payload: ticket.getPayload() }
  } catch (error) {
    return { error: 'Invalid user detected. Please try again' }
  }
}

export const register = async (
  request: IRequest<{ credential?: string }>,
  response: Response,
  next: NextFunction
) => {
  try {
    const { credential } = request.body
    if (!credential) return
    const verificationResponse = await verifyGoogleToken(credential)

    if (verificationResponse.error) {
      response.status(400).json({
        message: verificationResponse.error,
      })
      return
    }
    const profile = verificationResponse?.payload
    console.log(profile)
  } catch (error) {
    next(error)
  }
}

export const login = async (
  request: IRequest<{ credential?: string }>,
  response: Response,
  next: NextFunction
) => {
  try {
    const { credential } = request.body
    if (!credential) return
    const verificationResponse = await verifyGoogleToken(credential)

    if (verificationResponse.error) {
      response.status(400).json({
        message: verificationResponse.error,
      })
      return
    }
    const profile = verificationResponse?.payload
    const existUser: IUser | null = await User.findOne({ email: profile?.email }).exec()
    if (!existUser) {
      response.status(400).json({
        message: 'You are not registered. Please sign up',
      })
      return
    }
    const token: Token = generateToken({ id: existUser._id })
    response.json(
      existUser.toJSON({
        transform: (_, ret) => ({ ...ret, ...token }),
      })
    )
  } catch (error) {
    next(error)
  }
}
