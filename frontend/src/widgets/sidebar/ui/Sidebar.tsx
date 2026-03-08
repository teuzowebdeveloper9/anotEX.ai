import { NavLink } from 'react-router-dom'
import { Mic, FileText, Map, BookOpen, Sparkles } from 'lucide-react'

interface NavItem {
  icon: React.ReactNode
  label: string
  to: string
}

const mainItems: NavItem[] = [
  { icon: <Mic size={15} />, label: 'Gravações', to: '/dashboard' },
  { icon: <FileText size={15} />, label: 'Transcrições', to: '/transcriptions' },
]

const studyItems: NavItem[] = [
  { icon: <Sparkles size={15} />, label: 'Resumos', to: '/summaries' },
  { icon: <Map size={15} />, label: 'Mapas Mentais', to: '/mindmaps' },
  { icon: <BookOpen size={15} />, label: 'Flashcards', to: '/flashcards' },
]

function SideNavItem({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={item.to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
          isActive
            ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
        }`
      }
    >
      {item.icon}
      {item.label}
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="fixed top-14 left-0 bottom-0 w-52 border-r border-[var(--border)] bg-[var(--bg-base)] flex flex-col py-4 px-2.5 z-40">
      <div className="flex flex-col gap-0.5">
        {mainItems.map((item) => (
          <SideNavItem key={item.label} item={item} />
        ))}
      </div>

      <div className="mt-6">
        <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)]">
          Estudo
        </p>
        <div className="flex flex-col gap-0.5">
          {studyItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  )
}
