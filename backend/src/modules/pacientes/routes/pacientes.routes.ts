import { Router, Request, Response, NextFunction } from 'express';
import { pacientesService } from '../services/pacientes.service.js';
import { getProgresoJuegos, registrarIntentoJuegos } from '../../juegos/juegos.routes.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';
import { assertPatientAccess } from '../../../core/security/clinical-access.js';

export const pacientesRouter = Router();
pacientesRouter.use(authenticate);

// GET /api/v1/pacientes
pacientesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string | undefined;
    const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const result = await pacientesService.getAll({ q, activo, limit, offset, user: req.user! });
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pacientes
pacientesRouter.post('/', requireRoles(['ADMIN', 'PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.rol === 'PADRE' ? req.user.id_usuario : undefined;
    const paciente = await pacientesService.create(req.body, userId);
    res.status(201).json(paciente);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/pacientes/:key
pacientesRouter.get('/:key', requireRoles(['ADMIN', 'PADRE', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const paciente = await pacientesService.getById(key, req.user);
    if (!paciente) {
      return res.status(404).json({ detail: 'Paciente no encontrado' });
    }
    res.json(paciente);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/pacientes/:key
pacientesRouter.put('/:key', requireRoles(['ADMIN', 'PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = req.user?.rol === 'PADRE' ? req.user.id_usuario : undefined;
    if (req.user?.rol === 'PADRE') await assertPatientAccess(req.user, key);
    const paciente = await pacientesService.update(key, req.body, userId);
    res.json(paciente);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/pacientes/:key
pacientesRouter.delete('/:key', requireRoles(['ADMIN', 'PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = req.user?.rol === 'PADRE' ? req.user.id_usuario : undefined;
    if (req.user?.rol === 'PADRE') await assertPatientAccess(req.user, key);
    const paciente = await pacientesService.deactivate(key, userId);
    res.json(paciente);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/pacientes/:key/recorrido
pacientesRouter.get('/:key/recorrido', requireRoles(['ADMIN', 'PADRE', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertPatientAccess(req.user!, key);
    const estado = await pacientesService.recorrido(key);
    res.json(estado);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/pacientes/:key/tratamientos
pacientesRouter.get('/:key/tratamientos', requireRoles(['ADMIN', 'PADRE', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertPatientAccess(req.user!, key);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const result = await pacientesService.tratamientos(key, { limit, offset });
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/pacientes/:key/juegos
pacientesRouter.get('/:key/juegos', requireRoles(['ADMIN', 'PADRE', 'TERAPEUTA']), async (req, res, next) => {
  try {
    await assertPatientAccess(req.user!, parseInt(String(req.params.key), 10));
    return getProgresoJuegos(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Clinical outcomes and at-home game practice are returned as separate datasets.
pacientesRouter.get('/:key/analiticas/fonemas', requireRoles(['ADMIN', 'TERAPEUTA']), async (req, res, next) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const periodDays = req.query.periodo_dias === undefined ? 30 : parseInt(String(req.query.periodo_dias), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'El paciente indicado no es válido.' });
    if (!Number.isInteger(periodDays) || periodDays < 1 || periodDays > 365) {
      return res.status(400).json({ error: 'El periodo debe estar entre 1 y 365 días.' });
    }
    await assertPatientAccess(req.user!, key);
    res.json(await pacientesService.getFonemeActivityAnalytics(key, periodDays));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/pacientes/:key/juegos/:world/intentos
pacientesRouter.post('/:key/juegos/:world/intentos', requireRoles(['ADMIN', 'PADRE', 'TERAPEUTA']), async (req, res, next) => {
  try {
    await assertPatientAccess(req.user!, parseInt(String(req.params.key), 10));
    return registrarIntentoJuegos(req, res, next);
  } catch (err) {
    next(err);
  }
});
