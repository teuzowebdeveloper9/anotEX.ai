import { create } from 'zustand'

interface PomodoroPlayerStore {
  serverOffsetMs: number
  syncServerNow: (serverNowIso: string) => void
  reset: () => void
}

export const usePomodoroPlayerStore = create<PomodoroPlayerStore>((set) => ({
  serverOffsetMs: 0,
  syncServerNow: (serverNowIso: string) =>
    set({ serverOffsetMs: new Date(serverNowIso).getTime() - Date.now() }),
  reset: () => set({ serverOffsetMs: 0 }),
}))
