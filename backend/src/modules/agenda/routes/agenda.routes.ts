import { Router } from 'express';
import { agendaController } from '../controllers/agenda.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const agendaRouter = Router();

agendaRouter.use(authenticate);

agendaRouter.get('/citas', (req, res, next) => agendaController.getCitas(req, res, next));
agendaRouter.post('/citas', requireRoles(['PADRE', 'ADMIN']), (req, res, next) => agendaController.agendar(req, res, next));
agendaRouter.patch('/citas/:id/estado', requireRoles(['PADRE', 'TERAPEUTA', 'ADMIN']), (req, res, next) => agendaController.cambiarEstado(req, res, next));

