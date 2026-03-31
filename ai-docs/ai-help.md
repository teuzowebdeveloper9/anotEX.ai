cd frontend/ && npm run build && cd .. && npx wrangler deploy --assets frontend/dist

> frontend-tmp@0.0.0 build
> tsc -b && vite build

vite v7.3.1 building client environment for production...
✓ 3382 modules transformed.
[plugin vite:reporter] 
(!) /home/teuzothedev/work/anotEx.ai/frontend/src/features/billing/api/createCheckout.ts is dynamically imported by /home/teuzothedev/work/anotEx.ai/frontend/src/features/billing/ui/PricingSection.tsx, /home/teuzothedev/work/anotEx.ai/frontend/src/shared/auth/SubscriptionGuard.tsx but also statically imported by /home/teuzothedev/work/anotEx.ai/frontend/src/features/billing/hooks/useCheckout.ts, /home/teuzothedev/work/anotEx.ai/frontend/src/shared/auth/SubscriptionGuard.tsx, dynamic import will not move module into another chunk.

dist/index.html                                       1.39 kB │ gzip:   0.67 kB
dist/assets/logo-anotex-NOPZaPm6.png                 78.73 kB
dist/assets/generated-1774426507249-UifR4Uk-.png    748.45 kB
dist/assets/index-D0ZkvkQP.css                       86.66 kB │ gzip:  14.08 kB
dist/assets/index-ddEWZ07c.js                     1,709.89 kB │ gzip: 535.97 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 5.99s
Proxy environment variables detected. We'll use your proxy for fetch requests.

 ⛅️ wrangler 4.78.0
───────────────────
✘ [ERROR] Failed to fetch auth token: TypeError: fetch failed

      at Object.processResponse
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35528:21)
      at
  /home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35914:23
      at node:internal/process/task_queues:151:7
      at AsyncResource.runInAsyncScope (node:async_hooks:214:14)
      at AsyncResource.runMicrotask (node:internal/process/task_queues:148:8)
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
    [cause]: DOMException [Error]: Request was cancelled.
        at new DOMException (node:internal/per_context/domexception:66:5)
        at makeAppropriateNetworkError
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:34366:183)
        at httpNetworkFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:36243:18)
        at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
        at async httpNetworkOrCacheFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:36111:33)
        at async httpFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35938:37)
        at async mainFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35700:24)
  {
      cause: RequestAbortedError [AbortError]: Proxy response (407) !== 200 when HTTP Tunneling
          at Client2.connect
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:25991:26)
          at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
        code: 'UND_ERR_ABORTED'
      }
    }
  }


Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth?response_type=code&client_id=54d11594-84e4-41aa-b438-e81b8fa78ee7&redirect_uri=http%3A%2F%2Flocalhost%3A8976%2Foauth%2Fcallback&scope=account%3Aread%20user%3Aread%20workers%3Awrite%20workers_kv%3Awrite%20workers_routes%3Awrite%20workers_scripts%3Awrite%20workers_tail%3Aread%20d1%3Awrite%20pages%3Awrite%20zone%3Aread%20ssl_certs%3Awrite%20ai%3Awrite%20ai-search%3Awrite%20ai-search%3Arun%20queues%3Awrite%20pipelines%3Awrite%20secrets_store%3Awrite%20containers%3Awrite%20cloudchamber%3Awrite%20connectivity%3Aadmin%20offline_access&state=kpm5l9x2Jc-PqSzGlO-ouu~efJDSoZPG&code_challenge=PKSvQ8i5e1NgJXI5DDwBDjtQ8Yr107OpKnxpk9aTdhg&code_challenge_method=S256
✘ [ERROR] Failed to fetch auth token: TypeError: fetch failed

      at Object.processResponse
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35528:21)
      at
  /home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35914:23
      at node:internal/process/task_queues:151:7
      at AsyncResource.runInAsyncScope (node:async_hooks:214:14)
      at AsyncResource.runMicrotask (node:internal/process/task_queues:148:8)
      at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
    [cause]: DOMException [Error]: Request was cancelled.
        at new DOMException (node:internal/per_context/domexception:66:5)
        at makeAppropriateNetworkError
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:34366:183)
        at httpNetworkFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:36243:18)
        at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
        at async httpNetworkOrCacheFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:36111:33)
        at async httpFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35938:37)
        at async mainFetch
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35700:24)
  {
      cause: RequestAbortedError [AbortError]: Proxy response (407) !== 200 when HTTP Tunneling
          at Client2.connect
  (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:25991:26)
          at process.processTicksAndRejections (node:internal/process/task_queues:105:5) {
        code: 'UND_ERR_ABORTED'
      }
    }
  }


This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). The promise rejected with the reason:
TypeError: fetch failed
    at Object.processResponse (/home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35528:21)
    at /home/teuzothedev/.npm/_npx/32026684e21afda6/node_modules/wrangler/wrangler-dist/cli.js:35914:23
    at node:internal/process/task_queues:151:7
    at AsyncResource.runInAsyncScope (node:async_hooks:214:14)
    at AsyncResource.runMicrotask (node:internal/process/task_queues:148:8)
