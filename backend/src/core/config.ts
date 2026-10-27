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
  SESSION_COOKIE_NAME: z.string().default('ashakids_session'),
  SESSION_TTL_HOURS: z.string().regex(/^\d+$/, 'debe ser un número entero').default('24').transform((v) => parseInt(v, 10)),
  OPENAI_API_KEY: z.string().optional(),
  WHISPER_MODEL: z.string().default('whisper-1'),
  ZOOM_ENABLED: z.string().optional().default('false').transform((v) => v === 'true'),
  ZOOM_ACCOUNT_ID: z.string().optional().default(''),
  ZOOM_CLIENT_ID: z.string().optional().default(''),
  ZOOM_CLIENT_SECRET: z.string().optional().default(''),
  ZOOM_HOST_USER_ID: z.string().optional().default(''),
  ZOOM_API_BASE_URL: z.string().optional().default('https://api.zoom.us/v2'),
  ZOOM_MEETING_DURATION_MINUTES: z.string().optional().default('40').transform((v) => parseInt(v, 10) || 40),
  GMAIL_ENABLED: z.string().optional().default('false').transform((v) => v === 'true'),
  GMAIL_CLIENT_ID: z.string().optional().default(''),
  GMAIL_CLIENT_SECRET: z.string().optional().default(''),
  GMAIL_REFRESH_TOKEN: z.string().optional().default(''),
  GMAIL_SENDER_EMAIL: z.string().optional().default(''),
  GMAIL_SENDER_NAME: z.string().optional().default('Ashakids'),
  PUBLIC_ORIGIN: z.string().optional().default('https://ashakids.life'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
    .transform((val) => val.split(',').map((s) => s.trim())),
}).superRefine((env, ctx) => {
  if (env.ENVIRONMENT !== 'production') return;

  for (const key of ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD', 'CORS_ORIGINS'] as const) {
    if (!process.env[key]?.trim()) {
      ctx.addIssue({ code: 'custom', path: [key], message: `es obligatorio cuando ENVIRONMENT=production` });
    }
  }
  if (env.DB_USER === 'postgres') {
    ctx.addIssue({ code: 'custom', path: ['DB_USER'], message: 'usa un usuario de aplicación sin privilegios de superusuario' });
  }
  if (env.DB_PASSWORD.length < 20) {
    ctx.addIssue({ code: 'custom', path: ['DB_PASSWORD'], message: 'debe tener al menos 20 caracteres en producción' });
  }
  if (env.DB_PASSWORD.startsWith('REPLACE_WITH_')) {
    ctx.addIssue({ code: 'custom', path: ['DB_PASSWORD'], message: 'reemplaza el valor de ejemplo antes de desplegar' });
  }
  if (env.CORS_ORIGINS.length === 0 || env.CORS_ORIGINS.some((origin) => !origin.startsWith('https://'))) {
    ctx.addIssue({ code: 'custom', path: ['CORS_ORIGINS'], message: 'solo se permiten orígenes HTTPS en producción' });
  }
  if (env.SESSION_TTL_HOURS < 1 || env.SESSION_TTL_HOURS > 168) {
    ctx.addIssue({ code: 'custom', path: ['SESSION_TTL_HOURS'], message: 'debe estar entre 1 y 168 horas' });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid backend environment variables: ${details}`);
}

export const settings = parsed.data;
