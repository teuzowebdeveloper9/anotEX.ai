import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Users, Plus, Loader2, Crown, User2, Trash2,
  ExternalLink, FileText, UserMinus, Pencil
} from 'lucide-react'
import { useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { useGroupDetail } from '@/entities/study-group'
import { useAddGroupMember } from '@/features/groups/add-member/model/useAddGroupMember'
import { useUpdateGroup } from '@/features/groups/edit-group/model/useUpdateGroup'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import { supabase } from '@/shared/auth/supabase'

function EditGroupModal({
  groupId,
  currentName,
  currentDescription,
  onClose,
}: {
  groupId: string
  currentName: string
  currentDescription: string | null
  onClose: () => void
}) {
  const [name, setName] = useState(currentName)
  const [description, setDescription] = useState(currentDescription ?? '')
  const updateGroup = useUpdateGroup()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await updateGroup.mutateAsync({ groupId, name: name.trim(), description: description.trim() || undefined })
      toast.success('Grupo atualizado!')
      onClose()
    } catch {
      toast.error('Erro ao atualizar grupo.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Editar grupo</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <Input
            placeholder="Nome do grupo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            autoFocus
          />
          <Input
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={300}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={!name.trim() || updateGroup.isPending}>
              {updateGroup.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddMemberModal({ groupId, onClose }: { groupId: string; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const addMember = useAddGroupMember()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    try {
      await addMember.mutateAsync({ groupId, email: email.trim() })
      toast.success('Membro adicionado!')
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('already a member')) {
        toast.error('Usuário já é membro do grupo.')
      } else if (msg.includes('No user found')) {
        toast.error('Nenhum usuário encontrado com esse e-mail.')
      } else {
        toast.error('Erro ao adicionar membro.')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl">
        <div className="p-5 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Adicionar membro</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <Input
            type="email"
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancelar</Button>
            <Button type="submit" size="sm" disabled={!email.trim() || addMember.isPending}>
              {addMember.isPending ? <Loader2 size={13} className="animate-spin" /> : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading } = useGroupDetail(id!)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showEditGroup, setShowEditGroup] = useState(false)
  const queryClient = useQueryClient()

  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: s }) => setCurrentUserId(s.session?.user.id ?? null))
  }, [])

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(ENDPOINTS.groups.removeMember(id!, userId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-group', id] })
      toast.success('Membro removido.')
    },
    onError: () => toast.error('Erro ao remover membro.'),
  })

  const removeShare = useMutation({
    mutationFn: async (shareLinkId: string) => {
      await api.delete(ENDPOINTS.groups.removeShare(id!, shareLinkId))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-group', id] })
      toast.success('Compartilhamento removido.')
    },
    onError: () => toast.error('Erro ao remover compartilhamento.'),
  })

  const isOwner = data?.group.ownerId === currentUserId

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb size={500} color="#7C3AED" opacity={0.06} className="top-0 right-0 z-0" style={{ transform: 'translate(30%, -30%)' }} />

      <Navbar />
      <Sidebar />

      <main className="relative z-10 pt-14 md:pl-52">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-16">

          <Link
            to="/groups"
            className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-7 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Grupos de estudo
          </Link>

          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          )}

          {!isLoading && data && (
            <div className="flex flex-col gap-8">
              {/* Group header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl font-semibold gradient-text">{data.group.name}</h1>
                    {isOwner && <Crown size={14} className="text-amber-400" />}
                  </div>
                  {data.group.description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{data.group.description}</p>
                  )}
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowEditGroup(true)}>
                      <Pencil size={13} />
                      Editar
                    </Button>
                    <Button size="sm" onClick={() => setShowAddMember(true)}>
                      <Plus size={13} />
                      Membro
                    </Button>
                  </div>
                )}
              </div>

              {/* Members */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-[var(--text-secondary)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Membros ({data.members.length})
                  </h2>
                </div>
                <div className="flex flex-col gap-2">
                  {data.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] group"
                    >
                      <div className="h-8 w-8 rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] flex items-center justify-center shrink-0">
                        {member.role === 'owner'
                          ? <Crown size={12} className="text-amber-400" />
                          : <User2 size={12} className="text-[var(--text-secondary)]" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)] truncate">{member.userEmail}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {member.role === 'owner' ? 'Dono' : 'Membro'}
                        </p>
                      </div>
                      {(isOwner || member.userId === currentUserId) && member.role !== 'owner' && (
                        <button
                          onClick={() => removeMember.mutate(member.userId)}
                          className="opacity-0 group-hover:opacity-100 h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all"
                        >
                          <UserMinus size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Shared content */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={14} className="text-[var(--text-secondary)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Conteúdo compartilhado ({data.shares.length})
                  </h2>
                </div>

                {data.shares.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-12 text-center rounded-xl border border-dashed border-[var(--border)]">
                    <p className="text-sm text-[var(--text-secondary)]">Nenhum conteúdo compartilhado ainda</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Abra uma transcrição e compartilhe com este grupo
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {data.shares.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] group"
                    >
                      <div className="h-9 w-9 rounded-xl bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                        <FileText size={14} className="text-[var(--accent)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {share.resourceTitle ?? `Transcrição`}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Compartilhado em {new Date(share.sharedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <a
                          href={`/shared/${share.shareToken}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] transition-colors"
                        >
                          <ExternalLink size={13} />
                        </a>
                        {(isOwner || share.sharedBy === currentUserId) && (
                          <button
                            onClick={() => removeShare.mutate(share.sharedLinkId)}
                            className="opacity-0 group-hover:opacity-100 h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>

      {showAddMember && <AddMemberModal groupId={id!} onClose={() => setShowAddMember(false)} />}
      {showEditGroup && data && (
        <EditGroupModal
          groupId={id!}
          currentName={data.group.name}
          currentDescription={data.group.description}
          onClose={() => setShowEditGroup(false)}
        />
      )}
    </div>
  )
}
