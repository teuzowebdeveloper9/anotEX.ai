import { useEffect, useState } from 'react'
import { getUser, onAuthStateChange, type AuthUser } from './auth-client'

interface UseAuthReturn {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(() => getUser())

  useEffect(() => onAuthStateChange(setUser), [])

  return { user, loading: false, isAuthenticated: !!user }
}
