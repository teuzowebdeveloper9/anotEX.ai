export const ENDPOINTS = {
  audio: {
    upload: '/audio/upload',
    list: '/audio',
    status: (id: string) => `/audio/${id}/status`,
    url: (id: string) => `/audio/${id}/url`,
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
  sharing: {
    create: '/sharing',
    list: '/sharing',
    public: (token: string) => `/sharing/public/${token}`,
    toggle: (id: string) => `/sharing/${id}/toggle`,
    delete: (id: string) => `/sharing/${id}`,
  },
  groups: {
    create: '/groups',
    list: '/groups',
    get: (id: string) => `/groups/${id}`,
    delete: (id: string) => `/groups/${id}`,
    addMember: (id: string) => `/groups/${id}/members`,
    removeMember: (id: string, userId: string) => `/groups/${id}/members/${userId}`,
    addShare: (id: string) => `/groups/${id}/shares`,
    removeShare: (id: string, shareLinkId: string) => `/groups/${id}/shares/${shareLinkId}`,
  },
  chat: {
    conversations: '/chat/conversations',
    send: (transcriptionId: string) => `/chat/${transcriptionId}`,
    history: (transcriptionId: string) => `/chat/${transcriptionId}/history`,
    clearHistory: (transcriptionId: string) => `/chat/${transcriptionId}/history`,
  },
  review: {
    due: '/review/due',
    submit: '/review',
  },
} as const
