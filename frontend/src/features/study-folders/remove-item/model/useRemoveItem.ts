import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

export function useRemoveItem(folderId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(ENDPOINTS.studyFolders.removeItem(folderId, itemId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-folder', folderId] })
      queryClient.invalidateQueries({ queryKey: ['study-folders'] })
      toast.success('Material removido da pasta')
    },
    onError: () => {
      toast.error('Erro ao remover material')
    },
  })
}
