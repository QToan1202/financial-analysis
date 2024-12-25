import { useRef } from 'react'
import { Box, Flex, Grid, GridItem, useDisclosure } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'

import { Footer, Header } from '@components'
import { Drawer } from '@components/Drawer'

const Root = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef<HTMLButtonElement>(null)

  return (
    <Box display="flex" flexDirection="column" minH="100vh" w="full">
      <Header />
      <Grid flex={1} templateColumns="1px minmax(0, 1fr)">
        <GridItem>
          <Drawer isOpen={false} onClose={onClose} finalFocusRef={btnRef} />
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
