import { Router, Request, Response, NextFunction } from 'express';
import { notificacionesService } from './notificaciones.service.js';

export const notificacionesRouter = Router();

// GET /api/v1/notificaciones/preferencias
notificacionesRouter.get('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const prefs = await notificacionesService.getPreferencias(userId);
    res.json(prefs);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/notificaciones/preferencias
notificacionesRouter.put('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const prefs = await notificacionesService.guardarPreferencias(userId, req.body);
    res.json(prefs);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notificaciones
notificacionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const soloSinLeer = req.query.solo_sin_leer === 'true';

    const bandeja = await notificacionesService.getBandeja(userId, { limit, offset, soloSinLeer });
    res.json(bandeja);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/notificaciones/leidas
notificacionesRouter.post('/leidas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    await notificacionesService.marcarTodasLeidas(userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/notificaciones/:key/leida
notificacionesRouter.patch('/:key/leida', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = (req as any).user?.id_usuario || 1;
    const notif = await notificacionesService.marcarLeida(key, userId);
    res.json(notif);
  } catch (err) {
    next(err);
  }
});
