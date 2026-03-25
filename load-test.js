import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

// ── Métricas customizadas ────────────────────────
// ─────────────────────────────
const chatDuration    = new Trend('chat_duration_ms',  true)
const listDuration    = new Trend('list_duration_ms',  true)
const errorRate       = new Rate('error_rate')
const throttleCounter = new Counter('throttle_429_total')
const chatRequests    = new Counter('chat_requests_total')

export const options = {
  stages: [
    { duration: '15s', target: 3  },  // aquecimento
    { duration: '30s', target: 10 },  // carga normal
    { duration: '20s', target: 20 },  // stress
    { duration: '15s', target: 0  },  // cooldown
  ],
  thresholds: {
    http_req_failed:   ['rate<0.15'],
    http_req_duration: ['p(95)<3000'],
    chat_duration_ms:  ['p(95)<10000'],
    list_duration_ms:  ['p(95)<1000'],
  },
}

const BASE             = 'https://anotexai-production.up.railway.app/api/v1'
const TOKEN            = __ENV.JWT_TOKEN
const AUDIO_ID         = 'afb02c4f-fab4-4095-ab8e-5677d3f2a226'
const TRANSCRIPTION_ID = '9d0dd337-b97e-404c-8842-c6e6f8e89d75'

const HEADERS = {
  'Authorization':  `Bearer ${TOKEN}`,
  'Content-Type':   'application/json',
}

const CHAT_QUESTIONS = [
  'Qual o tema principal da aula?',
  'Quais ferramentas foram mencionadas?',
  'Faça um resumo em 3 pontos.',
]

export default function () {
  const iter = __ITER

  // ── 1. Health (sem auth) ──────────────────────────────────────────────────
  {
    const r = http.get(`${BASE}/health`)
    check(r, { '[health] 200': res => res.status === 200 })
    errorRate.add(r.status !== 200)
  }
  sleep(0.2)

  // ── 2. Listar gravações ───────────────────────────────────────────────────
  {
    const start = Date.now()
    const r     = http.get(`${BASE}/audio`, { headers: HEADERS })
    listDuration.add(Date.now() - start)
    throttleCounter.add(r.status === 429)

    const ok = check(r, {
      '[audio/list] 200':   res => res.status === 200,
      '[audio/list] !401':  res => res.status !== 401,
      '[audio/list] !429':  res => res.status !== 429,
    })
    errorRate.add(!ok)
    if (r.status !== 200) console.log(`[audio/list] status=${r.status} body=${r.body.slice(0,80)}`)
  }
  sleep(0.2)

  // ── 3. Status de áudio ────────────────────────────────────────────────────
  {
    const r = http.get(`${BASE}/audio/${AUDIO_ID}/status`, { headers: HEADERS })
    throttleCounter.add(r.status === 429)
    check(r, { '[audio/status] 200': res => res.status === 200 })
    errorRate.add(r.status !== 200)
  }
  sleep(0.2)

  // ── 4. Histórico de chat ──────────────────────────────────────────────────
  {
    const r = http.get(`${BASE}/chat/${TRANSCRIPTION_ID}/history`, { headers: HEADERS })
    throttleCounter.add(r.status === 429)
    check(r, { '[chat/history] 200': res => res.status === 200 })
    errorRate.add(r.status !== 200)
  }
  sleep(0.2)

  // ── 5. Conversas ─────────────────────────────────────────────────────────
  {
    const r = http.get(`${BASE}/chat/conversations`, { headers: HEADERS })
    throttleCounter.add(r.status === 429)
    check(r, { '[conversations] 200': res => res.status === 200 })
    errorRate.add(r.status !== 200)
  }
  sleep(0.2)

  // ── 6. Chat com IA (1 a cada 4 iterações para não estourar Groq) ──────────
  if (iter % 4 === 0) {
    const q     = CHAT_QUESTIONS[__VU % CHAT_QUESTIONS.length]
    const start = Date.now()
    chatRequests.add(1)

    const r = http.post(
      `${BASE}/chat/${TRANSCRIPTION_ID}`,
      JSON.stringify({ message: q }),
      { headers: HEADERS, timeout: '30s' },
    )
    chatDuration.add(Date.now() - start)
    throttleCounter.add(r.status === 429)

    check(r, {
      '[chat] 200':    res => res.status === 200,
      '[chat] !401':   res => res.status !== 401,
      '[chat] !429':   res => res.status !== 429,
      '[chat] !5xx':   res => res.status < 500,
    })
    if (r.status !== 200) console.log(`[chat] status=${r.status} body=${r.body.slice(0,120)}`)
    errorRate.add(r.status !== 200)
  }

  sleep(0.8)
}
