import axios from 'axios'
import { API_BASE_URL, TOKEN_KEY } from '../utils/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const PUBLIC_AUTH_PATHS = ['/auth/login', '/auth/register']

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const requestUrl = error.config?.url || ''
    const isPublicAuth = PUBLIC_AUTH_PATHS.some((path) => requestUrl.includes(path))

    if (status === 401 && !isPublicAuth) {
      localStorage.removeItem(TOKEN_KEY)
      window.dispatchEvent(new Event('rateora:unauthorized'))
    }

    return Promise.reject(error)
  }
)

export default api
