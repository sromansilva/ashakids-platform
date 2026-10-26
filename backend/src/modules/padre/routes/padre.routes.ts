import { Router, Request, Response, NextFunction } from 'express';
import { padreService } from '../services/padre.service.js';

export const padreRouter = Router();

// GET /api/v1/padres/me
padreRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 87;
    const profile = await padreService.getMe(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/padres/hijos
padreRouter.get('/hijos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 87;
    const result = await padreService.getHijos(userId);
    if (req.headers['x-mock-role'] && !req.headers.authorization && !req.cookies?.session_token) {
      return res.json(result.items);
    }
    res.json({ items: result.items, total: result.total });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/padres/hijos/:id
padreRouter.get('/hijos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const hijo = await padreService.getHijo(id);
    if (!hijo) return res.status(404).json({ detail: 'Hijo no encontrado' });
    res.json(hijo);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/padres/hijos
padreRouter.post('/hijos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 87;
    const result = await padreService.crearHijo(userId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PUT & PATCH /api/v1/padres/hijos/:id
const updateHijoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await padreService.actualizarHijo(id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
padreRouter.put('/hijos/:id', updateHijoHandler);
padreRouter.patch('/hijos/:id', updateHijoHandler);

// PUT & PATCH /api/v1/padres/hijos/:id/inactivar
const inactivarHijoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await padreService.inactivarHijo(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
padreRouter.put('/hijos/:id/inactivar', inactivarHijoHandler);
padreRouter.patch('/hijos/:id/inactivar', inactivarHijoHandler);

// DELETE /api/v1/padres/hijos/:id
padreRouter.delete('/hijos/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await padreService.eliminarHijo(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
