import { Link } from 'react-router-dom'
import { FileAudio, ChevronRight } from 'lucide-react'
import { Card } from '@/shared/ui/Card/Card'
import { AudioStatusBadge } from './AudioStatusBadge'
import type { AudioEntity } from '@/shared/types/api.types'

interface AudioCardProps {
  audio: AudioEntity
}

export function AudioCard({ audio }: AudioCardProps) {
  const date = new Date(audio.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const sizeMB = (audio.sizeBytes / 1024 / 1024).toFixed(1)

  return (
    <Link to={`/transcription/${audio.id}`}>
      <Card className="p-4 flex items-center gap-4 hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all duration-200 cursor-pointer group">
        <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0">
          <FileAudio size={18} className="text-[var(--accent)]" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
            {audio.fileName}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {date} · {sizeMB} MB
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <AudioStatusBadge status={audio.status} />
          <ChevronRight size={16} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>
      </Card>
    </Link>
  )
}
