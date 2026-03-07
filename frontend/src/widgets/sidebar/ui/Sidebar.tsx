import { NavLink } from 'react-router-dom'
import { Mic, FileText, Map, BookOpen, Sparkles } from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  to: string
}

const mainItems: NavItem[] = [
  { icon: <Mic size={16} />, label: 'Gravações', to: '/dashboard' },
  { icon: <FileText size={16} />, label: 'Transcrições', to: '/transcriptions' },
]

const studyItems: NavItem[] = [
  { icon: <Sparkles size={16} />, label: 'Resumos', to: '/summaries' },
  { icon: <Map size={16} />, label: 'Mapas Mentais', to: '/mindmaps' },
  { icon: <BookOpen size={16} />, label: 'Flashcards', to: '/flashcards' },
]

export function Sidebar() {
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-56 border-r border-[var(--border)] bg-[var(--bg-base)] flex flex-col py-4 px-3 z-40">
      <nav className="flex flex-col gap-1">
        {mainItems.map((item) => (
          <NavLink
            key={item.label}
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
          Material de Estudo
        </p>
        <nav className="flex flex-col gap-1">
          {studyItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
