import { useState, useRef, useEffect } from 'react'
import { Download, FileText, BookOpen, Printer, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { exportTxt, exportPdf, exportAnki } from '../model/useExport'
import type { FlashcardItem } from '@/shared/types/api.types'

interface ExportButtonProps {
  title: string
  transcriptionText: string | null
  summaryText: string | null
  flashcards: FlashcardItem[] | null
  createdAt: string
}

export function ExportButton({
  title,
  transcriptionText,
  summaryText,
  flashcards,
  createdAt,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const date = new Date(createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  const handlePdf = () => {
    if (!summaryText) return toast.error('Resumo não disponível.')
    exportPdf(title, summaryText, date)
    setOpen(false)
  }

  const handleTxt = () => {
    if (!transcriptionText) return toast.error('Transcrição não disponível.')
    exportTxt(title, transcriptionText)
    toast.success('Transcrição baixada!')
    setOpen(false)
  }

  const handleAnki = () => {
    if (!flashcards || flashcards.length === 0) return toast.error('Flashcards não disponíveis.')
    exportAnki(title, flashcards)
    toast.success(`${flashcards.length} flashcards exportados para o Anki!`)
    setOpen(false)
  }

  const options = [
    {
      icon: <Printer size={13} />,
      label: 'PDF do resumo',
      description: 'Abre janela de impressão',
      onClick: handlePdf,
      disabled: !summaryText,
    },
    {
      icon: <FileText size={13} />,
      label: 'TXT da transcrição',
      description: 'Texto completo',
      onClick: handleTxt,
      disabled: !transcriptionText,
    },
    {
      icon: <BookOpen size={13} />,
      label: 'Flashcards para Anki',
      description: 'Importar via File → Import',
      onClick: handleAnki,
      disabled: !flashcards || flashcards.length === 0,
    },
  ]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-bg)] border border-[var(--border)] hover:border-[var(--accent)]/30 transition-colors"
      >
        <Download size={12} />
        Exportar
        <ChevronDown size={10} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] shadow-lg z-50 overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.onClick}
              disabled={opt.disabled}
              className="w-full flex items-start gap-3 px-3.5 py-3 text-left hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="shrink-0 mt-0.5 text-[var(--accent)]">{opt.icon}</span>
              <div>
                <p className="text-xs font-medium text-[var(--text-primary)]">{opt.label}</p>
                <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
