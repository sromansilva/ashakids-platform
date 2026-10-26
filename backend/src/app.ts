import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { settings } from './core/config.js';
import { pool } from './core/database.js';
import { securityHeaders } from './core/middleware/security.middleware.js';
import { errorHandler, notFoundHandler } from './core/middleware/error.middleware.js';

// Modular Routers
import { authRouter } from './modules/auth/routes/auth.routes.js';
import { adminRouter } from './modules/admin/routes/admin.routes.js';
import { terapeutaRouter } from './modules/terapeuta/routes/terapeuta.routes.js';
import { padreRouter } from './modules/padre/routes/padre.routes.js';
import { pacientesRouter } from './modules/pacientes/routes/pacientes.routes.js';
import { citasRouter } from './modules/citas/citas.routes.js';
import { sesionesRouter } from './modules/sesiones/sesiones.routes.js';
import { usuariosRouter } from './modules/usuarios/usuarios.routes.js';
import { tratamientosRouter } from './modules/tratamientos/tratamientos.routes.js';
import { notificacionesRouter } from './modules/notificaciones/notificaciones.routes.js';
import { conversacionesRouter } from './modules/conversaciones/conversaciones.routes.js';
import { incidenciasRouter } from './modules/incidencias/incidencias.routes.js';
import { juegosRouter } from './modules/juegos/juegos.routes.js';
import { educacionRouter } from './modules/educacion/educacion.routes.js';
import { valoracionesRouter } from './modules/valoraciones/valoraciones.routes.js';
import { newsletterRouter } from './modules/newsletter/newsletter.routes.js';

// Legacy Module Routers for backward compatibility
import { agendaRouter } from './modules/agenda/routes/agenda.routes.js';
import { clinicaRouter } from './modules/clinica/routes/clinica.routes.js';
import { comunicacionRouter } from './modules/comunicacion/routes/comunicacion.routes.js';
import { mundoAshaRouter } from './modules/mundo_asha/routes/mundo_asha.routes.js';

export function createApp() {
  const app = express();
  const frontendDistPath =
    process.env.FRONTEND_DIST_DIR || path.resolve(process.cwd(), '../frontend-dist');
  const frontendIndexPath = path.join(frontendDistPath, 'index.html');
  const servesFrontend = existsSync(frontendIndexPath);

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

  if (servesFrontend) {
    app.use(express.static(frontendDistPath));
  }

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

  // System Readiness Check
  app.get('/health/ready', async (_req, res) => {
    try {
      await pool.query('SELECT 1;');
      res.json({ status: 'ready', database: 'connected' });
    } catch (err: any) {
      res.status(503).json({ status: 'unready', database: 'disconnected', error: err?.message });
    }
  });

  // Mount Standard REST Routers (Catalog Specification)
  app.use(`${settings.API_V1_PREFIX}/auth`, authRouter);
  app.use(`${settings.API_V1_PREFIX}/admin`, adminRouter);
  app.use(`${settings.API_V1_PREFIX}/terapeutas`, terapeutaRouter);
  app.use(`${settings.API_V1_PREFIX}/padres`, padreRouter);
  app.use(`${settings.API_V1_PREFIX}/pacientes`, pacientesRouter);
  app.use(`${settings.API_V1_PREFIX}/citas`, citasRouter);
  app.use(`${settings.API_V1_PREFIX}/sesiones`, sesionesRouter);
  app.use(`${settings.API_V1_PREFIX}/usuarios`, usuariosRouter);
  app.use(`${settings.API_V1_PREFIX}/tratamientos`, tratamientosRouter);
  app.use(`${settings.API_V1_PREFIX}/notificaciones`, notificacionesRouter);
  app.use(`${settings.API_V1_PREFIX}/conversaciones`, conversacionesRouter);
  app.use(`${settings.API_V1_PREFIX}/incidencias`, incidenciasRouter);
  app.use(`${settings.API_V1_PREFIX}/juegos`, juegosRouter);
  app.use(`${settings.API_V1_PREFIX}/educacion`, educacionRouter);
  app.use(`${settings.API_V1_PREFIX}/valoraciones`, valoracionesRouter);
  app.use(`${settings.API_V1_PREFIX}/newsletter`, newsletterRouter);

  // Backward compatibility alias mounts
  app.use(`${settings.API_V1_PREFIX}/agenda`, agendaRouter);
  app.use(`${settings.API_V1_PREFIX}/clinica`, clinicaRouter);
  app.use(`${settings.API_V1_PREFIX}/comunicacion`, comunicacionRouter);
  app.use(`${settings.API_V1_PREFIX}/mundo-asha`, mundoAshaRouter);

  if (servesFrontend) {
    app.get(/.*/, (req, res, next) => {
      if (
        req.path.startsWith(`${settings.API_V1_PREFIX}/`) ||
        req.path === '/health' ||
        req.path.startsWith('/health/') ||
        !req.accepts('html')
      ) {
        return next();
      }

      return res.sendFile(frontendIndexPath);
    });
  }

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
