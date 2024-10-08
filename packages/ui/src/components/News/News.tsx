import { Flex, Grid, GridItem, Heading, Image, Link, Text } from '@chakra-ui/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export type NewsProps = {
  title: string
  sourceName: string
  thumbnail: string
  link: string
  publishDate: string
  description?: string
}

const News = ({ thumbnail, publishDate, sourceName, title, description, link }: NewsProps) => {
  return (
    <Grid
      templateColumns="1fr 2fr"
      gap="1rem"
      py="1.5rem"
      bgColor="white"
      borderColor="border.button"
      borderBottomWidth="1px"
    >
      <GridItem>
        <Link href={link}>
          <Image
            w="full"
            h="full"
            mt="0.25rem"
            objectFit="cover"
            borderRadius="0.25rem"
            fallbackSrc="https://via.placeholder.com/250"
            src={thumbnail}
            alt="thumbnail of news"
          />
        </Link>
      </GridItem>
      <GridItem alignItems="center">
        <Flex direction="column">
          <Text fontSize="sm" color="text.faded">{`${dayjs(
            publishDate
          ).fromNow()} - ${sourceName}`}</Text>
          <Heading
            as="h3"
            mb="0.5rem"
            noOfLines={3}
            fontSize="xl"
            color="text.default"
            textAlign="start"
            fontWeight="700"
          >
            <Link href={link} _hover={{ color: 'primary.200' }}>
              {title}
            </Link>
          </Heading>
          {description && (
            <Text color="text.light" noOfLines={5} fontSize="0.95rem">
              {description}
            </Text>
          )}
        </Flex>
      </GridItem>
    </Grid>
  )
}

export default News
