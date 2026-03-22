import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { ChatMessageEntity } from '@/shared/types/api.types'

export function useChatHistory(transcriptionId: string) {
  return useQuery<ChatMessageEntity[]>({
    queryKey: ['chat-history', transcriptionId],
    queryFn: async () => {
      const { data } = await api.get<ChatMessageEntity[]>(
        ENDPOINTS.chat.history(transcriptionId),
      )
      return data
    },
    enabled: !!transcriptionId,
  })
}
