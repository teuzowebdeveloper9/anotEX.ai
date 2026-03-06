import { useState, useRef, useCallback } from 'react'

export type RecorderState = 'idle' | 'recording' | 'paused' | 'stopped'

interface UseRecorderReturn {
  state: RecorderState
  stream: MediaStream | null
  audioBlob: Blob | null
  durationMs: number
  start: () => Promise<void>
  pause: () => void
  resume: () => void
  stop: () => void
  reset: () => void
}

export function useRecorder(): UseRecorderReturn {
  const [state, setState] = useState<RecorderState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [durationMs, setDurationMs] = useState(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const accumulatedRef = useRef<number>(0)

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now()
    timerRef.current = setInterval(() => {
      setDurationMs(accumulatedRef.current + Date.now() - startTimeRef.current)
    }, 100)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    accumulatedRef.current += Date.now() - startTimeRef.current
  }, [])

  const start = useCallback(async (): Promise<void> => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    setStream(mediaStream)

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(mediaStream, { mimeType })
    chunksRef.current = []
    accumulatedRef.current = 0

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      setAudioBlob(blob)
      mediaStream.getTracks().forEach((t) => t.stop())
      setStream(null)
    }

    recorder.start(250)
    recorderRef.current = recorder
    setState('recording')
    startTimer()
  }, [startTimer])

  const pause = useCallback(() => {
    recorderRef.current?.pause()
    stopTimer()
    setState('paused')
  }, [stopTimer])

  const resume = useCallback(() => {
    recorderRef.current?.resume()
    startTimer()
    setState('recording')
  }, [startTimer])

  const stop = useCallback(() => {
    recorderRef.current?.stop()
    stopTimer()
    setState('stopped')
  }, [stopTimer])

  const reset = useCallback(() => {
    recorderRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    stream?.getTracks().forEach((t) => t.stop())
    setStream(null)
    setAudioBlob(null)
    setDurationMs(0)
    accumulatedRef.current = 0
    setState('idle')
  }, [stream])

  return { state, stream, audioBlob, durationMs, start, pause, resume, stop, reset }
}
