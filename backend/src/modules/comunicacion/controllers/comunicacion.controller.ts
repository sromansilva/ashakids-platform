import type { Request, Response, NextFunction } from 'express';
import { comunicacionService } from '../services/comunicacion.service.js';
import { enviarMensajeSchema, crearIncidenciaSchema } from '../dtos/comunicacion.dto.js';
import { requireUser } from '../../../core/security/clinical-access.js';

function optionalRecipientId(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw Object.assign(new Error('El contacto indicado no es válido.'), { status: 400 });
  }
  return id;
}

export class ComunicacionController {
  async getMensajes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = requireUser(req);
      const counterpartUserId = optionalRecipientId(req.query.con);
      const result = await comunicacionService.getMensajes(user, counterpartUserId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async enviarMensaje(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = requireUser(req);
      const dto = enviarMensajeSchema.parse(req.body);
      const result = await comunicacionService.enviarMensaje(user, dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getNotificaciones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = requireUser(req);
      const result = await comunicacionService.getNotificaciones(user.id_usuario);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearIncidencia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = requireUser(req);
      const dto = crearIncidenciaSchema.parse(req.body);
      const result = await comunicacionService.crearIncidencia(user.id_usuario, dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const comunicacionController = new ComunicacionController();

