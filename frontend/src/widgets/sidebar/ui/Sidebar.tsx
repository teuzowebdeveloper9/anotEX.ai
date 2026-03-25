import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Mic, FileText, Map, BookOpen, Sparkles, FolderOpen, Users, CircleHelp, MessageSquare, Brain } from 'lucide-react'
import { useEffect } from 'react'
import { useSidebarStore } from '@/shared/hooks/useSidebarStore'
import logoAnotex from '@/shared/assets/logo-anotex.png'

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
        `relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
          isActive
            ? 'text-[var(--accent-5)] font-semibold'
            : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
        }`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background: 'linear-gradient(90deg, rgba(56,171,228,0.14) 0%, rgba(0,196,204,0.06) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 6px 18px rgba(56,171,228,0.12)',
              border: '1px solid rgba(56,171,228,0.22)',
            }
          : undefined
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
              style={{ background: 'linear-gradient(180deg, #7AD5F5, #1E6CDC)' }}
            />
          )}
          <span
            style={
              isActive
                ? {
                    background: 'linear-gradient(135deg, #38ABE4, #1E6CDC)',
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

export function Sidebar({ withTopBar = true }: { withTopBar?: boolean }) {
  const { isOpen, close } = useSidebarStore()
  const location = useLocation()

  useEffect(() => {
    close()
  }, [location.pathname, close])

  const sidebarContent = (
    <aside
      className={[
        'fixed bottom-0 left-0 z-40 flex w-56 flex-col overflow-hidden border-r border-[var(--border)] px-3 py-5',
        'transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        withTopBar ? 'top-14' : 'top-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxShadow: '1px 0 0 rgba(56,171,228,0.1)',
      }}
    >
      <div className="mb-4 px-2 pb-4">
        <img src={logoAnotex} alt="anotEX.ai" className="h-[30px] w-auto" />
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
