import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

import { Footer, Header } from '@components'

const Root = () => (
  <Box>
    <Header />
    <Box p="1.5rem 1.25rem">
      <Outlet />
    </Box>
    <Footer />
  </Box>
)

export default Root
