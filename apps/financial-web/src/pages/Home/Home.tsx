import { chakra, Flex, Heading, Link, Text } from '@chakra-ui/react'
import { Search } from '../../components'

const HomePage = () => {
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
    </Flex>
  )
}

export default HomePage
