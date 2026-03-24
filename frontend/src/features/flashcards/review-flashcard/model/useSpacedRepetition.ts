import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { DueCardItem, FlashcardReviewData } from '@/shared/types/api.types'

export type ReviewQuality = 'hard' | 'medium' | 'easy'

const qualityMap: Record<ReviewQuality, 0 | 2 | 5> = {
  hard: 2,
  medium: 3,
  easy: 5,
}

export function useSpacedRepetition() {
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [sessionResults, setSessionResults] = useState<ReviewQuality[]>([])

  const { data: dueCards = [], isLoading } = useQuery<DueCardItem[]>({
    queryKey: ['review', 'due'],
    queryFn: () => api.get(ENDPOINTS.review.due).then((r) => r.data),
  })

  const reviewMutation = useMutation({
    mutationFn: (vars: {
      studyMaterialId: string
      flashcardIndex: number
      quality: number
    }) => api.post<FlashcardReviewData>(ENDPOINTS.review.submit, vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['review', 'due'] })
    },
  })

  const currentCard = dueCards[currentIndex] ?? null
  const isFinished = dueCards.length > 0 && currentIndex >= dueCards.length

  const flip = useCallback(() => {
    setIsFlipped(true)
  }, [])

  const submitReview = useCallback(
    async (quality: ReviewQuality) => {
      if (!currentCard) return

      await reviewMutation.mutateAsync({
        studyMaterialId: currentCard.studyMaterialId,
        flashcardIndex: currentCard.flashcardIndex,
        quality: qualityMap[quality],
      })

      setSessionResults((prev) => [...prev, quality])
      setIsFlipped(false)
      setCurrentIndex((prev) => prev + 1)
    },
    [currentCard, reviewMutation],
  )

  return {
    currentCard,
    isFlipped,
    isFinished,
    isLoading,
    totalCards: dueCards.length,
    currentIndex,
    sessionResults,
    flip,
    submitReview,
    isPending: reviewMutation.isPending,
  }
}
