import { UseMutationResult, useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'

import { requestForBE } from '@services'

type DocumentResponse = {
  filename: string
  message: string
}

export const useUploadDocument = (): UseMutationResult<
  AxiosResponse<DocumentResponse>,
  Error,
  File,
  unknown
> => {
  return useMutation<AxiosResponse<DocumentResponse>, Error, File, unknown>({
    mutationFn: (file: File): Promise<AxiosResponse<DocumentResponse>> => {
      const data = new FormData()
      const blob = new Blob([file], {
        type: file.type,
      })
      data.append('file', blob, file.name)
      return requestForBE.post('/document/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },
  })
}

export default useUploadDocument
