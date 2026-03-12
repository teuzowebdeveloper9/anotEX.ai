import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FolderOpen, Inbox, Plus, Sparkles, ChevronRight } from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
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
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb
        size={500}
        color="#6366f1"
        opacity={0.07}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <GradientOrb
        size={350}
        color="#7C3AED"
        opacity={0.04}
        className="bottom-0 left-52 z-0"
        style={{ transform: 'translate(-20%, 30%)' }}
      />

      <Navbar />
      <Sidebar />

      <main className="relative z-10 pt-14 md:pl-56">
        <div className="max-w-3xl mx-auto px-8 pt-10 pb-12">
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                  <FolderOpen size={16} className="text-[var(--accent)]" />
                </div>
                <h1 className="text-2xl font-semibold gradient-text">Pastas de Estudo</h1>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {folders?.length ?? 0} pasta{folders?.length !== 1 ? 's' : ''} criada{folders?.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)} size="sm">
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
                  color="#6366f1"
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
                    <div className="group flex items-start gap-0 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] hover:-translate-y-px transition-all duration-200 cursor-pointer shadow-[var(--shadow-card)] overflow-hidden">
                      <div
                        className="w-0.5 self-stretch shrink-0"
                        style={{ background: 'linear-gradient(180deg, #6366f1, #7C3AED)' }}
                      />
                      <div className="flex items-start gap-4 p-4 flex-1 min-w-0">
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

                          <div className="mt-2 flex items-center gap-3">
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
                          className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors mt-1 shrink-0"
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
