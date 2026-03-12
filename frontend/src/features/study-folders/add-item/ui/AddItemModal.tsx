import { useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { useTranscriptionList } from '@/entities/transcription/model/useTranscriptionList'
import { useAddItem } from '../model/useAddItem'
import type { FolderItemType } from '@/entities/study-folder/model/study-folder.types'
import { FOLDER_ITEM_TYPE_LABELS } from '@/entities/study-folder/model/study-folder.types'

const ALL_ITEM_TYPES: FolderItemType[] = ['SUMMARY', 'TRANSCRIPTION', 'FLASHCARDS', 'MINDMAP']

interface AddItemModalProps {
  folderId: string
  onClose: () => void
}

export function AddItemModal({ folderId, onClose }: AddItemModalProps) {
  const [selectedTranscriptionId, setSelectedTranscriptionId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<FolderItemType | null>(null)

  const { data: transcriptions, isLoading } = useTranscriptionList()
  const { mutate, isPending } = useAddItem(onClose)

  const completed = transcriptions?.filter((t) => t.status === 'COMPLETED') ?? []

  const handleAdd = () => {
    if (!selectedTranscriptionId || !selectedType) return
    mutate({ folderId, transcriptionId: selectedTranscriptionId, itemType: selectedType })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl flex flex-col max-h-[80vh]">
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

        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          {/* Step 1: select transcription */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
              1. Selecione uma transcrição
            </p>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : completed.length === 0 ? (
              <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
                Nenhuma transcrição concluída ainda
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
                {completed.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTranscriptionId(t.id)}
                    className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                      selectedTranscriptionId === t.id
                        ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--text-primary)]'
                        : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span className="flex-1 truncate">{t.title ?? 'Transcrição sem título'}</span>
                    {selectedTranscriptionId === t.id && (
                      <Check size={14} className="text-[var(--accent)] shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: select item type */}
          {selectedTranscriptionId && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                2. Selecione o tipo de material
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ALL_ITEM_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      selectedType === type
                        ? 'border-[var(--accent)]/60 bg-[var(--accent)]/10 text-[var(--accent)]'
                        : 'border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--accent)]/30 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {FOLDER_ITEM_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-5 pt-0 shrink-0">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!selectedTranscriptionId || !selectedType || isPending}
            loading={isPending}
            onClick={handleAdd}
            className="flex-1"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
