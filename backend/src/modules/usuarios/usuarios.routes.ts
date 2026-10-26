import { Router, Request, Response, NextFunction } from 'express';
import { usuariosService } from './usuarios.service.js';

export const usuariosRouter = Router();

// GET /api/v1/usuarios
usuariosRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string | undefined;
    const rol = req.query.rol as string | undefined;
    const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await usuariosService.listar({ q, rol, activo, limit, offset });
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/usuarios
usuariosRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usuariosService.crear(req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/usuarios/:key
usuariosRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const user = await usuariosService.detalle(key);
    if (!user) {
      return res.status(404).json({ detail: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/usuarios/:key
usuariosRouter.patch('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const user = await usuariosService.editar(key, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
});
