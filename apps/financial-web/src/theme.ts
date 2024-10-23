import { extendTheme } from '@chakra-ui/react'

import { ButtonTheme, SearchTheme, TextTheme } from './components'

const theme = extendTheme({
  styles: {
    global: {
      html: {
        fontSize: { base: '14px', lg: '16px' },
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
    '3xl': '2rem',
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
      link: '#1e73ba',
    },
    black: {
      50: '#111827',
      100: '#111111',
    },
    border: {
      default: '#e5e7eb',
      button: '#d1d5db',
    },
    white: {
      50: '#fff',
      100: '#f8f8f8',
    },
    gray: {
      50: '#f9fafb',
      100: '#666666',
    },
    green: {
      50: '#15803d',
    },
    red: {
      50: '#dc2626',
    },
  },
  components: {
    Button: ButtonTheme,
    Text: TextTheme,
    Search: SearchTheme,
  },
})

export default theme
