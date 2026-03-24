import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useSpacedRepetition } from '@/features/flashcards/review-flashcard/model/useSpacedRepetition'
import { ReviewCard } from '@/features/flashcards/review-flashcard/ui/ReviewCard'
import { ReviewSummary } from '@/features/flashcards/review-flashcard/ui/ReviewSummary'
import { Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button/Button'

export function ReviewPage() {
  const {
    currentCard,
    isFlipped,
    isFinished,
    isLoading,
    totalCards,
    currentIndex,
    sessionResults,
    flip,
    submitReview,
    isPending,
  } = useSpacedRepetition()

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb
        size={500}
        color="#6366f1"
        opacity={0.07}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <Navbar />
      <Sidebar />
      <main className="relative z-10 pt-14 md:pl-52">
        <div className="max-w-2xl mx-auto px-6 pt-10 pb-16">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent)]/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">Revisão Espaçada</h1>
              <p className="text-xs text-[var(--text-secondary)]">Algoritmo SM-2</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-[220px] w-full rounded-2xl" />
              <div className="flex gap-3">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
              </div>
            </div>
          ) : totalCards === 0 ? (
            <div className="flex flex-col items-center gap-5 py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center">
                <Brain className="w-7 h-7 text-[var(--text-tertiary)]" />
              </div>
              <div>
                <p className="text-base font-medium text-[var(--text-primary)]">
                  Nenhum card para revisar hoje
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-xs">
                  Você está em dia com suas revisões. Volte amanhã ou grave mais aulas.
                </p>
              </div>
              <Link to="/dashboard">
                <Button variant="outline">Ir para o Dashboard</Button>
              </Link>
            </div>
          ) : isFinished ? (
            <ReviewSummary total={totalCards} results={sessionResults} />
          ) : (
            <>
              {/* Barra de progresso */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
                  <span>
                    {currentIndex + 1} / {totalCards}
                  </span>
                  <span className="text-[var(--text-tertiary)]">{currentCard?.topic}</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                    style={{ width: `${(currentIndex / totalCards) * 100}%` }}
                  />
                </div>
              </div>

              <ReviewCard
                front={currentCard!.front}
                back={currentCard!.back}
                topic={currentCard!.topic}
                isFlipped={isFlipped}
                onFlip={flip}
                onReview={submitReview}
                isPending={isPending}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
