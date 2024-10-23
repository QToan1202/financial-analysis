import { createColumnHelper } from '@tanstack/react-table'
import { chakra } from '@chakra-ui/react'

import type { Gainer } from '@types'

const columnHelper = createColumnHelper<Gainer>()
export const defaultColumn = [
  columnHelper.accessor('symbol', {
    cell: (info) => <chakra.span color="text.link">{info.getValue()}</chakra.span>,
    header: 'Symbol',
  }),
  columnHelper.accessor('name', {
    cell: (info) => info.getValue(),
    header: 'Name',
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
