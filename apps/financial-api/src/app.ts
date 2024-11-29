import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import { connectDB } from './server'
import { runtime } from './controller/copilotkit'

const app = express()
const port = process.env.PORT || 3000

connectDB()

app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/copilotkit', runtime)

app.use(require('./router/auth'))
app.use('/google', require('./router/google'))
app.use('/document', require('./router/document'))

app.listen(port, () => {
  return console.log(`http://localhost:${port}`)
})
