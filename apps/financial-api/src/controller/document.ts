import { NextFunction, Response } from 'express'
import multer from 'multer'

import { IRequest } from '../types'
import axios, { AxiosError } from 'axios'

export const uploadDocument = async (request: IRequest, response: Response, next: NextFunction) => {
  try {
    if (!request.file) {
      response.status(400).json({ message: 'No file uploaded' })
      return
    }
    const { buffer, mimetype, originalname } = request.file
    const formData = new FormData()
    const fileBlob = new Blob([buffer], {
      type: mimetype,
    })
    formData.append('file', fileBlob, originalname)

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
