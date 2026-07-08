import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  ALLOWED_ORIGINS: Joi.string().required(),

  // Azure Database for PostgreSQL
  DATABASE_URL: Joi.string().required(),

  // Auth própria (magic link + JWT)
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  MAGIC_LINK_EXPIRES_IN_MINUTES: Joi.number().default(15),
  FRONTEND_URL: Joi.string().uri().required(),

  // Azure Communication Services (envio dos magic links)
  ACS_CONNECTION_STRING: Joi.string().required(),
  ACS_SENDER_ADDRESS: Joi.string().required(),

  // OpenAI
  OPENAI_API_KEY: Joi.string().required(),

  // Azure Blob Storage
  AZURE_STORAGE_ACCOUNT: Joi.string().required(),
  AZURE_STORAGE_KEY: Joi.string().required(),
  AZURE_STORAGE_CONTAINER: Joi.string().default('audios'),

  // Redis (Azure Managed Redis — porta 10000, TLS)
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(10000),
  REDIS_PASSWORD: Joi.string().required(),
  REDIS_TLS: Joi.string().valid('true', 'false').default('true'),

  ABACATEPAY_API_KEY: Joi.string().optional(),
  ABACATEPAY_API_BASE_URL: Joi.string().uri().default('https://api.abacatepay.com/v2'),
  ABACATEPAY_WEBHOOK_SECRET: Joi.string().optional(),
  ABACATEPAY_PUBLIC_HMAC_KEY: Joi.string().optional(),
  // Catálogo autoritativo: "productId:priceCents:Nome" separados por vírgula.
  // O preço é resolvido aqui no servidor — nunca aceito do cliente.
  ABACATEPAY_PRODUCTS: Joi.string().allow('').default(''),
  ABACATEPAY_RETURN_URL: Joi.string().uri().optional(),
  ABACATEPAY_COMPLETION_URL: Joi.string().uri().optional(),

  MAX_AUDIO_SIZE_MB: Joi.number().default(100),
  SIGNED_URL_EXPIRES_IN_SECONDS: Joi.number().default(900),

  YOUTUBE_API_KEY: Joi.string().required(),
});
