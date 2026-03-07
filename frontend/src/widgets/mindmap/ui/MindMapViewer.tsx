import { useEffect, useRef } from 'react'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'

interface MindMapViewerProps {
  markdown: string
}

const MARKMAP_STYLES = `
  .markmap-node text {
    fill: #ffffff !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    font-family: 'Inter', system-ui, sans-serif !important;
  }
  .markmap-node > circle {
    fill: #7c3aed !important;
    stroke: #7c3aed !important;
  }
  .markmap-link {
    stroke-opacity: 0.6 !important;
  }
  .markmap-node:hover > circle {
    fill: #a78bfa !important;
  }
  .markmap-node:hover text {
    fill: #ffffff !important;
    font-weight: 700 !important;
  }
`

export function MindMapViewer({ markdown }: MindMapViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const mmRef = useRef<Markmap | null>(null)

  useEffect(() => {
    if (!svgRef.current) return

    // Injeta estilos no SVG para dark theme
    let styleEl = svgRef.current.querySelector('style[data-markmap]')
    if (!styleEl) {
      styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style')
      styleEl.setAttribute('data-markmap', 'true')
      styleEl.textContent = MARKMAP_STYLES
      svgRef.current.prepend(styleEl)
    }

    const transformer = new Transformer()
    const { root } = transformer.transform(markdown)

    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current, {
        duration: 300,
        maxWidth: 320,
        paddingX: 16,
      })
    }

    mmRef.current.setData(root)
    void mmRef.current.fit()
  }, [markdown])

  useEffect(() => {
    return () => {
      mmRef.current?.destroy()
      mmRef.current = null
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      className="w-full rounded-lg"
      style={{ height: '560px', background: 'transparent' }}
    />
  )
}
