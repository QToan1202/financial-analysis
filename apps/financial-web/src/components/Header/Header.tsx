import { useCallback, useEffect, useRef } from 'react'
import { chakra, Flex, IconButton, Image, useDisclosure } from '@chakra-ui/react'
import { logo } from '@assets'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@contexts'

import { Search } from '../Search'
import { Button } from '../Button'
import { Link } from '../Link'
import { Drawer } from '../Drawer'

const Header = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const navigate = useNavigate()
  const handleLogout = useCallback(() => {
    clearAuth()
    navigate('/log-in')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    onClose()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <chakra.header padding="0.5rem" boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px;" bgColor="white">
        <Flex gap="0.75rem" justifyContent="space-between">
          <Flex flex={1} align="center">
            <IconButton
              variant="ghost"
              aria-label="Open drawer"
              onClick={onOpen}
              ref={btnRef}
              icon={<HamburgerIcon boxSize={7} />}
            />
            <Link to="/">
              <Image
                boxSize="50px"
                objectFit="cover"
                src={logo}
                alt="financial-analysis-web-logo"
              />
            </Link>
            <Search />
          </Flex>
          <Flex gap="0.25rem">
            <Button size="lg" borderRadius="2px" onClick={handleLogout}>
              Log out
            </Button>
          </Flex>
        </Flex>
      </chakra.header>
      <Drawer isOpen={isOpen} onClose={onClose} finalFocusRef={btnRef} />
    </>
  )
}

export default Header
