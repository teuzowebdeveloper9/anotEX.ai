# anotEX.ai - Implementacao de Pagamentos com Prioridade em Cyberseguranca

## Objetivo

Este documento define a direcao recomendada para uma futura implementacao de pagamentos no `anotEX.ai`, com prioridade explicita em:

- reduzir superficie de ataque
- evitar contato direto com dados sensiveis de cartao
- minimizar escopo PCI DSS
- bloquear fraudes, replay, spoofing e manipulacao de valor/status
- preservar trilha de auditoria e resposta a incidentes

A recomendacao principal nao e "fazer o checkout mais bonito". E tirar o maximo possivel de risco do produto.

---

## Resumo Executivo

### Recomendacao principal

Para a primeira implementacao, o `anotEX.ai` deve usar **checkout hospedado pelo gateway** ou, no maximo, **payment page isolada em iframe do provedor**, sem coletar PAN, CVV ou dados de cartao em componentes nossos.

### O que evitar

- nao criar formulario proprio de cartao no frontend
- nao armazenar PAN, CVV, track data ou equivalentes
- nao confiar em redirect do browser como prova de pagamento
- nao liberar plano/credito/assinatura com base em query params do frontend
- nao deixar valor, moeda, desconto ou plano serem decididos pelo cliente

### Decisao pratica

Se a prioridade for seguranca e reducao de escopo, a ordem recomendada e:

1. **Redirect para checkout hospedado pelo provedor**
2. **Iframe do provedor**, desde que todos os elementos de pagamento venham do provedor
3. **Campos hospedados/tokenizacao pelo provedor**
4. **Formulario proprio de cartao**

A opcao 4 deve ser tratada como ultimo recurso.

---

## Estado Atual do Projeto

Na leitura do codigo em `backend/src` e `frontend/src`, nao encontrei modulo de pagamentos existente. Portanto, este documento trata a implementacao como **nova capacidade** e define a abordagem recomendada antes de qualquer codigo.

---

## Principios de Seguranca

### 1. O produto nao deve tocar em dado de cartao se nao for obrigado

Quanto menos o `anotEX.ai` manipular dados de pagamento, menor o risco tecnico, juridico e operacional.

### 2. O backend e a unica fonte de verdade para preco e status

Preco, moeda, plano, desconto, periodo, renovacao e elegibilidade devem ser calculados e validados no backend.

### 3. O browser do usuario e ambiente hostil

Cliente pode adulterar payload, parametros de redirect, valor final, plano e fluxo. Nada vindo do frontend deve ser confiado para confirmacao de pagamento.

### 4. Confirmacao de pagamento so vale por canal servidor-a-servidor

Liberacao de assinatura, credito ou recurso pago deve depender de webhook autenticado e, idealmente, revalidacao server-side na API do gateway.

### 5. Cyberseguranca vence conveniencia

Se houver conflito entre UX e seguranca, a implementacao deve privilegiar isolamento do fluxo de pagamento.

---

## Base de Pesquisa e Implicacoes Praticas

### PCI DSS e reducao de escopo

O PCI SSC descreve o PCI DSS como uma baseline de requisitos tecnicos e operacionais para proteger dados de conta. Na publicacao do PCI DSS v4.0, o PCI SSC destacou MFA para todo acesso ao cardholder data environment como uma das mudancas centrais.

Implicacao pratica para o `anotEX.ai`:

- evitar entrar no cardholder data environment
- usar provedor validado pelo PCI para hospedar a coleta do pagamento
- exigir MFA forte para acessos administrativos ao provedor e aos segredos de integracao

### SAQ A e pagamento terceirizado

O PCI SSC esclarece que, para elegibilidade em cenarios com iframe, todos os elementos da payment page entregues ao navegador devem vir direta e exclusivamente de um third-party service provider PCI DSS validado. O mesmo FAQ atualizado em **fevereiro de 2025** reforca que, quando houver iframe embutido, o merchant precisa confirmar que a pagina nao esta suscetivel a ataques de script.

Implicacao pratica:

- **redirect hospedado pelo provedor** tende a ser o caminho de menor risco
- **iframe** so deve ser usado se o provedor entregar toda a payment page
- se qualquer campo sensivel ou logica de captura estiver no nosso DOM, o escopo e o risco sobem

### E-skimming e scripts de pagamento

Em **10 de marco de 2025**, o PCI SSC publicou guidance especifica para prevenir e-skimming em payment pages, destacando controle sobre scripts autorizados, verificacao de integridade e monitoracao de adulteracao, incluindo headers com impacto de seguranca.

Implicacao pratica:

- pagina de checkout nao pode virar area de marketing tag sprawl
- qualquer script de analytics, chat, heatmap, A/B test ou pixel deve ser tratado como risco
- checkout deve ser minimamente carregado e monitorado

### OWASP e integracao com gateway

O OWASP recomenda:

- recalcular carrinho e totais no backend
- sempre verificar o status do pagamento server-side antes de cumprir a operacao
- validar autenticidade de callbacks
- implementar idempotencia
- rejeitar replay com IDs unicos e expiracao

Implicacao pratica:

- redirect de sucesso nao concede acesso
- webhook sem assinatura valida nao altera estado
- evento duplicado nao pode gerar dupla ativacao

### OWASP e autorizacao de transacoes

O OWASP tambem reforca que autorizacao de transacao deve ser enforced server-side, com dados relevantes gerados e verificados no servidor, fluxo sequencial, TTL curto e credenciais unicas por operacao.

Implicacao pratica:

- checkout session deve ter TTL
- alteracao de plano/valor invalida sessao anterior
- cliente nao pode reaproveitar intent antigo para comprar outro plano

### NIST e MFA resistente a phishing

O NIST SP 800-63B afirma que OTP manual e out-of-band nao sao phishing-resistant. O OWASP destaca que U2F/passkeys resistem melhor a phishing que OTP digitado manualmente.

Implicacao pratica:

- admins do gateway, painel financeiro, CI/CD e secrets manager devem usar MFA resistente a phishing quando possivel
- SMS/OTP nao deve ser a unica camada para contas administrativas

### Logs, segredos e chaves

OWASP Logging, Secrets Management e Key Management reforcam que nao se deve logar dados de cartao, tokens, segredos ou chaves, que rotacao de segredos deve ser automatizada quando possivel, e que uma chave nao deve ser reutilizada para multiplos propositos.

Implicacao pratica:

- segredos do gateway fora do codigo e fora do frontend
- rotacao planejada de webhook secret e API keys
- separar segredos por ambiente e por finalidade

---

## Arquitetura Recomendada

### Opcao A - Recomendacao principal: checkout hospedado pelo provedor

Fluxo:

1. Frontend chama backend para iniciar compra/assinatura.
2. Backend valida usuario autenticado, plano, preco, moeda e regras.
3. Backend cria `checkout-session` no gateway com metadados minimos.
4. Frontend redireciona usuario para URL retornada pelo gateway.
5. Gateway processa pagamento.
6. Gateway envia webhook assinado para o backend.
7. Backend valida assinatura, reconsulta status se necessario, aplica idempotencia e ativa assinatura.

Vantagens:

- menor contato com dado sensivel
- menor risco de e-skimming local
- menor escopo PCI
- frontend fica mais simples

Desvantagens:

- menos controle visual da tela de pagamento

### Opcao B - Aceitavel com restricoes: iframe/payment page do provedor

So usar se:

- todos os elementos da payment page vierem do provedor PCI validado
- checkout ficar isolado de scripts desnecessarios
- houver governanca de scripts e headers

Risco principal:

- merchant page ainda pode impactar seguranca do pagamento, especialmente em ataques de script

### Opcao C - Nao recomendada para primeira versao: formulario proprio de cartao

Riscos:

- aumenta escopo PCI
- aumenta chance de vazamento em log, erro, observabilidade e suporte
- aumenta exigencia de hardening no frontend e backend
- aumenta custo de compliance e resposta a incidente

---

## Ferramentas Provaveis

Esta secao lista ferramentas realistas para uma primeira implementacao no `anotEX.ai`, priorizando reducao de risco, integracao simples com backend e boa operacao em producao.

### 1. Gateway de pagamento

Opcoes provaveis:

- **Stripe**
- **Asaas**
- **Pagar.me**
- **Mercado Pago**

Leitura pratica:

- **Stripe**: melhor opcao se a prioridade for DX forte, checkout hospedado maduro, boa documentacao, webhooks bem estruturados e suporte a Billing/Subscriptions.
- **Asaas**: faz sentido se quisermos maior aderencia ao mercado brasileiro, Pix e boleto com operacao mais local.
- **Pagar.me**: opcao forte para Brasil quando houver necessidade de ecossistema nacional e meios de pagamento locais.
- **Mercado Pago**: util se a estrategia priorizar Pix/carteira/ecossistema local, mas exige cuidado para manter uma modelagem limpa do fluxo de eventos.

Recomendacao inicial:

- se a prioridade for **seguranca + maturidade tecnica**: `Stripe Checkout`
- se a prioridade for **Brasil + Pix/Boleto logo no inicio**: `Asaas` ou `Pagar.me`

### 2. Checkout e billing

Ferramentas provaveis:

- **Hosted Checkout do gateway**
- **Portal de billing do proprio gateway**
- **Webhook endpoint no NestJS**

Direcao recomendada:

- usar `Hosted Checkout` para primeira versao
- usar o `customer portal` do provedor se ele resolver cancelamento, update de cartao e gestao de assinatura sem expor dados sensiveis ao nosso app
- manter toda confirmacao de pagamento no backend NestJS

### 3. Antifraude e protecao de abuse

Ferramentas provaveis:

- **Radar / antifraud nativo do gateway**
- **Cloudflare WAF**
- **Cloudflare Turnstile**
- **rate limiting no NestJS**
- **Upstash Redis** para contadores e chaves de idempotencia

Direcao recomendada:

- usar antifraude nativo do gateway antes de integrar uma solucao externa mais pesada
- usar `Cloudflare WAF` para proteger rotas expostas de checkout e webhook
- usar `Turnstile` se houver risco de automacao abusiva na criacao de sessoes de pagamento
- usar `Redis` para rate limit, replay protection e locks curtos

### 4. Segredos e credenciais

Ferramentas provaveis:

- **Railway Variables** ou secret store equivalente
- **1Password** ou **Bitwarden** para operacao da equipe
- **GitHub Secrets** para CI/CD

Direcao recomendada:

- segredos do gateway e webhook fora do repositorio
- acesso compartilhado a segredos apenas via cofre/senha corporativa
- rotacao documentada de `api_key`, `webhook_secret` e credenciais administrativas

### 5. Observabilidade e auditoria

Ferramentas provaveis:

- **Sentry**
- **New Relic**
- **OpenTelemetry**
- **Logtail** ou stack de logs centralizados
- **Postgres** para trilha de auditoria de pagamentos

Direcao recomendada:

- `Sentry` para falhas de execucao e exceptions
- `New Relic` se quisermos APM mais completo e correlacao operacional
- `OpenTelemetry` se quisermos padronizar tracing entre backend, filas e integracoes
- tabela propria de auditoria no banco para eventos financeiros e transicoes de estado

### 6. Filas, retries e processamento assincrono

Ferramentas provaveis:

- **BullMQ**
- **Redis**
- **jobs internos no backend**

Direcao recomendada:

- processar webhook de forma rapida e segura
- delegar reconciliacao, retries e tarefas nao criticas para fila
- usar jobs para revalidar pagamentos pendentes, falhas temporarias e reconciliacao periodica

### 7. Banco e persistencia

Ferramentas provaveis:

- **PostgreSQL**
- **Supabase Postgres**

Tabelas provaveis:

- `billing_plans`
- `payment_sessions`
- `subscriptions`
- `payment_events`
- `charges`
- `refunds`
- `audit_logs`

### 8. Protecao de pagina e superficie web

Ferramentas provaveis:

- **Cloudflare CDN/WAF**
- **CSP headers**
- **Subresource Integrity**, quando aplicavel
- **monitoracao de alteracao de scripts**

Direcao recomendada:

- a pagina que inicia checkout deve ser minimalista
- evitar trackers e scripts de terceiros nessa area
- controlar rigidamente origem de script, frame e conexoes

### 9. Stack recomendada para primeira versao

Opcao mais pragmatica para o `anotEX.ai`:

- gateway: `Stripe Checkout` ou `Asaas`
- backend: `NestJS`
- persistencia: `PostgreSQL / Supabase`
- fila e retries: `BullMQ + Redis`
- protecao web: `Cloudflare`
- observabilidade: `Sentry` + logs estruturados
- segredos: `Railway Secrets` + `GitHub Secrets`

### 10. Stack recomendada se o foco for Brasil

- gateway: `Asaas` ou `Pagar.me`
- meios de pagamento: `Pix`, `boleto`, `cartao`
- backend: `NestJS`
- persistencia: `PostgreSQL / Supabase`
- fila e retries: `BullMQ + Redis`
- protecao web: `Cloudflare`
- observabilidade: `Sentry` ou `New Relic`

---

## Controles Obrigatorios

### 1. Fonte de verdade de preco no backend

Nunca aceitar do cliente:

- valor final
- moeda
- desconto
- plano
- periodo
- trial
- quantidade de creditos

O frontend envia apenas intencao de compra. O backend resolve o resto com tabela de precos confiavel.

### 2. Idempotencia

Obrigatorio em:

- criacao de checkout session
- processamento de webhook
- ativacao de assinatura
- concessao de creditos
- cancelamento e reembolso

Modelo recomendado:

- tabela de eventos processados por `provider_event_id`
- `unique constraint` para impedir processamento duplicado

### 3. Validacao forte de webhook

Obrigatorio:

- assinatura/HMAC validada com secret do provedor
- tolerancia curta de timestamp
- armazenamento do payload bruto recebido para auditoria
- rejeicao explicita de eventos com assinatura ausente ou invalida

Boa pratica adicional:

- confirmar status na API do provedor antes de cumprir acao critica

### 4. Modelo de estados explicito

Evitar booleanos soltos como `isPaid`.

Preferir:

- `pending`
- `authorized`
- `paid`
- `failed`
- `canceled`
- `refunded`
- `chargeback`
- `expired`

Transicoes devem ser controladas no backend e auditadas.

### 5. Checkout com expiracao

Sessao de pagamento deve ter TTL curto e ficar vinculada a:

- `user_id`
- `plan_id`
- `currency`
- `amount`
- `created_at`
- `expires_at`

Se plano ou preco mudar, a sessao anterior deve ser invalidada.

### 6. Hardening da pagina de checkout

Aplicar:

- CSP restritiva
- `frame-src` e `connect-src` limitados ao gateway e dominios estritamente necessarios
- minimo de scripts terceiros
- sem pixels/heatmaps/chat em tela de pagamento
- inventory de scripts autorizados
- monitoracao de alteracoes

### 7. Segredos e credenciais

Obrigatorio:

- API keys e webhook secrets apenas no backend
- armazenamento em secret manager ou variaveis seguras da plataforma
- segregacao por ambiente
- rotacao planejada
- menor privilegio possivel

### 8. Acesso administrativo

Painel do gateway, provedor de email financeiro, secrets manager e GitHub/Railway devem usar:

- MFA obrigatorio
- preferencia por passkeys/U2F
- revisao periodica de acessos
- remocao imediata de acessos obsoletos

### 9. Logs e observabilidade

Logar:

- criacao de sessao
- callback recebido
- falha de assinatura
- mismatch de valor/moeda
- transicao de estado
- chargeback/refund/cancelamento

Nao logar:

- PAN
- CVV
- access tokens
- API keys
- webhook secrets
- payload sensivel sem saneamento
- dados bancarios completos

### 10. Protecao antifraude e antiabuso

Implementar pelo menos:

- rate limit em criacao de checkout
- rate limit em cupons/promocoes
- deteccao de repeticao anomala por IP/usuario/dispositivo
- alertas para muitos fracassos de pagamento
- alertas para callbacks repetidos e discrepancias de valor

---

## Ameacas Mais Importantes

### 1. Price tampering

Ataque:

- cliente tenta mandar valor menor ou trocar plano no payload

Mitigacao:

- backend recalcula tudo
- usar `price_id` interno confiavel
- validar amount/currency/order_id no retorno do gateway

### 2. Webhook spoofing

Ataque:

- invasor envia POST falso dizendo que o pagamento foi aprovado

Mitigacao:

- validar assinatura
- exigir timestamp recente
- reconsultar status no gateway
- processar por idempotencia

### 3. Replay de evento

Ataque:

- mesmo callback aprovado e reenviado varias vezes

Mitigacao:

- `provider_event_id` unico
- estado idempotente
- trava transacional no processamento

### 4. E-skimming/Magecart

Ataque:

- script malicioso no browser rouba dado de pagamento

Mitigacao:

- preferir redirect hospedado
- reduzir scripts na payment page
- CSP forte
- inventario, autorizacao e integridade de scripts

### 5. Fulfillment antes da confirmacao real

Ataque:

- usuario manipula `success=true` no frontend

Mitigacao:

- frontend apenas mostra "aguardando confirmacao"
- liberacao de recursos so apos confirmacao server-side

### 6. Exposicao de segredos

Ataque:

- key do gateway ou secret do webhook vaza em log, CI ou repo

Mitigacao:

- secret manager
- mascaramento em logs
- rotacao
- segregacao por ambiente

### 7. Account takeover administrativo

Ataque:

- conta do painel financeiro e comprometida por phishing

Mitigacao:

- MFA resistente a phishing
- revisao de acessos
- alertas de login

---

## Modelo Recomendado para o anotEX.ai

### Primeira versao

- usar provedor com checkout hospedado
- backend NestJS cria sessao de pagamento
- frontend React apenas redireciona
- webhook no backend confirma e ativa assinatura/plano
- banco registra historico de eventos e estados

### Objetos minimos sugeridos

- `billing_plans`
- `subscriptions`
- `payment_sessions`
- `payment_events`
- `invoices` ou `charges`

### Regras de negocio minimas

- um usuario nao ganha acesso premium por redirect do browser
- assinatura so muda apos evento validado
- reembolso e chargeback revertem estado com trilha de auditoria
- cancelamento nao apaga historico financeiro

---

## Requisitos de Implementacao

### Backend

- endpoint autenticado para iniciar checkout
- tabela confiavel de planos/precos
- integracao server-side com o gateway
- webhook assinado com validacao de raw body
- servico idempotente para aplicar eventos
- auditoria de transicoes de estado

### Frontend

- nao coletar dados de cartao em componentes proprios
- tratar redirect apenas como retorno de UX
- exibir status "processando confirmacao"
- consultar backend para estado real da assinatura

### Infra

- HTTPS obrigatorio
- secrets por ambiente
- alertas de falha de webhook
- monitoracao de picos de tentativa
- backup do historico financeiro e de eventos

---

## Checklist de Go/No-Go

Antes de subir pagamentos para producao, o time deve conseguir responder "sim" para tudo abaixo:

- o frontend nao manipula PAN/CVV?
- o preco final e calculado no backend?
- o redirect de sucesso nao ativa acesso sozinho?
- o webhook tem assinatura validada?
- existe idempotencia por evento?
- existe reconciliacao de amount/currency/order_id?
- existe trilha de auditoria?
- segredos estao fora do repo e com rotacao planejada?
- contas administrativas usam MFA forte?
- a pagina de pagamento esta limpa de scripts desnecessarios?
- cancelamento, refund e chargeback atualizam estado corretamente?

Se qualquer resposta for "nao", a implementacao nao deve ir para producao.

---

## Recomendacao Final

Para o `anotEX.ai`, a melhor estrategia inicial e:

- **checkout hospedado por provedor PCI validado**
- **backend como unica fonte de verdade**
- **webhook assinado + revalidacao server-side**
- **idempotencia obrigatoria**
- **pagina de pagamento minimizada e endurecida**
- **MFA forte para acessos administrativos**

Se o time quiser maximizar seguranca, o objetivo nao deve ser "integrar pagamento". Deve ser **integrar pagamento sem transformar o produto em processador de dados sensiveis**.

---

## Fontes

- PCI SSC - PCI DSS v4.0 press release: https://www.pcisecuritystandards.org/about_us/press_releases/securing-the-future-of-payments-pci-ssc-publishes-pci-data-security-standard-v4-0/
- PCI SSC - FAQ SAQ A scripts, atualizada em fevereiro de 2025: https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/how-does-an-e-commerce-merchant-meet-the-saq-a-eligibility-criteria-for-scripts/
- PCI SSC - FAQ sobre payment page em iframe: https://www.pcisecuritystandards.org/faq/articles/Frequently_Asked_Question/how-is-the-payment-page-determined-for-saq-a-merchants-using-iframe/
- PCI SSC - guidance sobre e-skimming publicada em 10 de marco de 2025: https://blog.pcisecuritystandards.org/new-information-supplement-payment-page-security-and-preventing-e-skimming
- OWASP - Secure Integration of Third-Party Payment Gateways Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Third_Party_Payment_Gateway_Integration.html
- OWASP - Transaction Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html
- OWASP - Multifactor Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html
- OWASP - Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- OWASP - Secrets Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
- OWASP - Key Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html
- NIST SP 800-63B - Authenticators: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/
