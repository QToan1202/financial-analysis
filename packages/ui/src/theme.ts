import { extendTheme } from '@chakra-ui/react'

import { ButtonTheme, SearchTheme, TextTheme } from './components'

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
    sm: '0.875rem',
    base: '1rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.185rem',
  },
  colors: {
    primary: {
      100: '#3c74d4',
      200: '#2c6288',
    },
    text: {
      default: '#111827',
      faded: '#374151',
      light: '#1f2937',
    },
    black: '#111827',
    border: {
      default: '#e5e7eb',
      button: '#d1d5db',
    },
    white: '#fff',
    gray: {
      50: '#f9fafb',
    },
  },
  components: {
    Button: ButtonTheme,
    Text: TextTheme,
    Search: SearchTheme,
  },
})

export default theme
