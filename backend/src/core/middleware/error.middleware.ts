import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Error de validación en la petición.',
      detalles: err.issues.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    });
    return;
  }

  const requestedStatus = (err as any).status;
  const statusCode = Number.isInteger(requestedStatus) && requestedStatus >= 400 && requestedStatus <= 599
    ? requestedStatus
    : 500;
  if (statusCode < 500) {
    res.status(statusCode).json({
      error: err.message,
      mensaje: err.message,
      detail: err.message,
      message: err.message,
    });
    return;
  }

  console.error('[API Error]:', err);
  res.status(statusCode).json({
    error: 'Error interno del servidor.',
    mensaje: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
}

