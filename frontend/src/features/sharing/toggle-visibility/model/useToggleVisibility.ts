import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { ShareLink } from '@/entities/share-link'

interface ToggleInput {
  id: string
  isPublic: boolean
}

export function useToggleVisibility() {
  const queryClient = useQueryClient()

  return useMutation<ShareLink, Error, ToggleInput>({
    mutationFn: async ({ id, isPublic }) => {
      const { data } = await api.patch<ShareLink>(ENDPOINTS.sharing.toggle(id), { isPublic })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] })
    },
  })
}
