import { useState, useRef, useEffect } from 'react'
import { FolderPlus, Loader2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFolderList } from '@/entities/study-folder/model/useFolderList'
import { useAddItem } from '@/features/study-folders/add-item/model/useAddItem'
import type { FolderItemType } from '@/entities/study-folder/model/study-folder.types'

interface SaveToFolderButtonProps {
  transcriptionId: string
  itemType: FolderItemType
}

export function SaveToFolderButton({ transcriptionId, itemType }: SaveToFolderButtonProps) {
  const [open, setOpen] = useState(false)
  const [addedFolders, setAddedFolders] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)

  const { data: folders, isLoading } = useFolderList()
  const { mutate, isPending, variables } = useAddItem(() => {
    if (variables?.folderId) {
      setAddedFolders((prev) => new Set(prev).add(variables.folderId))
    }
  })

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const addingFolderId = isPending ? variables?.folderId : null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v) }}
        title="Salvar em pasta"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border)] transition-all duration-150"
      >
        <FolderPlus size={13} />
        <span className="hidden sm:inline">Salvar em pasta</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 overflow-hidden">
          <p className="px-3 pt-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
            Escolher pasta
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={14} className="animate-spin text-[var(--text-secondary)]" />
            </div>
          ) : !folders || folders.length === 0 ? (
            <div className="px-3 pb-3">
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                Nenhuma pasta ainda.
              </p>
              <Link
                to="/study-folders"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
              >
                <Plus size={11} />
                Criar uma pasta
              </Link>
            </div>
          ) : (
            <div className="flex flex-col pb-1.5">
              {folders.map((folder) => {
                const isAdding = addingFolderId === folder.id
                const wasAdded = addedFolders.has(folder.id)
                return (
                  <button
                    key={folder.id}
                    disabled={isPending || wasAdded}
                    onClick={() =>
                      mutate({ folderId: folder.id, transcriptionId, itemType })
                    }
                    className={`flex items-center gap-2.5 px-3 py-2 text-xs transition-colors text-left disabled:cursor-not-allowed ${
                      wasAdded
                        ? 'text-[var(--accent)] opacity-60'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    {isAdding ? (
                      <Loader2 size={12} className="animate-spin shrink-0 text-[var(--accent)]" />
                    ) : (
                      <FolderPlus
                        size={12}
                        className={`shrink-0 ${wasAdded ? 'text-[var(--accent)]' : 'text-[var(--accent)]/60'}`}
                      />
                    )}
                    <span className="truncate flex-1">{folder.name}</span>
                    {wasAdded && (
                      <span className="text-[10px] text-[var(--accent)] shrink-0">Salvo</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
