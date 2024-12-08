import { Document } from 'mongoose'

import { IUser } from '../user/type'

export interface IDocument extends Document {
  ids: string[] // The actual array of ID of original document that located in vector store
  name: string
  extension: string
  type: string
  size: number
  user: IUser
}
