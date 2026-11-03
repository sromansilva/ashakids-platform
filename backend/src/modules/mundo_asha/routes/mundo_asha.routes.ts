import { Router } from 'express';
import { mundoAshaController } from '../controllers/mundo_asha.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const mundoAshaRouter = Router();

mundoAshaRouter.get('/mundos', (req, res, next) => mundoAshaController.getCatalogo(req, res, next));
mundoAshaRouter.use(authenticate);
mundoAshaRouter.post('/progreso', requireRoles(['ADMIN', 'PADRE']), (req, res, next) => mundoAshaController.guardarProgreso(req, res, next));
// Retired duplicate voice API: family voice activities use the consent-checked
// multipart endpoint under /educacion/voz/transcribir.
mundoAshaRouter.post('/voz/reconocimiento', requireRoles(['ADMIN', 'PADRE']), (_req, res) =>
  res.status(410).json({ error: 'Esta ruta fue retirada. Usa el servicio vigente de voz para las actividades familiares.' })
);

