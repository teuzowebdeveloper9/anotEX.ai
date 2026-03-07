import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { TranscriptionEntity } from '@/shared/types/api.types'

export function useTranscriptionList() {
  return useQuery<TranscriptionEntity[]>({
    queryKey: ['transcription-list'],
    queryFn: async () => {
      const { data } = await api.get<TranscriptionEntity[]>(ENDPOINTS.transcription.list)
      return data
    },
  })
}
