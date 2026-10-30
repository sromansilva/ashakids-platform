import { Router, Request, Response, NextFunction } from 'express';
import { incidenciasService } from './incidencias.service.js';
import { authenticate } from '../../core/middleware/auth.middleware.js';

export const incidenciasRouter = Router();

// Todas las operaciones de incidencias requieren usuario autenticado
incidenciasRouter.use(authenticate);

// POST /api/v1/incidencias - Registrar nueva incidencia (con clasificación automática)
incidenciasRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    const userId = user?.id_usuario || 1;
    const rol = user?.rol || user?.roles?.[0] || 'PADRE';
    const nombre = `${user?.nombres || 'Usuario'} ${user?.apellidos || 'AshaKids'}`.trim();

    const inc = await incidenciasService.crear(userId, rol, nombre, req.body);
    res.status(201).json(inc);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/incidencias/mis-incidencias - Historial de solicitudes enviadas por el usuario actual
incidenciasRouter.get('/mis-incidencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const items = await incidenciasService.listarMisIncidencias(userId);
    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/incidencias/recibidas/terapeuta - Bandeja de recibidas para terapeuta
incidenciasRouter.get('/recibidas/terapeuta', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user?.rol !== 'TERAPEUTA' && !user?.roles?.includes('TERAPEUTA') && user?.rol !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo terapeutas pueden consultar esta bandeja.' });
    }
    const items = await incidenciasService.listarRecibidasTerapeuta(user.id_usuario);
    res.json({ items, total: items.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/incidencias/recibidas/admin - Bandeja de recibidas para administración
incidenciasRouter.get('/recibidas/admin', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (user?.rol !== 'ADMIN' && !user?.roles?.includes('ADMIN')) {
      return res.status(403).json({ error: 'Solo administradores pueden consultar esta bandeja.' });
    }
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const result = await incidenciasService.listarRecibidasAdmin(offset, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/incidencias/terapeutas-relacionados - Lista de terapeutas para padres (sesiones previas y todos para 'Otro')
incidenciasRouter.get('/terapeutas-relacionados', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const result = await incidenciasService.obtenerTerapeutasRelacionados(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/incidencias/:id - Detalle de incidencia con validación de acceso
incidenciasRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const user = (req as any).user;
    const inc = await incidenciasService.obtenerPorId(id, user);
    res.json(inc);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/incidencias/:id/estado - Cambiar estado con validación de roles y permisos
incidenciasRouter.patch('/:id/estado', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { estado } = req.body;
    const user = (req as any).user;
    const inc = await incidenciasService.cambiarEstado(id, estado, user);
    res.json(inc);
  } catch (err) {
    next(err);
  }
});

// Handlers heredados para compatibilidad con AdminRouter (/api/v1/admin/incidencias)
export async function listarIncidenciasAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const result = await incidenciasService.listarRecibidasAdmin(offset, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function cambiarEstadoIncidenciaAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(String(req.params.id), 10);
    const { estado } = req.body;
    const user = (req as any).user || { id_usuario: 1, rol: 'ADMIN', roles: ['ADMIN'] };
    const inc = await incidenciasService.cambiarEstado(id, estado, user);
    res.json(inc);
  } catch (err) {
    next(err);
  }
}
