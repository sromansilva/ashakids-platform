import { Router } from 'express';
import { terapeutaController } from '../controllers/terapeuta.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const terapeutaRouter = Router();

terapeutaRouter.use(authenticate, requireRoles(['TERAPEUTA', 'ADMIN']));

terapeutaRouter.get('/me', (req, res) => terapeutaController.getMe(req, res));
terapeutaRouter.get('/disponibilidad', (req, res, next) => terapeutaController.getDisponibilidad(req, res, next));
terapeutaRouter.put('/disponibilidad', (req, res, next) => terapeutaController.updateDisponibilidad(req, res, next));
terapeutaRouter.get('/pacientes', (req, res, next) => terapeutaController.getPacientes(req, res, next));
terapeutaRouter.post('/reportes', (req, res, next) => terapeutaController.crearReporteClinico(req, res, next));

