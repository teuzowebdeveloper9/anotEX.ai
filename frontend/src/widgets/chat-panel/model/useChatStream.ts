import { useState, useCallback } from 'react'
import { supabase } from '@/shared/auth/supabase'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function useChatStream(transcriptionId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(async (userMessage: string) => {
    if (isStreaming) return

    setError(null)
    setIsStreaming(true)
    setStreamingContent('')

    setMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: userMessage },
    ])

    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) throw new Error('Sessão expirada')

      const baseUrl = import.meta.env.VITE_API_BASE_URL as string
      const response = await fetch(`${baseUrl}/chat/${transcriptionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`Erro ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value, { stream: true })
        const lines = text.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6)) as {
              token?: string
              done?: boolean
              error?: string
            }

            if (parsed.error) throw new Error(parsed.error)
            if (parsed.done) break
            if (parsed.token) {
              accumulated += parsed.token
              setStreamingContent(accumulated)
            }
          } catch {
            // skip malformed SSE line
          }
        }
      }

      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: accumulated },
      ])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar mensagem'
      setError(msg)
    } finally {
      setStreamingContent('')
      setIsStreaming(false)
    }
  }, [transcriptionId, isStreaming])

  return { messages, isStreaming, streamingContent, error, sendMessage }
}
