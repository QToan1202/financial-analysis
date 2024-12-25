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
  Flex,
  Heading,
  chakra,
  useOutsideClick,
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
      DRAWER_ITEM.map(({ title, href, icon }, index) => (
        <Flex key={index} borderRadius=".375rem" _hover={{ bgColor: 'gray.bg' }}>
          <Link
            _activeLink={{ bgColor: 'red' }}
            to={href}
            flex={1}
            display="flex"
            alignItems="center"
            gap=".5rem"
            p="1rem"
            _hover={{ textDecoration: 'none', color: 'text.default' }}
          >
            {icon}
            <chakra.span color="#4b5563" fontSize="sm" fontWeight="semibold">
              {title}
            </chakra.span>
          </Link>
        </Flex>
      )),
    []
  )

  return (
    <CDrawer placement="left" {...props}>
      <DrawerOverlay />
      <DrawerContent bgColor="white">
        <DrawerBody p="0.5rem">{DrawerItem}</DrawerBody>

        {/* <DrawerFooter>
          <Button borderRadius="2px" w="full" onClick={handleLogout}>
            Log Out
          </Button>
        </DrawerFooter> */}
      </DrawerContent>
    </CDrawer>
  )
}

export default Drawer
