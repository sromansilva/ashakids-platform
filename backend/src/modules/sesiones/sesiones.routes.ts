import { Router, Request, Response, NextFunction } from 'express';
import { sesionesService } from './sesiones.service.js';

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

// POST /api/v1/sesiones/:key/plan
sesionesRouter.post('/:key/plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const plan = await sesionesService.publicarPlan(key, req.body);
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
sesionesRouter.post('/:key/valoracion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = (req as any).user?.id_usuario || 1;
    const val = await sesionesService.crearValoracion(key, req.body, userId);
    res.status(201).json(val);
  } catch (err) {
    next(err);
  }
});
