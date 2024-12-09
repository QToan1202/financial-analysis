import express from 'express'
import multer from 'multer'
import { uploadDocument, get, remove } from '../controller/document'

const router = express.Router()
const upload = multer()

router.post('/upload', upload.single('file'), uploadDocument)
router.get('/get', get)
router.delete('/delete/:id', remove)

module.exports = router
