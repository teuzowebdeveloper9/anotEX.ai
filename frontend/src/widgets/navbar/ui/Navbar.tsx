import { Link, useNavigate } from 'react-router-dom'
import { Mic, LayoutDashboard } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { supabase } from '@/shared/auth/supabase'
import logoFavicon from '@/shared/assets/logo-favicon.png'

export function Navbar() {
  const navigate = useNavigate()

  const handleLogout = async (): Promise<void> => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--bg-base)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center">
          <img
            src={logoFavicon}
            alt="anotEX.ai"
            className="h-7 w-auto"
            style={{ mixBlendMode: 'lighten' }}
          />
        </Link>

        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <LayoutDashboard size={15} />
              Dashboard
            </Button>
          </Link>
          <Link to="/record">
            <Button variant="primary" size="sm">
              <Mic size={15} />
              Gravar
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </div>
    </nav>
  )
}
