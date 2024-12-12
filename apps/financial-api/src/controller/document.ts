import { HydratedDocument, ModifyResult } from 'mongoose'
import axios from 'axios'
import { NextFunction, Request, Response } from 'express'

import { IDocument } from '../models/document/type'
import Document from '../models/document'

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || ''
export const uploadDocument = async (request: Request, response: Response, next: NextFunction) => {
  try {
    if (!request.userId) {
      response.status(400).json({ message: 'Missing data when uploading file' })
      return
    }
    if (!request.file) {
      response.status(400).json({ message: 'No file uploaded' })
      return
    }
    const { buffer, mimetype, originalname, size } = request.file
    const formData = new FormData()
    const fileBlob = new Blob([buffer], {
      type: mimetype,
    })
    const convertFileName = Buffer.from(originalname, 'latin1').toString('utf8')
    formData.append('file', fileBlob, convertFileName)
    formData.append('user_id', request.userId)

    try {
      const fastAPIResponse = await axios.post(`${FASTAPI_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      const document: HydratedDocument<IDocument> = new Document({
        ids: fastAPIResponse.data.file_ids || [],
        name: convertFileName,
        extension: convertFileName.split('.')[1],
        type: mimetype,
        size: size,
        user: request.userId,
      })
      await document.save()

      response.json(
        document.toJSON({
          transform(_, ret) {
            delete ret.ids
          },
        })
      )
    } catch (error) {
      next(error)
    }
  } catch (error) {
    next(error)
  }
}

export const get = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const uploadedDocs: IDocument[] = await Document.find({ user: request.userId })

    response.json(
      uploadedDocs.map((doc) =>
        doc.toJSON({
          transform(_, ret) {
            delete ret.ids
            delete ret.user
          },
        })
      )
    )
  } catch (error) {
    next(error)
  }
}

export const remove = async (request: Request, response: Response, next: NextFunction) => {
  const { id: deleteDocId } = request.params

  if (!deleteDocId) {
    response.status(404).json({ message: 'Missing data for deleting process' })
    return
  }
  try {
    const document = await Document.findById(deleteDocId)

    if (!document) {
      response.status(404).json({ message: "Can't find item match with provided ID" })
      return
    }

    try {
      const fastAPIResponse = await axios.post(
        `${FASTAPI_BASE_URL}/delete-document`,
        {
          ids: document.ids,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (fastAPIResponse.status === 200) {
        await document.deleteOne()
        response.json({ message: 'Delete item success' })
        return
      }

      response
        .status(fastAPIResponse.status)
        .json({ message: 'Delete item fail due to some error' })
    } catch (error) {
      next(error)
    }
  } catch (error) {
    next(error)
  }
}
