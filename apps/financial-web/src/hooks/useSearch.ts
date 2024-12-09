import { useCallback } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { financialModelingPrepKeys } from '@factories'
import { requestFML } from '@services'
import type { StockSearch } from '@types'

import useDebounce from './useDebounce'

const useSearch = (query: string, limit: number = 5): UseQueryResult<StockSearch[], Error> => {
  const debouncedQuery = useDebounce(query)

  return useQuery({
    queryKey: financialModelingPrepKeys.list(debouncedQuery),
    queryFn: () => requestFML.get('v3/search-ticker', { params: { query: debouncedQuery, limit } }),
    enabled: !!debouncedQuery,
    select: useCallback((data: AxiosResponse<StockSearch[]>) => data.data, []),
  })
}

export default useSearch
