import { Box, CircularProgress, Divider, Heading, useToast } from '@chakra-ui/react'
import { News } from '@components'
import { useGetNews } from '@hooks'

const NewsPage = () => {
  const { data: news, error: errorWhenGetNews, isPending } = useGetNews(30)
  const toast = useToast()

  if (errorWhenGetNews)
    return toast({
      title: 'Error occurred fetching data.',
      description: errorWhenGetNews.message,
      status: 'error',
      duration: 3 * 1000,
      isClosable: true,
    })

  return isPending ? (
    <CircularProgress isIndeterminate color="primary.100" />
  ) : (
    <Box>
      <Heading as="h1" textAlign="left" mb="1rem">
        All Stock News
      </Heading>
      <Divider orientation="horizontal" borderColor="primary.200" borderBottomWidth="3px" />
      {news.map(
        ({
          id,
          title,
          article_url,
          description,
          published_utc,
          image_url,
          publisher: { name },
        }) => (
          <News
            key={id}
            title={title}
            sourceName={name}
            thumbnail={image_url}
            link={article_url}
            publishDate={published_utc}
            description={description}
          />
        )
      )}
    </Box>
  )
}

export default NewsPage
