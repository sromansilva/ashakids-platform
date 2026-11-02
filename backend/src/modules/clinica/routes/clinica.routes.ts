import { Router } from 'express';
import { clinicaController } from '../controllers/clinica.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const clinicaRouter = Router();

clinicaRouter.use(authenticate);

clinicaRouter.get('/sesiones', (req, res, next) => clinicaController.getSesiones(req, res, next));
clinicaRouter.post('/sesiones', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) => clinicaController.crearSesion(req, res, next));
clinicaRouter.post('/valoraciones', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) => clinicaController.crearValoracion(req, res, next));

