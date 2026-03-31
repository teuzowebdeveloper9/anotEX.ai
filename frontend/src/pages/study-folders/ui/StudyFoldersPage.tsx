import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Inbox, Plus, Sparkles, ChevronRight } from 'lucide-react'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useFolderList } from '@/entities/study-folder/model/useFolderList'
import { CreateFolderModal } from '@/features/study-folders/create-folder/ui/CreateFolderModal'

const RECOMMENDATIONS_THRESHOLD = 5

export function StudyFoldersPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const { data: folders, isLoading } = useFolderList()

  return (
    <div className="pen-shell">
      <GradientOrb size={500} color="#38ABE4" opacity={0.07} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />
      <Sidebar withTopBar={false} />

      <main className="relative z-10 md:pl-56">
        <div className="pen-content max-w-5xl pt-24 md:pt-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <FolderOpen size={16} className="text-[var(--accent)]" />
                </div>
                <h1 className="pen-page-title">Pastas de estudo</h1>
              </div>
              <p className="pen-page-subtitle">
                {folders?.length ?? 0} pasta{folders?.length !== 1 ? 's' : ''} criada{folders?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} size="sm" className="w-full sm:w-auto">
              <Plus size={14} />
              Nova Pasta
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-[88px] w-full" />
              ))
            ) : folders?.length === 0 ? (
              <div className="relative flex flex-col items-center gap-4 py-20 text-center overflow-hidden">
                <GradientOrb
                  size={280}
                  color="#38ABE4"
                  opacity={0.07}
                  className="top-1/2 left-1/2 z-0"
                  style={{ transform: 'translate(-50%, -50%)' }}
                />
                <div className="relative z-10">
                  <Inbox size={40} className="text-[var(--text-secondary)] mx-auto mb-4" />
                  <p className="text-[var(--text-primary)] font-medium">Nenhuma pasta ainda</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">
                    Crie uma pasta para organizar seus materiais por tema
                  </p>
                  <Button onClick={() => setShowCreateModal(true)} className="mt-5" size="sm">
                    <Plus size={14} />
                    Criar primeira pasta
                  </Button>
                </div>
              </div>
            ) : (
              folders?.map((folder) => {
                const progress = Math.min(folder.itemCount, RECOMMENDATIONS_THRESHOLD)
                const progressPercent = (progress / RECOMMENDATIONS_THRESHOLD) * 100

                return (
                  <Link key={folder.id} to={`/study-folders/${folder.id}`}>
                    <div className="pen-list-card group flex items-start gap-0 overflow-hidden rounded-[20px] transition-all duration-200 cursor-pointer hover:-translate-y-px hover:border-[var(--accent)]/40">
                      <div
                        className="w-0.5 self-stretch shrink-0"
                        style={{ background: 'linear-gradient(180deg, #38ABE4, #38ABE4)' }}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-4">
                        <div className="h-10 w-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
                          <FolderOpen size={18} className="text-[var(--accent)]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {folder.name}
                          </p>
                          {folder.description && (
                            <p className="text-xs text-[var(--text-secondary)] mt-0.5 line-clamp-1">
                              {folder.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-3">
                            <span className="text-xs text-[var(--text-secondary)]">
                              {folder.itemCount} material{folder.itemCount !== 1 ? 'is' : ''}
                            </span>

                            {folder.recommendationsUnlocked ? (
                              <span className="flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                                <Sparkles size={11} />
                                Recomendações disponíveis
                              </span>
                            ) : (
                              <div className="flex items-center gap-2 flex-1 max-w-[160px]">
                                <div className="flex-1 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${progressPercent}%`,
                                      background: 'var(--gradient-primary)',
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] text-[var(--text-secondary)] shrink-0">
                                  {progress}/{RECOMMENDATIONS_THRESHOLD}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          size={16}
                          className="mt-1 shrink-0 self-end text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent)] sm:self-auto"
                        />
                      </div>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </main>

      {showCreateModal && <CreateFolderModal onClose={() => setShowCreateModal(false)} />}
    </div>
  )
}
