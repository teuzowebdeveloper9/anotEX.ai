import { useState, useEffect } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { X, Link2, Globe, Lock, Users, Check, Copy, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useShareLinkByResource, useShareLinks } from '@/entities/share-link'
import { useCreateShareLink } from '@/features/sharing/create-share-link/model/useCreateShareLink'
import { useToggleVisibility } from '@/features/sharing/toggle-visibility/model/useToggleVisibility'
import { useGroupList } from '@/entities/study-group'
import { useShareToGroup } from '@/features/groups/share-to-group/model/useShareToGroup'
import type { ResourceType, ShareLink } from '@/entities/share-link'

interface ShareModalProps {
  resourceType: ResourceType
  resourceId: string
  title: string
  onClose: () => void
}

export function ShareModal({ resourceType, resourceId, title, onClose }: ShareModalProps) {
  const { refetch, isLoading: linksLoading, isFetching: linksFetching } = useShareLinks()
  const existing = useShareLinkByResource(resourceType, resourceId)

  // Sync from server only after the fetch (including background refetch) completes
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    // Wait for both loading and fetching (background refetch) to finish before syncing
    if (!synced && !linksLoading && !linksFetching) {
      setShareLink(existing ?? null)
      setSynced(true)
    }
  }, [existing, linksLoading, linksFetching, synced])

  const [copied, setCopied] = useState(false)
  const [sharedGroups, setSharedGroups] = useState<Set<string>>(new Set())

  const createShareLink = useCreateShareLink()
  const toggleVisibility = useToggleVisibility()
  const { data: groups } = useGroupList()
  const shareToGroup = useShareToGroup()

  const isPublic = shareLink?.isPublic ?? false
  const publicUrl = shareLink
    ? `${window.location.origin}/shared/${shareLink.token}`
    : null

  const isPending = createShareLink.isPending || toggleVisibility.isPending

  const handleToggle = async (checked: boolean) => {
    if (!shareLink) {
      // First time: create the link, then immediately set its visibility
      const created = await createShareLink.mutateAsync({ resourceType, resourceId })
      if (checked) {
        const updated = await toggleVisibility.mutateAsync({ id: created.id, isPublic: true })
        setShareLink(updated)
      } else {
        setShareLink(created)
      }
      refetch()
      return
    }
    const updated = await toggleVisibility.mutateAsync({ id: shareLink.id, isPublic: checked })
    setShareLink(updated)
    refetch()
    toast.success(checked ? 'Link público ativado' : 'Link tornado privado')
  }

  const handleCopy = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copiado!')
  }

  const handleShareToGroup = async (groupId: string) => {
    if (!shareLink) return

    let link = shareLink
    if (!link.isPublic) {
      const updated = await toggleVisibility.mutateAsync({ id: link.id, isPublic: true })
      setShareLink(updated)
      refetch()
      link = updated
    }

    try {
      await shareToGroup.mutateAsync({ groupId, shareLinkId: link.id })
      setSharedGroups((prev) => new Set(prev).add(groupId))
      toast.success('Compartilhado com o grupo!')
    } catch (err: unknown) {
      const msg = String(err)
      if (msg.includes('409') || msg.includes('already') || msg.includes('conflict')) {
        toast.info('Já compartilhado neste grupo.')
        setSharedGroups((prev) => new Set(prev).add(groupId))
      } else {
        toast.error('Erro ao compartilhar com o grupo.')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent)]/20 flex items-center justify-center">
              <Link2 size={14} className="text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Compartilhar</p>
              <p className="text-xs text-[var(--text-secondary)] truncate max-w-[220px]">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Loading state */}
          {!synced && (linksLoading || linksFetching) && (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={18} className="text-[var(--accent)] animate-spin" />
            </div>
          )}

          {/* Toggle público/privado */}
          {synced && (
            <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe size={16} className="text-emerald-400 shrink-0" />
                ) : (
                  <Lock size={16} className="text-[var(--text-secondary)] shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {isPublic ? 'Link público' : 'Privado'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isPublic
                      ? 'Qualquer pessoa com o link pode ver'
                      : 'Somente você pode ver'}
                  </p>
                </div>
              </div>

              {/* Radix UI Switch — zero problema de CSS */}
              <Switch.Root
                checked={isPublic}
                onCheckedChange={handleToggle}
                disabled={isPending}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-[var(--border)]"
              >
                <Switch.Thumb className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0" />
              </Switch.Root>
            </div>
          )}

          {/* Link público — só mostra quando ativo */}
          {synced && isPublic && publicUrl && (
            <div className="flex gap-2">
              <div className="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-base)]">
                <p className="text-xs text-[var(--text-secondary)] truncate font-mono">{publicUrl}</p>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--accent-bg)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          )}

          {/* Compartilhar com grupos */}
          {synced && groups && groups.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-[var(--text-secondary)]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Compartilhar com grupo
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {groups.map((group) => {
                  const alreadyShared = sharedGroups.has(group.id)
                  const isSharing = shareToGroup.isPending && !alreadyShared
                  return (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]"
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--text-primary)]">{group.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          {group.memberCount} {group.memberCount === 1 ? 'membro' : 'membros'}
                        </p>
                      </div>
                      {alreadyShared ? (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                          <Check size={11} />
                          Compartilhado
                        </span>
                      ) : (
                        <button
                          onClick={() => handleShareToGroup(group.id)}
                          disabled={isSharing || isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
                        >
                          {isSharing ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Plus size={11} />
                          )}
                          Compartilhar
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {synced && groups?.length === 0 && (
            <p className="text-xs text-[var(--text-secondary)] text-center py-2">
              Você não tem grupos de estudo.{' '}
              <a href="/groups" className="text-[var(--accent)] hover:underline">Criar um grupo</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
