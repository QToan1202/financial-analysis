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
    select: useCallback(
      (data: AxiosResponse<TickerNewsResponse>) =>
        data.data.results.map(({ title, ...rest }) => {
          const convertTitle =
            title.length >= 120
              ? title
                  .slice(0, 120)
                  .trimEnd()
                  .padEnd(120 + 3, '.')
              : title

          return { title: convertTitle, ...rest }
        }),
      []
    ),
  })
}

export default useGetNews
