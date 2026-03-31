import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles, BookOpen, BrainCircuit, Clock3, CheckCircle2, FolderOpen, Users, MessageSquareQuote } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/Button/Button'
import { PricingSection } from '@/features/billing/ui/PricingSection'
import logoAnotex from '@/shared/assets/logo-anotex.png'
import heroMock from '../../../../images/generated-1774426507249.png'

const valueCards = [
  {
    icon: Clock3,
    title: 'Transforme aula em estudo em segundos',
    description: 'Não perca tempo montando material. Grave, envie link do YouTube e receba tudo pronto.',
    tone: 'blue',
  },
  {
    icon: BrainCircuit,
    title: 'Revise sem precisar decidir o que estudar',
    description: 'O algoritmo SM-2 mostra exatamente o que você precisa revisar. Chega de guessing.',
    tone: 'teal',
  },
  {
    icon: BookOpen,
    title: 'Organize tudo em um só lugar',
    description: 'Resumo, flashcards, quiz, mapa mental e chat com a aula. Sem planilha espalhada.',
    tone: 'green',
  },
] as const

const productPillars = [
  {
    icon: Sparkles,
    title: 'Tudo que você precisa em um clique',
    description: 'Aula, resumo, flashcards, quiz, mapa mental e chat com IA. Um só fluxo, do início ao fim.',
  },
  {
    icon: FolderOpen,
    title: 'Pare de perder tempo organizando',
    description: 'Crie pastas por matéria, adicione tudo automaticamente e ache qualquer coisa em segundos.',
  },
  {
    icon: Users,
    title: 'Estude sozinho ou com o grupo',
    description: 'Compartilhe links, crie grupos e mantenha todo mundo na mesma página.',
  },
] as const

const outcomes = [
  'Pare de acumular aula que você nunca vai revisar.',
  'Tenha resumo, flashcards e quiz prontos sem precisar criar manualmente.',
  'Revise o que realmente importa — o algoritmo decide por você.',
  'Chegue no dia da prova com tudo organizado, não correndo.',
]

const steps = [
  {
    number: '01',
    title: 'Grave ou cole o link',
    description: '3 opções: gravação no navegador, upload de áudio ou link do YouTube.',
  },
  {
    number: '02',
    title: 'Receba tudo pronto',
    description: 'Resumo, flashcards, quiz, mapa mental e chat com a aula. Em minutos.',
  },
  {
    number: '03',
    title: 'Revise sem pensar',
    description: 'O algoritmo mostra o que revisar. Você só precisa responder.',
  },
]

const testimonials = [
  {
    quote: 'Eu não conseguia revisar tudo que assistia. Agora gravo, termino e já sei exatamente o que fazer.',
    author: 'Estudante universitário',
  },
  {
    quote: 'O que mais valeu foi parar de perder tempo montando flashcards. Agora recebo prontos.',
    author: 'Estudante de medicina',
  },
] as const

const toneClasses: Record<(typeof valueCards)[number]['tone'], string> = {
  blue: 'bg-gradient-to-br from-[#2563eb] to-[#1d4ed8]',
  teal: 'bg-gradient-to-br from-[#0d9488] to-[#0f766e]',
  green: 'bg-gradient-to-br from-[#16a34a] to-[#15803d]',
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
            <a href="#valor" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Valor
            </a>
            <a href="#como-funciona" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Como funciona
            </a>
            <a href="#produto" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Produto
            </a>
            <a href="#pricing" className="text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-5)]">
              Planos
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/login">
              <Button variant="outline" size="md">Entrar</Button>
            </Link>
            <Link to="/record">
              <Button size="md">
                Começar agora
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-[70px]">
        <section className="relative mx-auto flex min-h-[800px] w-full max-w-[1440px] flex-col justify-center gap-12 px-6 py-20 md:px-[100px] lg:flex-row lg:items-center lg:py-28">
          <div className="pointer-events-none absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-transparent blur-[100px]" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-[var(--accent-3)]/20 to-transparent blur-[100px]" />
          
          <motion.div
            className="relative max-w-[680px]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              <span className="text-sm font-medium text-[var(--accent)]">
                IA + Revisão Espaçada
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] md:text-[4.2rem]">
                Não chore mais
              </h1>
              <h1 className="text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.04em] md:text-[4.2rem]">
                <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-3)] bg-clip-text text-transparent">
                  sobre prova.
                </span>
              </h1>
              <h1 className="text-[2.8rem] font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text-primary)] md:text-[4.2rem]">
                Estude com estratégia.
              </h1>
            </div>

            <p className="mt-8 max-w-[540px] text-lg leading-relaxed text-[var(--text-secondary)]">
              Grave sua aula, receba{' '}
              <span className="font-semibold text-[var(--accent)]">resumo, flashcards e quiz</span>{' '}
              prontos, e revise com o algoritmo que decide o que você precisa ver.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/record">
                <Button size="lg" className="min-w-[200px] shadow-lg shadow-[var(--accent)]/25">
                  Começar gratuitamente
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <a
                href="#valor"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--border)] bg-white/50 px-6 text-base font-medium text-[var(--text-secondary)] backdrop-blur-sm transition-all hover:border-[var(--accent)]/50 hover:bg-white/80"
              >
                <Play size={16} className="transition-transform group-hover:scale-110" />
                Ver como funciona
              </a>
            </div>

            <div className="mt-10 flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[var(--accent)]/80 to-[var(--accent-3)]/80 text-xs font-bold text-white">
                    {i}
                  </div>
                ))}
              </div>
              <p>
                <span className="font-semibold text-[var(--text-primary)]">+500 estudantes</span> usando agora
              </p>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-[600px]"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="relative mx-auto w-full max-w-[540px]">
              <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent-3)]/10 to-transparent blur-2xl" />
              <div className="pen-hero-frame relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-white shadow-2xl">
                <img
                  src={heroMock}
                  alt="Preview do anotEX.ai"
                  className="h-[480px] w-full object-cover"
                />
                
                <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between rounded-t-[32px] border-b border-black/5 bg-white/80 px-6 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    anotEX.ai
                  </span>
                  <div className="h-6 w-6" />
                </div>

                <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3">
                  <div className="rounded-2xl border border-black/10 bg-white/95 p-4 shadow-xl backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <CheckCircle2 size={16} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Material pronto!</p>
                        <p className="text-xs text-[var(--text-secondary)]">Resumo, flashcards e quiz gerados</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur-md">
                      <p className="text-2xl font-bold text-[var(--accent)]">12</p>
                      <p className="text-xs text-[var(--text-secondary)]">Flashcards</p>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur-md">
                      <p className="text-2xl font-bold text-[var(--accent)]">5</p>
                      <p className="text-xs text-[var(--text-secondary)]">Quiz</p>
                    </div>
                    <div className="rounded-xl border border-black/10 bg-white/95 p-3 shadow-lg backdrop-blur-md">
                      <p className="text-2xl font-bold text-[var(--accent)]">98%</p>
                      <p className="text-xs text-[var(--text-secondary)]">Revisão</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="valor" className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-[100px]">
          <div className="mx-auto max-w-[860px] text-center">
            <h2 className="text-[2.2rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] md:text-[3rem]">
              O problema não é estudiar.
            </h2>
            <p className="mt-3 text-[1.06rem] leading-8 text-[var(--text-secondary)]">
              O problema é lembrar depois. O anotEX.ai resolve isso — do momento que você grava até o dia da prova.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {valueCards.map(({ icon: Icon, title, description, tone }) => (
              <div key={title} className={`group relative overflow-hidden rounded-3xl ${toneClasses[tone]} p-8 transition-transform hover:-translate-y-1`}>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 transition-transform group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/20 shadow-lg backdrop-blur-sm">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-white/80 leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="relative mx-auto w-full max-w-[1440px] px-6 py-24 md:px-[100px]">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent)]/[0.02] to-transparent" />
          <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="rounded-[32px] border border-[var(--border)] bg-white p-10 shadow-xl">
              <h2 className="text-[2.2rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)] md:text-[2.8rem]">
                O que você ganha
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
                Menos tempo organizando, mais tempo estudando. Mais clareza do que revisar, menos guessing. E tudo num lugar só.
              </p>

              <div className="mt-10 space-y-4">
                {outcomes.map((item, i) => (
                  <div key={item} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/50 px-5 py-4 transition-all hover:border-[var(--accent)]/30 hover:shadow-md">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)]/10 text-sm font-bold text-[var(--accent)]">
                      {i + 1}
                    </div>
                    <p className="flex-1 text-base font-medium text-[var(--text-secondary)]">{item}</p>
                    <CheckCircle2 size={20} className="text-green-500" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.number} className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-8 shadow-lg transition-all hover:shadow-xl hover:border-[var(--accent)]/30">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[var(--accent)]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-3)] text-lg font-bold text-white shadow-lg shadow-[var(--accent)]/25">
                      {i + 1}
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{step.title}</h3>
                    <p className="mt-2 text-base text-[var(--text-secondary)]">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="produto" className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[100px]">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="text-[2.4rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)] md:text-[3rem]">
              Tudo que você precisa. <span className="text-[var(--accent)]">Um só lugar.</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
              Da aula que você gravou até a prova. Sem apps espalhados, sem planilha, sem guessing.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {productPillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[var(--accent)]/20 bg-[var(--accent)]/5">
                    <Icon size={28} className="text-[var(--accent)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-3 text-base text-[var(--text-secondary)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[100px]">
          <div className="grid gap-6 lg:grid-cols-2">
            {testimonials.map(({ quote, author }) => (
              <div key={quote} className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-8 shadow-lg">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--accent)]/10 to-transparent" />
                <div className="relative">
                  <MessageSquareQuote size={32} className="text-[var(--accent)]" />
                  <p className="mt-6 text-xl leading-relaxed text-[var(--text-secondary)]">
                    "{quote}"
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-3)] text-white font-bold">
                      {author[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{author}</p>
                      <p className="text-sm text-[var(--text-secondary)]">Usuário do anotEX.ai</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <PricingSection />

        <section className="relative mx-auto w-full max-w-[1440px] px-6 pb-24 md:px-[100px]">
          <div className="absolute inset-0 overflow-hidden rounded-[40px]">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-tl from-[var(--accent-3)]/20 to-transparent blur-3xl" />
          </div>
          <div className="relative rounded-[40px] border border-[var(--border)] bg-white/80 px-8 py-16 text-center shadow-2xl backdrop-blur-md md:px-20">
            <h2 className="text-[2.4rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] md:text-[3.2rem]">
              Pronto para estudar <span className="text-[var(--accent)]">sem guesswork</span>?
            </h2>
            <p className="mx-auto mt-6 max-w-[600px] text-lg leading-relaxed text-[var(--text-secondary)]">
              Grave sua primeira aula e receba material pronto em minutos. Sem compromisso, sem cartão.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/record">
                <Button size="lg" className="min-w-[220px] shadow-xl shadow-[var(--accent)]/25">
                  Começar gratuitamente
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="min-w-[180px]">Já tenho conta</Button>
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-[var(--text-secondary)]">
              ✨ Grátis para sempre • Sem necessidade de cartão
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
