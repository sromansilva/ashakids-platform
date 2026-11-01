import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { sesionesService } from './sesiones.service.js';
import { authenticate, requireRoles } from '../../core/middleware/auth.middleware.js';

export const sesionesRouter = Router();

// GET /api/v1/sesiones
sesionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pacienteId = req.query.id_paciente ? parseInt(req.query.id_paciente as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await sesionesService.listar({ pacienteId, limit, offset });
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones
sesionesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_reserva } = req.body;
    const sesion = await sesionesService.crear(id_reserva);
    res.status(201).json(sesion);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key
sesionesRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const sesion = await sesionesService.detalle(key);
    if (!sesion) {
      return res.status(404).json({ detail: 'Sesión no encontrada' });
    }
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/iniciar
sesionesRouter.post('/:key/iniciar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const sesion = await sesionesService.iniciar(key);
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/cerrar
sesionesRouter.post('/:key/cerrar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const { asistencia } = req.body;
    const sesion = await sesionesService.cerrar(key, asistencia || 'ASISTIO');
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/reporte
sesionesRouter.get('/:key/reporte', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const rep = await sesionesService.reporte(key);
    res.json(rep);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/reporte/pdf
sesionesRouter.get('/:key/reporte/pdf', async (req: Request, res: Response, _next: NextFunction) => {
  const key = parseInt(String(req.params.key), 10);
  const pdfDummy = Buffer.from(
    `%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000052 00000 n \n0000000101 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF`
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="reporte-sesion-${key}.pdf"`);
  res.send(pdfDummy);
});

// PUT /api/v1/sesiones/:key/reporte
sesionesRouter.put('/:key/reporte', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const rep = await sesionesService.guardarReporte(key, req.body);
    res.json(rep);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/plan
sesionesRouter.get('/:key/plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const plan = await sesionesService.plan(key);
    res.json(plan);
  } catch (err) {
    next(err);
  }
});

const planSchema = z.object({
  nombre_tratamiento: z.string().trim().min(1).max(100),
  descripcion: z.string().max(90_000).nullable().optional(),
  area: z.enum(['FLUIDEZ', 'HABLA', 'LENGUAJE', 'VOZ', 'OROFACIAL']),
  mundos_asignados: z.array(z.enum(['FLUIDEZ', 'HABLA', 'LENGUAJE', 'VOZ', 'OROFACIAL']))
    .min(1).max(5).refine((areas) => new Set(areas).size === areas.length),
  sesiones_recomendadas: z.number().int().min(1).max(31),
}).strict();

// POST /api/v1/sesiones/:key/plan
sesionesRouter.post('/:key/plan', authenticate, requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (req.user?.rol === 'TERAPEUTA' && !(await sesionesService.perteneceATerapeuta(key, req.user.id_usuario))) {
      return res.status(403).json({ error: 'No tienes permiso para publicar un plan en esta sesión.' });
    }
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Completa los campos obligatorios del plan con valores válidos.' });
    const plan = await sesionesService.publicarPlan(key, { ...parsed.data, descripcion: parsed.data.descripcion ?? null });
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/valoracion
sesionesRouter.get('/:key/valoracion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const val = await sesionesService.valoracion(key);
    res.json(val);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/valoracion
sesionesRouter.post('/:key/valoracion', authenticate, requireRoles(['ADMIN', 'PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = req.user?.id_usuario;
    if (!userId) return res.status(401).json({ error: 'Inicia sesión para dejar una valoración.' });
    const val = await sesionesService.crearValoracion(key, req.body, userId);
    res.status(201).json(val);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/evaluar-fonema-en-vivo
sesionesRouter.post('/:key/evaluar-fonema-en-vivo', authenticate, requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (req.user?.rol === 'TERAPEUTA' && !(await sesionesService.perteneceATerapeuta(key, req.user.id_usuario))) {
      return res.status(403).json({ error: 'No tienes permiso para evaluar fonemas en esta sesión.' });
    }
    const resultado = await sesionesService.evaluarFonemaEnVivo(req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/evaluar-fragmento-fonetico
sesionesRouter.post('/:key/evaluar-fragmento-fonetico', authenticate, requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (req.user?.rol === 'TERAPEUTA' && !(await sesionesService.perteneceATerapeuta(key, req.user.id_usuario))) {
      return res.status(403).json({ error: 'No tienes permiso para analizar el audio de esta sesión.' });
    }
    const resultado = await sesionesService.evaluarFragmentoFonetico(key, req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/seguimiento-articulacion
sesionesRouter.get('/:key/seguimiento-articulacion', authenticate, requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (req.user?.rol === 'TERAPEUTA' && !(await sesionesService.perteneceATerapeuta(key, req.user.id_usuario))) {
      return res.status(403).json({ error: 'No tienes permiso para consultar el historial de esta sesión.' });
    }
    res.json(await sesionesService.historialArticulacion(key));
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/analizar-transcripcion-sesion
sesionesRouter.post('/:key/analizar-transcripcion-sesion', authenticate, requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (req.user?.rol === 'TERAPEUTA' && !(await sesionesService.perteneceATerapeuta(key, req.user.id_usuario))) {
      return res.status(403).json({ error: 'No tienes permiso para analizar la transcripción de esta sesión.' });
    }
    const resultado = await sesionesService.analizarTranscripcionSesion(key, req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
});
