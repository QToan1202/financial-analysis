import { ComponentStyleConfig, defineStyleConfig } from '@chakra-ui/react'

const TextTheme: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    color: 'black',
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: '1.125rem',
  },
})

export default TextTheme
