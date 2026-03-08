import { Link } from 'react-router-dom'
import {
  Mic, FileText, Sparkles, ArrowRight, CheckCircle,
  ClipboardCheck, BookOpen, Map, MessageSquare,
  GraduationCap, XCircle, Play, Star, Zap,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { Button } from '@/shared/ui/Button/Button'
import logoHero from '@/shared/assets/logo-hero.png'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
  viewport: { once: true },
})

const problems = [
  'Tenta prestar atenção na aula',
  'Tenta anotar ao mesmo tempo',
  'Perde partes importantes da explicação',
  'Depois não lembra o que o professor disse',
]

const steps = [
  {
    number: '01',
    icon: Mic,
    title: 'Grave a aula',
    description:
      'Grave diretamente pelo navegador ou envie um arquivo de áudio. Funciona com qualquer formato: MP3, MP4, WAV, WebM.',
  },
  {
    number: '02',
    icon: FileText,
    title: 'Transcrição automática',
    description:
      'Nossa IA transforma a aula inteira em texto completo. Revise tudo o que foi explicado, palavra por palavra.',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Material de estudo pronto',
    description:
      'Resumo inteligente, mapa mental interativo e flashcards gerados automaticamente. Revise em minutos.',
  },
]

const benefits = [
  'Revisar exatamente o que o professor explicou',
  'Encontrar trechos específicos em segundos',
  'Transformar horas de aula em material organizado',
  'Fixar conteúdo com flashcards gerados pela IA',
]

const audiences = ['Faculdade', 'Escola', 'Cursos técnicos', 'Cursos online']

const testimonials = [
  {
    name: 'Ana Luiza',
    role: 'Medicina · USP',
    text: 'Transformou minha forma de estudar. Consigo revisar 4 horas de aula em 20 minutos com o resumo e os flashcards.',
    rating: 5,
  },
  {
    name: 'Pedro Alves',
    role: 'Direito · PUC',
    text: 'Os mapas mentais gerados automaticamente são incríveis. Antes eu gastava horas criando esses mapas à mão.',
    rating: 5,
  },
  {
    name: 'Mariana Silva',
    role: 'Engenharia · UNICAMP',
    text: 'Uso em todas as aulas agora. A transcrição é precisa e o resumo capta os pontos mais importantes.',
    rating: 5,
  },
]

const features = [
  { icon: Mic,            label: 'Gravação ao vivo',       description: 'Grave direto pelo navegador.',             available: true  },
  { icon: FileText,       label: 'Transcrição automática', description: 'Groq Whisper Large v3.',                   available: true  },
  { icon: Sparkles,       label: 'Resumo com IA',          description: 'Llama 3.3 70B, pontos-chave da aula.',     available: true  },
  { icon: BookOpen,       label: 'Upload de arquivos',     description: 'MP3, MP4, WAV, OGG, WebM.',                available: true  },
  { icon: Map,            label: 'Mapas mentais',          description: 'Gerados automaticamente da aula.',         available: true  },
  { icon: BookOpen,       label: 'Flashcards',             description: 'Revisão ativa com cards gerados pela IA.', available: true  },
  { icon: ClipboardCheck, label: 'Quiz automático',        description: 'Verifique se você realmente entendeu.',    available: true  },
  { icon: MessageSquare,  label: 'Chat com a aula',        description: 'Tire dúvidas sobre o conteúdo.',           available: false },
] as const

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <MouseLight />

      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.1]"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <img
            src={logoHero}
            alt="anotEX.ai"
            className="h-7 w-auto"
            style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(230deg) brightness(1.2)' }}
          />
          <span className="text-base font-semibold text-[var(--text-primary)] tracking-tight">
            anotEX<span className="text-[var(--accent)]">.ai</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button size="sm">
              Começar grátis
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-bg)] text-xs font-medium text-[var(--accent)] mb-10">
            <Zap size={11} />
            Transcrição · Resumo · Mapa Mental · Flashcards com IA
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-7">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, var(--text-primary) 0%, var(--accent) 55%, var(--accent-2) 100%)',
              }}
            >
              Nunca mais saia de uma aula
            </span>
            <br />
            <span className="text-[var(--text-primary)]">sem entender tudo.</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-3 leading-relaxed">
            O anotEX.ai transforma aulas em transcrição completa, resumo inteligente e materiais de
            estudo — tudo gerado automaticamente pela IA.
          </p>
          <p className="text-sm text-[var(--text-tertiary)] max-w-xl mx-auto mb-12 leading-relaxed">
            Grave sua aula, envie um áudio e deixa a IA transformar o conteúdo em conhecimento organizado.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login">
              <Button size="lg">
                <Mic size={16} />
                Começar gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                <Play size={15} />
                Ver como funciona
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Problema ─────────────────────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <motion.div {...fadeUp()}>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              O Problema
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              A maioria dos estudantes passa pela mesma situação
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {problems.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-[var(--danger)]/15 bg-[var(--danger-bg)] shadow-[var(--shadow-card)]">
                  <XCircle size={15} className="text-[var(--danger)]/60 shrink-0" />
                  <p className="text-sm text-[var(--text-secondary)]">{p}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[var(--text-secondary)]">
            No final, sobra um caderno incompleto e várias dúvidas.{' '}
            <span className="text-[var(--text-primary)] font-medium">
              O anotEX.ai resolve exatamente esse problema.
            </span>
          </p>
        </motion.div>
      </section>

      {/* ── Como Funciona ─────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            Como Funciona
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Três passos. Resultado imediato.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {steps.map((step, i) => (
            <motion.div key={step.number} {...fadeUp(i * 0.1)}>
              <div className="p-6 h-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/35 hover:-translate-y-0.5 transition-all duration-200 shadow-[var(--shadow-card)]">
                <div className="flex items-start gap-3 mb-5">
                  <span className="text-4xl font-bold text-[var(--text-tertiary)]/40 font-mono leading-none select-none">
                    {step.number}
                  </span>
                  <div className="h-10 w-10 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <step.icon size={17} className="text-[var(--accent)]" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Benefícios ───────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <motion.div {...fadeUp()}>
          <div
            className="p-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-card)]"
            style={{
              background: 'radial-gradient(ellipse at 0% 50%, var(--accent-bg), transparent 60%)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
                  Uma vantagem real
                </p>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  Com o anotEX.ai você pode
                </h2>
                <div className="flex flex-col gap-3.5">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={15} className="text-[var(--success)] shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--text-secondary)]">{b}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-4">
                  Feito para estudantes de
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {audiences.map((a) => (
                    <span
                      key={a}
                      className="px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-sm text-[var(--text-secondary)]"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Qualquer aula pode virar conteúdo estruturado para estudo. Para muitos estudantes,
                  isso é uma vantagem enorme na hora de estudar para provas.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ─────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            O que você tem
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
            Você não apenas escuta a aula
          </h2>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm">
            Você transforma a aula em um sistema de estudo completo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {features.map((item, i) => (
            <motion.div key={item.label} {...fadeUp(i * 0.05)}>
              <div
                className={`p-5 h-full flex flex-col gap-3 rounded-xl border bg-[var(--bg-surface)] transition-all duration-200 shadow-[var(--shadow-card)] ${
                  item.available
                    ? 'border-[var(--border)] hover:border-[var(--success)]/30 hover:-translate-y-px'
                    : 'border-[var(--border)] opacity-50'
                }`}
              >
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  item.available ? 'bg-[var(--success-bg)]' : 'bg-[var(--accent-bg)]'
                }`}>
                  <item.icon size={15} className={item.available ? 'text-[var(--success)]' : 'text-[var(--accent)]'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{item.label}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </div>
                {item.available ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--success)] border border-[var(--success)]/25 bg-[var(--success-bg)] rounded-md px-2 py-0.5 w-fit mt-auto">
                    Disponível
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]/70 border border-[var(--accent)]/20 bg-[var(--accent-bg)] rounded-md px-2 py-0.5 w-fit mt-auto">
                    Em breve
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Social Proof ─────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            Depoimentos
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            O que os estudantes dizem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} {...fadeUp(i * 0.1)}>
              <div className="p-6 h-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:-translate-y-px transition-all duration-200 shadow-[var(--shadow-card)]">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-[var(--warning)] fill-[var(--warning)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center text-xs font-semibold text-[var(--accent)]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{t.name}</p>
                    <p className="text-xs text-[var(--text-tertiary)]">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────── */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-28 text-center">
        <motion.div {...fadeUp()}>
          <div
            className="p-14 rounded-2xl border border-[var(--accent)]/20 bg-[var(--bg-surface)] shadow-[var(--shadow-elevated)]"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, var(--accent-bg), transparent 70%)',
            }}
          >
            <GraduationCap size={32} className="text-[var(--accent)] mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              O futuro do estudo começa aqui
            </h2>
            <p className="text-[var(--text-secondary)] text-sm mb-1">
              Estudar não deveria significar perder informação.
            </p>
            <p className="text-[var(--text-primary)] font-medium text-sm mb-8">
              Grave. Transcreva. Entenda. Aprenda melhor.
            </p>
            <Link to="/login">
              <Button size="lg">
                Começar gratuitamente
                <ArrowRight size={15} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
