import {
  ListItem as CListItem,
  useToast,
  chakra,
  UnorderedList,
  type ListItemProps,
  HTMLChakraProps,
} from '@chakra-ui/react'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Link, Search } from '@components'
import { useClickOutside, useSearch } from '@hooks'

export type SearchFormProps = HTMLChakraProps<'form'>

const ListItem = (props: ListItemProps) => (
  <CListItem borderBottomWidth="1px" borderColor="border.default" {...props} />
)

const SearchForm = ({ ...props }: SearchFormProps) => {
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
    <chakra.form pos="relative" display="flex" {...props}>
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
  )
}

export default SearchForm
