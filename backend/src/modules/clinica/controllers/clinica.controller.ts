import type { Request, Response, NextFunction } from 'express';
import { clinicaService } from '../services/clinica.service.js';
import { sesionClinicaSchema, valoracionInicialSchema } from '../dtos/clinica.dto.js';

export class ClinicaController {
  async getSesiones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pacienteId = req.query.pacienteId ? parseInt(req.query.pacienteId as string, 10) : undefined;
      const result = await clinicaService.getSesiones(pacienteId, req.user!);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearSesion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = sesionClinicaSchema.parse(req.body);
      const result = await clinicaService.crearSesion(dto, req.user!);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearValoracion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = valoracionInicialSchema.parse(req.body);
      const result = await clinicaService.crearValoracion(dto, req.user!);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const clinicaController = new ClinicaController();

