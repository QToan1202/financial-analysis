import { forwardRef, memo } from 'react'
import { Button, type ButtonProps } from '@chakra-ui/react'

export type CustomButtonProps = ButtonProps

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ children, ...rest }, btnRef) => (
    <Button size={['sm', 'md', 'lg', 'xl']} {...rest} ref={btnRef}>
      {children}
    </Button>
  )
)

export default memo(CustomButton)
