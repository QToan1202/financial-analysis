import { ComponentStyleConfig, defineStyleConfig } from '@chakra-ui/react'

const SearchTheme: ComponentStyleConfig = defineStyleConfig({
  baseStyle: {
    bgColor: 'gray.50',
    borderWidth: 1,
    borderRadius: '0.125rem',
    borderColor: 'border.default',
    padding: '0.45rem',
    pl: 10,
    pr: 10,
  },
  variants: {
    default: {
      _hover: {
        boxShadow: 'base',
        bgColor: 'white',
      },
    },
  },
  defaultProps: {
    variant: 'default',
  },
})

export default SearchTheme
