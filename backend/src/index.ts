import { app } from './app.js';
import { settings } from './core/config.js';
import { pool } from './core/database.js';
import { migrateIncidencias } from './modules/incidencias/incidencias.migration.js';
import { seedIncidencias } from './modules/incidencias/incidencias.seed.js';
import { migrateTerapeutaProfile } from './modules/terapeuta/terapeuta-profile.migration.js';

let server: ReturnType<typeof app.listen> | undefined;
let shutdownRequested = false;

async function startServer(): Promise<void> {
  try {
    // Schema migrations finish before requests can reach routes that use the new columns.
    const migrations = await Promise.allSettled([migrateIncidencias(), migrateTerapeutaProfile()]);
    const failedMigration = migrations.find((result) => result.status === 'rejected');
    if (failedMigration?.status === 'rejected') throw failedMigration.reason;
    await seedIncidencias();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Bootstrap] Aviso: No se pudieron aplicar todas las migraciones o seeds (continuando):', message);
  }

  if (shutdownRequested) {
    await pool.end();
    return;
  }
  server = app.listen(settings.PORT, settings.HOST, () => {
    console.log(`🚀 ASHAKids TypeScript Backend listening on http://${settings.HOST}:${settings.PORT}`);
    console.log(`📁 Modular Layered Architecture enabled.`);
    console.log(`🔗 API Prefix: ${settings.API_V1_PREFIX}`);
  });
}

void startServer();

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  shutdownRequested = true;
  if (!server) {
    void pool.end().finally(() => process.exit(0));
    return;
  }
  server.close(async () => {
    console.log('HTTP server closed.');
    await pool.end();
    process.exit(0);
  });
});
