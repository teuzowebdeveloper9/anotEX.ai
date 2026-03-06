import { useEffect, useRef, useState } from 'react'

export function useAudioLevel(stream: MediaStream | null): number[] {
  const [levels, setLevels] = useState<number[]>(new Array(32).fill(0))
  const animRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const contextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (!stream) {
      setLevels(new Array(32).fill(0))
      return
    }

    const context = new AudioContext()
    const analyser = context.createAnalyser()
    analyser.fftSize = 64
    const source = context.createMediaStreamSource(stream)
    source.connect(analyser)

    contextRef.current = context
    analyserRef.current = analyser

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const tick = (): void => {
      analyser.getByteFrequencyData(dataArray)
      setLevels(Array.from(dataArray).map((v) => v / 255))
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      source.disconnect()
      void context.close()
    }
  }, [stream])

  return levels
}
