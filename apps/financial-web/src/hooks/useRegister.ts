import { UseMutationResult, useMutation } from '@tanstack/react-query'
import { AxiosResponse } from 'axios'
import { useNavigate } from 'react-router-dom'

import type { SignUpForm, IUser, Token } from '@types'
import { useAuthStore } from '@contexts'
import { requestForBE } from '@services'

export const useRegister = (
  path: string
): UseMutationResult<AxiosResponse<IUser & Token>, Error, SignUpForm, unknown> => {
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation<AxiosResponse<IUser & Token>, Error, SignUpForm, unknown>({
    mutationFn: (data: SignUpForm): Promise<AxiosResponse<IUser & Token>> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = data

      return requestForBE.post(path, registerData)
    },
    onSuccess: (data: AxiosResponse<IUser & Token>) => {
      setUser(data.data)
      navigate('/')
    },
  })
}

export default useRegister
