import { model, Schema } from 'mongoose'

import { IDocument } from './type'

const validateListOfId = (list: string[]) => list.length >= 1

const documentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  ids: {
    type: [String],
    required: true,
    validate: [validateListOfId, 'Uh oh, {PATH} does not have any items.'],
  },
  extension: { type: String, required: true },
  type: String,
  size: Number,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
})

const Document = model<IDocument>('Document', documentSchema)

export default Document
