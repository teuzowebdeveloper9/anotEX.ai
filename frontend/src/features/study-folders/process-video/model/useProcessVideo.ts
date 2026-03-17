import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

interface ProcessVideoResponse {
  audioId: string
  transcriptionId: string
}

export function useProcessVideo(folderId: string) {
  const navigate = useNavigate()
  const [processingVideoId, setProcessingVideoId] = useState<string | null>(null)

  const processVideo = async (videoId: string, videoTitle: string) => {
    setProcessingVideoId(videoId)
    try {
      const { data } = await api.post<ProcessVideoResponse>(
        ENDPOINTS.studyFolders.processVideo(folderId),
        { videoId, videoTitle },
      )
      toast.success('Vídeo enviado para processamento!')
      navigate(`/transcription/${data.audioId}`)
    } catch {
      toast.error('Não foi possível processar o vídeo. Tente novamente.')
    } finally {
      setProcessingVideoId(null)
    }
  }

  return { processVideo, processingVideoId }
}
