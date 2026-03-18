import type { FlashcardItem } from '@/shared/types/api.types'

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9À-ÿ\s-_]/g, '').trim().slice(0, 80)
}

// Converte markdown básico para HTML para a janela de impressão
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/^(?!<[hul])/gm, '')
    .split('\n')
    .map(line => line.startsWith('<') ? line : `<p>${line}</p>`)
    .join('\n')
}

export function exportTxt(title: string, text: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${sanitizeFilename(title)}-transcricao.txt`)
}

export function exportPdf(title: string, summaryMarkdown: string, date: string) {
  const html = markdownToHtml(summaryMarkdown)
  const win = window.open('', '_blank')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', serif;
      max-width: 720px;
      margin: 0 auto;
      padding: 48px 40px;
      color: #111;
      line-height: 1.7;
    }
    header {
      border-bottom: 2px solid #6366f1;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }
    header h1 { font-size: 22px; color: #1a1a2e; margin-bottom: 6px; }
    header p { font-size: 12px; color: #666; }
    h1 { font-size: 20px; margin: 28px 0 10px; color: #1a1a2e; }
    h2 { font-size: 17px; margin: 24px 0 8px; color: #2d2d5e; }
    h3 { font-size: 15px; margin: 20px 0 6px; color: #4a4a8a; }
    p { margin: 8px 0; color: #333; }
    ul { margin: 8px 0 8px 20px; }
    li { margin: 4px 0; }
    strong { color: #1a1a2e; }
    footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 11px;
      color: #999;
      text-align: center;
    }
    @media print {
      body { padding: 20px; }
      @page { margin: 2cm; }
    }
  </style>
</head>
<body>
  <header>
    <h1>${title}</h1>
    <p>Resumo gerado por anotEX.ai · ${date}</p>
  </header>
  <main>${html}</main>
  <footer>anotEX.ai — Resumos inteligentes para suas aulas</footer>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`)
  win.document.close()
}

export function exportAnki(title: string, flashcards: FlashcardItem[]) {
  // Formato tab-separado: front[TAB]back — Anki importa diretamente
  const lines = flashcards.map(
    (f) => `${f.front.replace(/\t/g, ' ')}\t${f.back.replace(/\t/g, ' ')}`,
  )
  const content = `#separator:tab\n#html:false\n#deck:${title}\n#notetype:Basic\n` + lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, `${sanitizeFilename(title)}-anki.txt`)
}
