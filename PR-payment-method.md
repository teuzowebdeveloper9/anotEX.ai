# Pull Request: Payment Method - Integração AbacatePay

## Summary

Implementação do fluxo completo de pagamentos utilizando a AbacatePay para cobranças única (ONE_TIME) no plano Pro.

## Changes

### Backend

- **Nova tabela**: `user_subscriptions` para armazenar dados do cliente e status da assinatura
- **DTOs**: 
  - `save-customer-data.dto.ts` - dados do cliente (nome, email, CPF, celular)
  - Atualizado `create-abacatepay-checkout.dto.ts` - adicionados campos de customer
- **Repository**: `subscription.repository.impl.ts` - operações CRUD para assinaturas
- **Use Cases**:
  - `save-customer-data.use-case.ts` - salva dados do cliente
  - `process-webhook.use-case.ts` - processa eventos de pagamento
- **Provider**: `abacatepay.provider.impl.ts` - ajustado para API v1 com customer data
- **Controller**: Novos endpoints:
  - `POST /payments/save-customer-data` - salva dados do cliente
  - `GET /payments/subscription-status` - retorna status da assinatura

### Frontend

- **Modal de Dados**: `CustomerFormModal.tsx` - formulário para coleta de dados de pagamento com UI fruity metro
- **Pricing Section**: `PricingSection.tsx` - atualizado para usar dados do DB
- **API**: `createCheckout.ts` - novos endpoints para subscription
- **Hooks**: `useCheckout.ts` - gerencia estado de subscription
- **Types**: `pricing.types.ts` - tipos atualizados

### Database

- **Migration**: `20260330000000_subscriptions.sql` - cria tabela user_subscriptions

## Security Fixes

- Remoção de logs de dados sensíveis (API keys, dados do cliente)
- Validação de inputs com class-validator
- Webhook com verificação HMAC + secret

## Migration Needed

```bash
cd supabase && npx supabase db push
```

## Environment Variables

Adicionar ao `.env`:
```
ABACATEPAY_API_KEY=sua_chave
ABACATEPAY_WEBHOOK_SECRET=seu_secret
ABACATEPAY_PUBLIC_HMAC_KEY=sua_chave_hmac
```

## Testing

1. Criar checkout: `POST /api/v1/payments/abacatepay/checkout`
2. Salvar dados: `POST /api/v1/payments/save-customer-data`
3. Verificar status: `GET /api/v1/payments/subscription-status`
4. Webhook: `POST /api/v1/payments/abacatepay/webhook`

## Notes

- Em modo dev (sandbox), o webhook não é chamado automaticamente
- Em produção, o webhook ativará automaticamente após pagamento confirmado
- Dados do cliente são salvos no banco para uso em futuras cobranças
