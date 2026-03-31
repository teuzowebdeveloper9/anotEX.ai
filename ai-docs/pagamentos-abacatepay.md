# Integração de Pagamentos - AbacatePay

## Visão Geral

Este documento descreve a integração do anotEX.ai com a AbacatePay para processamento de pagamentos via PIX e cartão de crédito.

## Arquitetura

### Stack
- **Backend**: NestJS + TypeScript
- **Pagamentos**: AbacatePay API v1
- **Banco de Dados**: Supabase (tabela `user_subscriptions`)
- **Infra**: Railway (deploy)

### Estrutura de Arquivos

```
backend/src/modules/payments/
├── application/dto/
│   ├── create-abacatepay-checkout.dto.ts
│   └── save-customer-data.dto.ts
├── domain/
│   ├── providers/
│   │   └── abacatepay.provider.ts (interface)
│   ├── use-cases/
│   │   ├── create-abacatepay-checkout.use-case.ts
│   │   ├── process-webhook.use-case.ts
│   │   ├── save-customer-data.use-case.ts
│   │   └── verify-abacatepay-webhook.use-case.ts
├── infrastructure/providers/
│   ├── abacatepay.provider.impl.ts
│   └── subscription.repository.impl.ts
└── presentation/controllers/
    └── payments.controller.ts
```

## Fluxo de Pagamento

### 1. Usuário salva dados para pagamento

**Endpoint**: `POST /api/v1/payments/save-customer-data`

O usuário preenche um formulário com:
- Nome completo
- Email
- Celular
- CPF (taxId)

Esses dados são salvos na tabela `user_subscriptions` com status inicial `pending`.

```typescript
// Request body
{
  "name": "João Silva",
  "email": "joao@email.com",
  "cellphone": "11999999999",
  "taxId": "12345678901"
}

// Response
{
  "hasSubscription": false,
  "status": "pending"
}
```

### 2. Usuário inicia checkout

**Endpoint**: `POST /api/v1/payments/abacatepay/checkout`

O checkout é criado na AbacatePay com:
- Dados do cliente (nome, email, celular, CPF)
- Produto (ID do plano Pro)
- Frequency: ONE_TIME
- Métodos: PIX e CARD

```typescript
// Request body
{
  "productId": "prod_uFHtgP3NQARHx35LtuFqRTT5",
  "priceInCents": 3990,
  "frequency": "SUBSCRIPTION"
}

// Response
{
  "id": "bill_xxx",
  "url": "https://checkout.abacatepay.com/xxx",
  "amount": 3990,
  "status": "PENDING",
  "frequency": "ONE_TIME",
  "devMode": false,
  "externalId": "anotex:userId:prodId:timestamp",
  "customerId": "cust_xxx",
  "createdAt": "2026-03-30T...",
  "updatedAt": "2026-03-30T..."
}
```

Após a criação do checkout, o `billingId` é salvo na tabela `user_subscriptions`.

### 3. Usuário efetua pagamento

O usuário é redirecionado para a página de pagamento da AbacatePay e efetua o pagamento via PIX ou cartão.

### 4. Webhook - Confirmação de pagamento

**Endpoint**: `POST /api/v1/payments/abacatepay/webhook?webhookSecret=SEU_SECRET`

A AbacatePay envia um webhook quando o pagamento é confirmado.

```json
{
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "bill_xxx",
      "amount": 3990,
      "customer": {
        "id": "cust_xxx",
        "metadata": {
          "name": "João Silva",
          "email": "joao@email.com",
          "cellphone": "11999999999",
          "taxId": "12345678901"
        }
      },
      "status": "PAID",
      "frequency": "ONE_TIME",
      "kind": ["PIX", "CARD"]
    },
    "payment": {
      "amount": 3990,
      "fee": 80,
      "method": "PIX"
    }
  }
}
```

#### Validação do Webhook

O webhook é validado através do parâmetro `webhookSecret` na query string, que deve corresponder à variável de ambiente `ABACATEPAY_WEBHOOK_SECRET`.

#### Processamento

Ao receber o webhook `billing.paid`:
1. O sistema busca a subscription pelo email do cliente
2. Atualiza o status para `active`
3. Salva o `billingId` se ainda não estiver salvo

### 5. Verificação de status

**Endpoint**: `GET /api/v1/payments/subscription-status`

```typescript
// Response
{
  "hasSubscription": true,
  "status": "active"  // "pending" | "active" | "cancelled" | "expired"
}
```

## Variáveis de Ambiente

```env
# AbacatePay
ABACATEPAY_API_KEY=abc_xxx
ABACATEPAY_API_BASE_URL=https://api.abacatepay.com/v1
ABACATEPAY_RETURN_URL=https://anotex.ai/payment/success
ABACATEPAY_COMPLETION_URL=https://anotex.ai/payment/complete
ABACATEPAY_WEBHOOK_SECRET=(SCARLETT)1*s
```

## Tabela de Assinaturas

**Tabela**: `user_subscriptions`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | uuid | ID único |
| user_id | uuid | ID do usuário (FK) |
| customer_name | text | Nome completo |
| customer_email | text | Email (em lowercase) |
| customer_cellphone | text | Celular |
| customer_tax_id | text | CPF |
| abacatepay_customer_id | text | ID do customer na AbacatePay |
| abacatepay_billing_id | text | ID do billing/checkout |
| status | text | pending, active, cancelled, expired |
| plan_id | text | ID do plano (futuro) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

## Fluxo de Cancelamento/Expiração

A AbacatePay também pode enviar webhooks para:
- `billing.expired` - Assinatura expirada
- `billing.cancelled` - Assinatura cancelada

Nesses casos, o status da subscription é atualizado para `expired` ou `cancelled`.

## Configuração do Webhook na AbacatePay

1. Acesse o painel da AbacatePay
2. Vá em Webhooks
3. Crie um novo webhook:
   - **URL**: `https://anotexai-production.up.railway.app/api/v1/payments/abacatepay/webhook`
   - **Secret**: Use o mesmo valor de `ABACATEPAY_WEBHOOK_SECRET`
   - **Eventos**: billing.paid, billing.expired, billing.cancelled

## Produtos

O produto cadastrado na AbacatePay:
- **ID**: `prod_uFHtgP3NQARHx35LtuFqRTT5`
- **Nome**: AnotEx Pro
- **Preço**: R$ 39,90

## Segurança

1. **Validação de webhook**: Apenas requests com o `webhookSecret` correto são aceitos
2. **Dados sensíveis**: Não armazenamos dados de cartão, apenas os dados pessoais necessários para emissão de nota fiscal
3. **Headers**: O backend usa `rawBody` para validação de assinatura (quando aplicável)

## Testes

Para testar locally, configure as variáveis de ambiente no `.env` do backend com as credenciais de sandbox da AbacatePay.
