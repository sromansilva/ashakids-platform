import { Router, type RequestHandler } from 'express';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';
import { soporteService } from '../services/soporte.service.js';
import { estadosSoporte } from '../domain/soporte.js';

export const soporteRouter = Router();
soporteRouter.use(authenticate, requireRoles(['SOPORTE_TECNICO']));
const idSchema = z.coerce.number().int().positive();
const filtersSchema = z.object({
  estado: z.enum(estadosSoporte).optional(),
  prioridad: z.coerce.number().int().min(1).max(3).optional(),
  search: z.string().trim().max(150).optional(),
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
const createSchema = z.object({
  tipo: z.string().trim().min(1).max(50),
  descripcion: z.string().trim().min(5).max(1000),
  envio_id: z.string().uuid().optional(),
  area_destino: z.enum(['ADMINISTRACION', 'TERAPEUTA', 'SOPORTE_TECNICO']).optional(),
  id_terapeuta: z.number().int().positive().nullable().optional(),
}).strict();
const noteSchema = z.object({ contenido: z.string().trim().min(1).max(4000), interna: z.boolean().default(false) }).strict();
const route = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch((error: unknown) => {
    if (error instanceof z.ZodError) { res.status(400).json({ error: 'Revisa los datos de la solicitud.' }); return; }
    next(error);
  });
};
soporteRouter.get('/incidencias', route(async (req, res) => {
  res.json(await soporteService.listar(filtersSchema.parse(req.query)));
}));
soporteRouter.post('/incidencias', route(async (req, res) => {
  res.status(201).json(await soporteService.crear(req.user!, createSchema.parse(req.body)));
}));
soporteRouter.get('/incidencias/:id', route(async (req, res) => {
  res.json(await soporteService.obtener(idSchema.parse(req.params.id)));
}));
soporteRouter.patch('/incidencias/:id/estado', route(async (req, res) => {
  const { estado } = z.object({ estado: z.enum(estadosSoporte) }).strict().parse(req.body);
  res.json(await soporteService.estado(idSchema.parse(req.params.id), estado));
}));
soporteRouter.get('/incidencias/:id/notas', route(async (req, res) => {
  res.json({ items: await soporteService.notas(idSchema.parse(req.params.id)) });
}));
soporteRouter.post('/incidencias/:id/notas', route(async (req, res) => {
  res.status(201).json(await soporteService.responder(idSchema.parse(req.params.id), req.user!, noteSchema.parse(req.body)));
}));
