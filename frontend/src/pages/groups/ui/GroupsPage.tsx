import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus, Loader2, Crown, User2, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { useGroupList } from '@/entities/study-group'
import { useCreateGroup } from '@/features/groups/create-group/model/useCreateGroup'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createGroup = useCreateGroup()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await createGroup.mutateAsync({ name: name.trim(), description: description.trim() || undefined })
      toast.success('Grupo criado!')
      onClose()
    } catch {
      toast.error('Erro ao criar grupo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Criar grupo de estudo</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <Input
            placeholder="Nome do grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <Input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={!name.trim() || createGroup.isPending}>
              {createGroup.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function GroupsPage() {
  const { data: groups, isLoading } = useGroupList()
  const [showCreate, setShowCreate] = useState(false)
  const queryClient = useQueryClient()

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(ENDPOINTS.groups.delete(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-groups'] })
      toast.success('Grupo removido.')
    },
    onError: () => toast.error('Erro ao remover grupo.'),
  })

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb size={500} color="#38ABE4" opacity={0.06} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />

      <Navbar />
      <Sidebar />

      <main className="relative z-10 pt-14 md:pl-52">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold gradient-text">Grupos de Estudo</h1>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Colabore e compartilhe conteúdo com colegas
              </p>
            </div>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus size={13} />
              Novo grupo
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="text-[var(--accent)] animate-spin" />
            </div>
          )}

          {!isLoading && groups?.length === 0 && (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <div className="h-14 w-14 rounded-2xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center">
                <Users size={22} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Nenhum grupo ainda</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Crie um grupo e convide seus colegas
                </p>
              </div>
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus size={13} />
                Criar primeiro grupo
              </Button>
            </div>
          )}

          {!isLoading && groups && groups.length > 0 && (
            <div className="flex flex-col gap-3">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/30 transition-colors group"
                >
                  <div className="h-10 w-10 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                    <Users size={16} className="text-[var(--accent)]" />
                  </div>

                  <Link to={`/groups/${group.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                        {group.name}
                      </p>
                      {group.role === 'owner' ? (
                        <Crown size={11} className="text-amber-400 shrink-0" />
                      ) : (
                        <User2 size={11} className="text-[var(--text-secondary)] shrink-0" />
                      )}
                    </div>
                    {group.description && (
                      <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">{group.description}</p>
                    )}
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'} · {group.shareCount} compartilhamentos
                    </p>
                  </Link>

                  {group.role === 'owner' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        if (confirm(`Remover o grupo "${group.name}"?`)) {
                          deleteGroup.mutate(group.id)
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}
