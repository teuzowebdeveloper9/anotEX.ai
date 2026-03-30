You reached the start of the range
Mar 30, 2026, 1:29 PM
Starting Container
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
(Use `node --trace-deprecation ...` to show where the warning was created)
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] ThrottlerModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [NestFactory] Starting Nest application...
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] DiscoveryModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +16ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [StorageRepositoryImpl] R2 inicializado | bucket=audios-anotex | accountId=14e52430...
(node:1) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] PaymentModule dependencies initialized +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] AppModule dependencies initialized +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[AbacatepayProvider] API Base URL: https://api.abacatepay.com/v1
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +2ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +5ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] BullModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] SpacedRepetitionModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] UserModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] SharingModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] StudyGroupModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] ChatModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] StudyFolderModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] AudioModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] StudyMaterialModule dependencies initialized +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [InstanceLoader] TranscriptionModule dependencies initialized +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM    WARN [LegacyRouteConverter] Unsupported route path: "/api/v1/*". In previous versions, the symbols ?, *, and + were used to denote optional or repeating path parameters. The latest version of "path-to-regexp" now requires the use of named parameters. For example, instead of using a route like /users/* to capture all routes starting with "/users", you should use /users/*path. For more details, refer to the migration guide. Attempting to auto-convert...
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] HealthController {/api/v1/health}: +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/health, GET} route +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] AudioController {/api/v1/audio}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/upload, POST} route +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id/url, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id/status, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/audio, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/audio/:id, DELETE} route +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] TranscriptionController {/api/v1/transcription}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/transcription, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-materials/:transcriptionId, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-materials/:transcriptionId/:type, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] StudyFolderController {/api/v1/study-folders}: +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/transcription/:audioId, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] StudyMaterialController {/api/v1/study-materials}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/items/:itemId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/recommendations, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/process-video, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] SharingController {/api/v1/sharing}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing, POST} route +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/public/:token, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/:id/toggle, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/study-folders/:id/items, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/sharing/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/shares, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/shares/:shareLinkId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, PATCH} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/members, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups/:id/members/:userId, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] StudyGroupController {/api/v1/groups}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/groups, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/user/export, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] ChatController {/api/v1/chat}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/conversations, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId, POST} route +1ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId/history, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/chat/:transcriptionId/history, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] SpacedRepetitionController {/api/v1/review}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/review/due, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/review, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] UserController {/api/v1/user}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/user, DELETE} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RoutesResolver] PaymentsController {/api/v1/payments}: +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/save-customer-data, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/subscription-status, GET} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/abacatepay/checkout, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:45 PM     LOG [RouterExplorer] Mapped {/api/v1/payments/abacatepay/webhook, POST} route +0ms
[Nest] 1  - 03/30/2026, 4:30:47 PM     LOG [ProcessVideoUseCase] yt-dlp standalone já presente e funcional
[Nest] 1  - 03/30/2026, 4:30:47 PM     LOG [NestApplication] Nest application successfully started +2ms
[Nest] 1  - 03/30/2026, 4:32:17 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:32:18 PM     LOG [HTTP] <-- GET / 304 567ms
[Nest] 1  - 03/30/2026, 4:32:19 PM     LOG [HTTP] <-- GET / 304 1561ms
[Nest] 1  - 03/30/2026, 4:32:19 PM     LOG [HTTP] <-- GET / 304 1548ms
[Nest] 1  - 03/30/2026, 4:32:26 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:32:26 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:32:26 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:32:27 PM     LOG [HTTP] <-- GET / 304 642ms
[Nest] 1  - 03/30/2026, 4:32:17 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:32:17 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:32:27 PM     LOG [HTTP] <-- GET / 304 1048ms
[Nest] 1  - 03/30/2026, 4:32:27 PM     LOG [HTTP] <-- GET / 304 1247ms
[Nest] 1  - 03/30/2026, 4:34:35 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:34:36 PM     LOG [HTTP] <-- GET / 304 697ms
[Nest] 1  - 03/30/2026, 4:34:47 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:34:47 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:34:47 PM     LOG [HTTP] --> GET /
[Nest] 1  - 03/30/2026, 4:34:48 PM     LOG [HTTP] <-- GET / 200 685ms
[Nest] 1  - 03/30/2026, 4:34:48 PM     LOG [HTTP] <-- GET / 200 1023ms
[Nest] 1  - 03/30/2026, 4:34:49 PM     LOG [HTTP] <-- GET / 200 1519ms
[Nest] 1  - 03/30/2026, 4:35:25 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 4:35:27 PM     LOG [HTTP] <-- POST / 201 1350ms
[Nest] 1  - 03/30/2026, 4:35:27 PM     LOG [HTTP] --> POST /
[Nest] 1  - 03/30/2026, 4:35:28 PM   ERROR [HTTP] POST /api/v1/payments/abacatepay/checkout 262ms | Product is not allowed for checkout
BadRequestException: Product is not allowed for checkout
    at CreateAbacatepayCheckoutUseCase.ensureProductAllowed (/app/dist/modules/payments/domain/use-cases/create-abacatepay-checkout.use-case.js:65:19)
    at CreateAbacatepayCheckoutUseCase.execute (/app/dist/modules/payments/domain/use-cases/create-abacatepay-checkout.use-case.js:27:14)
    at PaymentsController.createAbacatepayCheckout (/app/dist/modules/payments/presentation/controllers/payments.controller.js:65:67)
    at process.processTicksAndRejections (node:internal/process/task_queues:103:5)