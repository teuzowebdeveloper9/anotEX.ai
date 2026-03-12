import { useState } from 'react'
import { X, FolderPlus } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { useCreateFolder } from '../model/useCreateFolder'

interface CreateFolderModalProps {
  onClose: () => void
}

export function CreateFolderModal({ onClose }: CreateFolderModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const { mutate, isPending } = useCreateFolder(onClose)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    mutate({ name: name.trim(), description: description.trim() || undefined })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
              <FolderPlus size={16} className="text-[var(--accent)]" />
            </div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Nova Pasta</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Nome *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Cálculo Diferencial"
              maxLength={100}
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]/60 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sobre o que é essa pasta?"
              maxLength={300}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]/60 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isPending}
              loading={isPending}
              className="flex-1"
            >
              Criar Pasta
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
