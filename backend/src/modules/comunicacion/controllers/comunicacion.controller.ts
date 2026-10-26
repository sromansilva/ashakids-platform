import type { Request, Response, NextFunction } from 'express';
import { comunicacionService } from '../services/comunicacion.service.js';
import { enviarMensajeSchema, crearIncidenciaSchema } from '../dtos/comunicacion.dto.js';

export class ComunicacionController {
  async getMensajes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id_usuario || 1;
      const conUsuarioId = req.query.con ? parseInt(req.query.con as string, 10) : undefined;
      const result = await comunicacionService.getMensajes(usuarioId, conUsuarioId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async enviarMensaje(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const remitenteId = req.user?.id_usuario || 1;
      const dto = enviarMensajeSchema.parse(req.body);
      const result = await comunicacionService.enviarMensaje(remitenteId, dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async getNotificaciones(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id_usuario || 1;
      const result = await comunicacionService.getNotificaciones(usuarioId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async crearIncidencia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioId = req.user?.id_usuario || 1;
      const dto = crearIncidenciaSchema.parse(req.body);
      const result = await comunicacionService.crearIncidencia(usuarioId, dto);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}

export const comunicacionController = new ComunicacionController();

