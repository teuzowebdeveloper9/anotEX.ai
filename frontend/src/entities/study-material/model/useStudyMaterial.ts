import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { StudyMaterialEntity, StudyMaterialType } from '@/shared/types/api.types'

export function useStudyMaterial(transcriptionId: string, type: StudyMaterialType) {
  const queryClient = useQueryClient()
  const triggered = useRef(false)

  const query = useQuery<StudyMaterialEntity>({
    queryKey: ['study-material', transcriptionId, type],
    queryFn: async () => {
      const { data } = await api.get<StudyMaterialEntity>(
        ENDPOINTS.studyMaterials.getByType(transcriptionId, type),
      )
      return data
    },
    refetchInterval: (q) => {
      // Continua polling durante erros (404) até os registros aparecerem
      if (q.state.error) return 3000
      const status = q.state.data?.status
      return status === 'COMPLETED' || status === 'FAILED' ? false : 3000
    },
    enabled: !!transcriptionId,
    retry: false,
  })

  // Auto-trigger geração quando o material não existe (404)
  useEffect(() => {
    if (!transcriptionId || triggered.current) return
    if (query.isError && !query.isFetching) {
      triggered.current = true
      api
        .post(ENDPOINTS.studyMaterials.generate(transcriptionId))
        .then(() => {
          // Invalida o cache para forçar re-fetch e iniciar o polling
          void queryClient.invalidateQueries({
            queryKey: ['study-material', transcriptionId, type],
          })
        })
        .catch(() => undefined) // ignora se falhar o trigger
    }
  }, [query.isError, query.isFetching, transcriptionId, type, queryClient])

  return query
}
