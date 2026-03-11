import { Link, useNavigate } from 'react-router-dom'
import { Mic, LayoutDashboard, Sun, Moon, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { supabase } from '@/shared/auth/supabase'
import { useTheme } from '@/shared/hooks/useTheme'
import { useSidebarStore } from '@/shared/hooks/useSidebarStore'
import logoFavicon from '@/shared/assets/logo-favicon.png'

export function Navbar() {
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()
  const { isOpen, toggle: toggleSidebar } = useSidebarStore()

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav
      className="fixed top-0 inset-x-0 z-50 h-14 border-b border-[var(--border)] backdrop-blur-xl"
      style={{ background: 'rgba(8,12,20,0.75)' }}
    >
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Esquerda: hamburguer (mobile) + logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            aria-label="Abrir menu"
            className="md:hidden h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-200"
          >
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group">
            <img
              src={logoFavicon}
              alt="anotEX.ai"
              className="h-6 w-auto transition-opacity group-hover:opacity-80"
              style={{ filter: 'brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(230deg) brightness(1.2)' }}
            />
            <span className="text-sm font-semibold tracking-tight">
              <span className="text-[var(--text-primary)]">anotEX</span>
              <span
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                .ai
              </span>
            </span>
          </Link>
        </div>

        {/* Direita: ações */}
        <div className="flex items-center gap-1">
          <Link to="/dashboard" className="hidden md:block">
            <Button variant="ghost" size="sm">
              <LayoutDashboard size={14} />
              Dashboard
            </Button>
          </Link>
          <Link to="/record">
            <Button variant="primary" size="sm">
              <Mic size={14} />
              <span className="hidden sm:inline">Gravar</span>
            </Button>
          </Link>

          <div className="w-px h-4 bg-[var(--border)] mx-1" />

          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            onClick={handleLogout}
            aria-label="Sair"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all duration-200"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  )
}
