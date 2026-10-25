import { Router } from 'express';
import { agendaController } from '../controllers/agenda.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const agendaRouter = Router();

agendaRouter.use(authenticate);

agendaRouter.get('/citas', (req, res, next) => agendaController.getCitas(req, res, next));
agendaRouter.post('/citas', (req, res, next) => agendaController.agendar(req, res, next));
agendaRouter.patch('/citas/:id/estado', (req, res, next) => agendaController.cambiarEstado(req, res, next));

