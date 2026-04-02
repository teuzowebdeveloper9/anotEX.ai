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
      <div className="group flex items-center gap-4 rounded-[22px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.78)] p-4 transition-all duration-200 hover:border-[var(--border-strong)] hover:bg-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgba(37,99,235,0.08)] shrink-0">
          <FileAudio size={17} className="text-[var(--brand-primary)]" />
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
            className="text-[var(--text-tertiary)] transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-[var(--brand-primary)]"
          />
        </div>
      </div>
    </Link>
  )
}
