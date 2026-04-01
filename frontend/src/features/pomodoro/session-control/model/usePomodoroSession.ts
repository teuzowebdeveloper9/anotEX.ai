import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/shared/api/axios'
import { ENDPOINTS } from '@/shared/api/endpoints'
import {
  usePomodoroPlayerStore,
} from '@/entities/pomodoro/model/pomodoro-player.store'
import type {
  PomodoroSessionSnapshot,
  PomodoroStats,
  StartPomodoroPayload,
} from '@/entities/pomodoro/model/pomodoro.types'

function computeLiveRemaining(snapshot: PomodoroSessionSnapshot, serverOffsetMs: number): number {
  if (snapshot.session.status !== 'running' || !snapshot.session.phaseTargetEndsAt) {
    return snapshot.remainingMs
  }

  const serverNowMs = Date.now() + serverOffsetMs
  return Math.max(0, new Date(snapshot.session.phaseTargetEndsAt).getTime() - serverNowMs)
}

export function usePomodoroSession() {
  const queryClient = useQueryClient()
  const { serverOffsetMs, syncServerNow, reset } = usePomodoroPlayerStore()
  const [tick, setTick] = useState(() => Date.now())

  const activeQuery = useQuery<PomodoroSessionSnapshot | null>({
    queryKey: ['pomodoro', 'active'],
    queryFn: async () => {
      const { data } = await api.get<PomodoroSessionSnapshot | null>(ENDPOINTS.pomodoro.active)
      return data
    },
    refetchInterval: 30000,
  })

  const statsQuery = useQuery<PomodoroStats>({
    queryKey: ['pomodoro', 'stats', '7d'],
    queryFn: async () => {
      const { data } = await api.get<PomodoroStats>(ENDPOINTS.pomodoro.stats('7d'))
      return data
    },
  })

  useEffect(() => {
    if (!activeQuery.data?.serverNow) return
    syncServerNow(activeQuery.data.serverNow)
  }, [activeQuery.data?.serverNow, syncServerNow])

  useEffect(() => {
    if (!activeQuery.data) return

    const interval = window.setInterval(() => {
      setTick(Date.now())
    }, 1000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void activeQuery.refetch()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [activeQuery.data, activeQuery])

  const syncSnapshot = (snapshot: PomodoroSessionSnapshot | null) => {
    queryClient.setQueryData(['pomodoro', 'active'], snapshot)
    if (snapshot?.serverNow) syncServerNow(snapshot.serverNow)
    queryClient.invalidateQueries({ queryKey: ['pomodoro', 'stats'] })
    queryClient.invalidateQueries({ queryKey: ['pomodoro', 'history'] })
  }

  const startMutation = useMutation({
    mutationFn: async (payload: StartPomodoroPayload) => {
      const { data } = await api.post<PomodoroSessionSnapshot>(ENDPOINTS.pomodoro.start, payload)
      return data
    },
    onSuccess: syncSnapshot,
  })

  const pauseMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<PomodoroSessionSnapshot>(ENDPOINTS.pomodoro.pause(sessionId))
      return data
    },
    onSuccess: syncSnapshot,
  })

  const resumeMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<PomodoroSessionSnapshot>(ENDPOINTS.pomodoro.resume(sessionId))
      return data
    },
    onSuccess: syncSnapshot,
  })

  const advanceMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await api.post<PomodoroSessionSnapshot>(ENDPOINTS.pomodoro.advance(sessionId))
      return data
    },
    onSuccess: syncSnapshot,
  })

  const stopMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await api.post(ENDPOINTS.pomodoro.stop(sessionId))
    },
    onSuccess: () => {
      reset()
      syncSnapshot(null)
    },
  })

  const activeSession = activeQuery.data
  const remainingMs = useMemo(() => {
    void tick
    if (!activeSession) return 0
    return computeLiveRemaining(activeSession, serverOffsetMs)
  }, [activeSession, serverOffsetMs, tick])

  const elapsedMs = useMemo(() => {
    if (!activeSession) return 0
    return Math.max(0, activeSession.phaseDurationMs - remainingMs)
  }, [activeSession, remainingMs])

  return {
    activeSession,
    stats: statsQuery.data ?? null,
    isLoading: activeQuery.isLoading,
    isStatsLoading: statsQuery.isLoading,
    remainingMs,
    elapsedMs,
    startSession: startMutation.mutateAsync,
    pauseSession: pauseMutation.mutateAsync,
    resumeSession: resumeMutation.mutateAsync,
    advanceSession: advanceMutation.mutateAsync,
    stopSession: stopMutation.mutateAsync,
    isMutating:
      startMutation.isPending ||
      pauseMutation.isPending ||
      resumeMutation.isPending ||
      advanceMutation.isPending ||
      stopMutation.isPending,
  }
}
