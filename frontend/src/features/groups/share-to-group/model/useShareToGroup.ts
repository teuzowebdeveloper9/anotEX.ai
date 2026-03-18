import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { GroupShare } from '@/entities/study-group'

interface ShareToGroupInput {
  groupId: string
  shareLinkId: string
}

export function useShareToGroup() {
  const queryClient = useQueryClient()

  return useMutation<GroupShare, Error, ShareToGroupInput>({
    mutationFn: async ({ groupId, shareLinkId }) => {
      const { data } = await api.post<GroupShare>(ENDPOINTS.groups.addShare(groupId), { shareLinkId })
      return data
    },
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['study-group', groupId] })
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
    },
  })
}
