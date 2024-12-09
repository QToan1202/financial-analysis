import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

import { requestForBE } from '@services'
import { documentKeys } from '@factories'

type DocumentResponse = {
  filename: string
  message: string
}

type DocumentRequest = {
  files: FileList
  userId: string
}

export const useUploadDocument = (): UseMutationResult<
  AxiosResponse<DocumentResponse>,
  Error,
  DocumentRequest,
  unknown
> => {
  const queryClient = useQueryClient()

  return useMutation<AxiosResponse<DocumentResponse>, Error, DocumentRequest, unknown>({
    mutationFn: ({ files, userId }: DocumentRequest): Promise<AxiosResponse<DocumentResponse>> => {
      const file = files[0]
      const data = new FormData()
      const blob = new Blob([file], {
        type: file.type,
      })
      data.append('file', blob, file.name)
      data.append('userId', userId)
      return requestForBE.post('/document/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentKeys.lists(), exact: true })
    },
  })
}

export default useUploadDocument
