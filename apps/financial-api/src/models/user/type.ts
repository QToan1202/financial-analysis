import { Document, Model } from 'mongoose'

export interface IUser extends Document {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  avatar?: string
  verify?: boolean
  status: 'activate' | 'deactivate'
}

export interface IUserMethods {
  matchPassword: (password: string) => boolean | Promise<boolean>
}

export type UserModel = Model<IUser, {}, IUserMethods>
