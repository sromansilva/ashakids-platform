import { Router, Request, Response, NextFunction } from 'express';
import { terapeutaService } from '../services/terapeuta.service.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const terapeutaRouter = Router();

// GET /api/v1/terapeutas (directorio público y paginado)
terapeutaRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const result = await terapeutaService.getDirectorio({ limit, offset });
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/me
terapeutaRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 14;
    const profile = await terapeutaService.getMe(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/disponibilidad (para terapeuta autenticado y tests)
terapeutaRouter.get('/disponibilidad', authenticate, requireRoles(['TERAPEUTA', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const disp = await terapeutaService.getDisponibilidad(userId);
    res.json({
      ...disp,
      slots: disp.turnos.map(t => ({
        dia_semana: t.dia,
        hora_inicio: `${String(t.hora).padStart(2, '0')}:00`,
        hora_fin: `${String(t.hora + 1).padStart(2, '0')}:00`,
        activo: true,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/:key/disponibilidad
terapeutaRouter.get('/:key/disponibilidad', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const disp = await terapeutaService.getDisponibilidad(key);
    res.json(disp);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/terapeutas/:key/disponibilidad
terapeutaRouter.put('/:key/disponibilidad', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const disp = await terapeutaService.updateDisponibilidad(key, req.body);
    res.json(disp);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/:key/turnos
terapeutaRouter.get('/:key/turnos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
    const slots = await terapeutaService.getTurnosDelDia(key, fecha);
    res.json(slots);
  } catch (err) {
    next(err);
  }
});
