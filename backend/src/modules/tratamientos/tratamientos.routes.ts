import { Router, Request, Response, NextFunction } from 'express';
import { pacientesService } from '../pacientes/services/pacientes.service.js';
import { authenticate, requireRoles } from '../../core/middleware/auth.middleware.js';

export const tratamientosRouter = Router();
tratamientosRouter.use(authenticate);

// POST /api/v1/tratamientos
tratamientosRouter.post('/', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trat = await pacientesService.crearTratamiento(req.body, req.user!);
    res.status(201).json(trat);
  } catch (err) {
    next(err);
  }
});

