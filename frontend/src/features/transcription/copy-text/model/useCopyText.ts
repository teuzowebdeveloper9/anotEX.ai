import { useState } from 'react'
import { toast } from 'sonner'

export function useCopyText() {
  const [copied, setCopied] = useState(false)

  const copy = async (text: string): Promise<void> => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copiado!')
    setTimeout(() => setCopied(false), 2000)
  }

  return { copy, copied }
}
