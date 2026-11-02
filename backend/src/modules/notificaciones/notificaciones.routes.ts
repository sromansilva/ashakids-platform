import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authenticate } from '../../core/middleware/auth.middleware.js';
import { notificacionesService } from './notificaciones.service.js';

export const notificacionesRouter = Router();
notificacionesRouter.use(authenticate);

const preferencesSchema = z.object({
  nueva_cita: z.boolean(),
  cancelacion: z.boolean(),
  reprogramacion: z.boolean(),
  recordatorio: z.boolean(),
  mensajes: z.boolean(),
}).strict();

// GET /api/v1/notificaciones/preferencias
notificacionesRouter.get('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id_usuario;
    const prefs = await notificacionesService.getPreferencias(userId);
    res.json(prefs);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/notificaciones/preferencias
notificacionesRouter.put('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id_usuario;
    const parsed = preferencesSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Las preferencias de notificación no son válidas.' });
    const prefs = await notificacionesService.guardarPreferencias(userId, parsed.data);
    res.json(prefs);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/notificaciones
notificacionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id_usuario;
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({ error: 'La paginación no es válida.' });
    }
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
    const userId = req.user!.id_usuario;
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
    const userId = req.user!.id_usuario;
    const notif = await notificacionesService.marcarLeida(key, userId);
    res.json(notif);
  } catch (err) {
    next(err);
  }
});
