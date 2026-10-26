import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

const defaultEnvPath = process.env.LOCALAPPDATA
  ? path.join(process.env.LOCALAPPDATA, 'AshaKids', 'backend.env')
  : '.env';

if (process.env.ASHAKIDS_ENV_FILE) {
  dotenv.config({ path: process.env.ASHAKIDS_ENV_FILE });
} else {
  dotenv.config({ path: defaultEnvPath });
  dotenv.config(); // fallback standard local .env
}

const envSchema = z.object({
  PORT: z.string().default('8000').transform((v) => {
    const p = parseInt(v, 10);
    return isNaN(p) ? 8000 : p;
  }),
  HOST: z.string().default('0.0.0.0'),
  ENVIRONMENT: z.enum(['development', 'production', 'test']).default('development'),
  PROJECT_NAME: z.string().default('ASHAKids REST API'),
  VERSION: z.string().default('1.0.0'),
  API_V1_PREFIX: z.string().default('/api/v1'),
  DB_HOST: z.string().default('127.0.0.1'),
  DB_PORT: z.string().default('5432').transform((v) => parseInt(v, 10) || 5432),
  DB_NAME: z.string().default('ashakids'),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('1234'),
  DB_SSL_ENABLED: z.string().optional().default('false').transform((v) => v === 'true'),
  JWT_SECRET: z.string().default('ashakids-secret-key-change-in-prod-2026-super-secure'),
  SESSION_COOKIE_NAME: z.string().default('ashakids_session'),
  OPENAI_API_KEY: z.string().optional(),
  WHISPER_MODEL: z.string().default('whisper-1'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
    .transform((val) => val.split(',').map((s) => s.trim())),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid backend environment variables: ${details}`);
}

export const settings = parsed.data;
