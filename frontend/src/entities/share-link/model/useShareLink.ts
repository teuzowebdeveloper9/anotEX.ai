import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { ShareLink } from './share-link.types'

export function useShareLinks() {
  return useQuery<ShareLink[]>({
    queryKey: ['share-links'],
    queryFn: async () => {
      const { data } = await api.get<ShareLink[]>(ENDPOINTS.sharing.list)
      return data
    },
  })
}

export function useShareLinkByResource(resourceType: string, resourceId: string) {
  const { data: links } = useShareLinks()
  return links?.find(
    (l) => l.resourceType === resourceType && l.resourceId === resourceId,
  ) ?? null
}
