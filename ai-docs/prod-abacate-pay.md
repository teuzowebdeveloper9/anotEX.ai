{
	"statusCode": 400,
	"message": "Product is not allowed for checkout",
	"error": "BAD_REQUEST",
	"timestamp": "2026-03-30T13:45:47.398Z"
}

{
	"frequency": "SUBSCRIPTION",
	"priceInCents": 3990,
	"productId": "prod_ZzRqAYsduDYFKpfF1zwBbNzD"
}


```

est] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] TranscriptionController {/api/v1/transcription}: +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/transcription, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/transcription/:audioId, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] StudyMaterialController {/api/v1/study-materials}: +1ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-materials/:transcriptionId, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-materials/:transcriptionId/:type, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] StudyFolderController {/api/v1/study-folders}: +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders, GET} route +1ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/items, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/items/:itemId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/recommendations, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/process-video, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] SharingController {/api/v1/sharing}: +1ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/public/:token, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/:id/toggle, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] StudyGroupController {/api/v1/groups}: +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, DELETE} route +1ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/members, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/members/:userId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/shares, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/shares/:shareLinkId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] ChatController {/api/v1/chat}: +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/conversations, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId/history, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId/history, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] SpacedRepetitionController {/api/v1/review}: +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/review/due, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/review, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] UserController {/api/v1/user}: +1ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/user/export, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/user, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RoutesResolver] PaymentsController {/api/v1/payments}: +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/save-customer-data, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/subscription-status, GET} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/abacatepay/checkout, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:49 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/abacatepay/webhook, POST} route +0ms
[Nest] 1  - 03/30/2026, 1:43:50 PM     LOG [ProcessVideoUseCase] yt-dlp standalone já presente e funcional
[Nest] 1  - 03/30/2026, 1:43:50 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 1  - 03/30/2026, 1:44:45 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 1:44:46 PM     LOG [HTTP] <-- GET / 304 1145ms
[Nest] 1  - 03/30/2026, 1:44:48 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 1:44:48 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 1:44:49 PM     LOG [HTTP] <-- GET / 304 553ms
[Nest] 1  - 03/30/2026, 1:44:50 PM     LOG [HTTP] <-- GET / 304 1510ms
[Nest] 1  - 03/30/2026, 1:45:30 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 1:45:32 PM     LOG [HTTP] <-- POST / 201 2207ms
[Nest] 1  - 03/30/2026, 1:45:33 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 1:45:34 PM   ERROR [HTTP] POST /api/v1/payments/abacatepay/checkout 713ms | Product is not allowed for checkout
BadRequestException: Product is not allowed for checkout
    at CreateAbacatepayCheckoutUseCase.ensureProductAllowed (/app/dist/modules/payments/domain/use-cases/create-abacatepay-checkout.use-case.js:65:19)
    at CreateAbacatepayCheckoutUseCase.execute (/app/dist/modules/payments/domain/use-cases/create-abacatepay-checkout.use-case.js:27:14)
    at PaymentsController.createAbacatepayCheckout (/app/dist/modules/payments/presentation/controllers/payments.controller.js:65:67)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[Nest] 1  - 03/30/2026, 1:45:34 PM    WARN [HTTP] <-- POST / 400 969ms
[Nest] 1  - 03/30/2026, 1:45:44 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 1:45:45 PM     LOG [HTTP] <-- POST / 201 1393ms
[Nest] 1  - 03/30/2026, 1:45:46 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 1:45:47 PM   ERROR [HTTP] POST /api/v1/payments/abacatepay/checkout 294ms | Product is not allowed for checkout
BadRequestException: Product is not allowed for checkout
    at CreateAbacatepayCheckoutUseCase.ensureProductAllowed (/app/dist/modules/payments/domain/use-cases/create-abacatepay-checkout.use-case.js:65:19)
    at CreateAbacatepayCheckoutUseCase.execute (/app/dist/modules/payments/domain/use-cases/create-abacatepay-checkout.use-case.js:27:14)
    at PaymentsController.createAbacatepayCheckout (/app/dist/modules/payments/presentation/controllers/payments.controller.js:65:67)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
[Nest] 1  - 03/30/2026, 1:45:47 PM    WARN [HTTP] <-- POST / 400 577ms


```


Achei o ponto.

O erro não está dizendo que o produto está inativo no painel. Ele está dizendo que, para o fluxo de checkout que seu backend aceita, esse produto não é permitido. Isso aparece claramente no log: Product is not allowed for checkout, lançado dentro de ensureProductAllowed no seu use case CreateAbacatepayCheckoutUseCase. Também dá para ver que você está enviando um produto com frequency: "SUBSCRIPTION" e priceInCents: 3990.

Então o cenário mais provável é este:

Seu próprio backend está bloqueando o produto, antes ou durante a tentativa de criar o checkout. Ou seja, o problema provavelmente está numa regra sua, não necessariamente na tela da AbacatePay. O stack mostra isso de forma bem direta:

erro em CreateAbacatepayCheckoutUseCase.ensureProductAllowed
chamado por execute
vindo do endpoint /api/v1/payments/abacatepay/checkout
O que isso normalmente significa no código

Quase sempre essa função ensureProductAllowed faz uma dessas validações:

confere se o productId recebido bate com um ID fixo permitido em env/config
confere se o tipo do produto é aceito
confere se a frequência é a esperada
confere se o preço bate com o valor esperado
confere se o produto é de um tipo específico para checkout

No seu caso, como o log mostra que está indo SUBSCRIPTION com 3990, o suspeito principal é:

o productId usado no backend não é o mesmo do painel
ou a função permitiu só outro produto antigo
ou o backend está esperando outro tipo/formato de produto para checkout recorrente.
Uma pista importante

No print anterior, o produto do painel tinha um ID começando com prod_uFH....
No log enviado agora, o request mostra outro ID: prod_ZzRqAYsduDYFKpfF1zwBbNzD. Isso é um baita sinal de que:

ou você criou mais de um produto
ou o frontend/backend estão usando um ID antigo
ou o código está montando o checkout com o produto errado.
O que eu faria agora

Verifica no seu backend, dentro de ensureProductAllowed, algo assim:

lista de IDs permitidos
comparação com variável .env
regra do tipo if (productId !== process.env.ABACATEPAY_PRODUCT_ID) throw ...

Também verifica:

qual productId o frontend manda
qual productId está no .env
qual productId está no painel da AbacatePay

Os 3 precisam estar alinhados.

Em resumo

Não parece ser “produto inativo” na interface.
Parece ser bloqueio de regra interna do seu backend ou desalinhamento de productId entre painel, env e código.

Se você colar aqui o código de CreateAbacatepayCheckoutUseCase, especialmente o método ensureProductAllowed, eu te digo em segundos o erro exato.


## LOGS DO ABACATE PAY 


{
  "event": "withdraw.done",
  "data": {
    "transaction": {
      "id": "tran_uAZXkTTgbHrXTnGYfP0agqZB",
      "status": "COMPLETE",
      "devMode": false,
      "receiptUrl": "https://app.abacatepay.com/receipt/tran_uAZXkTTgbHrXTnGYfP0agqZB",
      "kind": "WITHDRAW",
      "amount": 3910,
      "platformFee": 80,
      "createdAt": "2026-03-30T14:14:18.533Z",
      "updatedAt": "2026-03-30T14:14:23.002Z"
    }
  },
  "devMode": false
}

{
  "statusCode": 404,
  "message": "Cannot POST /payments/abacatepay/webhook?webhookSecret=%28SCARLETT%291*s",
  "error": "NOT_FOUND",
  "timestamp": "2026-03-30T14:14:23.466Z"
} 

{
  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "bill_sgUTwnNPH1nRJQXNGQ0GX5Y5",
      "amount": 3990,
      "customer": {
        "id": "cust_JRYZ5d5zHArztQpRRWBQWSHe",
        "metadata": {
          "name": "Mateus da Silva ",
          "cellphone": "88988773236",
          "taxId": "11017339341",
          "email": "teuzosocial@gmail.com",
          "country": "",
          "zipCode": ""
        }
      },
      "frequency": "ONE_TIME",
      "kind": [
        "PIX",
        "CARD"
      ],
      "status": "PAID",
      "products": [
        {
          "publicId": "prod_rQP0GLmN3WMwrG51ChQChYTL",
          "externalId": "prod_ZzRqAYsduDYFKpfF1zwBbNzD",
          "quantity": 1
        }
      ],
      "paidAmount": 0,
      "couponsUsed": []
    },
    "payment": {
      "amount": 3990,
      "fee": 80,
      "method": "PIX"
    }
  },
  "devMode": false
}

{
  "statusCode": 401,
  "message": "Invalid AbacatePay webhook signature",
  "error": "UNAUTHORIZED",
  "timestamp": "2026-03-30T14:30:44.220Z"
}


webh_prod_ZsXZHZMPz6HX3nBC6q0XWHBC	
https://anotexai-production.up.railway.app/api/v1/payments/abacatepay/webhook	 

{
  "statusCode": 401,
  "message": "Invalid AbacatePay webhook signature",
  "error": "UNAUTHORIZED",
  "timestamp": "2026-03-30T15:10:23.416Z"
}



  "event": "billing.paid",
  "data": {
    "billing": {
      "id": "bill_RkeJNUq4ZbQfPf1Tj2WcRqHm",
      "amount": 3990,
      "customer": {
        "id": "cust_JRYZ5d5zHArztQpRRWBQWSHe",
        "metadata": {
          "name": "Mateus da Silva ",
          "cellphone": "88988773236",
          "taxId": "11017339341",
          "email": "teuzosocial@gmail.com",
          "country": "",
          "zipCode": ""
        }
      },
      "frequency": "ONE_TIME",
      "kind": [
        "PIX",
        "CARD"
      ],
      "status": "PAID",
      "products": [
        {
          "publicId": "prod_ny4GpFKCNLFCMk3Fuc0UYmdK",
          "externalId": "prod_uFHtgP3NQARHx35LtuFqRTT5",
          "quantity": 1
        }
      ],
      "paidAmount": 0,
      "couponsUsed": []
    },
    "payment": {
      "amount": 3990,
      "fee": 80,
      "method": "PIX"
    }
  },
  "devMode": false
} 