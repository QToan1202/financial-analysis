import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  chakra,
  DrawerBody,
  DrawerFooter,
  Flex,
  IconButton,
  Image,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { logo } from '@assets'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@contexts'
import { SearchForm } from '@features'

import { Button } from '../Button'
import { Link } from '../Link'
import { Drawer } from '../Drawer'
import { DRAWER_ITEM } from '@constants'

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isTablet = useBreakpointValue({ xl: false, lg: true })
  const btnRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()
  const handleLogout = useCallback(() => {
    clearAuth()
    navigate('/log-in')
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

  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <chakra.header padding="0.5rem" boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px;" bgColor="white">
        <Flex gap="0.75rem" justifyContent="space-between">
          <Flex flex={1} align="center">
            {isTablet && (
              <IconButton
                variant="ghost"
                aria-label="Open drawer"
                onClick={onOpen}
                ref={btnRef}
                icon={<HamburgerIcon boxSize={7} />}
              />
            )}
            <Link to="/">
              <Image
                boxSize="50px"
                objectFit="cover"
                src={logo}
                alt="financial-analysis-web-logo"
              />
            </Link>
            <SearchForm flexGrow={1} maxW="800px" ml="3rem" />
          </Flex>
          {!isTablet && (
            <Flex gap="0.25rem" marginLeft="auto">
              <Button size="lg" borderRadius="2px" onClick={handleLogout}>
                Log out
              </Button>
            </Flex>
          )}
        </Flex>
      </chakra.header>
      {isTablet && (
        <Drawer isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef}>
          <DrawerBody p="0.5rem" flex={1}>
            {DrawerItem}
          </DrawerBody>
          <DrawerFooter>
            <Button borderRadius="2px" w="full" onClick={handleLogout}>
              Log Out
            </Button>
          </DrawerFooter>
        </Drawer>
      )}
    </>
  )
}

export default Header
