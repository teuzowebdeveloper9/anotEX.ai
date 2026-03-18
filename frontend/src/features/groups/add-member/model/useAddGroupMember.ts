import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { GroupMember } from '@/entities/study-group'

interface AddMemberInput {
  groupId: string
  email: string
}

export function useAddGroupMember() {
  const queryClient = useQueryClient()

  return useMutation<GroupMember, Error, AddMemberInput>({
    mutationFn: async ({ groupId, email }) => {
      const { data } = await api.post<GroupMember>(ENDPOINTS.groups.addMember(groupId), { email })
      return data
    },
    onSuccess: (_data, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: ['study-group', groupId] })
    },
  })
}
