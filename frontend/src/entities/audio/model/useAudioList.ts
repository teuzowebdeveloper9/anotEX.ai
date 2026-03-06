import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { AudioEntity } from '@/shared/types/api.types'

export function useAudioList() {
  return useQuery<AudioEntity[]>({
    queryKey: ['audio-list'],
    queryFn: async () => {
      const { data } = await api.get<AudioEntity[]>(ENDPOINTS.audio.list)
      return data
    },
  })
}
