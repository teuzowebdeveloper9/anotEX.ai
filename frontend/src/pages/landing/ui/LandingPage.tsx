import { Link } from 'react-router-dom'
import { Mic, FileText, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { MouseLight } from '@/widgets/mouse-light/ui/MouseLight'
import { Button } from '@/shared/ui/Button/Button'
import { Card } from '@/shared/ui/Card/Card'
import logoHero from '@/shared/assets/logo-hero.png'

const features = [
  {
    icon: Mic,
    title: 'Grave em tempo real',
    description: 'Capture qualquer aula diretamente pelo navegador com qualidade de áudio profissional.',
  },
  {
    icon: FileText,
    title: 'Transcrição automática',
    description: 'Powered by Groq Whisper — transcrição precisa em português com latência mínima.',
  },
  {
    icon: Sparkles,
    title: 'Resumo com IA',
    description: 'Llama 3.3 70B gera resumos estruturados com tópicos, conceitos e pontos de revisão.',
  },
]

export function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <MouseLight />

      {/* Dot grid background */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between max-w-6xl mx-auto px-6 py-5">
        <img
          src={logoHero}
          alt="anotEX.ai"
          className="h-8 w-auto"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
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
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
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
                backgroundImage: 'linear-gradient(135deg, #e8eaf0 0%, #6366f1 50%, #818cf8 100%)',
              }}
            >
              Nunca mais perca
            </span>
            <br />
            <span className="text-[var(--text-primary)]">o conteúdo de uma aula</span>
          </h1>

          <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto mb-10 leading-relaxed">
            Grave, transcreva e resuma qualquer aula automaticamente. Foco total em aprender,
            não em anotar.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/login">
              <Button size="lg">
                <Mic size={16} />
                Gravar agora
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="lg">
                Ver demo
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <Card className="p-6 hover:border-[var(--accent)]/30 transition-colors duration-300">
                <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{f.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-24 text-center">
        <Card className="p-10 border-[var(--accent)]/20"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08), transparent 70%)' }}
        >
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-3">
            Pronto para começar?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Gratuito, sem cartão de crédito.
          </p>
          <Link to="/login">
            <Button size="lg">
              Criar conta grátis
              <ArrowRight size={16} />
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}
