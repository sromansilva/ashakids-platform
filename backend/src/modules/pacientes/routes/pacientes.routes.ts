import { Router } from 'express';
import { pacientesController } from '../controllers/pacientes.controller.js';
import { authenticate } from '../../../core/middleware/auth.middleware.js';

export const pacientesRouter = Router();

pacientesRouter.use(authenticate);

pacientesRouter.get('/', (req, res, next) => pacientesController.getAll(req, res, next));
pacientesRouter.get('/:id', (req, res, next) => pacientesController.getById(req, res, next));
pacientesRouter.post('/', (req, res, next) => pacientesController.create(req, res, next));

