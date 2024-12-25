import { Box, Flex, Grid, GridItem } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

import { Footer, Header, Collapse } from '@components'

const Root = () => {
  return (
    <Box display="flex" flexDirection="column" minH="100vh" w="full">
      <Header />
      <Grid flex={1} templateColumns="auto minmax(0, 1fr)">
        <GridItem>
          <Collapse />
        </GridItem>
        <GridItem>
          <Flex flex={1} p="1.5rem 1.25rem">
            <Outlet />
          </Flex>
        </GridItem>
      </Grid>
      <Footer />
    </Box>
  )
}

export default Root
