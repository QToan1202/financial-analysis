import express from 'express'
import { login, register } from '../controller/google'

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)

module.exports = router
