import axios from 'axios'
import { NextFunction, Response } from 'express'

import { IRequest } from '../types'

export const uploadDocument = async (
  request: IRequest<{ userId: string }>,
  response: Response,
  next: NextFunction
) => {
  try {
    if (!request.body.userId) {
      response.status(400).json({ message: 'Missing data when uploading file' })
      return
    }
    if (!request.file) {
      response.status(400).json({ message: 'No file uploaded' })
      return
    }
    const { buffer, mimetype, originalname } = request.file
    const formData = new FormData()
    const fileBlob = new Blob([buffer], {
      type: mimetype,
    })
    formData.append('file', fileBlob, Buffer.from(originalname, 'latin1').toString('utf8'))
    formData.append('user_id', request.body.userId)
    const FASTAPI_UPLOAD_URL = process.env.FASTAPI_UPLOAD_URL || ''

    try {
      const fastAPIResponse = await axios.post(FASTAPI_UPLOAD_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      response.json(fastAPIResponse.data)
    } catch (error) {
      next(error)
    }
  } catch (error) {
    next(error)
  }
}
