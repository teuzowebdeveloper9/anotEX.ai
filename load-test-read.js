import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

const latency   = new Trend('latency_ms',  true)
const errorRate = new Rate('error_rate')
const s401      = new Counter('auth_401_total')
const s429      = new Counter('throttle_429_total')

export const options = {
  stages: [
    { duration: '20s', target: 10  },
    { duration: '30s', target: 50  },
    { duration: '30s', target: 100 },
    { duration: '20s', target: 0   },
  ],
  thresholds: {
    latency_ms:      ['p(95)<2000'],
    error_rate:      ['rate<0.05'],
    http_req_failed: ['rate<0.05'],
    auth_401_total:  ['count<1'],
  },
}

const BASE             = 'https://anotexai-production.up.railway.app/api/v1'
const SUPABASE_URL     = 'https://cjottxpuzttvhbcdpmdg.supabase.co'
const SUPABASE_ANON    = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqb3R0eHB1enR0dmhiY2RwbWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjEwNjgsImV4cCI6MjA4ODMzNzA2OH0.v8UZ3LyGZD-I70g9DGdi4KtlY_2UjBjoTG0z-XG8G5c'
const AUDIO_ID         = 'afb02c4f-fab4-4095-ab8e-5677d3f2a226'
const TRANSCRIPTION_ID = '9d0dd337-b97e-404c-8842-c6e6f8e89d75'

// ── setup: roda UMA vez antes de todos os VUs iniciarem ──────────────────────
export function setup() {
  var res = http.post(
    SUPABASE_URL + '/auth/v1/token?grant_type=password',
    JSON.stringify({ email: __ENV.EMAIL, password: __ENV.PASSWORD }),
    { headers: { apikey: SUPABASE_ANON, 'Content-Type': 'application/json' } }
  )

  if (res.status !== 200) {
    throw new Error('Login falhou: ' + res.status + ' ' + res.body)
  }

  var token = JSON.parse(res.body).access_token
  console.log('JWT obtido com sucesso')
  return { token: token }
}

// ── loop principal — data.token compartilhado com todos os VUs ───────────────
export default function (data) {
  var H = { Authorization: 'Bearer ' + data.token }

  var urls = [
    { path: '/health',                                             auth: false },
    { path: '/audio',                                             auth: true  },
    { path: '/audio/' + AUDIO_ID + '/status',                     auth: true  },
    { path: '/transcription',                                     auth: true  },
    { path: '/chat/' + TRANSCRIPTION_ID + '/history',             auth: true  },
    { path: '/chat/conversations',                                auth: true  },
    { path: '/study-materials/' + TRANSCRIPTION_ID,               auth: true  },
  ]

  for (var i = 0; i < urls.length; i++) {
    var ep      = urls[i]
    var fullUrl = BASE + ep.path
    var params  = ep.auth ? { headers: H } : {}

    var start = Date.now()
    var r     = http.get(fullUrl, params)
    latency.add(Date.now() - start)

    if (r.status === 401) { s401.add(1) }
    if (r.status === 429) { s429.add(1) }

    var ok = check(r, {
      'status 2xx': function(res) { return res.status >= 200 && res.status < 300 },
      'nao 401':    function(res) { return res.status !== 401 },
      'nao 429':    function(res) { return res.status !== 429 },
      'nao 5xx':    function(res) { return res.status < 500 },
    })

    errorRate.add(!ok)

    if (r.status !== 200) {
      console.log('[VU ' + __VU + '] ' + r.status + ' ' + ep.path)
    }

    sleep(0.1)
  }

  sleep(0.5)
}
