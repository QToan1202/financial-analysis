import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

import { requestForBE } from '@services'
import { documentKeys } from '@factories'

export const useDeleteDocument = (): UseMutationResult<AxiosResponse, Error, string> => {
  const queryClient = useQueryClient()
  return useMutation<AxiosResponse, Error, string>({
    mutationFn: (id: string): Promise<AxiosResponse> => {
      if (!id) throw Error('Missing data when performing delete document')

      return requestForBE.delete(`/document/delete/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists(), exact: true })
    },
  })
}

export default useDeleteDocument
