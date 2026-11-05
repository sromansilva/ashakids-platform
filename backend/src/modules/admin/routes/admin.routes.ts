import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from '../services/admin.service.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';
import { listarIncidenciasAdmin, cambiarEstadoIncidenciaAdmin } from '../../incidencias/incidencias.routes.js';
import {
  listarSolicitudesAcceso,
  aprobarSolicitudAcceso,
  rechazarSolicitudAcceso,
} from '../../whatsapp/solicitudes.routes.js';

export const adminRouter = Router();

// Require authenticated ADMIN role for administration endpoints
adminRouter.use(authenticate, requireRoles(['ADMIN']));

const accountIdentitySchema = z.object({
  nombres: z.string().trim().min(1).max(60),
  apellidos: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(150),
});
const parentAccountSchema = accountIdentitySchema.extend({
  parentesco: z.string().trim().max(30).optional(),
  telefono: z.string().trim().max(12).optional(),
  direccion: z.string().trim().max(200).optional(),
});
const childAccountSchema = z.object({
  nombres_paciente: z.string().trim().min(1).max(60),
  apellidos_paciente: z.string().trim().min(1).max(80),
  fecha_nacimiento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
  }),
  sexo: z.enum(['Masculino', 'Femenino', 'Otro', 'M', 'F']),
  edad: z.number().int().min(0).max(18).optional(),
  avatar_nombre: z.string().max(80).optional(),
}).refine((child) => {
  const birth = new Date(`${child.fecha_nacimiento}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const month = now.getUTCMonth() - birth.getUTCMonth();
  if (month < 0 || (month === 0 && now.getUTCDate() < birth.getUTCDate())) age -= 1;
  return age >= 3 && age <= 12;
}, { message: 'La edad registrada debe estar entre 3 y 12 años.', path: ['fecha_nacimiento'] });
const familyAccountSchema = parentAccountSchema.extend({ hijos: z.array(childAccountSchema).min(1).max(10) });
const therapistAccountSchema = accountIdentitySchema.extend({
  especialidad: z.string().trim().max(100).optional(),
  anios_experiencia: z.number().int().min(0).max(70).optional(),
  idiomas: z.string().trim().max(50).optional(),
  descripcion_profesional: z.string().trim().max(2000).optional(),
});

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
    const parsed = parentAccountSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Revisa nombres, apellidos, correo y datos de contacto.' }); return; }
    const result = await adminService.crearPadre(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/cuentas/terapeutas
adminRouter.post('/cuentas/soporte', async (req, res, next) => {
  try {
    const parsed = accountIdentitySchema.strict().safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Revisa nombres, apellidos y correo.' }); return; }
    res.status(201).json(await adminService.crearSoporte(parsed.data));
  } catch (error) { next(error); }
});

adminRouter.post('/cuentas/terapeutas', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = therapistAccountSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Revisa nombres, apellidos, correo y perfil profesional.' }); return; }
    const result = await adminService.crearTerapeuta(parsed.data);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/familias
adminRouter.post('/familias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = familyAccountSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: 'Completa los datos de la familia y registra al menos un niño de 3 a 12 años.' }); return; }
    const result = await adminService.registrarFamilia(parsed.data);
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

adminRouter.post('/cuentas/:id/reenviar-activacion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.coerce.number().int().positive().safeParse(req.params.id);
    if (!id.success) return res.status(400).json({ detail: 'Identificador invalido.' });
    return res.json(await adminService.reenviarActivacion(id.data));
  } catch (err) { return next(err); }
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

// Solicitudes de acceso familiar recibidas por WhatsApp (el DNI solo se expone aquí)
adminRouter.get('/solicitudes-acceso', listarSolicitudesAcceso);
adminRouter.post('/solicitudes-acceso/:id/aprobar', aprobarSolicitudAcceso);
adminRouter.post('/solicitudes-acceso/:id/rechazar', rechazarSolicitudAcceso);
