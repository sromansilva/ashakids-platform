import { Router, Request, Response, NextFunction } from 'express';
import { pacientesService } from '../pacientes/services/pacientes.service.js';

export const tratamientosRouter = Router();

// POST /api/v1/tratamientos
tratamientosRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trat = await pacientesService.crearTratamiento(req.body);
    res.status(201).json(trat);
  } catch (err) {
    next(err);
  }
});

