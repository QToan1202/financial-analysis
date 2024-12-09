import { useCallback } from 'react'
import { AxiosResponse } from 'axios'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { documentKeys } from '@factories'
import { requestForBE } from '@services'
import type { Document } from '@types'
const useGetDocuments = (): UseQueryResult<Document[], Error> => {
  return useQuery({
    queryKey: documentKeys.lists(),
    queryFn: () => requestForBE.get('/document/get'),
    select: useCallback((data: AxiosResponse<Document[]>) => data.data, []),
  })
}

export default useGetDocuments
