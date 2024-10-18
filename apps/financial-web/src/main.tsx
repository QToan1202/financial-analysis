import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'

import App from './App.tsx'
import { overrideTheme } from './index.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={overrideTheme}>
      <App />
    </ChakraProvider>
  </StrictMode>
)
