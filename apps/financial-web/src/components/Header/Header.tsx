import { chakra, Flex, Image } from '@chakra-ui/react'
import { logo } from '@assets'

import { Search } from '../Search'
import { Button } from '../Button'
import { Link } from '../Link'

const Header = () => (
  <chakra.header padding="0.5rem" boxShadow="rgba(0, 0, 0, 0.24) 0px 3px 8px;" bgColor="white">
    <Flex gap="0.75rem" justifyContent="space-between">
      <Flex flex={1} align="center">
        <Image boxSize="50px" objectFit="cover" src={logo} alt="financial-analysis-web-logo" />
        <Search />
      </Flex>
      <Flex gap="0.25rem">
        <Link to="log-in">
          <Button variant="ghost" size="lg" borderRadius="2px">
            Log In
          </Button>
        </Link>
        <Link to="sign-up">
          <Button size="lg" borderRadius="2px">
            Sign up
          </Button>
        </Link>
      </Flex>
    </Flex>
  </chakra.header>
)

export default Header
