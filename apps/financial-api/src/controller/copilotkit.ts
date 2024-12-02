import { Application, NextFunction } from 'express'
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeExpressEndpoint,
} from '@copilotkit/runtime'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: 'https://integrate.api.nvidia.com/v1',
})
const serviceAdapter = new OpenAIAdapter({ openai, model: 'meta/llama-3.1-405b-instruct' })

export const runtime = (request: any, response: any, next: NextFunction) => {
  const runtime = new CopilotRuntime({
    remoteActions: [
      {
        url: 'http://localhost:8000/copilotkit_remote',
      },
    ],
  })
  const handler = copilotRuntimeNodeExpressEndpoint({
    endpoint: '/copilotkit',
    runtime,
    serviceAdapter,
  })

  return handler(request, response, next)
}

module.exports = runtime
