import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyFolder } from './study-folder.types'

export function useFolderList() {
  return useQuery<StudyFolder[]>({
    queryKey: ['study-folders'],
    queryFn: async () => {
      const { data } = await api.get<StudyFolder[]>(ENDPOINTS.studyFolders.list)
      return data
    },
  })
}
