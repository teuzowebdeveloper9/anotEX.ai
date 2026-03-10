import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import { useDebounce } from '@/shared/hooks/useDebounce'
import type { TranscriptionEntity } from '@/shared/types/api.types'

export function useTranscriptionList(search?: string) {
  const debouncedSearch = useDebounce(search ?? '', 300)

  return useQuery<TranscriptionEntity[]>({
    queryKey: ['transcription-list', debouncedSearch],
    queryFn: async () => {
      const params = debouncedSearch ? { q: debouncedSearch } : undefined
      const { data } = await api.get<TranscriptionEntity[]>(ENDPOINTS.transcription.list, { params })
      return data
    },
  })
}
