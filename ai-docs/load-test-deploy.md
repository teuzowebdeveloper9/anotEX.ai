# Load Test da Aplicação Deployada

Este guia é para testar como o `anotEX.ai` reage com muitos usuários na aplicação já deployada, sem sair disparando tráfego aleatório em produção.

O caminho mais pragmático aqui é:

1. testar a API, não o frontend
2. começar com carga pequena
3. aumentar em etapas
4. medir erro, latência e gargalo real

## Objetivo

Você quer responder estas perguntas:

- quantos usuários simultâneos a API aguenta antes de degradar
- quais endpoints quebram primeiro
- se o gargalo está no Railway, Supabase, Redis, Groq, R2 ou worker
- qual tempo de resposta fica aceitável para uso real

## Regra importante antes de rodar

Se possível, rode isso primeiro em `staging`.

Se for testar em produção:

- faça em horário de baixo uso
- use uma conta de teste
- evite fluxos caros com IA em volume alto logo no primeiro teste
- limite o teste para não gerar custo desnecessário em Groq, Supabase ou egress

## Ferramenta recomendada

Use `k6`.

Motivos:

- simples de escrever
- bom para tráfego HTTP autenticado
- suporta ramp-up, spike e stress test
- entrega métricas fáceis de ler

Instalação:

```bash
brew install k6
```

ou

```bash
sudo gpg -k
sudo apt-get update
sudo apt-get install -y gnupg ca-certificates
curl -fsSL https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## O que testar primeiro

Comece pelos endpoints mais frequentes e mais importantes.

Prioridade sugerida:

1. login / refresh de sessão
2. listagens principais
3. criação de recurso leve
4. upload ou processamento assíncrono
5. fluxos com IA

Para este projeto, o ideal é separar:

- testes de leitura: healthcheck, listagens, busca, folders
- testes de escrita: criar pasta, adicionar item, iniciar processamento
- testes pesados: transcrição, chat com aula, processamento de vídeo, geração com IA

## Estratégia de teste

Não comece tentando simular 5.000 usuários de uma vez.

Rode nessa ordem:

### 1. Smoke test

Confirma se o script, token e URL estão corretos.

- 1 a 5 usuários virtuais
- 1 a 2 minutos

### 2. Load test

Mede comportamento em carga esperada.

- 20, depois 50, depois 100 usuários simultâneos
- 5 a 10 minutos por rodada

### 3. Stress test

Descobre o ponto de degradação.

- sobe além da capacidade esperada
- para quando erro e latência saírem do aceitável

### 4. Spike test

Mede reação a pico brusco.

- sai de 10 para 100 ou 200 muito rápido
- útil para entender fila, autoscaling e rate limit

## Métricas que importam

Olhe principalmente:

- `p95` de latência
- taxa de erro
- `http_req_duration`
- `http_req_failed`
- throughput por segundo
- timeout

Referência prática inicial:

- ideal: `p95 < 500ms` em endpoints leves
- aceitável: `p95 < 1s` em operações normais
- pesado/assíncrono: avaliar por tempo de aceitação da requisição e sucesso posterior do job
- erro acima de `1%` já merece investigação

## Exemplo de script com k6

Crie um arquivo como `load-tests/smoke-auth-folders.js`.

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    smoke: {
      executor: 'ramping-vus',
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 },
        { duration: '20s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

const baseUrl = __ENV.BASE_URL;
const token = __ENV.AUTH_TOKEN;

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const listFolders = http.get(`${baseUrl}/study-folders`, params);
  check(listFolders, {
    'list folders status 200': (r) => r.status === 200,
  });

  const createFolder = http.post(
    `${baseUrl}/study-folders`,
    JSON.stringify({
      title: `load-test-${__VU}-${__ITER}`,
      description: 'folder criada em teste de carga',
    }),
    params,
  );

  check(createFolder, {
    'create folder status 201 ou 200': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1);
}
```

Rodando:

```bash
BASE_URL=https://sua-api.com AUTH_TOKEN=seu_jwt k6 run load-tests/smoke-auth-folders.js
```

## Exemplo de carga progressiva

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 20 },
        { duration: '5m', target: 20 },
        { duration: '2m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 100 },
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<1000'],
  },
};

const baseUrl = __ENV.BASE_URL;
const token = __ENV.AUTH_TOKEN;

export default function () {
  const params = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const res = http.get(`${baseUrl}/study-folders`, params);
  check(res, {
    'status 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

## Como autenticar no teste

Você tem 3 opções:

1. usar um `AUTH_TOKEN` manual de uma conta de teste
2. fazer login dentro do próprio script e guardar o token
3. criar múltiplos usuários de teste e distribuir credenciais

Para começar, use a opção 1. É a mais simples.

## Fluxos que exigem cuidado neste projeto

No `anotEX.ai`, nem todo endpoint deve receber carga pesada logo de cara.

Tenha cuidado com:

- transcrição de áudio
- processamento de vídeo do YouTube
- chat com aula / RAG
- qualquer fluxo que chama Groq
- qualquer endpoint que cria job em fila

Nesses casos, teste em duas camadas:

1. a API aceita a requisição rápido?
2. o worker consegue processar a fila sem crescer sem controle?

Ou seja: não basta olhar só status `200/201` da API.

## O que monitorar durante o teste

Abra os dashboards antes de rodar.

### Railway

Olhe:

- CPU
- memória
- restart/crash
- número de instâncias
- logs de timeout

### Supabase

Olhe:

- picos de conexão
- queries lentas
- lock
- uso de CPU
- erros de RLS ou timeout

### Upstash Redis / BullMQ

Olhe:

- tamanho da fila
- jobs atrasados
- jobs falhando
- tempo médio de processamento

### Groq

Olhe:

- rate limit
- timeout
- latência
- custo/consumo

## Como interpretar o gargalo

Alguns padrões comuns:

- API com latência alta e CPU alta no Railway: gargalo no backend
- API responde rápido mas fila cresce muito: gargalo no worker
- erro `429`: gargalo em rate limit interno ou de provedor
- resposta lenta só em endpoints de leitura: suspeite de query ou índice
- timeout em fluxos de IA: suspeite de provedor externo ou concorrência exagerada

## Plano simples de execução

Você pode seguir este roteiro:

1. rodar smoke test com 5 usuários
2. rodar load test com 20 usuários por 5 minutos
3. repetir com 50 usuários
4. repetir com 100 usuários
5. anotar `p95`, erro, throughput e consumo de infra
6. escolher o primeiro gargalo real
7. otimizar antes de subir a carga de novo

## Exemplo de tabela de resultado

Monte algo assim a cada rodada:

| Rodada | Cenário | VUs | Duração | p95 | Erro | Observação |
|---|---|---:|---:|---:|---:|---|
| 1 | Smoke | 5 | 2 min | 180ms | 0% | OK |
| 2 | Load | 20 | 5 min | 290ms | 0% | OK |
| 3 | Load | 50 | 5 min | 740ms | 0.5% | ainda aceitável |
| 4 | Load | 100 | 5 min | 1.8s | 4% | começou a degradar |

## O que eu recomendo para o seu caso

Se você quer um primeiro teste útil sem complicar:

1. escolha 1 endpoint leve e 1 endpoint crítico
2. rode com `20 -> 50 -> 100` usuários
3. monitore Railway, Supabase e Redis ao mesmo tempo
4. deixe fluxos de IA pesados para uma segunda rodada

## Próximo passo prático

Se quiser, o próximo passo ideal é eu criar dentro do repo:

- uma pasta `load-tests/`
- scripts `k6` prontos para os endpoints reais da sua API
- um `.env.example` para rodar os testes

Assim você só ajusta `BASE_URL` e `AUTH_TOKEN` e começa a medir.
