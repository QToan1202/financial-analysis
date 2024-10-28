import axios, { AxiosInstance } from 'axios'

export const requestAA: AxiosInstance = axios.create({
  baseURL: 'https://www.alphavantage.co',
  params: {
    apikey: import.meta.env.VITE_AA_API_KEY,
  },
})

export const requestFML: AxiosInstance = axios.create({
  baseURL: 'https://financialmodelingprep.com/api',
  params: {
    apikey: import.meta.env.VITE_FMP_API_KEY,
  },
})

export const requestPo: AxiosInstance = axios.create({
  baseURL: 'https://api.polygon.io',
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_PO_API_KEY}`,
  },
})
