import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { AudioStatusResponse } from '@/shared/types/api.types'

export function useTranscriptionStatus(audioId: string) {
  return useQuery<AudioStatusResponse>({
    queryKey: ['transcription-status', audioId],
    queryFn: async () => {
      const { data } = await api.get<AudioStatusResponse>(ENDPOINTS.audio.status(audioId))
      return data
    },
    refetchInterval: (query) => {
      const status = query.state.data?.transcription?.status
      return status === 'COMPLETED' || status === 'FAILED' ? false : 5000
    },
  })
}
