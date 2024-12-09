import { createColumnHelper } from '@tanstack/react-table'
import { chakra } from '@chakra-ui/react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import updateLocale from 'dayjs/plugin/updateLocale'

import type { Gainer, News } from '@types'
import { Link } from '@components'

dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
  },
})

const columnHelper = createColumnHelper<Gainer>()
export const defaultColumn = [
  columnHelper.accessor('symbol', {
    cell: (info) => (
      <Link to={`/detail/${info.getValue()}`} color="text.link">
        {info.getValue()}
      </Link>
    ),
    header: 'Symbol',
  }),
  columnHelper.accessor('name', {
    cell: (info) => info.getValue(),
    header: 'Name',
    maxSize: 220,
  }),
  columnHelper.accessor('price', {
    cell: (info) => `$${info.getValue().toFixed(2)}`,
    header: 'Price',
  }),
  columnHelper.accessor('changesPercentage', {
    cell: (info) => (
      <chakra.span color={info.getValue() > 0 ? 'green.50' : 'red.50'}>
        {info.getValue().toFixed(2)}%
      </chakra.span>
    ),
    header: 'Change',
  }),
]

const newsColumnHelper = createColumnHelper<News>()
export const newsColumn = [
  newsColumnHelper.accessor('published_utc', {
    cell: (info) => (
      <chakra.span textTransform="capitalize">{dayjs(info.getValue()).fromNow(true)}</chakra.span>
    ),
  }),
  newsColumnHelper.accessor('title', {
    cell: (info) => (
      <chakra.span>
        <Link
          maxW="550px"
          color="text.link"
          isExternal
          isTruncated
          to={info.row.original.article_url}
        >
          {info.getValue()}
        </Link>
        <chakra.span color="text.faded">
          &nbsp;&#45;&nbsp;{info.row.original.publisher.name}
        </chakra.span>
      </chakra.span>
    ),
  }),
]
