import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('8000').transform((v) => {
    const p = parseInt(v, 10);
    return isNaN(p) ? 8000 : p;
  }),
  HOST: z.string().default('0.0.0.0').transform(() => '0.0.0.0'),
  ENVIRONMENT: z.enum(['development', 'production', 'test']).default('development'),
  PROJECT_NAME: z.string().default('ASHAKids REST API'),
  VERSION: z.string().default('1.0.0'),
  API_V1_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().optional(),
  DB_HOST: z.string().default('aws-1-us-east-1.pooler.supabase.com'),
  DB_PORT: z.string().default('5432').transform((v) => parseInt(v, 10) || 5432),
  DB_NAME: z.string().default('postgres'),
  DB_USER: z.string().default('postgres.isbnlvecqnkmiykkwpoj'),
  DB_PASSWORD: z.string().default('Mantequillademani1%'),
  JWT_SECRET: z.string().default('ashakids-secret-key-change-in-prod-2026'),
  SESSION_COOKIE_NAME: z.string().default('ashakids_session'),
  OPENAI_API_KEY: z.string().optional(),
  WHISPER_MODEL: z.string().default('whisper-1'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
    .transform((val) => val.split(',').map((s) => s.trim())),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
}

export const settings = parsed.success ? parsed.data : {
  PORT: 8000,
  HOST: '0.0.0.0',
  ENVIRONMENT: 'development' as const,
  PROJECT_NAME: 'ASHAKids REST API',
  VERSION: '1.0.0',
  API_V1_PREFIX: '/api/v1',
  DATABASE_URL: undefined,
  DB_HOST: 'aws-1-us-east-1.pooler.supabase.com',
  DB_PORT: 5432,
  DB_NAME: 'postgres',
  DB_USER: 'postgres.isbnlvecqnkmiykkwpoj',
  DB_PASSWORD: 'Mantequillademani1%',
  JWT_SECRET: 'ashakids-secret-key-change-in-prod-2026',
  SESSION_COOKIE_NAME: 'ashakids_session',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  WHISPER_MODEL: 'whisper-1',
  CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
};
