import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { UploadAudioResponse } from '@/shared/types/api.types'

interface UseUploadAudioReturn {
  uploading: boolean
  upload: (file: Blob | File, language?: string) => Promise<void>
}

export function useUploadAudio(): UseUploadAudioReturn {
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const upload = async (file: Blob | File, language = 'pt'): Promise<void> => {
    setUploading(true)
    try {
      const fileName = file instanceof File
        ? file.name
        : `recording-${Date.now()}.webm`

      const formData = new FormData()
      formData.append('audio', file, fileName)
      formData.append('language', language)

      const { data } = await api.post<UploadAudioResponse>(ENDPOINTS.audio.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Áudio enviado! Processando transcrição...')
      navigate(`/transcription/${data.audioId}`)
    } catch {
      toast.error('Erro ao enviar áudio. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return { uploading, upload }
}
