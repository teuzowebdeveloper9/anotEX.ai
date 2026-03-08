import { Link } from 'react-router-dom'
import { FileAudio, ChevronRight, Calendar, HardDrive } from 'lucide-react'
import { Badge } from '@/shared/ui/Badge/Badge'
import type { AudioEntity } from '@/shared/types/api.types'

interface AudioCardProps {
  audio: AudioEntity
}

export function AudioCard({ audio }: AudioCardProps) {
  const date = new Date(audio.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const time = new Date(audio.createdAt).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const sizeMB = (audio.sizeBytes / 1024 / 1024).toFixed(1)

  return (
    <Link to={`/transcription/${audio.id}`}>
      <div className="group flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-card)]">
        <div className="h-10 w-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
          <FileAudio size={17} className="text-[var(--accent)]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate leading-snug">
            {audio.fileName}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <Calendar size={11} />
              {date} · {time}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-tertiary)]">
              <HardDrive size={11} />
              {sizeMB} MB
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge status={audio.status} />
          <ChevronRight
            size={15}
            className="text-[var(--text-tertiary)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all duration-150"
          />
        </div>
      </div>
    </Link>
  )
}
