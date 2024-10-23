import { chakra, CircularProgress, Flex, Heading, Link, Text, useToast } from '@chakra-ui/react'

import { useGetGainers, useGetLosers } from '@hooks'

import { Search, Table } from '../../components'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { defaultColumn } from './createTable'

const HomePage = () => {
  const { data: gainers, isPending, error } = useGetGainers()
  const { data: loser } = useGetLosers()
  const toast = useToast()
  const gainerTable = useReactTable({
    data: gainers || [],
    columns: defaultColumn,
    getCoreRowModel: getCoreRowModel(),
  })
  const loserTable = useReactTable({
    data: loser || [],
    columns: defaultColumn,
    getCoreRowModel: getCoreRowModel(),
  })

  if (error)
    return toast({
      title: 'Error occurred fetching data.',
      description: error.message,
      status: 'error',
      duration: 3 * 1000,
      isClosable: true,
    })

  if (isPending) return <CircularProgress isIndeterminate color="primary.100" />

  return (
    <Flex direction="column" justifyContent="center" alignItems="center" rowGap="1.25rem">
      <Heading as="h1" fontWeight="bold">
        Search for a stock to start your analysis
      </Heading>
      <Text textAlign="center">
        Accurate information on 68,000+ stocks and funds, including all the companies in the S&P500
        index. See stock prices, news, financials, forecasts, charts and more.
      </Text>
      <chakra.form display="flex" width="full" justifyContent="center">
        <Search placeholder="Company or stock symbol..." />
      </chakra.form>
      <Text textAlign="center">
        Trending:&nbsp;
        <Link href="#" textColor="text.link">
          NVDA
        </Link>
        ,&nbsp;
        <Link href="#" textColor="text.link">
          DRUG
        </Link>
        ,&nbsp;
        <Link href="#" textColor="text.link">
          ASML
        </Link>
        ,&nbsp;
        <Link href="#" textColor="text.link">
          TSLA
        </Link>
      </Text>
      <Flex gap="3rem">
        <Flex direction="column" justify="flex-start" align="flex-start" rowGap="0.5rem">
          <Heading as="h2">Top Gainers</Heading>
          <Table table={gainerTable} />
        </Flex>
        <Flex direction="column" justify="flex-start" align="flex-start" rowGap="0.5rem">
          <Heading as="h2">Top Losers</Heading>
          <Table table={loserTable} />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default HomePage
