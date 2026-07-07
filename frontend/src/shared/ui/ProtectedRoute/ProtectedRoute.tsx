import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { isAuthenticated, onAuthStateChange } from '@/shared/auth/auth-client'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isAuthenticated())

  useEffect(() => onAuthStateChange((user) => setAuthenticated(!!user)), [])

  if (!authenticated) {
    // Save the intended destination so we can redirect back after login
    const returnTo = window.location.pathname + window.location.search
    if (returnTo !== '/login') {
      sessionStorage.setItem('returnTo', returnTo)
    }
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
