import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FolderOpen,
  Plus,
  Trash2,
  Sparkles,
  X,
  Play,
  Youtube,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useFolder } from '@/entities/study-folder/model/useFolder'
import { useAddItem } from '@/features/study-folders/add-item/model/useAddItem'
import { useRemoveItem } from '@/features/study-folders/remove-item/model/useRemoveItem'
import { useDeleteFolder } from '@/features/study-folders/delete-folder/model/useDeleteFolder'
import { AddItemModal } from '@/features/study-folders/add-item/ui/AddItemModal'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import type { YouTubeVideo } from '@/entities/study-folder/model/study-folder.types'
import type { StudyFolderItem } from '@/entities/study-folder/model/study-folder.types'
import { FOLDER_ITEM_TYPE_LABELS, FOLDER_ITEM_TYPE_TAB } from '@/entities/study-folder/model/study-folder.types'

const RECOMMENDATIONS_THRESHOLD = 5

const ITEM_TYPE_COLORS: Record<string, string> = {
  SUMMARY: 'text-purple-400 bg-purple-400/10',
  TRANSCRIPTION: 'text-blue-400 bg-blue-400/10',
  FLASHCARDS: 'text-pink-400 bg-pink-400/10',
  MINDMAP: 'text-cyan-400 bg-cyan-400/10',
}

function FolderItemRow({ item, onRemove }: { item: StudyFolderItem; onRemove: () => void }) {
  const tab = FOLDER_ITEM_TYPE_TAB[item.itemType]

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] group hover:border-[var(--accent)]/30 transition-all">
      <span
        className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${ITEM_TYPE_COLORS[item.itemType] ?? 'text-[var(--accent)] bg-[var(--accent)]/10'}`}
      >
        {FOLDER_ITEM_TYPE_LABELS[item.itemType]}
      </span>
      <Link
        to={`/transcription/${item.transcriptionId}?tab=${tab}`}
        className="flex-1 text-sm text-[var(--text-primary)] truncate hover:text-[var(--accent)] transition-colors"
      >
        {item.title}
      </Link>
      <button
        onClick={onRemove}
        className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function VideoCard({
  video,
  onPlay,
}: {
  video: YouTubeVideo
  onPlay: (video: YouTubeVideo) => void
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden group hover:border-[var(--accent)]/40 transition-all duration-200">
      <div
        className="relative aspect-video bg-[var(--bg-base)] cursor-pointer overflow-hidden"
        onClick={() => onPlay(video)}
      >
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-elevated)]">
            <Youtube size={32} className="text-[var(--text-secondary)]" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play size={20} className="text-white fill-white" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-snug">
          {video.title}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1 truncate">{video.channelTitle}</p>
      </div>
    </div>
  )
}

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: YouTubeVideo
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 min-w-0">
            <Youtube size={16} className="text-red-500 shrink-0" />
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{video.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors ml-3 shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-[var(--text-secondary)]">{video.channelTitle}</p>
          <a
            href={`https://www.youtube.com/watch?v=${video.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[var(--accent)] hover:underline"
          >
            Abrir no YouTube
          </a>
        </div>
      </div>
    </div>
  )
}

export function StudyFolderPage() {
  const { id } = useParams<{ id: string }>()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [recommendations, setRecommendations] = useState<YouTubeVideo[] | null>(null)
  const [loadingRecs, setLoadingRecs] = useState(false)

  const { data, isLoading } = useFolder(id!)
  const { mutate: removeItem } = useRemoveItem(id!)
  const { mutate: deleteFolder, isPending: deletingFolder } = useDeleteFolder()

  const folder = data?.folder
  const items = data?.items ?? []

  const itemsLeft = RECOMMENDATIONS_THRESHOLD - (folder?.itemCount ?? 0)
  const progressPercent = Math.min(((folder?.itemCount ?? 0) / RECOMMENDATIONS_THRESHOLD) * 100, 100)

  const handleLoadRecommendations = async () => {
    setLoadingRecs(true)
    try {
      const { data: videos } = await api.get<YouTubeVideo[]>(
        ENDPOINTS.studyFolders.recommendations(id!),
      )
      setRecommendations(videos)
    } catch {
      // handled silently — toast shown by interceptor if needed
    } finally {
      setLoadingRecs(false)
    }
  }

  const handleDeleteFolder = () => {
    if (!folder) return
    if (window.confirm(`Excluir a pasta "${folder.name}"? Os materiais não serão apagados.`)) {
      deleteFolder(folder.id)
    }
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-base)]">
        <Navbar />
        <Sidebar />
        <main className="relative z-10 pt-14 md:pl-56">
          <div className="max-w-3xl mx-auto px-8 pt-10">
            <Skeleton className="h-8 w-64 mb-3" />
            <Skeleton className="h-4 w-96 mb-8" />
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-base)]">
        <Navbar />
        <Sidebar />
        <main className="relative z-10 pt-14 md:pl-56">
          <div className="max-w-3xl mx-auto px-8 pt-10">
            <p className="text-[var(--text-secondary)]">Pasta não encontrada.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-base)] overflow-hidden">
      <GradientOrb
        size={450}
        color="#6366f1"
        opacity={0.07}
        className="top-0 right-0 z-0"
        style={{ transform: 'translate(30%, -30%)' }}
      />

      <Navbar />
      <Sidebar />

      <main className="relative z-10 pt-14 md:pl-56">
        <div className="max-w-3xl mx-auto px-8 pt-8 pb-12">
          {/* Breadcrumb */}
          <Link
            to="/study-folders"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6"
          >
            <ArrowLeft size={12} />
            Pastas de Estudo
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-start gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center shrink-0 mt-0.5">
                <FolderOpen size={20} className="text-[var(--accent)]" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold text-[var(--text-primary)] leading-tight">
                  {folder.name}
                </h1>
                {folder.description && (
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{folder.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleDeleteFolder}
              disabled={deletingFolder}
              className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors mt-1 ml-4 shrink-0"
              title="Excluir pasta"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Progress bar */}
          {!folder.recommendationsUnlocked && (
            <div className="mt-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[var(--text-secondary)]">
                  {itemsLeft > 0
                    ? `Adicione mais ${itemsLeft} material${itemsLeft !== 1 ? 'is' : ''} para desbloquear as recomendações`
                    : 'Recomendações quase disponíveis'}
                </span>
                <span className="text-xs font-medium text-[var(--text-primary)]">
                  {folder.itemCount}/{RECOMMENDATIONS_THRESHOLD}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPercent}%`,
                    background: 'var(--gradient-primary)',
                  }}
                />
              </div>
            </div>
          )}

          {/* Materials section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Materiais ({items.length})
              </h2>
              <Button size="sm" variant="outline" onClick={() => setShowAddModal(true)}>
                <Plus size={13} />
                Adicionar
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center rounded-xl border border-dashed border-[var(--border)]">
                <FolderOpen size={32} className="text-[var(--text-secondary)]/40" />
                <p className="text-sm text-[var(--text-secondary)]">Nenhum material ainda</p>
                <Button size="sm" variant="ghost" onClick={() => setShowAddModal(true)}>
                  <Plus size={13} />
                  Adicionar material
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <FolderItemRow
                    key={item.id}
                    item={item}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recommendations section */}
          {folder.recommendationsUnlocked && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[var(--accent)]" />
                  <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                    Vídeos Recomendados
                  </h2>
                </div>
                {!recommendations && !loadingRecs && (
                  <Button size="sm" onClick={handleLoadRecommendations}>
                    <Sparkles size={13} />
                    Buscar Recomendações
                  </Button>
                )}
                {recommendations && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleLoadRecommendations}
                    loading={loadingRecs}
                  >
                    Atualizar
                  </Button>
                )}
              </div>

              {loadingRecs && (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Loader2 size={28} className="text-[var(--accent)] animate-spin" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Analisando seus materiais e buscando vídeos...
                  </p>
                </div>
              )}

              {!loadingRecs && recommendations && recommendations.length === 0 && (
                <p className="text-sm text-[var(--text-secondary)] text-center py-8">
                  Nenhum vídeo encontrado para este tema.
                </p>
              )}

              {!loadingRecs && recommendations && recommendations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendations.map((video) => (
                    <VideoCard key={video.videoId} video={video} onPlay={setSelectedVideo} />
                  ))}
                </div>
              )}

              {!loadingRecs && !recommendations && (
                <div className="flex flex-col items-center gap-2 py-10 text-center rounded-xl border border-dashed border-[var(--border)]">
                  <Sparkles size={32} className="text-[var(--accent)]/40" />
                  <p className="text-sm text-[var(--text-secondary)]">
                    Clique em &ldquo;Buscar Recomendações&rdquo; para ver vídeos relacionados ao tema desta pasta
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {showAddModal && (
        <AddItemModal folderId={id!} onClose={() => setShowAddModal(false)} />
      )}

      {selectedVideo && (
        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  )
}
