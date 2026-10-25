import { Router } from 'express';
import { clinicaController } from '../controllers/clinica.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const clinicaRouter = Router();

clinicaRouter.use(authenticate);

clinicaRouter.get('/sesiones', (req, res, next) => clinicaController.getSesiones(req, res, next));
clinicaRouter.post('/sesiones', (req, res, next) => clinicaController.crearSesion(req, res, next));
clinicaRouter.post('/valoraciones', (req, res, next) => clinicaController.crearValoracion(req, res, next));

