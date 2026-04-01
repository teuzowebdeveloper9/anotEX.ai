import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type {
  PomodoroSettingsEntity,
  UpdatePomodoroSettingsPayload,
} from '@/entities/pomodoro/model/pomodoro.types'

export function usePomodoroSettings() {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery<PomodoroSettingsEntity>({
    queryKey: ['pomodoro', 'settings'],
    queryFn: async () => {
      const { data } = await api.get<PomodoroSettingsEntity>(ENDPOINTS.pomodoro.settings)
      return data
    },
  })

  const updateSettings = useMutation({
    mutationFn: async (payload: UpdatePomodoroSettingsPayload) => {
      const { data } = await api.put<PomodoroSettingsEntity>(ENDPOINTS.pomodoro.settings, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['pomodoro', 'settings'], data)
    },
  })

  return {
    settings: settingsQuery.data ?? null,
    isLoading: settingsQuery.isLoading,
    isSaving: updateSettings.isPending,
    saveSettings: updateSettings.mutateAsync,
  }
}
