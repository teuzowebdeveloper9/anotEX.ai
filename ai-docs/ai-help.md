(node:1) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
(Use `node --trace-deprecation ...` to show where the warning was created)
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +15ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] ThrottlerModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +6ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] AppModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] PaymentModule dependencies initialized +1ms
[AbacatepayProvider] API Base URL: https://api.abacatepay.com/v1
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +2ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] SpacedRepetitionModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] UserModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] SharingModule dependencies initialized +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] StudyGroupModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] ChatModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] StudyFolderModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] AudioModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] StudyMaterialModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [InstanceLoader] TranscriptionModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM    WARN [LegacyRouteConverter] Unsupported route path: "/api/v1/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert...
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] HealthController {/api/v1/health}: +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/health, GET} route +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] AudioController {/api/v1/audio}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/upload, POST} route +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id/url, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id/status, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/audio, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id, DELETE} route +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] TranscriptionController {/api/v1/transcription}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/transcription, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/transcription/:audioId, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] StudyMaterialController {/api/v1/study-materials}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-materials/:transcriptionId, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-materials/:transcriptionId/:type, GET} route +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] StudyFolderController {/api/v1/study-folders}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/items, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/items/:itemId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/recommendations, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/process-video, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] SharingController {/api/v1/sharing}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing, POST} route +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/public/:token, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/:id/toggle, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] StudyGroupController {/api/v1/groups}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/members, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/members/:userId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/shares, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/shares/:shareLinkId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] ChatController {/api/v1/chat}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/conversations, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId/history, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId/history, DELETE} route +1ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] SpacedRepetitionController {/api/v1/review}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/review/due, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/review, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] UserController {/api/v1/user}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/user/export, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/user, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RoutesResolver] PaymentsController {/api/v1/payments}: +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/save-customer-data, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/subscription-status, GET} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/abacatepay/checkout, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/abacatepay/webhook, POST} route +0ms
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [ProcessVideoUseCase] yt-dlp standalone já presente e funcional
[Nest] 1  - 03/30/2026, 5:41:19 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 1  - 03/30/2026, 5:41:56 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:41:57 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:41:57 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:41:57 PM     LOG [HTTP] <-- GET / 200 608ms
[Nest] 1  - 03/30/2026, 5:41:57 PM     LOG [HTTP] <-- GET / 200 618ms
[Nest] 1  - 03/30/2026, 5:41:57 PM     LOG [HTTP] <-- GET / 200 573ms
[Nest] 1  - 03/30/2026, 5:42:45 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:42:46 PM     LOG [HTTP] <-- GET / 304 1144ms
[Nest] 1  - 03/30/2026, 5:43:01 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 5:43:02 PM     LOG [SaveCustomerDataUseCase] Saving customer data for user 5900347e-6f21-4674-b2fb-22362bb06e3b: {"name":"Mateus silva Oliveira","email":"mateuslinkedinlinkedin@gmail.com","cellphone":"88988773236","taxId":"11017339341"}
[Nest] 1  - 03/30/2026, 5:43:03 PM     LOG [SaveCustomerDataUseCase] Subscription saved: {"id":"a5e88e08-4812-4864-91fe-55fd07ed3804","userId":"5900347e-6f21-4674-b2fb-22362bb06e3b","customerName":"Mateus silva Oliveira","customerEmail":"mateuslinkedinlinkedin@gmail.com","customerCellphone":"88988773236","customerTaxId":"11017339341","abacatepayCustomerId":null,"abacatepayBillingId":null,"status":"pending","planId":null,"createdAt":"2026-03-30T17:43:03.351151+00:00","updatedAt":"2026-03-30T17:43:03.351151+00:00"}
[Nest] 1  - 03/30/2026, 5:43:03 PM     LOG [HTTP] <-- POST / 201 1827ms
[Nest] 1  - 03/30/2026, 5:43:04 PM     LOG [HTTP] --> POST /
[AbacatepayProvider] Creating checkout {
  url: 'https://api.abacatepay.com/v1/billing/create',
  hasCustomer: true
}
[AbacatepayProvider] Response status: 200
[Nest] 1  - 03/30/2026, 5:43:16 PM     LOG [HTTP] <-- POST / 201 12421ms
[Nest] 1  - 03/30/2026, 5:43:34 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:43:34 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:43:34 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 5:43:35 PM     LOG [HTTP] <-- GET / 304 1043ms
[Nest] 1  - 03/30/2026, 5:43:35 PM     LOG [HTTP] <-- GET / 304 1078ms
[Nest] 1  - 03/30/2026, 5:43:35 PM     LOG [HTTP] <-- GET / 200 1450ms
[Nest] 1  - 03/30/2026, 5:43:37 PM     LOG [HTTP] --> POST /?webhookSecret=%28SCARLETT%291*s
[Nest] 1  - 03/30/2026, 5:43:37 PM     LOG [ProcessWebhookUseCase] Processing webhook event: billing.paid
[Nest] 1  - 03/30/2026, 5:43:37 PM     LOG [ProcessWebhookUseCase] Raw webhook data: {"billing":{"id":"bill_3trRNsXqjKXxkhakJ4Tnc6bS","amount":3990,"customer":{"id":"cust_USQsAb2QP1FghuuZ3TSW0etT","metadata":{"name":"Mateus da Silva Oliveira","cellphone":"88988773236","taxId":"11017339341","email":"mateussoftwaredeveloper@gmail.com","country":"","zipCode":""}},"frequency":"ONE_TIME","kind":["PIX","CARD"],"status":"PAID","products":[{"publicId":"prod_EBJQDFuU2pfcfRYbgmmuP2AE","externalId":"prod_uFHtgP3NQARHx35LtuFqRTT5","quantity":1}],"paidAmount":0,"couponsUsed":[]},"payment":{"amount":3990,"fee":80,"method":"PIX"}}
[Nest] 1  - 03/30/2026, 5:43:37 PM     LOG [ProcessWebhookUseCase] Billing ID: bill_3trRNsXqjKXxkhakJ4Tnc6bS, userId from metadata: undefined
[Nest] 1  - 03/30/2026, 5:43:37 PM    WARN [ProcessWebhookUseCase] Subscription not found for email: mateussoftwaredeveloper@gmail.com
[Nest] 1  - 03/30/2026, 5:43:37 PM     LOG [HTTP] <-- POST /?webhookSecret=%28SCARLETT%291*s 200 273ms