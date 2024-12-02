import express from 'express'
import multer from 'multer'
import { uploadDocument } from '../controller/document'

const router = express.Router()
const upload = multer()

router.post('/upload', upload.single('file'), uploadDocument)

module.exports = router
