import { useRef, useState, useCallback } from 'react'
import { Play, Pause, Volume2, Loader2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import { cn } from '@/shared/lib/cn'
import type { TranscriptionSegment } from '@/shared/types/api.types'

interface TranscriptionViewerProps {
  audioId: string
  segments: TranscriptionSegment[] | null
  plainText: string | null
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TranscriptionViewer({ audioId, segments, plainText }: TranscriptionViewerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const activeSegmentRef = useRef<number>(-1)
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeSegment, setActiveSegment] = useState(-1)
  const [audioError, setAudioError] = useState(false)

  const hasSegments = !!segments && segments.length > 0

  const { data: urlData, isLoading: urlLoading } = useQuery({
    queryKey: ['audio-url', audioId],
    queryFn: async () => {
      const { data } = await api.get<{ url: string }>(ENDPOINTS.audio.url(audioId))
      return data
    },
    staleTime: 1000 * 60 * 10,
    enabled: !!audioId && hasSegments,
  })

  // — React event handlers no <audio> — sem useEffect, sem timing race —

  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    setDuration(audio.duration)
    setAudioError(false)
  }, [])

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !segments) return
    const t = audio.currentTime
    setCurrentTime(t)

    // Encontra segmento ativo sem causar re-render desnecessário
    let idx = -1
    for (let i = 0; i < segments.length; i++) {
      if (t >= segments[i].start) idx = i
      else break
    }
    if (idx !== activeSegmentRef.current) {
      activeSegmentRef.current = idx
      setActiveSegment(idx)
      if (idx >= 0) {
        segmentRefs.current[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [segments])

  const handleError = useCallback(() => setAudioError(true), [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      try {
        await audio.play()
      } catch {
        setAudioError(true)
      }
    }
  }, [isPlaying])

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    audio.play().catch(() => setAudioError(true))
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }, [duration])

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  // Fallback: sem segments, texto plano
  if (!hasSegments) {
    return (
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap max-h-[520px] overflow-y-auto pr-2">
        {plainText ?? '—'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Elemento de áudio sempre montado, src só seta quando URL chega */}
      <audio
        ref={audioRef}
        src={urlData?.url}
        preload="metadata"
        style={{ display: 'none' }}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => { setIsPlaying(false); setCurrentTime(0) }}
        onError={handleError}
      />

      {/* Player */}
      <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        <button
          onClick={togglePlay}
          disabled={!urlData?.url || urlLoading || audioError}
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--accent-bg)] border border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {urlLoading
            ? <Loader2 size={14} className="animate-spin" />
            : audioError
              ? <AlertCircle size={14} className="text-red-400" />
              : isPlaying
                ? <Pause size={14} />
                : <Play size={14} />
          }
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Volume2 size={11} className="text-[var(--text-secondary)]" />
          <span className="text-[10px] font-mono text-[var(--text-secondary)] tabular-nums w-[76px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div
          className="flex-1 h-1.5 bg-[var(--bg-surface)] rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-[var(--accent)] rounded-full"
            style={{ width: `${progressPct}%`, transition: 'width 0.1s linear' }}
          />
        </div>
      </div>

      {audioError && (
        <p className="text-xs text-red-400 flex items-center gap-1.5">
          <AlertCircle size={11} />
          Não foi possível carregar o áudio.
        </p>
      )}

      {/* Segments */}
      <div className="max-h-[480px] overflow-y-auto pr-1 flex flex-col gap-0.5">
        {segments.map((seg, i) => {
          const isActive = activeSegment === i
          return (
            <button
              key={i}
              ref={(el) => { segmentRefs.current[i] = el }}
              onClick={() => seekTo(seg.start)}
              disabled={!urlData?.url || audioError}
              className={cn(
                'group w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition-all duration-150 disabled:cursor-default',
                isActive
                  ? 'bg-[var(--accent-bg)] border border-[var(--accent)]/20'
                  : 'hover:bg-[var(--bg-elevated)] border border-transparent',
              )}
            >
              <span className={cn(
                'shrink-0 text-[10px] font-mono tabular-nums pt-0.5 min-w-[36px] transition-colors',
                isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent)]',
              )}>
                {formatTime(seg.start)}
              </span>
              <p className={cn(
                'text-sm leading-relaxed transition-colors',
                isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
              )}>
                {seg.text}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
