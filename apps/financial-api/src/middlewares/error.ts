import { NextFunction, Request, Response } from 'express'

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(500).json({ message: err.message })
}

module.exports = errorHandler
