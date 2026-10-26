import { Router } from 'express';
import { mundoAshaController } from '../controllers/mundo_asha.controller.js';

export const mundoAshaRouter = Router();

mundoAshaRouter.get('/mundos', (req, res, next) => mundoAshaController.getCatalogo(req, res, next));
mundoAshaRouter.post('/progreso', (req, res, next) => mundoAshaController.guardarProgreso(req, res, next));
mundoAshaRouter.post('/voz/reconocimiento', (req, res, next) => mundoAshaController.reconocerVoz(req, res, next));

