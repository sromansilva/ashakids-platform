import { Router } from 'express';
import { mundoAshaController } from '../controllers/mundo_asha.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';
import { settings } from '../../../core/config.js';

export const mundoAshaRouter = Router();

mundoAshaRouter.get('/mundos', (req, res, next) => mundoAshaController.getCatalogo(req, res, next));
mundoAshaRouter.use((req, res, next) => {
  if (settings.ENVIRONMENT === 'production') return authenticate(req, res, next);
  next();
});
mundoAshaRouter.post('/progreso', (req, res, next) => mundoAshaController.guardarProgreso(req, res, next));
mundoAshaRouter.post('/voz/reconocimiento', (req, res, next) => mundoAshaController.reconocerVoz(req, res, next));

