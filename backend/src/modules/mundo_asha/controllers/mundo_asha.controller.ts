import type { Request, Response, NextFunction } from 'express';
import { mundoAshaService } from '../services/mundo_asha.service.js';
import { progresoJuegoSchema, reconocimientoVozSchema } from '../dtos/mundo_asha.dto.js';

export class MundoAshaController {
  async getCatalogo(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await mundoAshaService.getCatalogoMundos();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async guardarProgreso(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = progresoJuegoSchema.parse(req.body);
      const result = await mundoAshaService.guardarProgreso(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async reconocerVoz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = reconocimientoVozSchema.parse(req.body);
      const result = await mundoAshaService.reconocerVoz(dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const mundoAshaController = new MundoAshaController();

