import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useSpacedRepetition } from '@/features/flashcards/review-flashcard/model/useSpacedRepetition'
import { ReviewCard } from '@/features/flashcards/review-flashcard/ui/ReviewCard'
import { ReviewSummary } from '@/features/flashcards/review-flashcard/ui/ReviewSummary'
import { Brain, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/shared/ui/Button/Button'
import logoAnotex from '@/shared/assets/logo-anotex.png'

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
    <div className="pen-page min-h-screen overflow-hidden">
      <GradientOrb size={500} color="#38ABE4" opacity={0.07} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />
      <header className="pen-nav relative z-20">
        <div className="mx-auto flex h-[66px] max-w-[1440px] items-center justify-between px-5 md:px-16">
          <img src={logoAnotex} alt="anotEX.ai" className="h-[30px] w-auto" />
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Revisão de hoje</span>
            <span className="rounded-full bg-[rgba(56,171,228,0.1)] px-3 py-1 text-xs font-semibold text-[var(--accent-5)]">
              {Math.min(currentIndex + 1, Math.max(totalCards, 1))} / {Math.max(totalCards, 1)}
            </span>
          </div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(56,171,228,0.25)] bg-white/60 px-4 py-2 text-sm font-medium text-[var(--accent-5)]">
            <X size={14} />
            Encerrar
          </Link>
        </div>
      </header>
      <main className="relative z-10 flex min-h-[calc(100vh-66px)] items-center justify-center px-6 py-10">
        <div className="w-full max-w-[760px]">

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
                <div className="w-full h-2 bg-[rgba(56,171,228,0.16)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / totalCards) * 100}%`, background: 'var(--gradient-primary)' }}
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
