import express from 'express'
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNodeHttpEndpoint } from '@copilotkit/runtime'
import OpenAI from 'openai'
import 'dotenv/config'

const app = express()
const port = 3000

app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
const serviceAdapter = new OpenAIAdapter({ openai })

app.use('/copilotkit', (req, res, next) => {
  const runtime = new CopilotRuntime({
    remoteActions: [
      {
        url: 'http://localhost:8000/copilotkit_remote',
      },
    ],
  })
  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter,
  })

  return handler(req as any, res, next)
})

app.listen(port, () => {
  return console.log(`http://localhost:${port}`)
})
