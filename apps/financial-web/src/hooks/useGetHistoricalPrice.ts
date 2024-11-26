import { useCallback } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'

import { financialModelingPrepKeys } from '@factories'
import { requestFML } from '@services'
import type { StockPrice } from '@types'

type TimeFrameType = '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour'
type TransformStockPricesType = Pick<StockPrice, 'close' | 'date'>

const useGetHistoricalPrice = (
  ticket: string,
  timeFrame: TimeFrameType = '1min',
  from: string = dayjs().subtract(1, 'week').format('YYYY-MM-DD'),
  to: string = dayjs().format('YYYY-MM-DD')
): UseQueryResult<TransformStockPricesType[], Error> => {
  return useQuery({
    enabled: !!ticket,
    queryKey: [financialModelingPrepKeys.list(ticket)],
    queryFn: () =>
      requestFML.get(`v3/historical-chart/${timeFrame}/${ticket}`, { params: { from, to } }),
    select: useCallback(
      (data: AxiosResponse<Array<StockPrice>>) =>
        data.data.map(({ close, date }: StockPrice) => ({ close, date })),
      []
    ),
  })
}

export default useGetHistoricalPrice
