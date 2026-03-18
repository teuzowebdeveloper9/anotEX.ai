import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { GroupDetail } from './study-group.types'

export function useGroupDetail(groupId: string) {
  return useQuery<GroupDetail>({
    queryKey: ['study-group', groupId],
    queryFn: async () => {
      const { data } = await api.get<GroupDetail>(ENDPOINTS.groups.get(groupId))
      return data
    },
    enabled: !!groupId,
  })
}
