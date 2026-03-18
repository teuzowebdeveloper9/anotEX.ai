import { useRef, useState, useEffect, useCallback } from 'react'
import { Play, Pause, Volume2, Loader2 } from 'lucide-react'
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
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function TranscriptionViewer({ audioId, segments, plainText }: TranscriptionViewerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeSegment, setActiveSegment] = useState<number | null>(null)
  const segmentRefs = useRef<(HTMLButtonElement | null)[]>([])

  const { data: urlData, isLoading: urlLoading } = useQuery({
    queryKey: ['audio-url', audioId],
    queryFn: async () => {
      const { data } = await api.get<{ url: string }>(ENDPOINTS.audio.url(audioId))
      return data
    },
    staleTime: 1000 * 60 * 10, // 10 min (signed URL válida por 15)
    enabled: !!audioId && !!segments?.length,
  })

  // Sync audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      if (segments) {
        const idx = segments.findIndex(
          (s, i) =>
            audio.currentTime >= s.start &&
            (i === segments.length - 1 || audio.currentTime < segments[i + 1].start),
        )
        if (idx !== -1 && idx !== activeSegment) {
          setActiveSegment(idx)
          segmentRefs.current[idx]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
      }
    }
    const onLoadedMetadata = () => setDuration(audio.duration)
    const onEnded = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
    }
  }, [segments, activeSegment])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
  }, [isPlaying])

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = time
    audio.play()
  }, [])

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * duration
  }, [duration])

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

  // Se não tem segments, renderiza texto plano
  if (!segments || segments.length === 0) {
    return (
      <div className="text-sm text-[var(--text-secondary)] leading-relaxed font-mono whitespace-pre-wrap max-h-[520px] overflow-y-auto pr-2">
        {plainText ?? '—'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Audio player */}
      {urlData?.url && (
        <audio ref={audioRef} src={urlData.url} preload="metadata" className="hidden" />
      )}

      <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        <button
          onClick={togglePlay}
          disabled={!urlData?.url || urlLoading}
          className="h-8 w-8 rounded-lg flex items-center justify-center bg-[var(--accent-bg)] border border-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {urlLoading
            ? <Loader2 size={14} className="animate-spin" />
            : isPlaying
              ? <Pause size={14} />
              : <Play size={14} />
          }
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <Volume2 size={11} className="text-[var(--text-secondary)]" />
          <span className="text-[10px] font-mono text-[var(--text-secondary)] tabular-nums w-[72px]">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div
          className="flex-1 h-1.5 bg-[var(--bg-surface)] rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-[var(--accent)] rounded-full transition-none"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Segments */}
      <div className="max-h-[480px] overflow-y-auto pr-1 flex flex-col gap-0.5">
        {segments.map((seg, i) => {
          const isActive = activeSegment === i
          return (
            <button
              key={i}
              ref={(el) => { segmentRefs.current[i] = el }}
              onClick={() => seekTo(seg.start)}
              disabled={!urlData?.url}
              className={cn(
                'group w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg transition-all duration-150 disabled:cursor-default',
                isActive
                  ? 'bg-[var(--accent-bg)] border border-[var(--accent)]/20'
                  : 'hover:bg-[var(--bg-elevated)] border border-transparent',
              )}
            >
              <span
                className={cn(
                  'shrink-0 text-[10px] font-mono tabular-nums pt-0.5 transition-colors min-w-[36px]',
                  isActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] group-hover:text-[var(--accent)]',
                )}
              >
                {formatTime(seg.start)}
              </span>
              <p
                className={cn(
                  'text-sm leading-relaxed transition-colors',
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]',
                )}
              >
                {seg.text}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
