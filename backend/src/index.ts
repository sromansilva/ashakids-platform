import { app } from './app.js';
import { settings } from './core/config.js';

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

