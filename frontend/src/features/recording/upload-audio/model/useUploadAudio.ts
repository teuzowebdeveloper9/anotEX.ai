import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { UploadAudioResponse } from '@/shared/types/api.types'

interface UseUploadAudioReturn {
  uploading: boolean
  upload: (file: Blob | File, language?: string) => Promise<UploadAudioResponse | null>
}

export function useUploadAudio(): UseUploadAudioReturn {
  const [uploading, setUploading] = useState(false)

  const upload = async (file: Blob | File, language = 'pt'): Promise<UploadAudioResponse | null> => {
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
      return data
    } catch {
      toast.error('Erro ao enviar áudio. Tente novamente.')
      return null
    } finally {
      setUploading(false)
    }
  }

  return { uploading, upload }
}
