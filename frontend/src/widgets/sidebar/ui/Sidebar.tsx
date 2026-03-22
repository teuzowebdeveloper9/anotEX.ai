import { NavLink, useLocation } from 'react-router-dom'
import { Mic, FileText, Map, BookOpen, Sparkles, FolderOpen, Users, CircleHelp, MessageSquare } from 'lucide-react'
import { useEffect } from 'react'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useSidebarStore } from '@/shared/hooks/useSidebarStore'

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
  { icon: <Sparkles size={15} />,      label: 'Resumos',          to: '/summaries'      },
  { icon: <Map size={15} />,           label: 'Mapas Mentais',    to: '/mindmaps'       },
  { icon: <BookOpen size={15} />,      label: 'Flashcards',       to: '/flashcards'     },
  { icon: <CircleHelp size={15} />,    label: 'Quiz',             to: '/quiz'           },
  { icon: <MessageSquare size={15} />, label: 'Conversas',        to: '/conversations'  },
  { icon: <FolderOpen size={15} />,    label: 'Pastas de Estudo', to: '/study-folders'  },
  { icon: <Users size={15} />,         label: 'Grupos de Estudo', to: '/groups'         },
]

function SideNavItem({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
          isActive
            ? 'bg-[var(--accent-bg)] text-[var(--accent)] font-medium'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
              style={{ background: 'var(--gradient-primary)' }}
            />
          )}
          <span
            style={
              isActive
                ? {
                    background: 'var(--gradient-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }
                : undefined
            }
          >
            {item.icon}
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar() {
  const { isOpen, close } = useSidebarStore()
  const location = useLocation()

  // Fecha o sidebar ao navegar no mobile
  useEffect(() => {
    close()
  }, [location.pathname, close])

  const sidebarContent = (
    <aside
      className={[
        'fixed top-14 left-0 bottom-0 w-52 border-r border-[var(--border)] bg-[var(--bg-base)]',
        'flex flex-col py-4 px-2.5 z-40 overflow-hidden',
        'transition-transform duration-300 ease-in-out',
        // Mobile: slide in/out; Desktop: always visible
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
    >
      <GradientOrb
        size={200}
        color="#7C3AED"
        opacity={0.06}
        className="top-0 left-0 z-0"
        style={{ transform: 'translate(-40%, -40%)' }}
      />

      <div className="relative z-10 flex flex-col gap-0.5">
        {mainItems.map((item) => (
          <SideNavItem key={item.label} item={item} onClick={close} />
        ))}
      </div>

      <div className="relative z-10 mt-6">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] flex items-center gap-1.5">
          <span
            className="inline-block h-px w-3 rounded"
            style={{ background: 'var(--gradient-primary)', opacity: 0.6 }}
          />
          Estudo
        </p>
        <div className="flex flex-col gap-0.5">
          {studyItems.map((item) => (
            <SideNavItem key={item.label} item={item} onClick={close} />
          ))}
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
        />
      )}
      {sidebarContent}
    </>
  )
}
