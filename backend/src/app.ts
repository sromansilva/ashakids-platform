import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { settings } from './core/config.js';
import { securityHeaders } from './core/middleware/security.middleware.js';
import { errorHandler, notFoundHandler } from './core/middleware/error.middleware.js';

// Modular Routers
import { authRouter } from './modules/auth/routes/auth.routes.js';
import { adminRouter } from './modules/admin/routes/admin.routes.js';
import { terapeutaRouter } from './modules/terapeuta/routes/terapeuta.routes.js';
import { padreRouter } from './modules/padre/routes/padre.routes.js';
import { pacientesRouter } from './modules/pacientes/routes/pacientes.routes.js';
import { agendaRouter } from './modules/agenda/routes/agenda.routes.js';
import { clinicaRouter } from './modules/clinica/routes/clinica.routes.js';
import { comunicacionRouter } from './modules/comunicacion/routes/comunicacion.routes.js';
import { mundoAshaRouter } from './modules/mundo_asha/routes/mundo_asha.routes.js';

export function createApp() {
  const app = express();

  // Basic security and parsing middlewares
  app.use(securityHeaders);
  app.use(
    cors({
      origin: settings.CORS_ORIGINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-mock-role'],
      exposedHeaders: ['X-Total-Count'],
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Root & Health check
  app.get('/', (_req, res) => {
    res.json({
      status: 'ok',
      service: settings.PROJECT_NAME,
      version: settings.VERSION,
      environment: settings.ENVIRONMENT,
    });
  });

  app.get(`${settings.API_V1_PREFIX}/health`, (_req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // Mount Modular Routes
  app.use(`${settings.API_V1_PREFIX}/auth`, authRouter);
  app.use(`${settings.API_V1_PREFIX}/admin`, adminRouter);
  app.use(`${settings.API_V1_PREFIX}/terapeutas`, terapeutaRouter);
  app.use(`${settings.API_V1_PREFIX}/padres`, padreRouter);
  app.use(`${settings.API_V1_PREFIX}/pacientes`, pacientesRouter);
  app.use(`${settings.API_V1_PREFIX}/agenda`, agendaRouter);
  app.use(`${settings.API_V1_PREFIX}/clinica`, clinicaRouter);
  app.use(`${settings.API_V1_PREFIX}/comunicacion`, comunicacionRouter);
  app.use(`${settings.API_V1_PREFIX}/mundo-asha`, mundoAshaRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();

