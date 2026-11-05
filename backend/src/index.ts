import { app } from './app.js';
import { settings } from './core/config.js';
import { pool } from './core/database.js';
import { migrateIncidencias } from './modules/incidencias/incidencias.migration.js';
import { seedIncidencias } from './modules/incidencias/incidencias.seed.js';
import { migrateTerapeutaProfile } from './modules/terapeuta/terapeuta-profile.migration.js';
import { migrateClinicaSchema } from './modules/clinica/clinica.migration.js';
import { migrateNotificacionesSchema } from './modules/notificaciones/notificaciones.migration.js';
import { migrateWhatsApp } from './modules/whatsapp/whatsapp.migration.js';
import { appointmentReminderScheduler } from './modules/notificaciones/recordatorios.scheduler.js';

let server: ReturnType<typeof app.listen> | undefined;
let shutdownRequested = false;

async function startServer(): Promise<void> {
  try {
    // Schema migrations finish before requests can reach routes that use the new columns.
    const migrations = await Promise.allSettled([
      migrateIncidencias(),
      migrateTerapeutaProfile(),
      migrateClinicaSchema(),
      migrateNotificacionesSchema(),
      migrateWhatsApp(),
    ]);
    const failedMigration = migrations.find((result) => result.status === 'rejected');
    if (failedMigration?.status === 'rejected') throw failedMigration.reason;
    // Los tickets y cuentas de ejemplo nunca se crean solos: requieren activación explícita fuera de producción.
    if (process.env.SEED_DEMO_INCIDENCIAS === 'true' && settings.ENVIRONMENT !== 'production') {
      await seedIncidencias();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Bootstrap] No se pudo completar el esquema requerido; el servidor no iniciará:', message);
    await pool.end();
    process.exitCode = 1;
    return;
  }

  if (shutdownRequested) {
    await pool.end();
    return;
  }
  server = app.listen(settings.PORT, settings.HOST, () => {
    console.log(`🚀 ASHAKids TypeScript Backend listening on http://${settings.HOST}:${settings.PORT}`);
    console.log(`📁 Modular Layered Architecture enabled.`);
    console.log(`🔗 API Prefix: ${settings.API_V1_PREFIX}`);
    appointmentReminderScheduler.start();
  });
}

void startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  shutdownRequested = true;
  if (!server) {
    void appointmentReminderScheduler.stop().finally(() => pool.end()).finally(() => process.exit(0));
    return;
  }
  server.close(async () => {
    console.log('HTTP server closed.');
    await appointmentReminderScheduler.stop();
    await pool.end();
    process.exit(0);
  });
});
