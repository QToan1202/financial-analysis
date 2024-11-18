// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import { CopilotKit } from '@copilotkit/react-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App.tsx'
import { overrideTheme } from './index.ts'

import '@copilotkit/react-ui/styles.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <QueryClientProvider client={queryClient}>
    <ChakraProvider theme={overrideTheme}>
      <CopilotKit runtimeUrl="http://localhost:3000/copilotkit" agent="chat-with-memory-agent">
        <App />
      </CopilotKit>
    </ChakraProvider>
  </QueryClientProvider>
  // </StrictMode>
)
