import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { ShareLink, ResourceType } from '@/entities/share-link'

interface CreateShareLinkInput {
  resourceType: ResourceType
  resourceId: string
}

export function useCreateShareLink() {
  const queryClient = useQueryClient()

  return useMutation<ShareLink, Error, CreateShareLinkInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<ShareLink>(ENDPOINTS.sharing.create, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['share-links'] })
    },
  })
}
