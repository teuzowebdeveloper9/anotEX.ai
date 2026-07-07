const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

if (!API_BASE_URL) {
  throw new Error('Missing VITE_API_BASE_URL')
}

const ACCESS_TOKEN_KEY = 'anotex.access_token'
const REFRESH_TOKEN_KEY = 'anotex.refresh_token'
const USER_KEY = 'anotex.user'

export interface AuthUser {
  id: string
  email: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export class AuthApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AuthApiError'
    this.status = status
  }
}

type AuthStateListener = (user: AuthUser | null) => void

const listeners = new Set<AuthStateListener>()

function notifyListeners(): void {
  const user = getUser()
  listeners.forEach((listener) => listener(user))
}

// Multi-tab sync: react to session changes made in other tabs
window.addEventListener('storage', (event: StorageEvent) => {
  if (
    event.key === null ||
    event.key === ACCESS_TOKEN_KEY ||
    event.key === REFRESH_TOKEN_KEY ||
    event.key === USER_KEY
  ) {
    notifyListeners()
  }
})

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `Erro ${response.status}`
    try {
      const data = (await response.json()) as { message?: string | string[] }
      if (data.message) {
        message = Array.isArray(data.message) ? data.message.join(', ') : data.message
      }
    } catch {
      // resposta sem corpo JSON — mantém mensagem padrão
    }
    throw new AuthApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as unknown
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as AuthUser).id === 'string' &&
      typeof (parsed as AuthUser).email === 'string'
    ) {
      return parsed as AuthUser
    }
    return null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getAccessToken() !== null && getUser() !== null
}

export function hasRefreshToken(): boolean {
  return localStorage.getItem(REFRESH_TOKEN_KEY) !== null
}

export function setSession(session: AuthSession): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(session.user))
  notifyListeners()
}

export function clearSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  notifyListeners()
}

export function onAuthStateChange(callback: AuthStateListener): () => void {
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

export async function requestMagicLink(email: string): Promise<void> {
  await post<{ message: string }>('/auth/magic-link', { email })
}

export async function verifyMagicLink(token: string): Promise<AuthSession> {
  const session = await post<AuthSession>('/auth/verify', { token })
  setSession(session)
  return session
}

export async function login(email: string, password: string): Promise<AuthSession> {
  const session = await post<AuthSession>('/auth/login', { email, password })
  setSession(session)
  return session
}

export async function register(email: string, password: string): Promise<AuthSession> {
  const session = await post<AuthSession>('/auth/register', { email, password })
  setSession(session)
  return session
}

export async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (refreshToken) {
    try {
      await post<void>('/auth/logout', { refreshToken })
    } catch {
      // logout local prossegue mesmo se a revogação remota falhar
    }
  }
  clearSession()
}

let refreshPromise: Promise<AuthSession> | null = null

async function doRefresh(): Promise<AuthSession> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
  if (!refreshToken) {
    throw new AuthApiError('Sessão expirada', 401)
  }
  const session = await post<AuthSession>('/auth/refresh', { refreshToken })
  setSession(session)
  return session
}

export function refresh(): Promise<AuthSession> {
  // Single-flight: reusa a promise em voo para evitar rotações concorrentes
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}
