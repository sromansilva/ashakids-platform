import { Router, Request, Response, NextFunction } from 'express';
import { citasService } from './citas.service.js';
import { authenticate, requireRoles } from '../../core/middleware/auth.middleware.js';

export const citasRouter = Router();
citasRouter.use(authenticate);

// GET /api/v1/citas
citasRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const estado = req.query.estado as string | undefined;
    const terapeutaId = req.query.id_terapeuta ? parseInt(req.query.id_terapeuta as string, 10) : undefined;
    const pacienteId = req.query.id_paciente ? parseInt(req.query.id_paciente as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await citasService.listar({ estado, terapeutaId, pacienteId, limit, offset }, req.user!);
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/citas
citasRouter.post('/', requireRoles(['PADRE', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cita = await citasService.crear(req.body, req.user!);
    res.status(201).json(cita);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/citas/:key
citasRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const cita = await citasService.detalle(key, req.user!);
    if (!cita) {
      return res.status(404).json({ detail: 'Cita no encontrada' });
    }
    res.json(cita);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/citas/:key (reprogramar)
citasRouter.put('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const cita = await citasService.reprogramar(key, req.body, req.user!);
    res.json(cita);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/citas/:key/estado
citasRouter.patch('/:key/estado', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const { estado_reserva } = req.body;
    const cita = await citasService.cambiarEstado(key, estado_reserva, req.user!);
    res.json(cita);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/citas/:key/reunion
citasRouter.put('/:key/reunion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const { meet_url } = req.body;
    const cita = await citasService.actualizarReunion(key, meet_url ?? null, req.user!);
    res.json(cita);
  } catch (err) {
    next(err);
  }
});
