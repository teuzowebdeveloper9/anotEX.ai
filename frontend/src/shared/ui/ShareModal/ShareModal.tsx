import { useState, useEffect } from 'react'
import { X, Link2, Globe, Lock, Users, Check, Copy, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useShareLinkByResource, useShareLinks } from '@/entities/share-link'
import { useCreateShareLink } from '@/features/sharing/create-share-link/model/useCreateShareLink'
import { useToggleVisibility } from '@/features/sharing/toggle-visibility/model/useToggleVisibility'
import { useGroupList } from '@/entities/study-group'
import { useShareToGroup } from '@/features/groups/share-to-group/model/useShareToGroup'
import type { ResourceType } from '@/entities/share-link'

interface ShareModalProps {
  resourceType: ResourceType
  resourceId: string
  title: string
  onClose: () => void
}

export function ShareModal({ resourceType, resourceId, title, onClose }: ShareModalProps) {
  const { refetch } = useShareLinks()
  const existing = useShareLinkByResource(resourceType, resourceId)
  const [shareLink, setShareLink] = useState(existing)
  const [copied, setCopied] = useState(false)
  const [shareGroupId, setShareGroupId] = useState<string | null>(null)

  const createShareLink = useCreateShareLink()
  const toggleVisibility = useToggleVisibility()
  const { data: groups } = useGroupList()
  const shareToGroup = useShareToGroup()

  useEffect(() => {
    setShareLink(existing)
  }, [existing])

  const publicUrl = shareLink
    ? `${window.location.origin}/shared/${shareLink.token}`
    : null

  const handleInit = async () => {
    if (shareLink) return
    const result = await createShareLink.mutateAsync({ resourceType, resourceId })
    await refetch()
    setShareLink(result)
  }

  const handleToggle = async () => {
    if (!shareLink) return
    const updated = await toggleVisibility.mutateAsync({
      id: shareLink.id,
      isPublic: !shareLink.isPublic,
    })
    setShareLink(updated)
    toast.success(updated.isPublic ? 'Link público ativado' : 'Link tornado privado')
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
    setShareGroupId(groupId)
    try {
      await shareToGroup.mutateAsync({ groupId, shareLinkId: shareLink.id })
      toast.success('Compartilhado com o grupo!')
    } catch {
      toast.error('Erro ao compartilhar com o grupo.')
    } finally {
      setShareGroupId(null)
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

          {/* Toggle público/privado */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
            <div className="flex items-center gap-3">
              {shareLink?.isPublic ? (
                <Globe size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <Lock size={16} className="text-[var(--text-secondary)] shrink-0" />
              )}
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {shareLink?.isPublic ? 'Link público' : 'Privado'}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {shareLink?.isPublic
                    ? 'Qualquer pessoa com o link pode ver'
                    : 'Somente você pode ver'}
                </p>
              </div>
            </div>
            <button
              onClick={shareLink ? handleToggle : handleInit}
              disabled={createShareLink.isPending || toggleVisibility.isPending}
              className={[
                'relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
                shareLink?.isPublic ? 'bg-emerald-500' : 'bg-[var(--border)]',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200',
                  shareLink?.isPublic ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </button>
          </div>

          {/* Link público */}
          {shareLink?.isPublic && publicUrl && (
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
          {groups && groups.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Users size={13} className="text-[var(--text-secondary)]" />
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
                  Compartilhar com grupo
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {groups.map((group) => (
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
                    <button
                      onClick={() => handleShareToGroup(group.id)}
                      disabled={(shareToGroup.isPending && shareGroupId === group.id) || !shareLink}
                      title={!shareLink ? 'Ative o link público primeiro' : undefined}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent-bg)] text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50"
                    >
                      {shareToGroup.isPending && shareGroupId === group.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : (
                        <Plus size={11} />
                      )}
                      Compartilhar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {groups?.length === 0 && (
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
