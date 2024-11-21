import { Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

import { Footer, Header } from '@components'

const Root = () => (
  <Flex direction="column" gap="1rem">
    <Header />
    <Outlet />
    <Footer />
  </Flex>
)

export default Root
