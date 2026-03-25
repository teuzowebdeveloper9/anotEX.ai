import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyGroup } from '@/entities/study-group'

interface UpdateGroupInput {
  groupId: string
  name?: string
  description?: string
}

export function useUpdateGroup() {
  const queryClient = useQueryClient()

  return useMutation<StudyGroup, Error, UpdateGroupInput>({
    mutationFn: async ({ groupId, ...body }) => {
      const { data } = await api.patch<StudyGroup>(ENDPOINTS.groups.update(groupId), body)
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['study-group', variables.groupId] })
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
    },
  })
}
