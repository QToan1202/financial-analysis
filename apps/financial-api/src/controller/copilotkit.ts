import { Application, NextFunction } from 'express'
import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNodeExpressEndpoint,
} from '@copilotkit/runtime'
import OpenAI from 'openai'

const openai = new OpenAI()
const serviceAdapter = new OpenAIAdapter({ openai, model: 'gpt-4o-mini' })

export const runtime = (request: any, response: any, next: NextFunction) => {
  const runtime = new CopilotRuntime({
    remoteActions: [
      {
        url: `${process.env.FASTAPI_BASE_URL}/copilotkit_remote`,
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
