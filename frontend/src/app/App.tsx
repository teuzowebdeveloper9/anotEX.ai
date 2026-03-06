import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryProvider } from './providers/QueryProvider'
import { LandingPage } from '@/pages/landing/ui/LandingPage'
import { LoginPage } from '@/pages/login/ui/LoginPage'
import { AuthCallbackPage } from '@/pages/auth-callback/ui/AuthCallbackPage'
import { DashboardPage } from '@/pages/dashboard/ui/DashboardPage'
import { RecordPage } from '@/pages/record/ui/RecordPage'
import { TranscriptionPage } from '@/pages/transcription/ui/TranscriptionPage'
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute/ProtectedRoute'

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/record"
            element={
              <ProtectedRoute>
                <RecordPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transcription/:id"
            element={
              <ProtectedRoute>
                <TranscriptionPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          },
        }}
      />
    </QueryProvider>
  )
}
