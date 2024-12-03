import { useAuthStore } from '@contexts'
import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

import refreshAccessToken from './auth'

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

export const requestForBE: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

requestForBE.interceptors.request.use(
  (config: CustomRequestConfig) => {
    const userInfo = useAuthStore.getState().user
    if (userInfo.accessToken) {
      config.headers.Authorization = `Bearer ${userInfo.accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

requestForBE.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const updateToken = useAuthStore.getState().setAccessToken
    const clearCredential = useAuthStore.getState().clearAuth
    const originalRequest = error.config as CustomRequestConfig

    if (error.status !== 401 && originalRequest._retry) return Promise.reject(error)
    originalRequest._retry = true

    try {
      const accessToken = await refreshAccessToken()
      if (!accessToken) return Promise.reject(error)
      updateToken(accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return requestForBE(originalRequest)
    } catch (refreshError) {
      // Handle logout when available token expired
      clearCredential()
      Promise.reject(refreshError)
    }
  }
)

export const requestAA: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AA_URL,
  params: {
    apikey: import.meta.env.VITE_AA_API_KEY,
  },
})

export const requestFML: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_FMP_URL,
  params: {
    apikey: import.meta.env.VITE_FMP_API_KEY,
  },
})

export const requestPo: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_PO_URL,
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_PO_API_KEY}`,
  },
})
