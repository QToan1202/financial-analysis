import { useAuthStore } from '@contexts'
import { requestForBE } from '@services'

const refreshAccessToken = async () => {
  const userInfo = useAuthStore.getState().user
  if (!userInfo.refreshToken) throw Error('Missing refresh token')

  const response = await requestForBE.post<{ token?: string }>('/refresh-token', {
    token: userInfo.refreshToken,
  })

  return response.data.token
}

export default refreshAccessToken
