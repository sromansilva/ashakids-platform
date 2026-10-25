import type { Request, Response, NextFunction } from 'express';
import { terapeutaService } from '../services/terapeuta.service.js';
import { updateDisponibilidadSchema, reporteClinicoSchema } from '../dtos/terapeuta.dto.js';

export class TerapeutaController {
  async getMe(req: Request, res: Response): Promise<void> {
    res.json({
      ...(req.user || {}),
      modulo: 'TERAPEUTA',
      especialidades: ['Lenguaje', 'Habla', 'Fluidez'],
    });
  }

  async getDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const terapeutaId = req.user?.id_usuario || 1;
      const result = await terapeutaService.getDisponibilidad(terapeutaId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateDisponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const terapeutaId = req.user?.id_usuario || 1;
      const dto = updateDisponibilidadSchema.parse(req.body);
      const result = await terapeutaService.updateDisponibilidad(terapeutaId, dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getPacientes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const terapeutaId = req.user?.id_usuario || 1;
      const result = await terapeutaService.getPacientes(terapeutaId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearReporteClinico(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = reporteClinicoSchema.parse(req.body);
      const result = await terapeutaService.crearReporteClinico(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const terapeutaController = new TerapeutaController();

