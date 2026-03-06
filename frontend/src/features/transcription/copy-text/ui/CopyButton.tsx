import { Copy, Check } from 'lucide-react'
import { Button } from '@/shared/ui/Button/Button'
import { useCopyText } from '../model/useCopyText'

export function CopyButton({ text }: { text: string }) {
  const { copy, copied } = useCopyText()
  return (
    <Button variant="ghost" size="sm" onClick={() => void copy(text)}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? 'Copiado' : 'Copiar'}
    </Button>
  )
}
