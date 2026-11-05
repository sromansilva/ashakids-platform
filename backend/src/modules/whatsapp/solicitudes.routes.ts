import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  SOLICITUD_ESTADOS,
  aprobarSolicitud,
  listarSolicitudes,
  rechazarSolicitud,
} from './solicitudes.service.js';

const idSchema = z.string().regex(/^[1-9]\d{0,9}$/).transform(Number);
const estadoSchema = z.enum(SOLICITUD_ESTADOS);

function sendError(err: unknown, res: Response, next: NextFunction) {
  const status = (err as { status?: number } | null)?.status;
  if (status && status >= 400 && status < 500) {
    const message = (err as Error).message;
    // `detail` es lo que lee el cliente HTTP del frontend.
    res.status(status).json({ detail: message, error: message });
    return;
  }
  next(err);
}

// GET /api/v1/admin/solicitudes-acceso?estado=
export async function listarSolicitudesAcceso(req: Request, res: Response, next: NextFunction) {
  try {
    const rawEstado = typeof req.query.estado === 'string' && req.query.estado ? req.query.estado.toUpperCase() : undefined;
    const estado = rawEstado === undefined ? undefined : estadoSchema.safeParse(rawEstado);
    if (estado && !estado.success) {
      res.status(400).json({ detail: 'Estado de solicitud no válido.', error: 'Estado de solicitud no válido.' });
      return;
    }
    res.json(await listarSolicitudes(estado?.data));
  } catch (err) {
    sendError(err, res, next);
  }
}

function reviewHandler(action: typeof aprobarSolicitud) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = idSchema.safeParse(req.params.id);
      if (!id.success) {
        res.status(400).json({ detail: 'Identificador de solicitud no válido.', error: 'Identificador de solicitud no válido.' });
        return;
      }
      res.json(await action(id.data, Number(req.user?.id_usuario)));
    } catch (err) {
      sendError(err, res, next);
    }
  };
}

// POST /api/v1/admin/solicitudes-acceso/:id/aprobar
export const aprobarSolicitudAcceso = reviewHandler(aprobarSolicitud);
// POST /api/v1/admin/solicitudes-acceso/:id/rechazar
export const rechazarSolicitudAcceso = reviewHandler(rechazarSolicitud);
