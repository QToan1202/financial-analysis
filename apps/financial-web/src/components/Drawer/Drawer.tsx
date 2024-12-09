import {
  Box,
  Drawer as CDrawer,
  type DrawerProps as CDrawerProps,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Heading,
} from '@chakra-ui/react'
import { ReactNode, useCallback, useMemo } from 'react'

import { Button } from '../Button'
import { useAuthStore } from '@contexts'
import { useNavigate } from 'react-router-dom'
import { Link } from '@components/Link'
import { DRAWER_ITEM } from '@constants'

export type DrawerProps = Omit<CDrawerProps, 'children'> & {
  children?: ReactNode
}

const Drawer = ({ ...props }: DrawerProps) => {
  const clear = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()
  const handleLogout = useCallback(() => {
    clear()
    navigate('/log-in', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const DrawerItem = useMemo(
    () =>
      DRAWER_ITEM.map(({ title, href }, index) => (
        <Link to={href} key={index} _hover={{ textDecoration: 'none' }}>
          <Box p="1rem" pl="0.25rem" _hover={{ bgColor: 'gray.200' }}>
            <Heading
              as="h6"
              color="text.default"
              fontSize="xl"
              fontWeight="semibold"
              letterSpacing={1.2}
            >
              {title}
            </Heading>
          </Box>
        </Link>
      )),
    []
  )

  return (
    <CDrawer placement="left" {...props}>
      <DrawerOverlay />
      <DrawerContent bgColor="white">
        <DrawerCloseButton />
        <DrawerHeader>Financial Analysis</DrawerHeader>

        <DrawerBody>{DrawerItem}</DrawerBody>

        <DrawerFooter>
          <Button borderRadius="2px" w="full" onClick={handleLogout}>
            Log Out
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </CDrawer>
  )
}

export default Drawer
