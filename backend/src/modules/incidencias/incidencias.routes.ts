import { Router, Request, Response, NextFunction } from 'express';
import { incidenciasService } from './incidencias.service.js';

export const incidenciasRouter = Router();

// POST /api/v1/incidencias
incidenciasRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const rol = (req as any).user?.roles?.[0] || 'PADRE';
    const inc = await incidenciasService.crear(userId, rol, req.body);
    res.status(201).json(inc);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/incidencias
export async function listarIncidenciasAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const result = await incidenciasService.listar(offset, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/v1/admin/incidencias/:id
export async function cambiarEstadoIncidenciaAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { estado } = req.body;
    const inc = await incidenciasService.cambiarEstado(id, estado);
    res.json(inc);
  } catch (err) {
    next(err);
  }
}
