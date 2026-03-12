import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

export function useDeleteFolder() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (folderId: string) => {
      await api.delete(ENDPOINTS.studyFolders.delete(folderId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-folders'] })
      toast.success('Pasta excluída')
      navigate('/study-folders')
    },
    onError: () => {
      toast.error('Erro ao excluir pasta')
    },
  })
}
