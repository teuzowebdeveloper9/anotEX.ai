import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Mic, FileText, Map, BookOpen, Sparkles, FolderOpen, Users, CircleHelp, MessageSquare, Brain, Menu, X, Timer } from 'lucide-react'
import { useEffect } from 'react'
import { useSidebarStore } from '@/shared/hooks/useSidebarStore'
import { brandLogo } from '@/shared/assets/brand-logo'

interface NavItem {
  icon: React.ReactNode
  label: string
  to: string
}

const mainItems: NavItem[] = [
  { icon: <LayoutDashboard size={15} />, label: 'Dashboard', to: '/dashboard' },
  { icon: <Mic size={15} />, label: 'Gravar aula', to: '/record' },
  { icon: <FileText size={15} />, label: 'Transcrições', to: '/transcriptions' },
]

const studyItems: NavItem[] = [
  { icon: <Sparkles size={15} />,      label: 'Resumos',          to: '/summaries'      },
  { icon: <Map size={15} />,           label: 'Mapas Mentais',    to: '/mindmaps'       },
  { icon: <BookOpen size={15} />,      label: 'Flashcards',       to: '/flashcards'     },
  { icon: <Brain size={15} />,         label: 'Revisão',          to: '/review'         },
  { icon: <Timer size={15} />,         label: 'Pomodoro',         to: '/pomodoro'       },
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
        `relative flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-all duration-150 ${
          isActive
            ? 'bg-[rgba(37,99,235,0.08)] text-[var(--brand-primary)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:bg-[rgba(37,99,235,0.03)] hover:text-[var(--text-primary)]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={isActive ? 'text-[var(--brand-primary)]' : ''}>
            {item.icon}
          </span>
          {item.label}
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ withTopBar = true }: { withTopBar?: boolean }) {
  const { isOpen, open, close } = useSidebarStore()
  const location = useLocation()

  useEffect(() => {
    close()
  }, [location.pathname, close])

  const sidebarContent = (
    <aside
      className={[
        'fixed bottom-0 left-0 z-40 flex w-[min(18rem,calc(100vw-1rem))] max-w-[18rem] flex-col overflow-y-auto border-r border-[rgba(25,28,31,0.06)] px-3 py-4 md:w-[11rem] md:max-w-none md:py-5',
        'transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        withTopBar ? 'top-14' : 'top-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
      style={{
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      <div className="mb-4 flex items-center justify-between px-2 pb-4">
        <img src={brandLogo} alt="anotEX.ai" className="h-[22px] w-auto" />
        <button
          type="button"
          onClick={close}
          aria-label="Fechar menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-[rgba(37,99,235,0.08)] hover:text-[var(--brand-primary)] md:hidden"
        >
          <X size={17} />
        </button>
      </div>

      <div className="relative z-10 flex flex-col gap-1">
        {mainItems.map((item) => (
          <SideNavItem key={item.label} item={item} onClick={close} />
        ))}
      </div>

      <div className="relative z-10 mt-6">
        <div className="flex flex-col gap-1">
          {studyItems.map((item) => (
            <SideNavItem key={item.label} item={item} onClick={close} />
          ))}
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {!withTopBar && !isOpen && (
        <button
          type="button"
          onClick={open}
          aria-label="Abrir menu"
          className="fixed left-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-soft)] bg-[rgba(255,255,255,0.88)] text-[var(--text-secondary)] shadow-[var(--shadow-card)] backdrop-blur-md transition-colors hover:text-[var(--brand-primary)] md:hidden"
        >
          <Menu size={18} />
        </button>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}
      {sidebarContent}
    </>
  )
}
