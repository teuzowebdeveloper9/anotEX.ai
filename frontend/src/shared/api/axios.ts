import axios from 'axios'
import { supabase } from '@/shared/auth/supabase'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
})

instance.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { instance as api }

// Unauthenticated instance for public endpoints (e.g. shared resource pages)
export const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
})
