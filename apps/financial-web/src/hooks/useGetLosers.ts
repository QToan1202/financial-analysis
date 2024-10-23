import { useCallback } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { financialModelingPrepKeys } from '@factories'
import { requestFML } from '@services'
import type { Gainer } from '@types'

const useGetLosers = (): UseQueryResult<Gainer[], Error> => {
  return useQuery({
    queryKey: [financialModelingPrepKeys.list('losers')],
    queryFn: () => requestFML.get('v3/stock_market/losers'),
    select: useCallback((data: AxiosResponse<Gainer[]>) => data.data.slice(0, 10), []),
  })
}

export default useGetLosers
