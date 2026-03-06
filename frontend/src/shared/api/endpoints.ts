export const ENDPOINTS = {
  audio: {
    upload: '/audio/upload',
    list: '/audio',
    status: (id: string) => `/audio/${id}/status`,
    delete: (id: string) => `/audio/${id}`,
  },
  transcription: {
    getByAudioId: (audioId: string) => `/transcription/${audioId}`,
  },
} as const
