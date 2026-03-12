import { useState } from 'react'
import { X, Plus, Check, ChevronDown, Sparkles, FileText, BookOpen, Map } from 'lucide-react'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { useTranscriptionList } from '@/entities/transcription/model/useTranscriptionList'
import { useAddItem } from '../model/useAddItem'
import type { FolderItemType, StudyFolderItem } from '@/entities/study-folder/model/study-folder.types'

const PAGE_SIZE = 10

const TABS: { type: FolderItemType; label: string; icon: React.ElementType }[] = [
  { type: 'SUMMARY',       label: 'Resumos',       icon: Sparkles  },
  { type: 'TRANSCRIPTION', label: 'Transcrições',  icon: FileText  },
  { type: 'FLASHCARDS',    label: 'Flashcards',    icon: BookOpen  },
  { type: 'MINDMAP',       label: 'Mapas Mentais', icon: Map       },
]

interface AddItemModalProps {
  folderId: string
  existingItems: StudyFolderItem[]
  onClose: () => void
}

export function AddItemModal({ folderId, existingItems, onClose }: AddItemModalProps) {
  const [activeTab, setActiveTab] = useState<FolderItemType>('SUMMARY')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [added, setAdded] = useState<Set<string>>(new Set())

  const { data: transcriptions, isLoading } = useTranscriptionList()
  const { mutate, isPending, variables } = useAddItem(() => {
    if (variables) {
      setAdded((prev) => new Set(prev).add(`${variables.transcriptionId}__${variables.itemType}`))
    }
  })

  const completed = transcriptions?.filter((t) => t.status === 'COMPLETED') ?? []
  const visible = completed.slice(0, visibleCount)
  const hasMore = completed.length > visibleCount

  const isAlreadyIn = (transcriptionId: string, itemType: FolderItemType) =>
    existingItems.some(
      (i) => i.transcriptionId === transcriptionId && i.itemType === itemType,
    ) || added.has(`${transcriptionId}__${itemType}`)

  const isAdding = (transcriptionId: string) =>
    isPending &&
    variables?.transcriptionId === transcriptionId &&
    variables?.itemType === activeTab

  const handleTabChange = (type: FolderItemType) => {
    setActiveTab(type)
    setVisibleCount(PAGE_SIZE)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl flex flex-col max-h-[80vh]">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
              <Plus size={16} className="text-[var(--accent)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              Adicionar Material
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 p-1.5 border-b border-[var(--border)] bg-[var(--bg-base)]/40 shrink-0">
          {TABS.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              onClick={() => handleTabChange(type)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                activeTab === type
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-[var(--shadow-card)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          ) : completed.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">
              Nenhuma transcrição concluída ainda
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {visible.map((t) => {
                const alreadyIn = isAlreadyIn(t.id, activeTab)
                const adding = isAdding(t.id)
                const date = new Date(t.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })

                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                      alreadyIn
                        ? 'border-[var(--accent)]/20 bg-[var(--accent)]/5 opacity-60'
                        : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[var(--text-primary)] truncate">
                        {t.title ?? 'Transcrição sem título'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{date}</p>
                    </div>

                    <button
                      disabled={alreadyIn || isPending}
                      onClick={() =>
                        mutate({ folderId, transcriptionId: t.id, itemType: activeTab })
                      }
                      className={`shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-all ${
                        alreadyIn
                          ? 'text-[var(--accent)] cursor-default'
                          : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 border border-[var(--border)] hover:border-[var(--accent)]/40'
                      }`}
                    >
                      {adding ? (
                        <span className="h-3 w-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                      ) : alreadyIn ? (
                        <Check size={13} />
                      ) : (
                        <Plus size={13} />
                      )}
                    </button>
                  </div>
                )
              })}

              {hasMore && (
                <button
                  onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                  className="flex items-center justify-center gap-1.5 w-full py-2.5 mt-1 rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]/30 transition-colors"
                >
                  <ChevronDown size={13} />
                  Mostrar mais ({completed.length - visibleCount} restantes)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
