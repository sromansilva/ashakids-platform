import { Router } from 'express';
import { mundoAshaController } from '../controllers/mundo_asha.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const mundoAshaRouter = Router();

mundoAshaRouter.get('/mundos', (req, res, next) => mundoAshaController.getCatalogo(req, res, next));
mundoAshaRouter.use(authenticate);
mundoAshaRouter.post('/progreso', requireRoles(['ADMIN', 'PADRE']), (req, res, next) => mundoAshaController.guardarProgreso(req, res, next));
mundoAshaRouter.post('/voz/reconocimiento', requireRoles(['ADMIN', 'PADRE']), (req, res, next) => mundoAshaController.reconocerVoz(req, res, next));

