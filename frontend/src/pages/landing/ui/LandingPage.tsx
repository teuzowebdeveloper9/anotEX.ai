import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles, BookOpen, BrainCircuit } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/Button/Button'
import logoAnotex from '@/shared/assets/logo-anotex.png'
import heroMock from '../../../../images/generated-1774426507249.png'

const features = [
  {
    icon: Sparkles,
    title: 'Transcrição Automática',
    description: 'Groq Whisper transcreve sua aula em segundos com alta precisão.',
    tone: 'blue',
  },
  {
    icon: BookOpen,
    title: 'Resumo e Flashcards com IA',
    description: 'Llama 3.3 70B gera resumos, mapas mentais e flashcards prontos.',
    tone: 'teal',
  },
  {
    icon: BrainCircuit,
    title: 'Revisão Espaçada SM-2',
    description: 'O algoritmo SM-2 calcula o exato momento de revisar cada flashcard.',
    tone: 'green',
  },
] as const

const toneClasses: Record<(typeof features)[number]['tone'], string> = {
  blue: 'pen-card pen-card-blue',
  teal: 'pen-card pen-card-teal',
  green: 'pen-card pen-card-green',
}

export function LandingPage() {
  return (
    <div className="pen-page min-h-screen overflow-x-hidden">
      <div className="pointer-events-none pen-blob pen-blob-blue -left-24 -top-16 h-[30rem] w-[30rem]" />
      <div className="pointer-events-none pen-blob pen-blob-cyan -right-24 top-40 h-[36rem] w-[36rem]" />
      <div className="pointer-events-none pen-blob pen-blob-green bottom-8 left-[32rem] h-80 w-80" />

      <nav className="pen-nav fixed inset-x-0 top-0 z-40">
        <div className="mx-auto flex h-[70px] w-full max-w-[1440px] items-center justify-between px-6 md:px-[72px]">
          <Link to="/" className="flex items-center">
            <img src={logoAnotex} alt="anotEX.ai" className="h-8 w-auto" />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <a href="#funcionalidades" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Como funciona
            </a>
            <a href="#precos" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Preços
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="outline" size="md">Entrar</Button>
            </Link>
            <Link to="/record">
              <Button size="md">
                Começar grátis
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-[70px]">
        <section className="mx-auto flex min-h-[560px] w-full max-w-[1440px] flex-col justify-between gap-14 px-6 py-16 md:px-[100px] lg:flex-row lg:items-center">
          <motion.div
            className="max-w-[580px]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(56,171,228,0.25)] bg-[rgba(56,171,228,0.08)] px-3.5 py-1.5">
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--accent-5)]">
                IA para estudantes · revisão espaçada SM-2
              </span>
            </div>

            <div className="space-y-1.5">
              <h1 className="text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-[var(--text-primary)] md:text-[3.6rem]">
                Transforme suas aulas
              </h1>
              <h1 className="text-[2.8rem] font-extrabold leading-[1.02] tracking-[-0.045em] md:text-[3.6rem]">
                <span className="gradient-text">em conhecimento que fica.</span>
              </h1>
            </div>

            <p className="mt-6 max-w-[36rem] text-[1.06rem] leading-[1.6] text-[var(--text-secondary)]">
              Grave sua aula, a IA transcreve, resume, cria flashcards e te lembra de revisar no momento certo.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/record">
                <Button size="lg" className="w-full sm:w-auto">
                  Gravar minha primeira aula
                </Button>
              </Link>
              <a
                href="#funcionalidades"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[rgba(56,171,228,0.28)] bg-[rgba(255,255,255,0.65)] px-6 text-base font-semibold text-[var(--accent-5)] shadow-[0_4px_12px_rgba(56,171,228,0.12)] backdrop-blur-sm transition-all hover:-translate-y-px hover:bg-white/80"
              >
                <Play size={16} />
                Ver demo
              </a>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-[560px]"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="pen-hero-frame mx-auto w-full max-w-[504px]">
              <img
                src={heroMock}
                alt="Preview da plataforma com resumo, flashcards e IA"
                className="h-[448px] w-full rounded-[24px] object-cover"
              />

              <div className="absolute inset-x-0 top-0 flex h-[54px] items-center justify-between rounded-t-[24px] border-b border-[rgba(56,171,228,0.16)] bg-[rgba(255,255,255,0.34)] px-5 backdrop-blur-sm">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  Biologia — Mitose e Meiose
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(113,171,35,0.14)] px-2.5 py-1 text-[11px] font-medium text-[#3D7A10]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-3)]" />
                  Processado
                </span>
              </div>

              <div className="absolute inset-x-5 top-[70px] flex flex-col gap-3.5">
                <div className="rounded-2xl border border-[rgba(56,171,228,0.18)] bg-[rgba(255,255,255,0.5)] p-4 shadow-[0_4px_12px_rgba(56,171,228,0.12)] backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent-5)]">
                    Resumo com IA
                  </p>
                  <p className="mt-2 text-xs leading-[1.5] text-[var(--text-secondary)]">
                    A mitose é o processo de divisão celular que produz duas células geneticamente idênticas, passando pelas fases: prófase, metáfase, anáfase e telófase.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[14px] border border-[rgba(56,171,228,0.22)] bg-[linear-gradient(180deg,rgba(56,171,228,0.12),rgba(0,196,204,0.05))] p-3.5 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold text-[var(--text-primary)]">O que é mitose?</p>
                    <p className="mt-1.5 text-[10px] leading-[1.4] text-[var(--text-secondary)]">
                      Divisão que gera 2 células idênticas
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-[rgba(113,171,35,0.22)] bg-[linear-gradient(180deg,rgba(113,171,35,0.12),rgba(159,225,29,0.05))] p-3.5 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold text-[var(--text-primary)]">Quantas fases tem?</p>
                    <p className="mt-1.5 text-[10px] leading-[1.4] text-[var(--text-secondary)]">
                      4: prófase, metáfase, anáfase, telófase
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="funcionalidades" className="mx-auto w-full max-w-[1440px] px-6 pb-20 md:px-[100px]">
          <div className="mx-auto max-w-[840px] text-center">
            <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)] md:text-[2.4rem]">
              Tudo que você precisa para estudar de verdade
            </h2>
            <p className="mt-2 text-base text-[var(--text-secondary)]">
              Do áudio ao flashcard em segundos.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description, tone }) => (
              <div key={title} className={`${toneClasses[tone]} rounded-[22px] p-6`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/55 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Icon size={20} className="text-[var(--accent-5)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
