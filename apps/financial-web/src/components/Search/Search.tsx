import { ChangeEvent, useMemo, useState } from 'react'
import {
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  type InputProps,
  InputRightElement,
  useStyleConfig,
} from '@chakra-ui/react'
import { CloseIcon, SearchIcon } from '@chakra-ui/icons'

export type SearchProps = InputProps & {
  onChangeText?: (value: string) => void
}

const DEFAULT_INPUT_VALUE: string = ''
const Search = ({ onChangeText, ...rest }: SearchProps) => {
  const styles = useStyleConfig('Search')
  const [value, setValue] = useState<string>(DEFAULT_INPUT_VALUE)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
    onChangeText?.(event.target.value)
  }
  const handleClearInput = () => setValue(DEFAULT_INPUT_VALUE)
  const LeftIcon = useMemo(
    () => (
      <InputLeftElement pointerEvents="none">
        <SearchIcon />
      </InputLeftElement>
    ),
    []
  )
  const RightIcon = useMemo(
    () => (
      <InputRightElement>
        <IconButton
          variant="ghost"
          aria-label="Clear search input"
          icon={<CloseIcon />}
          onClick={handleClearInput}
        />
      </InputRightElement>
    ),
    []
  )

  return (
    <InputGroup maxW={{ base: '95%', lg: '75%' }}>
      {LeftIcon}
      <Input
        variant="unstyled"
        sx={styles}
        type="text"
        placeholder="Company or stock symbol..."
        {...rest}
        value={value}
        onChange={handleChange}
      />
      {value && RightIcon}
    </InputGroup>
  )
}

export default Search
