import { app } from './app.js';
import { settings } from './core/config.js';
import { migrateIncidencias } from './modules/incidencias/incidencias.migration.js';
import { seedIncidencias } from './modules/incidencias/incidencias.seed.js';

// Inicializar esquema y seed de incidencias de forma resiliente
migrateIncidencias()
  .then(() => seedIncidencias())
  .catch((err) => {
    console.warn('[Bootstrap] Aviso: No se pudo auto-migrar o sembrar incidencias (continuando):', err?.message || err);
  });

const server = app.listen(settings.PORT, settings.HOST, () => {
  console.log(`🚀 ASHAKids TypeScript Backend listening on http://${settings.HOST}:${settings.PORT}`);
  console.log(`📁 Modular Layered Architecture enabled.`);
  console.log(`🔗 API Prefix: ${settings.API_V1_PREFIX}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});
