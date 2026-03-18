import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyGroup } from '@/entities/study-group'

interface CreateGroupInput {
  name: string
  description?: string
}

export function useCreateGroup() {
  const queryClient = useQueryClient()

  return useMutation<StudyGroup, Error, CreateGroupInput>({
    mutationFn: async (input) => {
      const { data } = await api.post<StudyGroup>(ENDPOINTS.groups.create, input)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
    },
  })
}
