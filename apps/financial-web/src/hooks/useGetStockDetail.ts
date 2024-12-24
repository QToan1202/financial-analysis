import { useCallback } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

import { financialModelingPrepKeys } from '@factories'
import { requestFML } from '@services'
import type { Stock } from '@types'

const useGetStockDetail = (ticker: string): UseQueryResult<Stock, Error> => {
  return useQuery({
    enabled: !!ticker,
    queryKey: financialModelingPrepKeys.detail(ticker),
    queryFn: () => requestFML.get(`v3/profile/${ticker.toUpperCase()}`),
    select: useCallback((data: AxiosResponse<Array<Stock>>) => data.data[0], []),
  })
}

export default useGetStockDetail
