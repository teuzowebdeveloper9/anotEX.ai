import { Link } from 'react-router-dom'
import {
  Mic, FileText, Sparkles, ArrowRight, CheckCircle,
  ClipboardCheck, BookOpen, Map, MessageSquare,
  GraduationCap, XCircle, Play,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import logoHero from '@/shared/assets/logo-hero.png'

const problems = [
  'Tenta prestar atenção na aula',
  'Tenta anotar ao mesmo tempo',
  'Perde partes importantes da explicação',
  'Depois não lembra exatamente o que o professor disse',
]

const steps = [
  {
    number: '01',
    icon: Mic,
    title: 'Grave a aula',
    description:
      'Grave diretamente pelo app ou envie um arquivo de áudio. Funciona com gravações de aula, arquivos de áudio e materiais de estudo.',
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
    title: 'Resumo inteligente',
    description:
      'O anotEX.ai gera automaticamente resumo da aula, pontos principais e estrutura do conteúdo. Revise em minutos.',
  },
]

const benefits = [
  'Revisar exatamente o que o professor explicou',
  'Encontrar partes específicas da aula em segundos',
  'Transformar horas de aula em material de estudo organizado',
]

const audiences = ['Faculdade', 'Escola', 'Cursos técnicos', 'Cursos online']


export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <MouseLight />

      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.12]"
        style={{
          backgroundImage: 'radial-gradient(circle, #7c3aed 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <div className="flex items-center gap-2">
          <img
            src={logoHero}
            alt="anotEX.ai"
            className="h-8 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            anotEX<span className="text-[var(--accent)]">.ai</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button size="sm">
              Começar grátis
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-xs text-[var(--accent)] mb-8">
            <Sparkles size={12} />
            Transcrição + Resumo automático com IA
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-6">
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #e8eaf0 0%, #7c3aed 50%, #a78bfa 100%)',
              }}
            >
              Nunca mais saia de uma aula
            </span>
            <br />
            <span className="text-[var(--text-primary)]">sem entender tudo.</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-3 leading-relaxed">
            O anotEX.ai transforma aulas em transcrição completa, resumo inteligente e materiais de
            estudo automáticos — tudo salvo no seu aplicativo.
          </p>
          <p className="text-base text-[var(--text-secondary)]/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Grave sua aula, envie um áudio ou arquivo e deixe a IA transformar o conteúdo em conhecimento organizado.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login">
              <Button size="lg">
                <Mic size={16} />
                Começar gratuitamente
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg">
                <Play size={16} />
                Ver como funciona
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* O Problema */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
              O Problema
            </p>
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
              A maioria dos estudantes passa pela mesma situação
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {problems.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="p-4 flex items-center gap-3 border-red-500/10 bg-red-500/[0.04]">
                  <XCircle size={15} className="text-red-400/60 shrink-0" />
                  <p className="text-sm text-[var(--text-secondary)]">{p}</p>
                </Card>
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

      {/* Como Funciona */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            Como Funciona
          </p>
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Três passos. Resultado imediato.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:border-[var(--accent)]/30 transition-colors duration-300">
                <div className="flex items-start gap-3 mb-5">
                  <span className="text-4xl font-bold text-[var(--accent)]/15 font-mono leading-none select-none">
                    {step.number}
                  </span>
                  <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <step.icon size={18} className="text-[var(--accent)]" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vantagem real */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card
            className="p-10"
            style={{
              background:
                'radial-gradient(ellipse at 0% 50%, rgba(124,58,237,0.08), transparent 60%)',
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
                <div className="flex flex-col gap-4">
                  {benefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-[var(--accent)] shrink-0 mt-0.5" />
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
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] mb-3">
            O que você tem
          </p>
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Você não apenas escuta a aula
          </h2>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Você transforma a aula em um sistema de estudo completo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { icon: Mic,            label: 'Gravação ao vivo',          description: 'Grave direto pelo navegador.',              available: true  },
            { icon: FileText,       label: 'Transcrição automática',    description: 'Groq Whisper Large v3.',                    available: true  },
            { icon: Sparkles,       label: 'Resumo com IA',             description: 'Llama 3.3 70B, pontos-chave da aula.',      available: true  },
            { icon: BookOpen,       label: 'Upload de arquivos',        description: 'MP3, MP4, WAV, OGG, WebM.',                 available: true  },
            { icon: Map,            label: 'Mapas mentais',             description: 'Gerados automaticamente da aula.',          available: false },
            { icon: MessageSquare,  label: 'Perguntas e respostas',     description: 'Tire dúvidas sobre o conteúdo.',            available: false },
            { icon: ClipboardCheck, label: 'Testes automáticos',        description: 'Verifique se você realmente entendeu.',     available: false },
            { icon: CheckCircle,    label: 'Materiais de revisão',      description: 'Flashcards e resumos estruturados.',        available: false },
          ] as const).map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              viewport={{ once: true }}
            >
              <Card className={`p-5 flex flex-col gap-3 transition-colors duration-300 ${item.available ? 'hover:border-emerald-500/20' : 'opacity-50'}`}>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${item.available ? 'bg-emerald-500/10' : 'bg-[var(--accent)]/10'}`}>
                  <item.icon size={16} className={item.available ? 'text-emerald-400' : 'text-[var(--accent)]'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{item.label}</p>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </div>
                {item.available ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/80 border border-emerald-500/20 rounded px-2 py-0.5 w-fit">
                    Disponível
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]/60 border border-[var(--accent)]/20 rounded px-2 py-0.5 w-fit">
                    Em breve
                  </span>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Card
            className="p-12 border-[var(--accent)]/20"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12), transparent 70%)',
            }}
          >
            <GraduationCap size={36} className="text-[var(--accent)] mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              O futuro do estudo começa aqui
            </h2>
            <p className="text-[var(--text-secondary)] mb-2">
              Estudar não deveria significar perder informação.
            </p>
            <p className="text-[var(--text-primary)] font-medium mb-8">
              Grave. Transcreva. Entenda. Aprenda melhor.
            </p>
            <Link to="/login">
              <Button size="lg">
                Começar gratuitamente
                <ArrowRight size={16} />
              </Button>
            </Link>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
