import express from 'express'
import { connectDB } from './server'
import { runtime } from './controller/copilotkit'

const app = express()
const port = process.env.PORT || 3000

connectDB()
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/copilotkit', runtime)

app.listen(port, () => {
  return console.log(`http://localhost:${port}`)
})
