import { Router, Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';
import { listarIncidenciasAdmin, cambiarEstadoIncidenciaAdmin } from '../../incidencias/incidencias.routes.js';

export const adminRouter = Router();

// Require authenticated ADMIN role for administration endpoints
adminRouter.use(authenticate, requireRoles(['ADMIN']));

// GET /api/v1/admin/me
adminRouter.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const profile = await adminService.getMe(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/auditoria
adminRouter.get('/auditoria', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.getAuditoria();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/cuentas
adminRouter.get('/cuentas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rol = req.query.rol as string | undefined;
    const search = req.query.search as string | undefined;
    const activo = req.query.activo !== undefined ? req.query.activo === 'true' : undefined;
    const result = await adminService.getCuentas({ rol, search, activo });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/cuentas/:id
adminRouter.get('/cuentas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const cuenta = await adminService.getCuenta(id);
    if (!cuenta) return res.status(404).json({ detail: 'Cuenta no encontrada' });
    res.json(cuenta);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/cuentas/padres
adminRouter.post('/cuentas/padres', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.crearPadre(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/cuentas/terapeutas
adminRouter.post('/cuentas/terapeutas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.crearTerapeuta(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/familias
adminRouter.post('/familias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adminService.registrarFamilia(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH & PUT /api/v1/admin/cuentas/:id
const updateCuentaHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await adminService.actualizarCuenta(id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
adminRouter.patch('/cuentas/:id', updateCuentaHandler);
adminRouter.put('/cuentas/:id', updateCuentaHandler);

// PATCH & PUT /api/v1/admin/cuentas/:id/suspender
const suspenderCuentaHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await adminService.suspenderCuenta(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
adminRouter.patch('/cuentas/:id/suspender', suspenderCuentaHandler);
adminRouter.put('/cuentas/:id/suspender', suspenderCuentaHandler);

// PATCH & PUT /api/v1/admin/cuentas/:id/activar
const activarCuentaHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await adminService.activarCuenta(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
adminRouter.patch('/cuentas/:id/activar', activarCuentaHandler);
adminRouter.put('/cuentas/:id/activar', activarCuentaHandler);

// DELETE /api/v1/admin/cuentas/:id
adminRouter.delete('/cuentas/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await adminService.eliminarCuenta(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/cuentas/:id/hijos
adminRouter.get('/cuentas/:id/hijos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await adminService.getHijosDePadre(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH & PUT /api/v1/admin/pacientes/:id/reactivar
const reactivarHijoHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const result = await adminService.reactivarHijo(id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
adminRouter.patch('/pacientes/:id/reactivar', reactivarHijoHandler);
adminRouter.put('/pacientes/:id/reactivar', reactivarHijoHandler);

// Admin Incidencias endpoints
adminRouter.get('/incidencias', listarIncidenciasAdmin);
adminRouter.patch('/incidencias/:id', cambiarEstadoIncidenciaAdmin);
