import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { GroupWithMeta } from './study-group.types'

export function useGroupList() {
  return useQuery<GroupWithMeta[]>({
    queryKey: ['study-groups'],
    queryFn: async () => {
      const { data } = await api.get<GroupWithMeta[]>(ENDPOINTS.groups.list)
      return data
    },
  })
}
