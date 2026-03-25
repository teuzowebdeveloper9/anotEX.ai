import { Link } from 'react-router-dom'
import {
  Mic, BookOpen, Sparkles, Cpu, Zap,
  ChevronRight, Play, Check,
  Layers, Map, CreditCard, ArrowRight, Star, XCircle,
  GraduationCap, FileText, CheckCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { Button } from '@/shared/ui/Button/Button'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { EnergyLines } from '@/shared/ui/decorative/EnergyLines'
import { FloatingShapes } from '@/shared/ui/decorative/FloatingShapes'
import { WaveDivider } from '@/shared/ui/decorative/WaveDivider'
import logoHero from '@/shared/assets/logo-hero.png'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' as const },
  viewport: { once: true },
})

const problems = [
  { icon: XCircle, text: 'Tenta prestar atenção na aula' },
  { icon: XCircle, text: 'Tenta anotar ao mesmo tempo' },
  { icon: XCircle, text: 'Perde partes importantes da explicação' },
  { icon: XCircle, text: 'Depois não lembra o que o professor disse' },
]

const steps = [
  {
    number: '01',
    icon: Mic,
    title: 'Grave a aula',
    description:
      'Grave diretamente pelo navegador ou envie um arquivo de áudio. Funciona com qualquer formato: MP3, MP4, WAV, WebM.',
    color: '#38ABE4',
    color2: '#22D3EE',
  },
  {
    number: '02',
    icon: Cpu,
    title: 'Transcrição automática',
    description:
      'Nossa IA transforma a aula inteira em texto completo. Revise tudo o que foi explicado, palavra por palavra.',
    color: '#22D3EE',
    color2: '#3B82F6',
  },
  {
    number: '03',
    icon: BookOpen,
    title: 'Material de estudo pronto',
    description:
      'Resumo inteligente, mapa mental interativo e flashcards gerados automaticamente. Revise em minutos.',
    color: '#10B981',
    color2: '#22D3EE',
  },
]

const features = [
  {
    icon: Mic,
    label: 'Transcrição automática',
    description: 'Groq Whisper Large v3 transcreve qualquer áudio com alta precisão.',
    color: '#38ABE4',
    color2: '#22D3EE',
  },
  {
    icon: Sparkles,
    label: 'Resumos com IA',
    description: 'Llama 3.3 70B extrai os pontos-chave e gera resumos inteligentes.',
    color: '#EC4899',
    color2: '#38ABE4',
  },
  {
    icon: Map,
    label: 'Mapas Mentais',
    description: 'Estrutura visual do conteúdo gerada automaticamente da transcrição.',
    color: '#3B82F6',
    color2: '#10B981',
  },
  {
    icon: CreditCard,
    label: 'Flashcards',
    description: 'Revisão ativa com cards gerados pela IA para fixar o conteúdo.',
    color: '#F59E0B',
    color2: '#EC4899',
  },
  {
    icon: Layers,
    label: 'Múltiplos formatos',
    description: 'MP3, MP4, WAV, OGG, WebM — qualquer formato de áudio funciona.',
    color: '#10B981',
    color2: '#3B82F6',
  },
  {
    icon: Zap,
    label: 'Interface limpa',
    description: 'Design focado em produtividade, sem distrações. Tudo onde precisa estar.',
    color: '#22D3EE',
    color2: '#38ABE4',
  },
]

const studyTools = [
  {
    icon: CreditCard,
    label: 'Flashcards',
    description: 'Pergunta e resposta para fixar conceitos. Gerados automaticamente.',
    color: '#F59E0B',
    color2: '#EC4899',
    preview: ['O que é neuroplasticidade?', 'A capacidade do cérebro de se reorganizar...'],
  },
  {
    icon: Map,
    label: 'Mapa Mental',
    description: 'Estrutura visual hierárquica do conteúdo da aula.',
    color: '#3B82F6',
    color2: '#10B981',
    preview: ['Conceito central', 'Subtópico A', 'Subtópico B'],
  },
  {
    icon: FileText,
    label: 'Resumo',
    description: 'Pontos mais importantes da aula em formato estruturado.',
    color: '#38ABE4',
    color2: '#22D3EE',
    preview: ['Introdução ao tema', 'Desenvolvimento', 'Conclusões'],
  },
]

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

const benefits = [
  'Revisar exatamente o que o professor explicou',
  'Encontrar trechos específicos em segundos',
  'Transformar horas de aula em material organizado',
  'Fixar conteúdo com flashcards gerados pela IA',
]

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <MouseLight />

      {/* ── Navbar ─────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <img
            src={logoHero}
            alt="anotEX.ai"
            className="h-7 w-auto"
            style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(230deg) brightness(1.2)' }}
          />
          <span className="text-base font-semibold tracking-tight">
            <span className="text-[var(--text-primary)]">anotEX</span>
            <span
              className="font-bold"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >.ai</span>
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

      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative z-10 min-h-[92vh] flex flex-col items-center justify-center max-w-5xl mx-auto px-6 pt-10 pb-24 text-center">
        {/* Background decorations */}
        <EnergyLines className="z-0 opacity-40" />
        <FloatingShapes />
        <GradientOrb size={600} color="#38ABE4" opacity={0.18} className="-top-40 -left-40 z-0" />
        <GradientOrb size={500} color="#22D3EE" opacity={0.10} className="-top-20 right-0 z-0" style={{ transform: 'translateX(40%)' }} />
        <GradientOrb size={300} color="#EC4899" opacity={0.08} className="bottom-0 left-1/3 z-0" />

        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--accent) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent-bg)] text-xs font-medium text-[var(--accent)] mb-10">
            <Zap size={11} />
            Transcrição · Resumo · Mapa Mental · Flashcards com IA
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.08] tracking-tight mb-7 max-w-4xl">
            <span className="text-[var(--text-primary)]">Transforme suas aulas em</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 60%, #EC4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              conhecimento
            </span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-3 leading-relaxed">
            Grave, transcreva e estude com IA. Flashcards, mapas mentais e resumos automáticos.
          </p>
          <p className="text-sm text-[var(--text-tertiary)] max-w-xl mx-auto mb-12 leading-relaxed">
            Grave sua aula, envie um áudio e deixa a IA transformar o conteúdo em conhecimento organizado.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap mb-16">
            <Link to="/login">
              <Button size="lg">
                <Mic size={16} />
                Começar grátis
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">
                <Play size={15} />
                Ver demo
              </Button>
            </Link>
          </div>

          {/* Mock card preview */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            className="w-full max-w-2xl"
          >
            <div
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-[var(--shadow-elevated)] overflow-hidden"
              style={{
                background: 'rgba(15,22,36,0.90)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Fake window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#10B981]/60" />
                <div className="ml-3 flex-1 h-5 rounded-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]" />
              </div>
              {/* Content preview */}
              <div className="p-5 flex gap-4">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #38ABE4, #22D3EE)' }}>
                      <Sparkles size={12} className="text-white" />
                    </div>
                    <div className="h-3 w-28 rounded bg-[rgba(255,255,255,0.08)]" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2 w-full rounded bg-[rgba(255,255,255,0.06)]" />
                    <div className="h-2 w-5/6 rounded bg-[rgba(255,255,255,0.05)]" />
                    <div className="h-2 w-4/6 rounded bg-[rgba(255,255,255,0.04)]" />
                    <div className="h-2 w-full rounded bg-[rgba(255,255,255,0.06)]" />
                    <div className="h-2 w-3/4 rounded bg-[rgba(255,255,255,0.05)]" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    {['Resumo', 'Transcrição', 'Mapa Mental', 'Flashcards'].map((tab, i) => (
                      <span
                        key={tab}
                        className="text-[10px] px-2.5 py-1 rounded-md font-medium"
                        style={{
                          background: i === 0
                            ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(34,211,238,0.2))'
                            : 'rgba(255,255,255,0.04)',
                          color: i === 0 ? 'var(--accent-2)' : 'var(--text-tertiary)',
                          border: `1px solid ${i === 0 ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        }}
                      >
                        {tab}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="w-32 flex flex-col gap-2 shrink-0">
                  {['Neuroplasticidade', 'Sinapses', 'Memória'].map((item, i) => (
                    <div
                      key={item}
                      className="px-2.5 py-2 rounded-lg text-[10px] text-[var(--text-secondary)] border border-[rgba(255,255,255,0.06)]"
                      style={{
                        background: i === 0
                          ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(34,211,238,0.08))'
                          : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Problem Section ───────────────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <motion.div {...fadeUp()}>
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              O Problema
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
              Você anota tudo mas não retém nada?
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm">
              A maioria dos estudantes passa pela mesma situação.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            {problems.map((p, i) => (
              <motion.div key={i} {...fadeUp(i * 0.08)}>
                <div className="flex items-center gap-3 p-5 rounded-xl border border-[var(--danger)]/15 shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all duration-200" style={{ background: 'rgba(239,68,68,0.05)' }}>
                  <div className="h-8 w-8 rounded-lg bg-[var(--danger-bg)] border border-[var(--danger)]/20 flex items-center justify-center shrink-0">
                    <p.icon size={14} className="text-[var(--danger)]/70" />
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">{p.text}</p>
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

      {/* ── How it Works ─────────────────────── */}
      <WaveDivider />
      <section className="relative z-10 bg-[var(--bg-surface)] py-24 overflow-hidden">
        <GradientOrb size={500} color="#22D3EE" opacity={0.06} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -20%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              Como Funciona
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Três passos. Resultado imediato.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.number} {...fadeUp(i * 0.1)}>
                <div className="relative p-7 h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:border-[rgba(124,58,237,0.3)] hover:-translate-y-1 transition-all duration-300 shadow-[var(--shadow-card)]">
                  {/* Gradient accent top */}
                  <div
                    className="absolute top-0 inset-x-0 h-px rounded-t-2xl"
                    style={{ background: `linear-gradient(90deg, transparent, ${step.color}, transparent)` }}
                  />
                  <div className="flex items-start gap-3 mb-5">
                    <span className="text-4xl font-bold font-mono leading-none select-none" style={{ color: `${step.color}30` }}>
                      {step.number}
                    </span>
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: `linear-gradient(135deg, ${step.color}25, ${step.color2}15)`, border: `1px solid ${step.color}30` }}
                    >
                      <step.icon size={17} style={{ color: step.color }} />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {step.description}
                  </p>
                  {/* Connector arrow (between cards) */}
                  {i < steps.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full items-center justify-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                      <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <WaveDivider flipped />

      {/* ── Features Grid ─────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24 overflow-hidden">
        <GradientOrb size={700} color="#38ABE4" opacity={0.07} className="top-1/2 left-1/2 z-0" style={{ transform: 'translate(-50%, -50%)' }} />
        <div className="relative z-10">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              Funcionalidades
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3">
              Tudo que você precisa para estudar melhor
            </h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm">
              Você não apenas escuta a aula — você transforma em um sistema de estudo completo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((item, i) => (
              <motion.div key={item.label} {...fadeUp(i * 0.07)}>
                <div className="p-6 h-full flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[rgba(124,58,237,0.25)] hover:-translate-y-1 transition-all duration-300 shadow-[var(--shadow-card)]">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg, ${item.color}22, ${item.color2}15)`, border: `1px solid ${item.color}30` }}
                  >
                    <item.icon size={17} style={{ color: item.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{item.label}</p>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-1 text-xs font-medium" style={{ color: item.color }}>
                    <Check size={11} />
                    <span>Disponível</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Study Tools Preview ───────────────── */}
      <section className="relative z-10 bg-[var(--bg-surface)] py-24 overflow-hidden">
        <GradientOrb size={400} color="#EC4899" opacity={0.07} className="bottom-0 left-0 z-0" style={{ transform: 'translate(-30%, 30%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              Ferramentas de estudo
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
              Ferramentas de estudo inteligentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {studyTools.map((tool, i) => (
              <motion.div key={tool.label} {...fadeUp(i * 0.1)}>
                <div className="p-6 h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:-translate-y-1 transition-all duration-300 shadow-[var(--shadow-card)] overflow-hidden relative">
                  {/* Top gradient line */}
                  <div
                    className="absolute top-0 inset-x-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${tool.color}, ${tool.color2}, transparent)` }}
                  />
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `linear-gradient(135deg, ${tool.color}25, ${tool.color2}15)`, border: `1px solid ${tool.color}30` }}
                    >
                      <tool.icon size={15} style={{ color: tool.color }} />
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{tool.label}</h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-5">
                    {tool.description}
                  </p>
                  {/* Preview items */}
                  <div className="flex flex-col gap-2">
                    {tool.preview.map((item, j) => (
                      <div
                        key={j}
                        className="px-3 py-2 rounded-lg text-xs text-[var(--text-secondary)] border border-[var(--border)]"
                        style={{
                          background: j === 0
                            ? `linear-gradient(135deg, ${tool.color}12, ${tool.color2}08)`
                            : 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <motion.div {...fadeUp()}>
          <div
            className="p-10 rounded-2xl border border-[var(--border)] shadow-[var(--shadow-card)] overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(22,30,46,1) 60%)',
            }}
          >
            <GradientOrb size={400} color="#38ABE4" opacity={0.12} className="top-0 left-0 z-0" style={{ transform: 'translate(-30%, -30%)' }} />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
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
                      <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <CheckCircle size={11} className="text-[var(--success)]" />
                      </div>
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
                  {['Faculdade', 'Escola', 'Cursos técnicos', 'Cursos online'].map((a) => (
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

      {/* ── Testimonials ─────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
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
              <div className="p-6 h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:-translate-y-1 transition-all duration-300 shadow-[var(--shadow-card)]">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={13} className="text-[var(--warning)] fill-[var(--warning)]" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))' }}
                  >
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

      {/* ── CTA Final ────────────────────────── */}
      <section className="relative z-10 pb-24 px-6 overflow-hidden">
        <motion.div {...fadeUp()}>
          <div
            className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden p-16 text-center"
            style={{
              background: 'linear-gradient(135deg, #38ABE4 0%, #4F46E5 40%, #22D3EE 100%)',
            }}
          >
            {/* Noise/pattern overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <GradientOrb size={400} color="#ffffff" opacity={0.08} className="top-0 right-0 z-0" style={{ transform: 'translate(20%, -20%)' }} />
            <div className="relative z-10">
              <GraduationCap size={36} className="text-white/80 mx-auto mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Comece a estudar melhor hoje
              </h2>
              <p className="text-white/70 text-base mb-2">
                Estudar não deveria significar perder informação.
              </p>
              <p className="text-white font-medium text-base mb-10">
                Grave. Transcreva. Entenda. Aprenda melhor.
              </p>
              <Link to="/login">
                <button
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm bg-white text-[#38ABE4] hover:bg-white/90 active:scale-[0.98] transition-all duration-200 shadow-xl"
                >
                  Começar gratuitamente
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer note */}
      <div className="relative z-10 text-center pb-10">
        <p className="text-xs text-[var(--text-tertiary)]">
          anotEX.ai — Powered by Groq Whisper &amp; Llama 3.3 70B
        </p>
      </div>
    </div>
  )
}
