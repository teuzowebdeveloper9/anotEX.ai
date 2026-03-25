import { Link } from 'react-router-dom'
import { ArrowRight, Play, Sparkles, BookOpen, BrainCircuit, Clock3, CheckCircle2, FolderOpen, Users, MessageSquareQuote } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/Button/Button'
import logoAnotex from '@/shared/assets/logo-anotex.png'
import heroMock from '../../../../images/generated-1774426507249.png'

const valueCards = [
  {
    icon: Clock3,
    title: 'Estude mais em menos tempo',
    description: 'Transforme horas de aula em material pronto para revisar em minutos.',
    tone: 'blue',
  },
  {
    icon: BrainCircuit,
    title: 'Fixe o conteúdo com constância',
    description: 'Saia do estudo passivo e mantenha uma rotina de revisão que realmente sustenta aprendizado.',
    tone: 'teal',
  },
  {
    icon: BookOpen,
    title: 'Chegue preparado para prova',
    description: 'Tenha resumos, flashcards, quiz e organização clara para revisar com confiança.',
    tone: 'green',
  },
] as const

const productPillars = [
  {
    icon: Sparkles,
    title: 'Tudo organizado em um só lugar',
    description: 'Aula, resumo, flashcards, quiz, mapas mentais e conversa com IA no mesmo fluxo.',
  },
  {
    icon: FolderOpen,
    title: 'Sua rotina fica mais leve',
    description: 'Menos tempo montando material e mais tempo entendendo, praticando e revisando.',
  },
  {
    icon: Users,
    title: 'Funciona para estudar sozinho ou em grupo',
    description: 'Compartilhe conteúdos, crie grupos e mantenha sua preparação alinhada com colegas.',
  },
] as const

const outcomes = [
  'Pare de perder informação importante da aula enquanto tenta anotar tudo.',
  'Revise com clareza o que realmente importa em vez de reler material bagunçado.',
  'Ganhe consistência com uma rotina de revisão mais simples e mais sustentável.',
  'Mostre valor imediato para quem paga: mais organização, mais retenção e menos desperdício de tempo.',
]

const steps = [
  {
    number: '01',
    title: 'Grave ou envie sua aula',
    description: 'Comece em segundos, sem montar processo complicado.',
  },
  {
    number: '02',
    title: 'Receba material pronto para estudar',
    description: 'O conteúdo vira resumo, flashcards, quiz e mapa mental.',
  },
  {
    number: '03',
    title: 'Reveja no momento certo',
    description: 'Mantenha ritmo e transforme estudo em progresso visível.',
  },
]

const testimonials = [
  {
    quote: 'Eu parei de acumular aula sem revisar. Agora eu termino uma gravação e já sei exatamente como estudar.',
    author: 'Estudante universitário',
  },
  {
    quote: 'O maior valor foi economizar tempo e finalmente conseguir manter constância antes das provas.',
    author: 'Aluno em preparação para vestibular',
  },
] as const

const toneClasses: Record<(typeof valueCards)[number]['tone'], string> = {
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
            <a href="#valor" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Valor
            </a>
            <a href="#como-funciona" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Como funciona
            </a>
            <a href="#produto" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-5)]">
              Produto
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
        <section className="mx-auto flex min-h-[720px] w-full max-w-[1440px] flex-col justify-between gap-16 px-6 py-20 md:px-[100px] lg:flex-row lg:items-center lg:py-24">
          <motion.div
            className="max-w-[650px]"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(56,171,228,0.25)] bg-[rgba(56,171,228,0.08)] px-3.5 py-1.5">
              <span className="h-[7px] w-[7px] rounded-full bg-[var(--accent)]" />
              <span className="text-xs font-medium text-[var(--accent-5)]">
                Seu sistema de estudo para aula, revisão e prova
              </span>
            </div>

            <div className="space-y-2">
              <h1 className="text-[3.1rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)] md:text-[4.5rem]">
                Pare de só
              </h1>
              <h1 className="text-[3.1rem] font-extrabold leading-[1.02] tracking-[-0.05em] md:text-[4.5rem]">
                <span className="gradient-text">assistir aula.</span>
              </h1>
              <h1 className="text-[3.1rem] font-extrabold leading-[1.02] tracking-[-0.05em] text-[var(--text-primary)] md:text-[4.5rem]">
                Comece a aprender de verdade.
              </h1>
            </div>

            <p className="mt-7 max-w-[40rem] text-[1.13rem] leading-[1.7] text-[var(--text-secondary)]">
              O anotEX.ai transforma sua aula em uma rotina de estudo completa. Você grava, organiza o conteúdo, revisa com clareza e mantém constância sem depender de força de vontade toda vez que senta para estudar.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {['Mais organização', 'Mais retenção', 'Menos retrabalho'].map((item) => (
                <span key={item} className="pen-pill bg-white/55">{item}</span>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link to="/record">
                <Button size="lg" className="w-full sm:w-auto">
                  Quero estudar melhor
                </Button>
              </Link>
              <a
                href="#valor"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[rgba(56,171,228,0.28)] bg-[rgba(255,255,255,0.65)] px-6 text-base font-semibold text-[var(--accent-5)] shadow-[0_4px_12px_rgba(56,171,228,0.12)] backdrop-blur-sm transition-all hover:-translate-y-px hover:bg-white/80"
              >
                <Play size={16} />
                Entender o valor
              </a>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full max-w-[600px]"
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          >
            <div className="pen-hero-frame mx-auto w-full max-w-[540px]">
              <img
                src={heroMock}
                alt="Preview do anotEX.ai organizando uma aula em material de estudo"
                className="h-[500px] w-full rounded-[24px] object-cover"
              />

              <div className="absolute inset-x-0 top-0 flex h-[54px] items-center justify-between rounded-t-[24px] border-b border-[rgba(56,171,228,0.16)] bg-[rgba(255,255,255,0.34)] px-5 backdrop-blur-sm">
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  Aula organizada e pronta para revisar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(113,171,35,0.14)] px-2.5 py-1 text-[11px] font-medium text-[#3D7A10]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-3)]" />
                  Conteúdo pronto
                </span>
              </div>

              <div className="absolute inset-x-5 top-[70px] flex flex-col gap-3.5">
                <div className="rounded-2xl border border-[rgba(56,171,228,0.18)] bg-[rgba(255,255,255,0.5)] p-4 shadow-[0_4px_12px_rgba(56,171,228,0.12)] backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--accent-5)]">
                    O que o aluno percebe
                  </p>
                  <p className="mt-2 text-xs leading-[1.6] text-[var(--text-secondary)]">
                    Menos conteúdo solto, menos aula acumulada e mais clareza para saber exatamente o que revisar hoje.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-[14px] border border-[rgba(56,171,228,0.22)] bg-[linear-gradient(180deg,rgba(56,171,228,0.12),rgba(0,196,204,0.05))] p-3.5 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold text-[var(--text-primary)]">Resumo claro</p>
                    <p className="mt-1.5 text-[10px] leading-[1.4] text-[var(--text-secondary)]">
                      Entenda o conteúdo sem precisar refazer tudo do zero.
                    </p>
                  </div>
                  <div className="rounded-[14px] border border-[rgba(113,171,35,0.22)] bg-[linear-gradient(180deg,rgba(113,171,35,0.12),rgba(159,225,29,0.05))] p-3.5 backdrop-blur-sm">
                    <p className="text-[11px] font-semibold text-[var(--text-primary)]">Revisão contínua</p>
                    <p className="mt-1.5 text-[10px] leading-[1.4] text-[var(--text-secondary)]">
                      Mantenha ritmo para não esquecer o que estudou.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="valor" className="mx-auto w-full max-w-[1440px] px-6 py-10 md:px-[100px]">
          <div className="mx-auto max-w-[860px] text-center">
            <h2 className="text-[2.2rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] md:text-[3rem]">
              O produto não vende tecnologia.
            </h2>
            <p className="mt-3 text-[1.06rem] leading-8 text-[var(--text-secondary)]">
              Ele vende tranquilidade, clareza e continuidade para estudar melhor ao longo do semestre, da preparação para prova e da rotina de revisão.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {valueCards.map(({ icon: Icon, title, description, tone }) => (
              <div key={title} className={`${toneClasses[tone]} rounded-[24px] p-7`}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/55 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                  <Icon size={22} className="text-[var(--accent-5)]" />
                </div>
                <h3 className="text-[1.15rem] font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="como-funciona" className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-[100px]">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="pen-surface rounded-[30px] p-8 md:p-10">
              <h2 className="text-[2rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)] md:text-[2.6rem]">
                Como isso agrega valor ao pagador
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
                Quem paga quer perceber evolução real. O anotEX.ai entrega isso ao reduzir atrito, organizar a rotina e tornar o estudo mais consistente ao longo do tempo.
              </p>

              <div className="mt-8 space-y-4">
                {outcomes.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-[rgba(56,171,228,0.14)] bg-white/45 px-4 py-4">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[var(--accent-5)]" />
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {steps.map((step) => (
                <div key={step.number} className="pen-surface rounded-[26px] p-7">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(56,171,228,0.1)] text-sm font-bold text-[var(--accent-5)]">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="produto" className="mx-auto w-full max-w-[1440px] px-6 py-8 md:px-[100px]">
          <div className="mx-auto max-w-[920px] text-center">
            <h2 className="text-[2.1rem] font-extrabold tracking-[-0.03em] text-[var(--text-primary)] md:text-[2.8rem]">
              Um produto pensado para acompanhar a jornada inteira
            </h2>
            <p className="mt-3 text-base leading-8 text-[var(--text-secondary)]">
              Da aula ao momento da prova, o anotEX.ai ajuda a organizar, revisar e reaproveitar o conteúdo de forma útil para a vida real.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {productPillars.map(({ icon: Icon, title, description }) => (
              <div key={title} className="pen-surface rounded-[24px] p-7">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-[18px] border border-white/55 bg-white/45">
                  <Icon size={22} className="text-[var(--accent-5)]" />
                </div>
                <h3 className="text-[1.05rem] font-bold text-[var(--text-primary)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 py-16 md:px-[100px]">
          <div className="grid gap-5 lg:grid-cols-2">
            {testimonials.map(({ quote, author }) => (
              <div key={quote} className="pen-surface rounded-[28px] p-8">
                <MessageSquareQuote size={22} className="text-[var(--accent-5)]" />
                <p className="mt-5 text-[1.02rem] leading-8 text-[var(--text-secondary)]">
                  {quote}
                </p>
                <p className="mt-5 text-sm font-semibold text-[var(--text-primary)]">{author}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1440px] px-6 pb-24 md:px-[100px]">
          <div className="pen-surface rounded-[34px] px-8 py-12 text-center md:px-14">
            <h2 className="text-[2.2rem] font-extrabold tracking-[-0.04em] text-[var(--text-primary)] md:text-[3rem]">
              Se estudar melhor precisa virar rotina, comece por aqui.
            </h2>
            <p className="mx-auto mt-4 max-w-[820px] text-base leading-8 text-[var(--text-secondary)]">
              O anotEX.ai ajuda a transformar conteúdo em progresso. Menos acúmulo, menos improviso e mais clareza para aprender com consistência.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/record">
                <Button size="lg">
                  Testar agora
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">Entrar na plataforma</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
