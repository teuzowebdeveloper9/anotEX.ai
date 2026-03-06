import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { UploadAudioResponse } from '@/shared/types/api.types'

interface UseUploadAudioReturn {
  uploading: boolean
  upload: (blob: Blob, language?: string) => Promise<void>
}

export function useUploadAudio(): UseUploadAudioReturn {
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const upload = async (blob: Blob, language = 'pt'): Promise<void> => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('audio', blob, `recording-${Date.now()}.webm`)
      formData.append('language', language)

      const { data } = await api.post<UploadAudioResponse>(ENDPOINTS.audio.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Gravação enviada! Processando transcrição...')
      navigate(`/transcription/${data.audioId}`)
    } catch {
      toast.error('Erro ao enviar gravação. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return { uploading, upload }
}
