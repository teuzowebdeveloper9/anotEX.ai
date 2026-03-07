import { NavLink } from 'react-router-dom'
import { Mic, FileText, Map, MessageSquare, Sparkles, Clock } from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  to: string
  comingSoon?: boolean
}

const mainItems: NavItem[] = [
  { icon: <Mic size={16} />, label: 'Gravações', to: '/dashboard' },
  { icon: <FileText size={16} />, label: 'Transcrições', to: '/transcriptions' },
]

const soonItems: NavItem[] = [
  { icon: <Map size={16} />, label: 'Mapas Mentais', to: '#', comingSoon: true },
  { icon: <MessageSquare size={16} />, label: 'Perguntas & Respostas', to: '#', comingSoon: true },
  { icon: <Sparkles size={16} />, label: 'Resumos Auto', to: '#', comingSoon: true },
]

export function Sidebar() {
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-56 border-r border-[var(--border)] bg-[var(--bg-base)] flex flex-col py-4 px-3 z-40">
      <nav className="flex flex-col gap-1">
        {mainItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-medium'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-6">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]/50">
          Em breve
        </p>
        <nav className="flex flex-col gap-1">
          {soonItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)]/40 cursor-default select-none"
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              <span className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-wide text-[var(--text-secondary)]/30 bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-1.5 py-0.5">
                <Clock size={8} />
                logo
              </span>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  )
}
