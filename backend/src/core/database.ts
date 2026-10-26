import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { settings } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  host: settings.DB_HOST,
  port: settings.DB_PORT,
  database: settings.DB_NAME,
  user: settings.DB_USER,
  password: settings.DB_PASSWORD,
  ssl: settings.DB_SSL_ENABLED ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const res = await pool.query('SELECT 1 as connected;');
    return res.rows.length > 0;
  } catch (err) {
    console.warn('[Database] PostgreSQL connection error:', err instanceof Error ? err.message : err);
    return false;
  }
}
