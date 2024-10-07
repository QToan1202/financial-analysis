import { ComponentStyleConfig, defineStyleConfig } from '@chakra-ui/react'

const ButtonTheme: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    fontSize: '1rem',
    color: 'white',
  },
  sizes: {
    sm: {
      padding: '0.375rem 0.5rem',
    },
    md: {
      pl: '0.625rem',
      pr: '0.625rem',
    },
    lg: {
      pl: '0.75rem',
      pr: '0.75rem',
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    xl: {
      padding: '0.5rem 1rem',
    },
  },
  variants: {
    primary: {
      bgColor: 'primary.100',
      _hover: {
        bgColor: 'primary.200',
      },
    },
    outline: {
      borderColor: 'border',
      bgColor: 'white',
      color: 'black',
      _hover: {
        bgColor: '#f9fafb',
      },
    },
  },
  defaultProps: {
    variant: 'primary',
    size: 'sm',
  },
})

export default ButtonTheme
