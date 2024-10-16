import { memo } from 'react'
import { Button, type ButtonProps } from '@chakra-ui/react'

export type CustomButtonProps = ButtonProps

const CustomButton = ({ children, ...rest }: CustomButtonProps) => (
  <Button size={['sm', 'md', 'lg', 'xl']} {...rest}>
    {children}
  </Button>
)

export default memo(CustomButton)
