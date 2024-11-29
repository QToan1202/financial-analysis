import { useCallback } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { polygonKeys } from '@factories'
import { requestPo } from '@services'
import type { News, TickerNewsResponse } from '@types'

const useGetNews = (limit: number = 10): UseQueryResult<News[], Error> => {
  return useQuery({
    queryKey: polygonKeys.list('news'),
    queryFn: () => requestPo.get('/v2/reference/news', { params: { limit } }),
    select: useCallback((data: AxiosResponse<TickerNewsResponse>) => data.data.results, []),
  })
}

export default useGetNews
