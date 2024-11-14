import {
  Box,
  CircularProgress,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Text,
  useToast,
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import { useGetStockDetail } from '@hooks'

const DetailPage = () => {
  const { ticket } = useParams()
  const { data: stockDetail, error, isPending } = useGetStockDetail(ticket || 'AAPL')
  const toast = useToast()

  if (error)
    return toast({
      title: 'Error occurred fetching data.',
      description: error.message,
      status: 'error',
      duration: 3 * 1000,
      isClosable: true,
    })

  return isPending ? (
    <CircularProgress isIndeterminate color="primary.100" />
  ) : (
    <Box maxW="1200px">
      <Heading as="h1" textAlign="left">
        {stockDetail.companyName} ({stockDetail.symbol})
      </Heading>
      <Text color="text.faded" fontSize="sm" mb="1rem">
        {stockDetail.exchangeShortName}: {stockDetail.symbol} - Real-Time Price -{' '}
        {stockDetail.currency}
      </Text>
      <Text fontSize="2.25rem" fontWeight="bold">
        {stockDetail.price}
        <Text
          as="span"
          fontSize="1.5rem"
          fontWeight="semibold"
          color={stockDetail.changes > 0 ? 'green.50' : 'red.50'}
        >{` ${stockDetail.changes > 0 ? '+' : ''}${stockDetail.changes} (${((stockDetail.changes / stockDetail.price) * 100).toFixed(2)}%)`}</Text>
      </Text>
      <Heading as="h2" textAlign="start" mb="0.5rem">
        About {stockDetail.symbol.toUpperCase()}
      </Heading>
      <Text>{stockDetail.description}</Text>
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem gap="1rem">
          <Flex direction="column" gap="0.5rem">
            <Box>
              <Text fontWeight="semibold">Industry</Text>
              <Text>{stockDetail.industry}</Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">IPO Date</Text>
              <Text>{dayjs(stockDetail.ipoDate).format('MMM DD, YYYY')}</Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">Stock Exchange</Text>
              <Text>{stockDetail.exchangeShortName}</Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">Website</Text>
              <Text color="text.link">
                <Link href={stockDetail.website} textAlign="left" isExternal>
                  {stockDetail.website}
                </Link>
              </Text>
            </Box>
          </Flex>
        </GridItem>
        <GridItem>
          <Flex direction="column" gap="0.5rem">
            <Box>
              <Text fontWeight="semibold">Sector</Text>
              <Text>{stockDetail.sector}</Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">Employees</Text>
              <Text>{Intl.NumberFormat().format(+stockDetail.fullTimeEmployees)}</Text>
            </Box>
            <Box>
              <Text fontWeight="semibold">Ticker Symbol</Text>
              <Text>{stockDetail.symbol.toUpperCase()}</Text>
            </Box>
          </Flex>
        </GridItem>
      </Grid>
    </Box>
  )
}

export default DetailPage
