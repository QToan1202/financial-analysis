import { ComponentStyleConfig, defineStyleConfig } from '@chakra-ui/react'

const TextTheme: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    color: 'text.default',
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: '1.125rem',
    textAlign: 'start',
  },
})

export default TextTheme
