import { Fragment, useMemo } from 'react'
import {
  Box,
  Center,
  chakra,
  CircularProgress,
  Flex,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react'
import { getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { useGetGainers, useGetLosers, useGetNews } from '@hooks'
import { NAV_ITEM, TRENDING_INDEXES } from '@constants'

import { Link, Search, Table } from '@components'
import { defaultColumn, newsColumn } from './createTable'

const HomePage = () => {
  const { data: gainers, isPending, error: errorGainers } = useGetGainers()
  const { data: loser, error: errorLosers } = useGetLosers()
  const { data: news, error: errorWhenGetNews } = useGetNews()
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
  const newsTable = useReactTable({
    data: news || [],
    columns: newsColumn,
    getCoreRowModel: getCoreRowModel(),
  })
  const error = useMemo(
    () => errorGainers || errorLosers || errorWhenGetNews,
    [errorGainers, errorLosers, errorWhenGetNews]
  )

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
    <Flex
      bgColor="white"
      direction="column"
      justifyContent="center"
      alignItems="center"
      rowGap="1.25rem"
    >
      <Flex direction="column" borderBottomWidth="1px" padding="2rem" rowGap="1.25rem">
        <Heading as="h1" fontWeight="bold" textAlign="center">
          Search for a stock to start your analysis
        </Heading>
        <Text textAlign="center" fontSize={'1.25rem'} maxW={'850px'}>
          Accurate information on 68,000+ stocks and funds, including all the companies in the
          S&P500 index. See stock prices, news, financials, forecasts, charts and more.
        </Text>
        <chakra.form display="flex" width="full" justifyContent="center">
          <Search placeholder="Company or stock symbol..." />
        </chakra.form>
        <Text textAlign="center">
          Trending:
          {TRENDING_INDEXES.map((item: string, index: number, arr: string[]) => (
            <Fragment key={index}>
              &nbsp;
              <Link to={`/detail/${item.toUpperCase()}`} textColor="text.link">
                {item}
              </Link>
              {arr.length === index + 1 ? null : ','}
            </Fragment>
          ))}
        </Text>
      </Flex>
      <Center gap="1.5rem">
        {NAV_ITEM.map(({ id, icon, title }) => (
          <Flex
            borderRadius="0.5rem"
            width="170px"
            height="100px"
            direction="column"
            align="center"
            padding="1rem"
            borderWidth="1px"
            borderColor="rgb(209, 213, 219)"
            key={id}
            _hover={{
              boxShadow: 'md',
            }}
          >
            <Box boxSize={'32px'} marginBottom={1}>
              {icon}
            </Box>
            <Link to="#">{title}</Link>
          </Flex>
        ))}
      </Center>
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
      <Flex direction="column" justify="flex-start" align="flex-start" rowGap="0.5rem">
        <Heading as="h2">Market news</Heading>
        <Table table={newsTable} variant="simple" isShowHeader={false} fullBorder={false} />
      </Flex>
    </Flex>
  )
}

export default HomePage
