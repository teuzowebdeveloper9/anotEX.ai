import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  ALLOWED_ORIGINS: Joi.string().required(),

  SUPABASE_URL: Joi.string().uri().required(),
  SUPABASE_ANON_KEY: Joi.string().required(),
  SUPABASE_SERVICE_ROLE_KEY: Joi.string().required(),

  GROQ_API_KEY: Joi.string().required(),

  R2_ACCOUNT_ID: Joi.string().required(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  R2_PUBLIC_URL: Joi.string().uri().required(),

  UPSTASH_REDIS_URL: Joi.string().required(),
  UPSTASH_REDIS_TOKEN: Joi.string().required(),

  MAX_AUDIO_SIZE_MB: Joi.number().default(100),
  SIGNED_URL_EXPIRES_IN_SECONDS: Joi.number().default(900),
});
