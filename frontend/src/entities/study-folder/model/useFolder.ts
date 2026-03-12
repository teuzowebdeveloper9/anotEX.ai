import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { FolderWithItems } from './study-folder.types'

export function useFolder(folderId: string) {
  return useQuery<FolderWithItems>({
    queryKey: ['study-folder', folderId],
    queryFn: async () => {
      const { data } = await api.get<FolderWithItems>(ENDPOINTS.studyFolders.get(folderId))
      return data
    },
    enabled: !!folderId,
  })
}
