export const ENDPOINTS = {
  audio: {
    upload: '/audio/upload',
    list: '/audio',
    status: (id: string) => `/audio/${id}/status`,
    delete: (id: string) => `/audio/${id}`,
  },
  transcription: {
    list: '/transcription',
    getByAudioId: (audioId: string) => `/transcription/${audioId}`,
  },
  studyMaterials: {
    list: (transcriptionId: string) => `/study-materials/${transcriptionId}`,
    getByType: (transcriptionId: string, type: string) =>
      `/study-materials/${transcriptionId}/${type}`,
    generate: (transcriptionId: string) => `/study-materials/${transcriptionId}/generate`,
  },
} as const
