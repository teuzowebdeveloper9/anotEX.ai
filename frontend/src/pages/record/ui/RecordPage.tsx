import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, Pause, Play, Square, RotateCcw, Send, Upload, Zap, Sparkles, Brain, AudioLines } from 'lucide-react'
import { toast } from 'sonner'
import { Waveform } from '@/shared/ui/Waveform/Waveform'
import { Button } from '@/shared/ui/Button/Button'
import { useRecorder } from '@/features/recording/start-recording/model/useRecorder'
import { useUploadAudio } from '@/features/recording/upload-audio/model/useUploadAudio'
import { useAudioLevel } from '@/shared/hooks/useAudioLevel'
import logoAnotex from '@/shared/assets/logo-anotex.png'

const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/wav', 'audio/ogg', 'audio/mp3']
const MAX_MB = 100
const PROCESSING_STEPS = [
  { title: 'Enviando seu audio', description: 'Preparando o arquivo e registrando a transcricao.' },
  { title: 'Analisando o contexto da aula', description: 'Separando idioma, ritmo e estrutura do conteudo.' },
  { title: 'Entendendo as vozes e pausas', description: 'Organizando o que foi dito para abrir a leitura com clareza.' },
  { title: 'Montando sua pagina de estudo', description: 'Finalizando o material para te levar direto para a transcricao.' },
] as const

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
  const { uploading, upload } = useUploadAudio()
  const levels = useAudioLevel(stream)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [processingAudioId, setProcessingAudioId] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState(0)

  useEffect(() => {
    if (!processingAudioId) return

    setProcessingStep(0)
    const interval = window.setInterval(() => {
      setProcessingStep((current) => Math.min(current + 1, PROCESSING_STEPS.length - 1))
    }, 1100)
    const timeout = window.setTimeout(() => {
      navigate(`/transcription/${processingAudioId}`)
    }, 4200)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [navigate, processingAudioId])

  const beginUploadFlow = async (file: Blob | File, language = 'pt'): Promise<void> => {
    const result = await upload(file, language)
    if (result?.audioId) {
      setProcessingAudioId(result.audioId)
    }
  }

  const handleSend = (): void => {
    if (audioBlob) void beginUploadFlow(audioBlob)
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

    void beginUploadFlow(file, 'pt')
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
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 md:px-[72px]">
          <img src={logoAnotex} alt="anotEX.ai" className="h-8 w-auto" />
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(56,171,228,0.28)] bg-[rgba(56,171,228,0.08)] px-3 py-2 text-[12px] font-medium text-[var(--accent-5)] sm:px-4 sm:text-[13px]"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Voltar ao Dashboard</span>
            <span className="sm:hidden">Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] max-w-[1440px] items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
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

          <div className="flex w-full flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="pen-surface flex w-full max-w-[320px] flex-col items-center gap-1 rounded-2xl px-6 py-4 text-center transition-transform hover:-translate-y-px disabled:opacity-50 sm:min-w-[245px]"
            >
              <Upload size={20} className="text-[var(--accent)]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Upload de arquivo</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">MP3, M4A, WAV, WEBM</span>
            </button>

            <div className="pen-surface flex w-full max-w-[320px] flex-col items-center gap-1 rounded-2xl px-6 py-4 text-center sm:min-w-[245px]">
              <Zap size={20} className="text-[var(--accent-3)]" />
              <span className="text-[13px] font-semibold text-[var(--text-primary)]">Transcrição em segundos</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">Powered by Groq Whisper</span>
            </div>
          </div>
        </div>
      </main>

      {processingAudioId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(248,250,252,0.55)] px-4 backdrop-blur-xl">
          <div className="relative w-full max-w-[620px] overflow-hidden rounded-[32px] border border-[rgba(56,171,228,0.18)] bg-[rgba(255,255,255,0.78)] p-6 shadow-[0_30px_120px_rgba(15,23,42,0.18)] sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-[rgba(56,171,228,0.18)] blur-3xl" />
            <div className="pointer-events-none absolute -left-12 bottom-0 h-36 w-36 rounded-full bg-[rgba(34,211,238,0.14)] blur-3xl" />

            <div className="relative flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[rgba(56,171,228,0.2)] bg-[rgba(56,171,228,0.1)] text-[var(--accent)]">
                  <AudioLines size={24} className="animate-pulse" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--accent)]">
                    Processando
                  </p>
                  <h2 className="mt-2 text-[26px] font-bold tracking-[-0.04em] text-[var(--text-primary)]">
                    Sua aula ja esta entrando no modo estudo
                  </h2>
                  <p className="mt-2 max-w-[460px] text-[14px] leading-6 text-[var(--text-secondary)]">
                    Estamos preparando a melhor primeira leitura para voce. Em instantes a transcricao abre com o audio ja registrado.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {PROCESSING_STEPS.map((step, index) => {
                  const isDone = index < processingStep
                  const isActive = index === processingStep
                  const Icon = index % 2 === 0 ? Sparkles : Brain

                  return (
                    <div
                      key={step.title}
                      className={[
                        'flex items-start gap-3 rounded-2xl border px-4 py-3 transition-all duration-300',
                        isActive
                          ? 'border-[rgba(56,171,228,0.28)] bg-[rgba(56,171,228,0.12)] shadow-[0_14px_30px_rgba(56,171,228,0.12)]'
                          : isDone
                            ? 'border-[rgba(16,185,129,0.18)] bg-[rgba(16,185,129,0.08)]'
                            : 'border-[rgba(148,163,184,0.18)] bg-[rgba(255,255,255,0.42)]',
                      ].join(' ')}
                    >
                      <div
                        className={[
                          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',
                          isActive
                            ? 'bg-white text-[var(--accent)]'
                            : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-[rgba(148,163,184,0.18)] text-[var(--text-tertiary)]',
                        ].join(' ')}
                      >
                        <Icon size={15} className={isActive ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">{step.title}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="overflow-hidden rounded-full bg-[rgba(148,163,184,0.18)]">
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{
                    width: `${((processingStep + 1) / PROCESSING_STEPS.length) * 100}%`,
                    background: 'var(--gradient-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
