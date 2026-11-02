import type { Request, Response, NextFunction } from 'express';
import { mundoAshaService } from '../services/mundo_asha.service.js';
import { progresoJuegoSchema, reconocimientoVozSchema } from '../dtos/mundo_asha.dto.js';
import { assertConsentAccess, assertPatientAccess, assertPatientOwner } from '../../../core/security/clinical-access.js';

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
      if (req.user!.rol === 'PADRE') await assertPatientOwner(req.user!, dto.id_paciente);
      else await assertPatientAccess(req.user!, dto.id_paciente);
      const result = await mundoAshaService.guardarProgreso(dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async reconocerVoz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = reconocimientoVozSchema.parse(req.body);
      if (req.user!.rol === 'PADRE') await assertPatientOwner(req.user!, dto.id_paciente);
      else await assertPatientAccess(req.user!, dto.id_paciente);
      await assertConsentAccess(dto.id_paciente);
      const result = await mundoAshaService.reconocerVoz(dto);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const mundoAshaController = new MundoAshaController();

