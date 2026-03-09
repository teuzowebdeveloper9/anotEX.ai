import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyMaterialEntity, StudyMaterialType } from '@/shared/types/api.types'

export function useStudyMaterial(transcriptionId: string, type: StudyMaterialType) {
  const triggered = useRef(false)

  const query = useQuery<StudyMaterialEntity | null>({
    queryKey: ['study-material', transcriptionId, type],
    queryFn: async () => {
      const { data } = await api.get<StudyMaterialEntity | null>(
        ENDPOINTS.studyMaterials.getByType(transcriptionId, type),
      )
      return data ?? null
    },
    refetchInterval: (q) => {
      // null = ainda em fila, continua polling
      if (q.state.data === null) return 5000
      const status = q.state.data?.status
      return status === 'COMPLETED' || status === 'FAILED' ? false : 5000
    },
    enabled: !!transcriptionId,
    retry: false,
  })

  // Auto-trigger geração quando o material ainda não existe (null)
  useEffect(() => {
    if (!transcriptionId || triggered.current) return
    if (query.isSuccess && query.data === null && !query.isFetching) {
      triggered.current = true
      api
        .post(ENDPOINTS.studyMaterials.generate(transcriptionId))
        .catch(() => undefined)
    }
  }, [query.isSuccess, query.data, query.isFetching, transcriptionId, queryClient])

  return query
}
