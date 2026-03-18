import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { QueryProvider } from './providers/QueryProvider'
import { LandingPage } from '@/pages/landing/ui/LandingPage'
import { LoginPage } from '@/pages/login/ui/LoginPage'
import { AuthCallbackPage } from '@/pages/auth-callback/ui/AuthCallbackPage'
import { DashboardPage } from '@/pages/dashboard/ui/DashboardPage'
import { RecordPage } from '@/pages/record/ui/RecordPage'
import { TranscriptionPage } from '@/pages/transcription/ui/TranscriptionPage'
import { TranscriptionsPage } from '@/pages/transcriptions/ui/TranscriptionsPage'
import { SummariesPage } from '@/pages/summaries/ui/SummariesPage'
import { MindMapsPage } from '@/pages/mindmaps/ui/MindMapsPage'
import { FlashcardsPage } from '@/pages/flashcards/ui/FlashcardsPage'
import { QuizPage } from '@/pages/quiz/ui/QuizPage'
import { StudyFoldersPage } from '@/pages/study-folders/ui/StudyFoldersPage'
import { StudyFolderPage } from '@/pages/study-folder/ui/StudyFolderPage'
import { SharedResourcePage } from '@/pages/shared-resource/ui/SharedResourcePage'
import { GroupsPage } from '@/pages/groups/ui/GroupsPage'
import { GroupDetailPage } from '@/pages/group-detail/ui/GroupDetailPage'
import { ProtectedRoute } from '@/shared/ui/ProtectedRoute/ProtectedRoute'
import { useTheme } from '@/shared/hooks/useTheme'

export function App() {
  const { theme } = useTheme()

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
            path="/transcriptions"
            element={
              <ProtectedRoute>
                <TranscriptionsPage />
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
          <Route
            path="/summaries"
            element={
              <ProtectedRoute>
                <SummariesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mindmaps"
            element={
              <ProtectedRoute>
                <MindMapsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/flashcards"
            element={
              <ProtectedRoute>
                <FlashcardsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-folders"
            element={
              <ProtectedRoute>
                <StudyFoldersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-folders/:id"
            element={
              <ProtectedRoute>
                <StudyFolderPage />
              </ProtectedRoute>
            }
          />
          <Route path="/shared/:token" element={<SharedResourcePage />} />
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/groups/:id"
            element={
              <ProtectedRoute>
                <GroupDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster
        position="bottom-right"
        theme={theme}
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
