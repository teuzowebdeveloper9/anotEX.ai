import { Link } from 'react-router-dom'
import { Mic, Inbox } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { AudioCard } from '@/entities/audio/ui/AudioCard'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { useAudioList } from '@/entities/audio/model/useAudioList'

export function DashboardPage() {
  const { data: audios, isLoading } = useAudioList()

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <Sidebar />
      <main className="pl-56 pt-14">
      <div className="max-w-3xl mx-auto px-8 pt-10 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Suas gravações</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {audios?.length ?? 0} gravação{audios?.length !== 1 ? 'ões' : ''}
            </p>
          </div>
          <Link to="/record">
            <Button>
              <Mic size={15} />
              Nova gravação
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] w-full" />
            ))
          ) : audios?.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <Inbox size={40} className="text-[var(--text-secondary)]" />
              <div>
                <p className="text-[var(--text-primary)] font-medium">Nenhuma gravação ainda</p>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Grave sua primeira aula para começar
                </p>
              </div>
              <Link to="/record">
                <Button>
                  <Mic size={15} />
                  Gravar agora
                </Button>
              </Link>
            </div>
          ) : (
            audios
              ?.filter((a) => a.status !== 'FAILED')
              .map((audio) => <AudioCard key={audio.id} audio={audio} />)
          )}
        </div>
      </div>
      </main>
    </div>
  )
}
