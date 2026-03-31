import { Link, useNavigate } from 'react-router-dom'
import { Mic, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { supabase } from '@/shared/auth/supabase'
import { useSidebarStore } from '@/shared/hooks/useSidebarStore'
import logoAnotex from '@/shared/assets/logo-anotex.png'

export function Navbar() {
  const navigate = useNavigate()
  const { isOpen, toggle: toggleSidebar } = useSidebarStore()

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 h-14 border-b border-[var(--border)]"
      style={{
        background: 'rgba(255,255,255,0.72)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '0 1px 0 rgba(56,171,228,0.1)',
      }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-3 sm:px-4">
        {/* Esquerda: hamburguer (mobile) + logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            aria-label="Abrir menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--accent-bg)] hover:text-[var(--accent-5)] md:hidden"
          >
            {isOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <Link to="/dashboard" className="flex items-center group">
            <img
              src={logoAnotex}
              alt="anotEX.ai"
              className="h-7 w-auto transition-opacity group-hover:opacity-80"
            />
          </Link>
        </div>

        {/* Direita: ações */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <Link to="/dashboard" className="hidden md:block">
            <Button variant="ghost" size="sm">
              <LayoutDashboard size={14} />
              Dashboard
            </Button>
          </Link>
          <Link to="/record">
            <Button variant="primary" size="sm" className="px-3 sm:px-4">
              <Mic size={14} />
              <span className="hidden sm:inline">Gravar</span>
            </Button>
          </Link>

          <div className="mx-0.5 h-4 w-px bg-[var(--border)] sm:mx-1" />

          <button
            onClick={handleLogout}
            aria-label="Sair"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-tertiary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all duration-200"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  )
}
