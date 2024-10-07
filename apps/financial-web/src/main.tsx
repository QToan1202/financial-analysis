import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'

import { overrideTheme } from '@financial-web/ui'

import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider theme={overrideTheme}>
      <App />
    </ChakraProvider>
  </StrictMode>
)
