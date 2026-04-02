import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles, BookOpen, BrainCircuit, Clock3, CheckCircle2, FolderOpen, Users, MessageSquareQuote } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/Button/Button'
import { PricingSection } from '@/features/billing/ui/PricingSection'
import { brandLogo } from '@/shared/assets/brand-logo'
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
  blue: 'bg-[linear-gradient(180deg,rgba(219,225,255,0.72)_0%,rgba(255,255,255,0.96)_100%)]',
  teal: 'bg-[linear-gradient(180deg,rgba(90,248,251,0.18)_0%,rgba(255,255,255,0.96)_100%)]',
  green: 'bg-[linear-gradient(180deg,rgba(150,249,150,0.18)_0%,rgba(255,255,255,0.96)_100%)]',
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#fbfcff_0%,#f7f9fd_100%)]">
      <div className="pointer-events-none absolute left-[-8rem] top-[-5rem] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.12)_0%,rgba(37,99,235,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-[12rem] h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(86,245,248,0.1)_0%,rgba(86,245,248,0)_70%)] blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8rem] left-[22%] h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle,rgba(122,220,125,0.08)_0%,rgba(122,220,125,0)_70%)] blur-3xl" />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[rgba(25,28,31,0.06)] bg-[rgba(247,249,253,0.82)] backdrop-blur-[18px]">
        <div className="mx-auto flex h-[78px] w-full max-w-[1440px] items-center justify-between px-6 md:px-[72px]">
          <Link to="/" className="flex items-center">
            <img src={brandLogo} alt="anotEX.ai" className="h-8 w-auto" />
          </Link>

          <div className="hidden items-center gap-10 md:flex">
            <a href="#valor" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]">
              Valor
            </a>
            <a href="#como-funciona" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]">
              Como funciona
            </a>
            <a href="#produto" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]">
              Produto
            </a>
            <a href="#pricing" className="text-sm font-semibold text-[var(--brand-primary)] transition-colors hover:text-[var(--brand-primary-strong)]">
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

      <main className="relative z-10 pt-[78px]">
        <section className="mx-auto grid min-h-[920px] w-full max-w-[1440px] gap-14 px-6 py-12 md:px-[72px] lg:grid-cols-[minmax(0,1fr)_minmax(520px,1fr)] lg:items-center lg:py-16">
          
          <motion.div
            className="relative max-w-[700px]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 py-2 text-[13px] font-medium text-[var(--brand-primary-strong)] shadow-[0_8px_24px_rgba(25,28,31,0.05)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-primary)] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
              </span>
              IA + Revisão Espaçada
            </div>

            <div className="space-y-6">
              <h1 className="max-w-[720px] text-[3.35rem] font-extrabold leading-[0.92] tracking-[-0.075em] text-[var(--text-primary)] md:text-[5.65rem]">
                Transforme qualquer aula
                <br />
                em material de estudo
                <br />
                <span className="text-[var(--brand-primary)]">pronto para revisar.</span>
              </h1>
              <p className="max-w-[560px] text-[1.03rem] leading-8 text-[var(--text-secondary)] md:text-[1.1rem]">
                Grave, envie áudio ou cole um link. O anotEX.ai organiza resumo, flashcards, quiz, mapa mental e revisão automática em um fluxo único e claro.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link to="/record">
                <Button size="lg" className="min-w-[220px]">
                  Começar gratuitamente
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <a
                href="#valor"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-6 text-base font-medium text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]"
              >
                <Play size={16} className="transition-transform group-hover:scale-110" />
                Ver como funciona
              </a>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {[
                ['Resumo completo', 'Leitura pronta sem retrabalho'],
                ['Revisão inteligente', 'Saiba o que revisar hoje'],
                ['Organização real', 'Pastas, grupos e histórico'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.8)] px-4 py-4 shadow-[0_1px_2px_rgba(25,28,31,0.03)]">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--text-tertiary)]">{description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="relative w-full"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="relative mx-auto w-full max-w-[620px]">
              <div className="absolute left-[-1rem] top-[3rem] h-[72%] w-[72%] rounded-[44px] border border-[rgba(37,99,235,0.08)] bg-[rgba(219,225,255,0.45)]" />
              <div className="absolute right-[-1.5rem] top-[-1.5rem] h-[40%] w-[40%] rounded-[36px] bg-[linear-gradient(180deg,rgba(90,248,251,0.18)_0%,rgba(255,255,255,0.02)_100%)] blur-2xl" />
              <div className="absolute bottom-[-1rem] left-[3rem] h-[32%] w-[32%] rounded-[32px] bg-[linear-gradient(180deg,rgba(150,249,150,0.18)_0%,rgba(255,255,255,0.02)_100%)] blur-2xl" />

              <div className="relative ml-auto overflow-hidden rounded-[36px] border border-[var(--border-soft)] bg-white shadow-[0_30px_80px_rgba(25,28,31,0.12)]">
                <img
                  src={heroMock}
                  alt="Preview do anotEX.ai"
                  className="h-[620px] w-full object-cover"
                />
                
                <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between border-b border-[rgba(25,28,31,0.06)] bg-[rgba(255,255,255,0.86)] px-6 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[var(--brand-primary)]/55" />
                    <div className="h-3 w-3 rounded-full bg-[var(--brand-secondary)]/55" />
                    <div className="h-3 w-3 rounded-full bg-[var(--brand-tertiary)]/55" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    anotEX.ai
                  </span>
                  <div className="h-6 w-6" />
                </div>

                <div className="absolute inset-x-5 bottom-5 flex flex-col gap-3">
                  <div className="rounded-[24px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.95)] p-4 shadow-[0_10px_40px_rgba(25,28,31,0.08)] backdrop-blur-md">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand-tertiary-soft)]">
                        <CheckCircle2 size={16} className="text-[var(--brand-tertiary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">Material pronto!</p>
                        <p className="text-xs text-[var(--text-secondary)]">Resumo, flashcards e quiz gerados</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.95)] p-3 shadow-[0_8px_24px_rgba(25,28,31,0.06)] backdrop-blur-md">
                      <p className="text-2xl font-bold text-[var(--brand-primary)]">12</p>
                      <p className="text-xs text-[var(--text-secondary)]">Flashcards</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.95)] p-3 shadow-[0_8px_24px_rgba(25,28,31,0.06)] backdrop-blur-md">
                      <p className="text-2xl font-bold text-[var(--brand-secondary)]">5</p>
                      <p className="text-xs text-[var(--text-secondary)]">Quiz</p>
                    </div>
                    <div className="rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.95)] p-3 shadow-[0_8px_24px_rgba(25,28,31,0.06)] backdrop-blur-md">
                      <p className="text-2xl font-bold text-[var(--brand-tertiary)]">98%</p>
                      <p className="text-xs text-[var(--text-secondary)]">Revisão</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="valor" className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-[72px]">
          <div className="mx-auto max-w-[880px] text-center">
            <h2 className="text-[2.4rem] font-extrabold tracking-[-0.05em] text-[var(--text-primary)] md:text-[3.4rem]">
              O problema não é assistir a aula.
            </h2>
            <p className="mt-4 text-[1.08rem] leading-8 text-[var(--text-secondary)]">
              O problema é transformar isso em estudo consistente depois. O anotEX.ai resolve o caminho inteiro, da captura até a revisão.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {valueCards.map(({ icon: Icon, title, description, tone }) => (
              <div key={title} className={`group relative overflow-hidden rounded-[30px] border border-[var(--border-soft)] p-8 shadow-[0_10px_34px_rgba(25,28,31,0.05)] transition-transform hover:-translate-y-1 ${toneClasses[tone]}`}>
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/70 opacity-60 transition-transform group-hover:scale-150" />
                <div className="relative">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/55 bg-white/88 shadow-[0_8px_20px_rgba(25,28,31,0.05)]">
                    <Icon size={24} className="text-[var(--text-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-3 leading-relaxed text-[var(--text-secondary)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="relative mx-auto w-full max-w-[1440px] px-6 py-24 md:px-[72px]">
          <div className="relative grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="rounded-[34px] border border-[var(--border-soft)] bg-white p-10 shadow-[0_18px_44px_rgba(25,28,31,0.05)]">
              <h2 className="text-[2.2rem] font-extrabold tracking-[-0.05em] text-[var(--text-primary)] md:text-[3rem]">
                O que você ganha
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
                Menos tempo organizando, mais tempo estudando. Mais clareza do que revisar, menos guessing. E tudo num lugar só.
              </p>

              <div className="mt-10 space-y-4">
                {outcomes.map((item, i) => (
                  <div key={item} className="flex items-center gap-4 rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)] px-5 py-4 transition-all hover:border-[var(--border-strong)]">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-accent-soft)] text-sm font-bold"
                      style={{ color: '#191c1f' }}
                    >
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
                <div key={step.number} className="group relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-white p-8 shadow-[0_10px_34px_rgba(25,28,31,0.04)] transition-all hover:border-[var(--border-strong)]">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-[var(--brand-primary)]/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative">
                    <div
                      className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold shadow-[0_10px_24px_rgba(25,28,31,0.06)]"
                      style={{ color: '#191c1f' }}
                    >
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

        <section id="produto" className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[72px]">
          <div className="mx-auto max-w-[800px] text-center">
            <h2 className="text-[2.5rem] font-extrabold tracking-[-0.05em] text-[var(--text-primary)] md:text-[3.3rem]">
              Tudo o que você precisa. <span className="text-[var(--brand-primary)]">Num só lugar.</span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-[var(--text-secondary)]">
              Da aula que você gravou até a prova. Sem apps espalhados, sem planilha, sem guessing.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {productPillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="group relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-white p-8 shadow-[0_10px_34px_rgba(25,28,31,0.05)] transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-primary)]/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[var(--surface-panel)]">
                    <Icon size={28} className="text-[var(--brand-primary)]" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
                  <p className="mt-3 text-base text-[var(--text-secondary)]">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 py-20 md:px-[72px]">
          <div className="grid gap-6 lg:grid-cols-2">
            {testimonials.map(({ quote, author }) => (
              <div key={quote} className="relative overflow-hidden rounded-3xl border border-[var(--border-soft)] bg-white p-8 shadow-[0_10px_34px_rgba(25,28,31,0.05)]">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--brand-primary)]/10 to-transparent" />
                <div className="relative">
                  <MessageSquareQuote size={32} className="text-[var(--brand-primary)]" />
                  <p className="mt-6 text-xl leading-relaxed text-[var(--text-secondary)]">
                    "{quote}"
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--gradient-brand)] text-white font-bold">
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

        <section className="relative mx-auto w-full max-w-[1440px] px-6 pb-24 md:px-[72px]">
          <div className="absolute inset-0 overflow-hidden rounded-[40px]">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-[var(--brand-primary)]/16 to-transparent blur-3xl" />
            <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-tl from-[var(--brand-tertiary)]/16 to-transparent blur-3xl" />
          </div>
          <div className="relative rounded-[40px] border border-[var(--border-soft)] bg-[rgba(255,255,255,0.86)] px-8 py-16 text-center shadow-[0_20px_54px_rgba(25,28,31,0.08)] backdrop-blur-md md:px-20">
            <h2 className="text-[2.4rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] md:text-[3.2rem]">
              Pronto para estudar <span className="text-[var(--brand-primary)]">sem guesswork</span>?
            </h2>
            <p className="mx-auto mt-6 max-w-[600px] text-lg leading-relaxed text-[var(--text-secondary)]">
              Grave sua primeira aula e receba material pronto em minutos. Sem compromisso, sem cartão.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/record">
                <Button size="lg" className="min-w-[220px]">
                  Começar gratuitamente
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="min-w-[180px]">Já tenho conta</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
