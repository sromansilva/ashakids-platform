import { pool } from '../../core/database.js';
import { purgeStaleData } from './whatsapp.conversation.js';

const SCHEDULER_LOCK_A = 8612;
const SCHEDULER_LOCK_B = 4;
const POLL_MS = 60 * 60 * 1000; // 1 hora

/**
 * Planificador periódico de purga y retención de datos de WhatsApp:
 * - Borra borradores abandonados (> 24 h)
 * - Borra identificadores de mensajes procesados (> 7 d)
 * - Borra solicitudes rechazadas vencidas (> WHATSAPP_RETENTION_DAYS)
 * - Anonimiza solicitudes aprobadas vencidas (> WHATSAPP_RETENTION_DAYS)
 *
 * Funciona de manera independiente a si WHATSAPP_ENABLED está activo o no,
 * asegurando la higiene y privacidad de datos históricos.
 */
export class WhatsAppRetentionScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private inFlight: Promise<void> | null = null;

  start(): void {
    if (this.timer) return;
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), POLL_MS);
    this.timer.unref?.();
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await this.inFlight;
  }

  runOnce(): Promise<void> | null {
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.execute()
      .catch((error) => {
        console.warn(
          '[WhatsAppRetentionScheduler] Error en ciclo de purga de retención:',
          error instanceof Error ? error.message : String(error),
        );
      })
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }

  private async execute(): Promise<void> {
    let client;
    let locked = false;
    try {
      client = await pool.connect();
      const lockResult = await client.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock($1, $2) AS locked;',
        [SCHEDULER_LOCK_A, SCHEDULER_LOCK_B],
      );
      locked = Boolean(lockResult.rows[0]?.locked);
      if (!locked) return;

      await purgeStaleData();
    } catch (error) {
      console.error(
        '[WhatsAppRetentionScheduler] No se pudo ejecutar la purga de retención:',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      if (client) {
        if (locked) {
          try {
            await client.query('SELECT pg_advisory_unlock($1, $2);', [SCHEDULER_LOCK_A, SCHEDULER_LOCK_B]);
          } catch {
            console.error('[WhatsAppRetentionScheduler] No se pudo liberar el bloqueo del planificador.');
          }
        }
        client.release();
      }
    }
  }
}

export const whatsAppRetentionScheduler = new WhatsAppRetentionScheduler();
