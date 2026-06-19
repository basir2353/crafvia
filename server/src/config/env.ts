import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  STRIPE_CHECKOUT_URL: z.string().optional().default(''),
  DONATE_URL: z.string().url().default('https://buymeacoffee.com/crafvia'),
  FREE_DAILY_JOBS: z.coerce.number().default(50),
  PRO_DAILY_JOBS: z.coerce.number().default(1000),
  FREE_MAX_FILE_MB: z.coerce.number().default(20),
  PRO_MAX_FILE_MB: z.coerce.number().default(100),
  AI_PROVIDER: z
    .enum(['auto', 'openai', 'anthropic', 'gemini', 'groq', 'ollama', 'template'])
    .default('auto'),
  AI_DEV_FALLBACK: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  AI_ALLOW_FREE_ACCESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  OPENAI_API_KEY: z.string().optional().default(''),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().default('https://api.openai.com/v1'),
  GROQ_API_KEY: z.string().optional().default(''),
  GROQ_MODEL: z.string().default('llama-3.3-70b-versatile'),
  GROQ_BASE_URL: z.string().default('https://api.groq.com/openai/v1'),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  ANTHROPIC_MODEL: z.string().default('claude-3-5-haiku-latest'),
  GOOGLE_API_KEY: z.string().optional().default(''),
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_IMAGE_MODEL: z.string().default('gemini-2.5-flash-image'),
  OPENAI_IMAGE_MODEL: z.string().default('dall-e-3'),
  HUGGINGFACE_API_KEY: z.string().optional().default(''),
  HF_IMAGE_MODEL: z.string().default('black-forest-labs/FLUX.1-schnell'),
  IMAGE_PROVIDER: z
    .enum(['auto', 'openai', 'gemini', 'huggingface'])
    .default('auto'),
  OLLAMA_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((value) => value === 'true'),
  OLLAMA_BASE_URL: z.string().default('http://localhost:11434'),
  OLLAMA_MODEL: z.string().default('llama3.2'),
  ADMIN_EMAILS: z.string().optional().default(''),
})

export const env = envSchema.parse(process.env)
