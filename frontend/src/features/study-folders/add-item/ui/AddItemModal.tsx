import { useState } from 'react'
import { X, Plus, ChevronDown, Sparkles, FileText, BookOpen, Map, Trash2 } from 'lucide-react'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { useTranscriptionList } from '@/entities/transcription/model/useTranscriptionList'
import { useAddItem } from '../model/useAddItem'
import { useRemoveItem } from '../../remove-item/model/useRemoveItem'
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
  // track items added in this session (transcriptionId__itemType → true)
  const [sessionAdded, setSessionAdded] = useState<Set<string>>(new Set())
  // track items removed in this session (itemId → true)
  const [sessionRemoved, setSessionRemoved] = useState<Set<string>>(new Set())

  const { data: transcriptions, isLoading } = useTranscriptionList()
  const { mutate: addItem, isPending: isAdding, variables: addVars } = useAddItem(() => {
    if (addVars) {
      setSessionAdded((prev) => new Set(prev).add(`${addVars.transcriptionId}__${addVars.itemType}`))
    }
  })
  const { mutate: removeItem, isPending: isRemoving, variables: removeVars } = useRemoveItem(folderId)

  const completed = transcriptions?.filter((t) => t.status === 'COMPLETED') ?? []
  const visible = completed.slice(0, visibleCount)
  const hasMore = completed.length > visibleCount

  const getExistingItem = (transcriptionId: string, itemType: FolderItemType): StudyFolderItem | undefined =>
    existingItems.find((i) => i.transcriptionId === transcriptionId && i.itemType === itemType)

  const isInFolder = (transcriptionId: string, itemType: FolderItemType): boolean => {
    const existing = getExistingItem(transcriptionId, itemType)
    if (existing && !sessionRemoved.has(existing.id)) return true
    return sessionAdded.has(`${transcriptionId}__${itemType}`)
  }

  const handleRemove = (transcriptionId: string, itemType: FolderItemType) => {
    const existing = getExistingItem(transcriptionId, itemType)
    if (!existing) return
    setSessionRemoved((prev) => new Set(prev).add(existing.id))
    removeItem(existing.id)
  }

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
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
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
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
            </div>
          ) : completed.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">
              Nenhuma transcrição concluída ainda
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {visible.map((t) => {
                const inFolder = isInFolder(t.id, activeTab)
                const addingThis = isAdding && addVars?.transcriptionId === t.id && addVars?.itemType === activeTab
                const existingItem = getExistingItem(t.id, activeTab)
                const removingThis = isRemoving && existingItem && removeVars === existingItem.id
                const date = new Date(t.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })

                return (
                  <div
                    key={t.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all ${
                      inFolder
                        ? 'border-red-500/30 bg-red-500/8'
                        : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/30 hover:bg-[var(--bg-elevated)]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${inFolder ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                        {t.title ?? 'Transcrição sem título'}
                      </p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{date}</p>
                    </div>

                    {inFolder ? (
                      <button
                        disabled={!!removingThis}
                        onClick={() => handleRemove(t.id, activeTab)}
                        className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center border border-red-500/40 text-red-400 hover:bg-red-500/20 transition-all"
                        title="Remover da pasta"
                      >
                        {removingThis ? (
                          <span className="h-3 w-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    ) : (
                      <button
                        disabled={isAdding}
                        onClick={() => addItem({ folderId, transcriptionId: t.id, itemType: activeTab })}
                        className="shrink-0 h-7 w-7 rounded-lg flex items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/40 transition-all"
                        title="Adicionar à pasta"
                      >
                        {addingThis ? (
                          <span className="h-3 w-3 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
                        ) : (
                          <Plus size={13} />
                        )}
                      </button>
                    )}
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
