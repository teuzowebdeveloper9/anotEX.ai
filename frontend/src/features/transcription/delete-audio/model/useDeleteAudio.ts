import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

export function useDeleteAudio() {
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const deleteAudio = async (audioId: string): Promise<void> => {
    setLoading(true)
    try {
      await api.delete(ENDPOINTS.audio.delete(audioId))
      await queryClient.invalidateQueries({ queryKey: ['audio-list'] })
      toast.success('Gravação removida.')
    } catch {
      toast.error('Erro ao remover gravação.')
    } finally {
      setLoading(false)
    }
  }

  return { deleteAudio, loading }
}
