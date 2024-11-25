import express from 'express'
import { login, refreshToken, register } from '../controller/auth'

const router = express.Router()

router.route('/register').post(register)
router.route('/login').post(login)
router.route('/refresh-token').post(refreshToken)

module.exports = router
