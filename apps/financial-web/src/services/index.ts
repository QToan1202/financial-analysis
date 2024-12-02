import axios, { AxiosInstance } from 'axios'

export const requestForBE: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

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
