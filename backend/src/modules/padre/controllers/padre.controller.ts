import type { Request, Response, NextFunction } from 'express';
import { padreService } from '../services/padre.service.js';
import { registrarHijoSchema, reservarCitaPadreSchema } from '../dtos/padre.dto.js';

export class PadreController {
  async getMe(req: Request, res: Response): Promise<void> {
    res.json({
      ...(req.user || {}),
      modulo: 'FAMILIA_PADRE',
    });
  }

  async getHijos(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const padreId = req.user?.id_usuario || 1;
      const result = await padreService.getHijos(padreId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async registrarHijo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const padreId = req.user?.id_usuario || 1;
      const dto = registrarHijoSchema.parse(req.body);
      const result = await padreService.registrarHijo(padreId, dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async reservarCita(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const padreId = req.user?.id_usuario || 1;
      const dto = reservarCitaPadreSchema.parse(req.body);
      const result = await padreService.reservarCita(padreId, dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getProgresoHijo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pacienteId = parseInt(String(req.params.id_paciente), 10);
      const result = await padreService.getProgresoHijo(pacienteId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const padreController = new PadreController();
