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
  studyFolders: {
    list: '/study-folders',
    create: '/study-folders',
    get: (id: string) => `/study-folders/${id}`,
    update: (id: string) => `/study-folders/${id}`,
    delete: (id: string) => `/study-folders/${id}`,
    addItem: (folderId: string) => `/study-folders/${folderId}/items`,
    removeItem: (folderId: string, itemId: string) => `/study-folders/${folderId}/items/${itemId}`,
    recommendations: (id: string) => `/study-folders/${id}/recommendations`,
    processVideo: (id: string) => `/study-folders/${id}/process-video`,
  },
} as const
