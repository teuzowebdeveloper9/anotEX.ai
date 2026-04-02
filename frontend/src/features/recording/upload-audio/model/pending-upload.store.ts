import { useSyncExternalStore } from 'react'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { UploadAudioResponse } from '@/shared/types/api.types'

export type PendingUploadStatus = 'uploading' | 'completed' | 'error'

export interface PendingUploadEntry {
  id: string
  status: PendingUploadStatus
  audioId: string | null
  errorMessage: string | null
  fileName: string
  startedAt: number
}

const uploads = new Map<string, PendingUploadEntry>()
const listeners = new Map<string, Set<() => void>>()

function emit(uploadId: string): void {
  listeners.get(uploadId)?.forEach((listener) => listener())
}

function setUpload(uploadId: string, next: PendingUploadEntry): void {
  uploads.set(uploadId, next)
  emit(uploadId)
}

function getUpload(uploadId: string): PendingUploadEntry | null {
  return uploads.get(uploadId) ?? null
}

function subscribe(uploadId: string, listener: () => void): () => void {
  const set = listeners.get(uploadId) ?? new Set<() => void>()
  set.add(listener)
  listeners.set(uploadId, set)

  return () => {
    const current = listeners.get(uploadId)
    if (!current) return
    current.delete(listener)
    if (current.size === 0) {
      listeners.delete(uploadId)
    }
  }
}

function scheduleCleanup(uploadId: string): void {
  window.setTimeout(() => {
    uploads.delete(uploadId)
    listeners.delete(uploadId)
  }, 5 * 60 * 1000)
}

export function startPendingUpload(file: Blob | File, language = 'pt'): string {
  const uploadId = crypto.randomUUID()
  const fileName = file instanceof File ? file.name : `recording-${Date.now()}.webm`

  setUpload(uploadId, {
    id: uploadId,
    status: 'uploading',
    audioId: null,
    errorMessage: null,
    fileName,
    startedAt: Date.now(),
  })

  void (async () => {
    try {
      const formData = new FormData()
      formData.append('audio', file, fileName)
      formData.append('language', language)

      const { data } = await api.post<UploadAudioResponse>(ENDPOINTS.audio.upload, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setUpload(uploadId, {
        id: uploadId,
        status: 'completed',
        audioId: data.audioId,
        errorMessage: null,
        fileName,
        startedAt: uploads.get(uploadId)?.startedAt ?? Date.now(),
      })
      scheduleCleanup(uploadId)
    } catch {
      setUpload(uploadId, {
        id: uploadId,
        status: 'error',
        audioId: null,
        errorMessage: 'Erro ao enviar áudio. Tente novamente.',
        fileName,
        startedAt: uploads.get(uploadId)?.startedAt ?? Date.now(),
      })
      scheduleCleanup(uploadId)
    }
  })()

  return uploadId
}

export function usePendingUpload(uploadId?: string | null): PendingUploadEntry | null {
  return useSyncExternalStore(
    (onStoreChange) => (uploadId ? subscribe(uploadId, onStoreChange) : () => undefined),
    () => (uploadId ? getUpload(uploadId) : null),
    () => null,
  )
}
