import { Mic, Pause, Play, Square, RotateCcw, Send } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Waveform } from '@/shared/ui/Waveform/Waveform'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { useRecorder } from '@/features/recording/start-recording/model/useRecorder'
import { useUploadAudio } from '@/features/recording/upload-audio/model/useUploadAudio'
import { useAudioLevel } from '@/shared/hooks/useAudioLevel'

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function RecordPage() {
  const { state, stream, audioBlob, durationMs, start, pause, resume, stop, reset } = useRecorder()
  const { uploading, upload } = useUploadAudio()
  const levels = useAudioLevel(stream)

  const handleSend = (): void => {
    if (audioBlob) void upload(audioBlob)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Nova gravação</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Grave sua aula e obtenha transcrição e resumo automaticamente
          </p>
        </div>

        <Card className="p-8 flex flex-col items-center gap-6">
          {/* Timer */}
          <div className="font-mono text-5xl font-semibold text-[var(--text-primary)] tabular-nums">
            {formatDuration(durationMs)}
          </div>

          {/* Waveform */}
          <div className="w-full">
            <Waveform levels={levels} active={state === 'recording'} />
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {state === 'recording' && (
              <>
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Gravando...
              </>
            )}
            {state === 'paused' && (
              <>
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Pausado
              </>
            )}
            {state === 'stopped' && (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Pronto para enviar
              </>
            )}
            {state === 'idle' && 'Clique em gravar para iniciar'}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {state === 'idle' && (
              <Button size="lg" onClick={() => void start()}>
                <Mic size={16} />
                Gravar
              </Button>
            )}

            {state === 'recording' && (
              <>
                <Button variant="ghost" size="lg" onClick={pause}>
                  <Pause size={16} />
                  Pausar
                </Button>
                <Button variant="danger" size="lg" onClick={stop}>
                  <Square size={16} />
                  Parar
                </Button>
              </>
            )}

            {state === 'paused' && (
              <>
                <Button variant="ghost" size="lg" onClick={resume}>
                  <Play size={16} />
                  Continuar
                </Button>
                <Button variant="danger" size="lg" onClick={stop}>
                  <Square size={16} />
                  Parar
                </Button>
              </>
            )}

            {state === 'stopped' && (
              <>
                <Button variant="ghost" size="lg" onClick={reset}>
                  <RotateCcw size={16} />
                  Regravar
                </Button>
                <Button size="lg" loading={uploading} onClick={handleSend}>
                  <Send size={16} />
                  Enviar
                </Button>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
