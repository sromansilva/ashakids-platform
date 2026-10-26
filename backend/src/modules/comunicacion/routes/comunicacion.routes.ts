import { Router } from 'express';
import { comunicacionController } from '../controllers/comunicacion.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const comunicacionRouter = Router();

comunicacionRouter.use(authenticate);

comunicacionRouter.get('/mensajes', (req, res, next) => comunicacionController.getMensajes(req, res, next));
comunicacionRouter.post('/mensajes', (req, res, next) => comunicacionController.enviarMensaje(req, res, next));
comunicacionRouter.get('/notificaciones', (req, res, next) => comunicacionController.getNotificaciones(req, res, next));
comunicacionRouter.post('/incidencias', (req, res, next) => comunicacionController.crearIncidencia(req, res, next));

