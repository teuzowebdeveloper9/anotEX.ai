import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyFolder } from '@/entities/study-folder/model/study-folder.types'

interface CreateFolderPayload {
  name: string
  description?: string
}

export function useCreateFolder(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateFolderPayload) => {
      const { data } = await api.post<StudyFolder>(ENDPOINTS.studyFolders.create, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-folders'] })
      toast.success('Pasta criada com sucesso')
      onSuccess?.()
    },
    onError: () => {
      toast.error('Erro ao criar pasta')
    },
  })
}
