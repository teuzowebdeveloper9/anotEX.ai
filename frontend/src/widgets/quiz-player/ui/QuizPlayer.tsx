import { useState, useCallback } from 'react'
import { CheckCircle2, XCircle, RotateCcw, Trophy, ChevronRight, AlertCircle } from 'lucide-react'
import type { QuizItem } from '@/shared/types/api.types'
import { cn } from '@/shared/lib/cn'

interface QuizPlayerProps {
  questions: QuizItem[]
}

type Phase = 'playing' | 'reviewing' | 'finished'

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const

export function QuizPlayer({ questions }: QuizPlayerProps) {
  const [phase, setPhase] = useState<Phase>('playing')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(questions.length).fill(null))

  const current = questions[currentIndex]
  const selectedForCurrent = answers[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const score = answers.filter((a, i) => a === questions[i].correct).length

  const handleSelectOption = useCallback((optionIndex: number) => {
    if (phase === 'reviewing') return
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = optionIndex
      return next
    })
    setPhase('reviewing')
  }, [phase, currentIndex])

  const handleNext = useCallback(() => {
    if (isLast) {
      setPhase('finished')
    } else {
      setCurrentIndex((i) => i + 1)
      setPhase('playing')
    }
  }, [isLast])

  const handleReset = useCallback(() => {
    setCurrentIndex(0)
    setAnswers(Array(questions.length).fill(null))
    setPhase('playing')
  }, [questions.length])

  const progress = ((currentIndex + (phase === 'finished' ? 1 : 0)) / questions.length) * 100
  const scorePercent = Math.round((score / questions.length) * 100)

  // — Tela de resultado —
  if (phase === 'finished') {
    return (
      <div className="flex flex-col gap-6">

        {/* Score card */}
        <div className="pen-surface flex flex-col items-center gap-4 rounded-[28px] py-10">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center"
            style={{
              background: scorePercent >= 70
                ? 'rgba(34,197,94,0.12)'
                : scorePercent >= 40
                  ? 'rgba(234,179,8,0.12)'
                  : 'rgba(239,68,68,0.12)',
              border: `1px solid ${scorePercent >= 70 ? 'rgba(34,197,94,0.25)' : scorePercent >= 40 ? 'rgba(234,179,8,0.25)' : 'rgba(239,68,68,0.25)'}`,
            }}
          >
            <Trophy
              size={24}
              style={{
                color: scorePercent >= 70 ? '#22c55e' : scorePercent >= 40 ? '#eab308' : '#ef4444',
              }}
            />
          </div>

          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
              {score}/{questions.length}
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {scorePercent >= 70
                ? 'Ótimo desempenho!'
                : scorePercent >= 40
                  ? 'Continue praticando'
                  : 'Revise o conteúdo'}
            </p>
          </div>

          {/* Score bar */}
          <div className="w-48 h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${scorePercent}%`,
                background: scorePercent >= 70
                  ? '#22c55e'
                  : scorePercent >= 40
                    ? '#eab308'
                    : '#ef4444',
              }}
            />
          </div>
          <p className="text-xs font-semibold text-[var(--text-secondary)]">{scorePercent}%</p>
        </div>

        {/* Breakdown */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-1">
            Detalhamento
          </p>
          {questions.map((q, i) => {
            const userAnswer = answers[i]
            const correct = userAnswer === q.correct
            return (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-xl border',
                  correct
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-red-500/20 bg-red-500/5',
                )}
              >
                {correct
                  ? <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] leading-relaxed">
                    {q.question}
                  </p>
                  {!correct && userAnswer !== null && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                      Você: <span className="text-red-400">{q.options[userAnswer]}</span>
                      {' · '}
                      Correto: <span className="text-emerald-400">{q.options[q.correct]}</span>
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="self-center flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <RotateCcw size={13} />
          Refazer quiz
        </button>
      </div>
    )
  }

  // — Tela de quiz —
  return (
    <div className="flex flex-col gap-5">

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-all duration-400 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums shrink-0">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Dot indicators */}
      {questions.length <= 15 && (
        <div className="flex gap-1.5 justify-center">
          {questions.map((_, i) => {
            const answered = answers[i] !== null
            const wasCorrect = answered && answers[i] === questions[i].correct
            return (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === currentIndex
                    ? 'w-5 bg-[var(--accent)]'
                    : answered
                      ? wasCorrect
                        ? 'w-1.5 bg-emerald-500'
                        : 'w-1.5 bg-red-500'
                      : 'w-1.5 bg-[var(--bg-elevated)]',
                )}
              />
            )
          })}
        </div>
      )}

      {/* Question card */}
      <div className="pen-surface rounded-[28px] p-8">
        <div className="flex items-start gap-3 mb-5">
          <span className="shrink-0 h-6 w-6 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)]">
            {currentIndex + 1}
          </span>
          <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed pt-0.5">
            {current.question}
          </p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {current.options.map((option, i) => {
            const isSelected = selectedForCurrent === i
            const isCorrect = i === current.correct
            const isReviewing = phase === 'reviewing'

            let optionStyle = ''
            if (isReviewing) {
              if (isCorrect) {
                optionStyle = 'border-emerald-500/40 bg-emerald-500/8 text-emerald-300'
              } else if (isSelected && !isCorrect) {
                optionStyle = 'border-red-500/40 bg-red-500/8 text-red-300'
              } else {
                optionStyle = 'border-[var(--border)] text-[var(--text-secondary)] opacity-50'
              }
            } else {
                  optionStyle = 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:bg-white/70 hover:text-[var(--text-primary)] cursor-pointer'
            }

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(i)}
                disabled={isReviewing}
                className={cn(
                  'flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 disabled:cursor-default',
                  optionStyle,
                )}
              >
                {/* Label A/B/C/D */}
                <span
                  className={cn(
                    'shrink-0 h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors',
                    isReviewing && isCorrect
                      ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                      : isReviewing && isSelected && !isCorrect
                        ? 'border-red-500/40 bg-red-500/20 text-red-300'
                        : 'border-[var(--border)] bg-[var(--bg-surface)]',
                  )}
                >
                  {OPTION_LABELS[i]}
                </span>

                <span className="flex-1 text-sm leading-snug">{option}</span>

                {/* Icon indicator */}
                {isReviewing && isCorrect && (
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                )}
                {isReviewing && isSelected && !isCorrect && (
                  <XCircle size={14} className="text-red-400 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Explanation + next (only after answering) */}
      {phase === 'reviewing' && (
        <div className="flex flex-col gap-3">
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-xl border text-sm',
              selectedForCurrent === current.correct
                ? 'border-emerald-500/25 bg-emerald-500/5'
                : 'border-amber-500/25 bg-amber-500/5',
            )}
          >
            <AlertCircle
              size={15}
              className={cn(
                'shrink-0 mt-0.5',
                selectedForCurrent === current.correct ? 'text-emerald-400' : 'text-amber-400',
              )}
            />
            <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
              {current.explanation}
            </p>
          </div>

          <button
            onClick={handleNext}
            className="self-end flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-95"
            style={{ background: 'var(--gradient-primary)' }}
          >
            {isLast ? 'Ver resultado' : 'Próxima pergunta'}
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
