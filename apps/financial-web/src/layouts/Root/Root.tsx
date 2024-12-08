import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

import { Footer, Header } from '@components'

const Root = () => (
  <Box display="flex" flexDirection="column" minH="100vh" w="full">
    <Header />
    <Flex flex={1} p="1.5rem 1.25rem">
      <Outlet />
    </Flex>
    <Footer />
  </Box>
)

export default Root
