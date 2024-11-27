import { UseMutationResult, useMutation } from '@tanstack/react-query'

import { useAuthStore } from '@contexts'
import { requestForBE } from '@services'
import { AxiosResponse } from 'axios'
import type { IUser, SignInForm, Token } from '@types'

const useLogin = (
  path: string
): UseMutationResult<AxiosResponse<IUser & Token>, Error, SignInForm, unknown> => {
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation<AxiosResponse<IUser & Token>, Error, SignInForm, unknown>({
    mutationFn: ({ account, password }: SignInForm): Promise<AxiosResponse<IUser & Token>> =>
      requestForBE.post(path, { email: account, password: password }),
    onSuccess: (data: AxiosResponse<IUser & Token>) => {
      setUser(data.data)
    },
  })
}

export default useLogin
