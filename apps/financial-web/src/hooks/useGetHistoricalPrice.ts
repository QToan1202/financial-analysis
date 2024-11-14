import { useCallback } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import dayjs from 'dayjs'

import { financialModelingPrepKeys } from '@factories'
import { requestFML } from '@services'
import type { StockPrice } from '@types'

type TimeFrameType = '1min' | '5min' | '15min' | '30min' | '1hour' | '4hour'

const useGetHistoricalPrice = (
  ticket: string,
  timeFrame: TimeFrameType = '5min',
  from: string = dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
  to: string = dayjs().format('YYYY-MM-DD')
): UseQueryResult<StockPrice[], Error> => {
  return useQuery({
    enabled: !!ticket,
    queryKey: [financialModelingPrepKeys.list(ticket)],
    queryFn: () =>
      requestFML.get(`v3/historical-chart/${timeFrame}/${ticket}`, { params: { from, to } }),
    select: useCallback((data: AxiosResponse<Array<StockPrice>>) => data.data, []),
  })
}

export default useGetHistoricalPrice
