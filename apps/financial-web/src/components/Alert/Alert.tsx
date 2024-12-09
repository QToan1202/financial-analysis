import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Divider,
  type AlertDialogProps,
} from '@chakra-ui/react'
import { Button } from '@components/Button'
import { ReactNode, useRef } from 'react'

export type AlertProps = Omit<AlertDialogProps, 'leastDestructiveRef'> & {
  header: ReactNode
  children: ReactNode
  onConfirm?: () => void
}

const Alert = ({ header, children, onClose, onConfirm, ...rest }: AlertProps) => {
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <AlertDialog {...rest} onClose={onClose} leastDestructiveRef={btnRef}>
      <AlertDialogOverlay>
        <AlertDialogContent bgColor="white">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {header}
          </AlertDialogHeader>

          <Divider borderColor="gray.100" />

          <AlertDialogBody>{children}</AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={btnRef} onClick={onClose}>
              Cancel
            </Button>
            <Button bgColor="red.500" _hover={{ bgColor: 'red.600' }} onClick={onConfirm} ml={3}>
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default Alert
