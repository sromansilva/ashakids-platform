import type { Request, Response, NextFunction } from 'express';
import { pacientesService } from '../services/pacientes.service.js';
import { pacienteSchema } from '../dtos/pacientes.dto.js';

export class PacientesController {
  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await pacientesService.getAll();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const result = await pacientesService.getById(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = pacienteSchema.parse(req.body);
      const result = await pacientesService.create(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const pacientesController = new PacientesController();
