import { useGoogleLogin as useLogin, UseGoogleLoginOptionsAuthCodeFlow } from '@react-oauth/google'
import { useToast } from '@chakra-ui/react'
import { AxiosError, AxiosResponse } from 'axios'
import { useNavigate } from 'react-router-dom'

import { IUser, Token } from '@types'
import { useAuthStore } from '@contexts'
import { requestForBE } from '@services'

const useGoogleLogin = (path: string, options?: UseGoogleLoginOptionsAuthCodeFlow) => {
  const setUser = useAuthStore((state) => state.setUser)
  const toast = useToast({
    duration: 3 * 1000,
    isClosable: true,
  })
  const navigate = useNavigate()
  const login = useLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const responseFromProvider = await requestForBE.post(
          import.meta.env.VITE_GOOGLE_TOKEN_URI,
          {
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
            code: tokenResponse.code,
            grant_type: 'authorization_code',
            redirect_uri: 'postmessage',
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        )

        const responseFromBE: AxiosResponse<IUser & Token> = await requestForBE.post(path, {
          credential: responseFromProvider.data.id_token,
        })

        setUser(responseFromBE.data)
        navigate('/')
        options?.onSuccess?.(tokenResponse)
      } catch (error) {
        if (error instanceof AxiosError) {
          toast({
            title: 'Login Failed.',
            description:
              error.response?.data.message ||
              'Something went wrong. Please check your credentials and try again.',
            status: 'error',
          })
        }
      }
    },
    onError: (errorResponse) => options?.onError?.(errorResponse),
    flow: 'auth-code',
  })

  return login
}

export default useGoogleLogin
