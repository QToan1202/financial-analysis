import {
  Drawer as CDrawer,
  type DrawerProps as CDrawerProps,
  DrawerContent,
  DrawerOverlay,
} from '@chakra-ui/react'
import { ReactNode } from 'react'

export type DrawerProps = Omit<CDrawerProps, 'children'> & {
  children: ReactNode
}

const Drawer = ({ children, ...props }: DrawerProps) => (
  <CDrawer placement="left" isFullHeight size={'xs'} {...props}>
    <DrawerOverlay />
    <DrawerContent bgColor="white">{children}</DrawerContent>
  </CDrawer>
)

export default Drawer
