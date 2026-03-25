import { NavLink, useLocation } from 'react-router-dom'
import { Mic, FileText, Map, BookOpen, Sparkles, FolderOpen, Users, CircleHelp, MessageSquare, Brain } from 'lucide-react'
import { useEffect } from 'react'
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
        `relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all duration-150 ${
          isActive
            ? 'text-[var(--accent-5)] font-semibold'
            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/60'
        }`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background: 'linear-gradient(90deg, rgba(56,171,228,0.14) 0%, rgba(56,171,228,0.06) 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80), 0 2px 8px rgba(56,171,228,0.10)',
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

export function Sidebar() {
  const { isOpen, close } = useSidebarStore()
  const location = useLocation()

  useEffect(() => {
    close()
  }, [location.pathname, close])

  const sidebarContent = (
    <aside
      className={[
        'fixed top-14 left-0 bottom-0 w-52 border-r border-[var(--border)]',
        'flex flex-col py-4 px-2.5 z-40 overflow-hidden',
        'transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
      style={{
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(18px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        boxShadow: '1px 0 0 rgba(56,171,228,0.12), 4px 0 24px rgba(56,171,228,0.06)',
      }}
    >
      {/* Decorative blobs */}
      <div
        className="pointer-events-none absolute -top-16 -left-16 w-48 h-48 rounded-full blob-drift"
        style={{
          background: 'radial-gradient(circle, rgba(56,171,228,0.28) 0%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-10 -right-10 w-36 h-36 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,196,204,0.20) 0%, transparent 70%)',
          filter: 'blur(16px)',
          animationDelay: '4s',
        }}
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
            style={{ background: 'linear-gradient(90deg, #38ABE4, #00C4CC)', opacity: 0.7 }}
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
