import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { clearSession, getAccessToken, hasRefreshToken, refresh } from '@/shared/auth/auth-client'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
})

instance.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

// Em 401: tenta UM refresh (se houver refresh token) e repete a request.
// Se falhar, apenas limpa a sessão — o ProtectedRoute reage ao onAuthStateChange
// e redireciona via SPA. Nunca usar window.location aqui: em páginas públicas
// isso causava loop infinito de reload.
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableRequestConfig | undefined

    if (error.response?.status === 401 && config && !config._retry && hasRefreshToken()) {
      config._retry = true
      try {
        const session = await refresh()
        config.headers.Authorization = `Bearer ${session.accessToken}`
        return instance(config)
      } catch {
        clearSession()
      }
    }

    return Promise.reject(error)
  },
)

export { instance as api }

// Unauthenticated instance for public endpoints (e.g. shared resource pages)
export const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
})
