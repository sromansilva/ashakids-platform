import { Router } from 'express';
import { padreController } from '../controllers/padre.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const padreRouter = Router();

padreRouter.use(authenticate, requireRoles(['PADRE', 'ADMIN']));

padreRouter.get('/me', (req, res) => padreController.getMe(req, res));
padreRouter.get('/hijos', (req, res, next) => padreController.getHijos(req, res, next));
padreRouter.post('/hijos', (req, res, next) => padreController.registrarHijo(req, res, next));
padreRouter.post('/citas', (req, res, next) => padreController.reservarCita(req, res, next));
padreRouter.get('/hijos/:id_paciente/progreso', (req, res, next) => padreController.getProgresoHijo(req, res, next));

