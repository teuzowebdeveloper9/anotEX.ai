import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, Pause, Play, Square, RotateCcw, Send, Upload, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Waveform } from '@/shared/ui/Waveform/Waveform'
import { Button } from '@/shared/ui/Button/Button'
import { useRecorder } from '@/features/recording/start-recording/model/useRecorder'
import { useAudioLevel } from '@/shared/hooks/useAudioLevel'
import { startPendingUpload } from '@/features/recording/upload-audio/model/pending-upload.store'
import { brandLogo } from '@/shared/assets/brand-logo'

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
  const navigate = useNavigate()
  const { state, stream, audioBlob, durationMs, start, pause, resume, stop, reset } = useRecorder()
  const levels = useAudioLevel(stream)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const beginUploadFlow = (file: Blob | File, language = 'pt'): void => {
    const uploadId = startPendingUpload(file, language)
    navigate(`/transcription/pending?uploadId=${uploadId}`)
  }

  const handleSend = (): void => {
    if (audioBlob) beginUploadFlow(audioBlob)
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

    beginUploadFlow(file, 'pt')
    e.target.value = ''
  }

  const statusText = {
    idle: 'Aguardando início',
    recording: 'Gravando agora',
    paused: 'Gravação pausada',
    stopped: 'Pronto para enviar',
  }[state]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#fbfcff_0%,#f7f9fd_100%)]">
      <div className="pointer-events-none absolute left-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-[18%] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(86,245,248,0.1)_0%,rgba(86,245,248,0)_72%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-6rem] left-[20%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(122,220,125,0.08)_0%,rgba(122,220,125,0)_72%)] blur-3xl" />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-[1440px] items-center justify-center px-4 py-8 sm:px-6 md:px-[72px]">
        <div className="flex w-full max-w-[680px] flex-col items-center gap-8 text-center">
          <div className="flex w-full items-center justify-between">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--text-secondary)] shadow-[0_8px_24px_rgba(25,28,31,0.04)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft size={14} />
              Dashboard
            </Link>

            <img src={brandLogo} alt="anotEX.ai" className="h-8 w-auto" />
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--brand-primary-strong)] shadow-[0_8px_24px_rgba(25,28,31,0.05)]">
              <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
              Gravação inteligente
            </div>
            <h1 className="text-[2.4rem] font-extrabold tracking-[-0.06em] text-[var(--text-primary)] md:text-[3.4rem]">
              Grave sua próxima aula
            </h1>
            <p className="max-w-[460px] text-[15px] leading-7 text-[var(--text-tertiary)]">
              Inicie a gravação, faça upload do arquivo ou continue do ponto em que parou. O fluxo de processamento continua o mesmo.
            </p>
          </div>

          <div className="relative h-48 w-48">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0.02)_48%,transparent_72%)]" />
            <div className="absolute inset-[8px] rounded-full border border-[rgba(37,99,235,0.14)]" />
            <div className={`absolute inset-[18px] rounded-full ${state === 'recording' ? 'animate-pulse' : ''} bg-[rgba(37,99,235,0.08)]`} />
            <button
              onClick={() => {
                if (state === 'idle') {
                  void start()
                  return
                }
                if (state === 'recording') {
                  pause()
                  return
                }
                if (state === 'paused') {
                  resume()
                }
              }}
              className="absolute inset-[28px] flex items-center justify-center rounded-full text-white shadow-[0_18px_42px_rgba(37,99,235,0.28)] transition-transform hover:scale-[1.01]"
              style={{ background: 'var(--gradient-brand)' }}
              aria-label="Controle da gravação"
            >
              {state === 'recording' ? <Pause size={40} /> : state === 'paused' ? <Play size={40} /> : <Mic size={40} />}
            </button>
          </div>

          <div className="text-[58px] font-extrabold tracking-[-0.08em] text-[var(--text-primary)]">
            {formatDuration(durationMs)}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-[18px] py-2 text-[13px] font-medium text-[var(--brand-primary-strong)]">
            <span className={`h-2 w-2 rounded-full ${state === 'recording' ? 'animate-pulse bg-red-500' : 'bg-[var(--brand-primary)]'}`} />
            {statusText}
          </div>

          <div className="w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.8)] p-5 shadow-[0_16px_40px_rgba(25,28,31,0.04)]">
            <Waveform levels={levels} active={state === 'recording'} className="h-20" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {state === 'recording' && (
              <Button variant="danger" size="lg" onClick={stop}>
                <Square size={16} />
                Parar
              </Button>
            )}
            {state === 'paused' && (
              <>
                <Button variant="outline" size="lg" onClick={resume}>
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
                <Button variant="outline" size="lg" onClick={reset}>
                  <RotateCcw size={16} />
                  Regravar
                </Button>
                <Button size="lg" onClick={handleSend}>
                  <Send size={16} />
                  Enviar
                </Button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.mp4,.wav,.ogg,.webm,.m4a,audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div className="grid w-full max-w-[640px] gap-4 md:grid-cols-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-1 rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.82)] px-6 py-5 text-center shadow-[0_12px_34px_rgba(25,28,31,0.04)] transition-transform hover:-translate-y-px disabled:opacity-50"
            >
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-accent-soft)]">
                <Upload size={20} className="text-[var(--brand-primary)]" />
              </div>
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">Upload de arquivo</span>
              <span className="text-[12px] text-[var(--text-tertiary)]">MP3, M4A, WAV, WEBM</span>
            </button>

            <div className="flex w-full flex-col items-center gap-1 rounded-[28px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.82)] px-6 py-5 text-center shadow-[0_12px_34px_rgba(25,28,31,0.04)]">
              <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand-tertiary-soft)]">
                <Zap size={20} className="text-[var(--brand-tertiary)]" />
              </div>
              <span className="text-[15px] font-semibold text-[var(--text-primary)]">Transcrição em segundos</span>
              <span className="text-[12px] text-[var(--text-tertiary)]">Powered by Groq Whisper</span>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}
