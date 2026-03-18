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
  FileText,
  BookOpen,
  Map,
  Wand2,
  Share2,
} from 'lucide-react'
import { Navbar } from '@/widgets/navbar/ui/Navbar'
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar'
import { Button } from '@/shared/ui/Button/Button'
import { Skeleton } from '@/shared/ui/Skeleton/Skeleton'
import { GradientOrb } from '@/shared/ui/decorative/GradientOrb'
import { useFolder } from '@/entities/study-folder/model/useFolder'
import { useRemoveItem } from '@/features/study-folders/remove-item/model/useRemoveItem'
import { useDeleteFolder } from '@/features/study-folders/delete-folder/model/useDeleteFolder'
import { useProcessVideo } from '@/features/study-folders/process-video/model/useProcessVideo'
import { AddItemModal } from '@/features/study-folders/add-item/ui/AddItemModal'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import { ShareModal } from '@/shared/ui/ShareModal'
import type { FolderItemType, YouTubeVideo, StudyFolderItem } from '@/entities/study-folder/model/study-folder.types'
import { FOLDER_ITEM_TYPE_LABELS, FOLDER_ITEM_TYPE_TAB } from '@/entities/study-folder/model/study-folder.types'

const RECOMMENDATIONS_THRESHOLD = 5

const TYPE_CONFIG: Record<FolderItemType, { icon: React.ElementType; color: string; gradient: string }> = {
  SUMMARY:       { icon: Sparkles, color: 'text-purple-400', gradient: 'from-purple-500/20 to-transparent' },
  TRANSCRIPTION: { icon: FileText, color: 'text-blue-400',   gradient: 'from-blue-500/20 to-transparent'   },
  FLASHCARDS:    { icon: BookOpen, color: 'text-pink-400',   gradient: 'from-pink-500/20 to-transparent'   },
  MINDMAP:       { icon: Map,      color: 'text-cyan-400',   gradient: 'from-cyan-500/20 to-transparent'   },
}

const TYPE_ORDER: FolderItemType[] = ['SUMMARY', 'TRANSCRIPTION', 'FLASHCARDS', 'MINDMAP']

function FolderItemRow({ item, onRemove }: { item: StudyFolderItem; onRemove: () => void }) {
  const tab = FOLDER_ITEM_TYPE_TAB[item.itemType]

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] group hover:border-[var(--accent)]/30 transition-all">
      <Link
        to={`/transcription/${item.audioId}?tab=${tab}`}
        className="flex-1 text-sm text-[var(--text-primary)] truncate hover:text-[var(--accent)] transition-colors"
      >
        {item.title}
      </Link>
      <button
        onClick={onRemove}
        className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors opacity-0 group-hover:opacity-100 shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function ItemsSection({
  type,
  items,
  onRemove,
}: {
  type: FolderItemType
  items: StudyFolderItem[]
  onRemove: (id: string) => void
}) {
  if (items.length === 0) return null
  const { icon: Icon, color } = TYPE_CONFIG[type]

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className={color} />
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
          {FOLDER_ITEM_TYPE_LABELS[type]}
        </span>
        <span className="text-[10px] text-[var(--text-secondary)]/50">({items.length})</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {items.map((item) => (
          <FolderItemRow key={item.id} item={item} onRemove={() => onRemove(item.id)} />
        ))}
      </div>
    </div>
  )
}

function VideoCard({
  video,
  onPlay,
  onProcess,
  isProcessing,
}: {
  video: YouTubeVideo
  onPlay: (v: YouTubeVideo) => void
  onProcess: (videoId: string, videoTitle: string) => void
  isProcessing: boolean
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
        <button
          onClick={() => onProcess(video.videoId, video.title)}
          disabled={isProcessing}
          className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
            bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20
            hover:bg-[var(--accent)]/20 hover:border-[var(--accent)]/40
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Wand2 size={12} />
          )}
          {isProcessing ? 'Processando...' : 'Gerar materiais de estudo'}
        </button>
      </div>
    </div>
  )
}

function VideoPlayerModal({ video, onClose }: { video: YouTubeVideo; onClose: () => void }) {
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
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [recommendations, setRecommendations] = useState<YouTubeVideo[] | null>(null)
  const [loadingRecs, setLoadingRecs] = useState(false)

  const { data, isLoading } = useFolder(id!)
  const { mutate: removeItem } = useRemoveItem(id!)
  const { mutate: deleteFolder, isPending: deletingFolder } = useDeleteFolder()
  const { processVideo, processingVideoId } = useProcessVideo(id!)

  const folder = data?.folder
  const items = data?.items ?? []

  // Group items by type
  const itemsByType = TYPE_ORDER.reduce<Record<FolderItemType, StudyFolderItem[]>>(
    (acc, type) => {
      acc[type] = items.filter((i) => i.itemType === type)
      return acc
    },
    { SUMMARY: [], TRANSCRIPTION: [], FLASHCARDS: [], MINDMAP: [] },
  )

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
      // silently handled
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
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
            <div className="flex items-center gap-2 mt-1 ml-4 shrink-0">
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
                title="Compartilhar pasta"
              >
                <Share2 size={12} />
                Compartilhar
              </button>
              <button
                onClick={handleDeleteFolder}
                disabled={deletingFolder}
                className="text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                title="Excluir pasta"
              >
                <Trash2 size={16} />
              </button>
            </div>
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
                  style={{ width: `${progressPercent}%`, background: 'var(--gradient-primary)' }}
                />
              </div>
            </div>
          )}

          {/* Materials section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
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
              <div className="flex flex-col gap-5">
                {TYPE_ORDER.map((type) => (
                  <ItemsSection
                    key={type}
                    type={type}
                    items={itemsByType[type]}
                    onRemove={(itemId) => removeItem(itemId)}
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
                  <Button size="sm" variant="ghost" onClick={handleLoadRecommendations} loading={loadingRecs}>
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
                    <VideoCard
                      key={video.videoId}
                      video={video}
                      onPlay={setSelectedVideo}
                      onProcess={processVideo}
                      isProcessing={processingVideoId === video.videoId}
                    />
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
        <AddItemModal folderId={id!} existingItems={items} onClose={() => setShowAddModal(false)} />
      )}

      {showShareModal && folder && (
        <ShareModal
          resourceType="study_folder"
          resourceId={folder.id}
          title={folder.name}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {selectedVideo && (
        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </div>
  )
}
