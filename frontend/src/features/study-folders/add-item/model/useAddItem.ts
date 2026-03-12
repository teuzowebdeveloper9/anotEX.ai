import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { FolderItemType, StudyFolderItem } from '@/entities/study-folder/model/study-folder.types'

interface AddItemPayload {
  folderId: string
  transcriptionId: string
  itemType: FolderItemType
}

export function useAddItem(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ folderId, transcriptionId, itemType }: AddItemPayload) => {
      const { data } = await api.post<StudyFolderItem>(
        ENDPOINTS.studyFolders.addItem(folderId),
        { transcriptionId, itemType },
      )
      return data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['study-folder', variables.folderId] })
      queryClient.invalidateQueries({ queryKey: ['study-folders'] })
      toast.success('Material adicionado à pasta')
      onSuccess?.()
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      if (message?.includes('já está na pasta')) {
        toast.error('Este material já está na pasta')
      } else {
        toast.error('Erro ao adicionar material')
      }
    },
  })
}
