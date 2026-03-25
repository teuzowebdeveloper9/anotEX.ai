import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mic, Pause, Play, Square, RotateCcw, Send, Upload, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Waveform } from '@/shared/ui/Waveform/Waveform'
import { Button } from '@/shared/ui/Button/Button'
import { useRecorder } from '@/features/recording/start-recording/model/useRecorder'
import { useUploadAudio } from '@/features/recording/upload-audio/model/useUploadAudio'
import { useAudioLevel } from '@/shared/hooks/useAudioLevel'
import logoAnotex from '@/shared/assets/logo-anotex.png'

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

  const statusText = {
    idle: 'Aguardando início',
    recording: 'Gravando agora',
    paused: 'Gravação pausada',
    stopped: 'Pronto para enviar',
  }[state]

  return (
    <div className="pen-page min-h-screen overflow-hidden">
      <div className="pointer-events-none pen-blob pen-blob-blue left-[28%] top-[-6%] h-[38rem] w-[38rem]" />
      <div className="pointer-events-none pen-blob pen-blob-cyan left-[-4%] top-[58%] h-[24rem] w-[24rem]" />

      <header className="pen-nav relative z-20">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-6 md:px-[72px]">
          <img src={logoAnotex} alt="anotEX.ai" className="h-8 w-auto" />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(56,171,228,0.28)] bg-[rgba(56,171,228,0.08)] px-4 py-2 text-[13px] font-medium text-[var(--accent-5)]"
          >
            <ArrowLeft size={14} />
            Voltar ao Dashboard
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-[1440px] items-center justify-center px-6 py-10">
        <div className="flex w-full max-w-[600px] flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[var(--text-primary)]">
              Gravar nova aula
            </h1>
            <p className="max-w-[400px] text-[15px] leading-[1.5] text-[var(--text-tertiary)]">
              Pressione o botão para começar a gravar sua aula.
            </p>
          </div>

          <div className="relative h-40 w-40">
            <div className="absolute inset-0 rounded-full border-2 border-[rgba(56,171,228,0.24)] bg-[radial-gradient(circle,rgba(56,171,228,0.14)_60%,transparent_100%)]" />
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
              className="absolute inset-5 flex items-center justify-center rounded-full text-white shadow-[0_10px_32px_rgba(56,171,228,0.42)]"
              style={{ background: 'var(--gradient-primary)' }}
              aria-label="Controle da gravação"
            >
              {state === 'recording' ? <Pause size={40} /> : state === 'paused' ? <Play size={40} /> : <Mic size={40} />}
            </button>
          </div>

          <div className="text-[48px] font-bold tracking-[-0.08em] text-[var(--text-primary)]">
            {formatDuration(durationMs)}
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(56,171,228,0.08)] px-[18px] py-2 text-[13px] font-medium text-[var(--accent-5)]">
            <span className={`h-2 w-2 rounded-full ${state === 'recording' ? 'animate-pulse bg-red-500' : 'bg-[var(--accent)]'}`} />
            {statusText}
          </div>

          <div className="w-full max-w-[520px] overflow-hidden rounded-[20px] border border-[rgba(56,171,228,0.12)] bg-[rgba(255,255,255,0.34)] p-4">
            <Waveform levels={levels} active={state === 'recording'} />
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
                <Button size="lg" loading={uploading} onClick={handleSend}>
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

          <div className="flex flex-wrap items-center justify-center gap-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="pen-surface flex min-w-[245px] flex-col items-center gap-1 rounded-2xl px-6 py-4 text-center transition-transform hover:-translate-y-px disabled:opacity-50"
            >
              <Upload size={20} className="text-[var(--accent)]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Upload de arquivo</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">MP3, M4A, WAV, WEBM</span>
            </button>

            <div className="pen-surface flex min-w-[245px] flex-col items-center gap-1 rounded-2xl px-6 py-4 text-center">
              <Zap size={20} className="text-[var(--accent-3)]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Transcrição em segundos</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">Powered by Groq Whisper</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
