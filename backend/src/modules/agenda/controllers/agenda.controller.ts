import type { Request, Response, NextFunction } from 'express';
import { agendaService } from '../services/agenda.service.js';
import { agendarCitaSchema, cambiarEstadoCitaSchema } from '../dtos/agenda.dto.js';

export class AgendaController {
  async getCitas(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fecha = req.query.fecha as string | undefined;
      const terapeutaId = req.query.terapeutaId ? parseInt(req.query.terapeutaId as string, 10) : undefined;
      const result = await agendaService.getCitas({ fecha, terapeutaId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async agendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = agendarCitaSchema.parse(req.body);
      const result = await agendaService.agendar(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async cambiarEstado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(String(req.params.id), 10);
      const dto = cambiarEstadoCitaSchema.parse(req.body);
      const result = await agendaService.cambiarEstado(id, dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const agendaController = new AgendaController();
