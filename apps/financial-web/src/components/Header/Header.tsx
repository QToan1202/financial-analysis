import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  chakra,
  Flex,
  IconButton,
  Image,
  useDisclosure,
  useToast,
  ListItem as CListItem,
  type ListItemProps,
  UnorderedList,
} from '@chakra-ui/react'
import { logo } from '@assets'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@contexts'

import { Search } from '../Search'
import { Button } from '../Button'
import { Link } from '../Link'
import { Drawer } from '../Drawer'
import { useClickOutside, useSearch } from '@hooks'

const ListItem = (props: ListItemProps) => (
  <CListItem borderBottomWidth="1px" borderColor="border.default" {...props} />
)

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
  const [query, setQuery] = useState<string>('')
  const { data: search, isPending: isGetSearchData, error: searchError } = useSearch(query)
  const searchRef = useRef<HTMLInputElement>(null)
  const handleSearch = useCallback((text: string) => {
    setQuery(text)
  }, [])
  const [isFocused, setIsFocused] = useState(false)
  const checkFocus = useCallback(() => {
    setIsFocused(false)
  }, [])
  const handleClickSearch = useCallback(() => {
    setIsFocused(true)
  }, [])
  useClickOutside(searchRef, checkFocus)

  const toast = useToast()
  const SearchItem = useMemo(() => {
    if (searchError) {
      return toast({
        title: 'Error occurred search data.',
        description: searchError.message,
        status: 'error',
      })
    }
    if (isGetSearchData)
      return (
        <ListItem p="0.75rem" _hover={{ bgColor: 'gray.bg' }}>
          Start searching for Stock
        </ListItem>
      )
    if (!search.length)
      return (
        <ListItem p="0.75rem" _hover={{ bgColor: 'gray.bg' }}>
          No results found. Try a symbol lookup instead
        </ListItem>
      )

    return search.map(({ symbol, name }) => (
      <ListItem key={symbol}>
        <Link
          display="flex"
          to={`/detail/${symbol}`}
          p="0.75rem"
          color="text.default"
          _hover={{ bgColor: 'gray.bg' }}
        >
          <chakra.span flexBasis="3rem" textAlign="left" fontWeight="semibold">
            {symbol}
          </chakra.span>
          &#32;
          <chakra.span flexGrow={1} marginLeft="0.5rem" paddingLeft="0.25rem" textAlign="left">
            {name}
          </chakra.span>
        </Link>
      </ListItem>
    ))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGetSearchData, search, searchError])

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
            <chakra.form pos="relative" display="flex" flexGrow={1} maxW="800px" ml="3rem">
              <Search
                placeholder="Company or stock symbol..."
                w="full"
                maxW="unset"
                ref={searchRef}
                onChangeText={handleSearch}
                onClick={handleClickSearch}
              />
              {isFocused ? (
                <UnorderedList
                  maxW="75%"
                  styleType="none"
                  margin={0}
                  position="absolute"
                  top="40px"
                  bg="white"
                  boxShadow="rgba(0, 0, 0, 0.24) 0px 1px 2px;"
                  borderColor="border.default"
                  borderWidth="1px"
                  overflowY="auto"
                  w="full"
                  zIndex={40}
                >
                  {SearchItem}
                </UnorderedList>
              ) : null}
            </chakra.form>
          </Flex>
          <Flex gap="0.25rem" marginLeft="auto">
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
