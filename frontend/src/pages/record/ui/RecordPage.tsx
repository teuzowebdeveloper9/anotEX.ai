import { useRef } from 'react'
import { Mic, Pause, Play, Square, RotateCcw, Send, Upload, FileAudio } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Waveform } from '@/shared/ui/Waveform/Waveform'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import { useRecorder } from '@/features/recording/start-recording/model/useRecorder'
import { useUploadAudio } from '@/features/recording/upload-audio/model/useUploadAudio'
import { useAudioLevel } from '@/shared/hooks/useAudioLevel'

const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp3']
const MAX_MB = 100

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = (): void => {
    if (audioBlob) void upload(audioBlob)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return

    const mimeType = file.type || 'audio/mpeg'
    const isAllowed = ALLOWED_TYPES.some(t => mimeType.includes(t.split('/')[1]) || file.name.match(/\.(mp3|mp4|wav|ogg|webm|m4a)$/i))
    if (!isAllowed) {
      toast.error('Formato não suportado. Use MP3, MP4, WAV, OGG ou WebM.')
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Arquivo muito grande. Máximo ${MAX_MB}MB.`)
      return
    }

    void upload(file, 'pt')
    e.target.value = ''
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <Navbar />
      <Sidebar />
      <main className="pl-56 pt-14">
      <div className="max-w-xl mx-auto px-8 pt-10 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Nova gravação</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Grave ao vivo ou envie um arquivo de áudio do seu computador
          </p>
        </div>

        {/* Gravação ao vivo */}
        <Card className="p-8 flex flex-col items-center gap-6 mb-4">
          <div className="font-mono text-5xl font-semibold text-[var(--text-primary)] tabular-nums">
            {formatDuration(durationMs)}
          </div>

          <div className="w-full">
            <Waveform levels={levels} active={state === 'recording'} />
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            {state === 'recording' && (
              <><span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />Gravando...</>
            )}
            {state === 'paused' && (
              <><span className="h-2 w-2 rounded-full bg-yellow-500" />Pausado</>
            )}
            {state === 'stopped' && (
              <><span className="h-2 w-2 rounded-full bg-emerald-500" />Pronto para enviar</>
            )}
            {state === 'idle' && 'Clique em gravar para iniciar'}
          </div>

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

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-secondary)]">ou</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Upload de arquivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".mp3,.mp4,.wav,.ogg,.webm,.m4a,audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full group border-2 border-dashed border-[var(--border)] rounded-xl p-8 flex flex-col items-center gap-3 hover:border-[var(--accent)]/50 hover:bg-[var(--bg-elevated)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="h-12 w-12 rounded-full bg-[var(--bg-elevated)] group-hover:bg-[var(--accent)]/10 flex items-center justify-center transition-colors">
            {uploading ? (
              <span className="h-5 w-5 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
            ) : (
              <FileAudio size={22} className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {uploading ? 'Enviando...' : 'Enviar arquivo de áudio'}
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              MP3, MP4, WAV, OGG, WebM — até {MAX_MB}MB
            </p>
          </div>
          {!uploading && (
            <div className="flex items-center gap-2 text-xs text-[var(--accent)]">
              <Upload size={12} />
              Clique para selecionar
            </div>
          )}
        </button>
      </div>
      </main>
    </div>
  )
}
