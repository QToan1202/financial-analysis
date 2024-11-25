import { Request } from 'express'

export interface Token {
  accessToken: string
  refreshToken: string
}

export interface IRequest<T = unknown> extends Request {
  body: T
}
