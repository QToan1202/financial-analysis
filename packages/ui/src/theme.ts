import { extendTheme } from '@chakra-ui/react'

import { ButtonTheme, TextTheme } from './components'

const theme = extendTheme({
  styles: {
    global: {
      html: {
        fontSize: '16px',
      },
    },
  },
  breakpoints: {
    base: '0em',
    sm: '22em', // ~350px
    md: '24em', // ~380px
    lg: '40em', // ~640px
    xl: '80em',
    '2xl': '96em',
  },
  fontSizes: {
    sm: 14,
    base: 16,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 30,
  },
  colors: {
    primary: {
      100: '#3c74d4',
      200: '#2c6288',
    },
    black: '#111827',
    border: '#d1d5db',
    white: '#fff',
  },
  components: {
    Button: ButtonTheme,
    Text: TextTheme,
  },
})

export default theme
