import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

const latency      = new Trend('latency_ms',  true)
const errorRate    = new Rate('error_rate')
const status401    = new Counter('auth_401_total')
const status429    = new Counter('throttle_429_total')

export const options = {
  stages: [
    { duration: '20s', target: 10  },
    { duration: '30s', target: 50  },
    { duration: '30s', target: 100 },
    { duration: '20s', target: 0   },
  ],
  thresholds: {
    latency_ms:       ['p(95)<2000'],
    error_rate:       ['rate<0.05'],
    http_req_failed:  ['rate<0.05'],
    auth_401_total:   ['count<1'],    // zero 401 tolerado
  },
}

const BASE             = 'https://anotexai-production.up.railway.app/api/v1'
const SUPABASE_URL     = 'https://cjottxpuzttvhbcdpmdg.supabase.co'
const SUPABASE_ANON    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqb3R0eHB1enR0dmhiY2RwbWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjEwNjgsImV4cCI6MjA4ODMzNzA2OH0.v8UZ3LyGZD-I70g9DGdi4KtlY_2UjBjoTG0z-XG8G5c'
const EMAIL            = __ENV.EMAIL
const PASSWORD         = __ENV.PASSWORD
const AUDIO_ID         = 'afb02c4f-fab4-4095-ab8e-5677d3f2a226'
const TRANSCRIPTION_ID = '9d0dd337-b97e-404c-8842-c6e6f8e89d75'

// ── JWT renovado automaticamente ─────────────────────────────────────────────
// Cada VU guarda seu próprio token + expiração
const vuTokens = {}

function getToken(vu) {
  const now = Math.floor(Date.now() / 1000)
  const cached = vuTokens[vu]

  // Renova se não existir ou expirar em menos de 60s
  if (!cached || cached.exp - now < 60) {
    const res = http.post(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({ email: EMAIL, password: PASSWORD }),
      { headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' } },
    )

    if (res.status !== 200) {
      console.error(`[VU ${vu}] falha ao renovar JWT: ${res.status} ${res.body.slice(0, 80)}`)
      return cached?.token ?? ''
    }

    const body = JSON.parse(res.body)
    vuTokens[vu] = { token: body.access_token, exp: body.expires_at ?? now + 3600 }
    console.log(`[VU ${vu}] JWT renovado`)
  }

  return vuTokens[vu].token
}

// ── Loop principal ────────────────────────────────────────────────────────────
export default function () {
  const token = getToken(__VU)
  const H = { Authorization: `Bearer ${token}` }

  const endpoints = [
    { url: `${BASE}/health`,                                null },
    { url: `${BASE}/audio`,                                 H    },
    { url: `${BASE}/audio/${AUDIO_ID}/status`,              H    },
    { url: `${BASE}/transcription`,                         H    },
    { url: `${BASE}/chat/${TRANSCRIPTION_ID}/history`,      H    },
    { url: `${BASE}/chat/conversations`,                    H    },
    { url: `${BASE}/study-materials/${TRANSCRIPTION_ID}`,   H    },
  ]

  for (const { url, headers } of endpoints) {
    const start = Date.now()
    const r     = http.get(url, headers ? { headers } : {})
    latency.add(Date.now() - start)

    if (r.status === 401) {
      status401.add(1)
      console.warn(`[VU ${__VU}] 401 em ${url.split('/api/v1')[1]} — renovando JWT`)
      // Força renovação na próxima iteração
      delete vuTokens[__VU]
    }
    if (r.status === 429) status429.add(1)

    const ok = check(r, {
      'status 2xx':  res => res.status >= 200 && res.status < 300,
      'nao 401':     res => res.status !== 401,
      'nao 429':     res => res.status !== 429,
      'nao 5xx':     res => res.status < 500,
    })

    errorRate.add(!ok)

    if (r.status !== 200) {
      console.log(`[VU ${__VU}] ${r.status} ${url.split('/api/v1')[1]}`)
    }

    sleep(0.1)
  }

  sleep(0.5)
}
