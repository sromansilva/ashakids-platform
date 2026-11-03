import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { sesionesService } from './sesiones.service.js';
import { buildReportPdf } from './report-pdf.js';
import { authenticate, requireRoles } from '../../core/middleware/auth.middleware.js';
import { assertSessionEditAccess, assertSessionReadAccess } from '../../core/security/clinical-access.js';

export const sesionesRouter = Router();
sesionesRouter.use(authenticate);

const phoneticsAudioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512_000, files: 1, fields: 2 },
}).single('audio');
const phoneticsPacketUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8_000, files: 1, fields: 1, fieldSize: 32 },
}).single('audio');

const phoneticCaptureSchema = z.object({
  captura_id: z.string().uuid(),
  palabra_objetivo: z.string().trim().min(1).max(80),
  fonema_objetivo: z.enum(['/rr/', '/r/', '/s/', '/pl/', '/tr/']),
}).strict();

// Family-device capture is a separate explicit flow. The clinical call never
// consumes a remote Google Meet audio track.
sesionesRouter.post('/:key/evaluacion-fonema/capturas-familia', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    const parsed = phoneticCaptureSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Los datos de captura fonológica no son válidos.' });
    await assertSessionEditAccess(req.user!, key);
    const capture = await sesionesService.solicitarCapturaFamiliar(key, req.user!, parsed.data);
    res.status(201).json(capture);
  } catch (err) {
    next(err);
  }
});

sesionesRouter.get('/:key/evaluacion-fonema/capturas-familia/pendiente', requireRoles(['PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionReadAccess(req.user!, key);
    const capture = await sesionesService.obtenerCapturaFamiliarPendiente(key, req.user!.id_usuario);
    res.json(capture);
  } catch (err) {
    next(err);
  }
});

sesionesRouter.post('/:key/evaluacion-fonema/capturas-familia/:captureId/iniciar', requireRoles(['PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionReadAccess(req.user!, key);
    const capture = await sesionesService.iniciarCapturaFamiliar(key, req.user!.id_usuario, String(req.params.captureId));
    res.json(capture);
  } catch (err) {
    next(err);
  }
});

sesionesRouter.post('/:key/evaluacion-fonema/capturas-familia/:captureId/paquetes', requireRoles(['PADRE']), phoneticsPacketUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const packetNumber = Number(req.body.numero_paquete);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (!req.file?.buffer?.length) return res.status(400).json({ error: 'Adjunta un paquete PCM válido.' });
    if (!['application/octet-stream', 'audio/pcm', 'audio/L16'].includes(req.file.mimetype)) {
      return res.status(415).json({ error: 'Los paquetes deben contener PCM de 16 bits y 16 kHz.' });
    }
    await assertSessionReadAccess(req.user!, key);
    const result = await sesionesService.guardarPaqueteCapturaFamiliar(key, req.user!.id_usuario, String(req.params.captureId), packetNumber, req.file.buffer);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    req.file?.buffer.fill(0);
  }
});

sesionesRouter.post('/:key/evaluacion-fonema/capturas-familia/:captureId/finalizar', requireRoles(['PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionReadAccess(req.user!, key);
    const result = await sesionesService.finalizarCapturaFamiliar(key, req.user!.id_usuario, String(req.params.captureId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

sesionesRouter.delete('/:key/evaluacion-fonema/capturas-familia/:captureId', requireRoles(['ADMIN', 'TERAPEUTA', 'PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (req.user!.rol === 'PADRE') await assertSessionReadAccess(req.user!, key);
    else await assertSessionEditAccess(req.user!, key);
    const familyUserId = req.user!.rol === 'PADRE' ? req.user!.id_usuario : undefined;
    res.json(sesionesService.descartarCapturaFamiliar(key, String(req.params.captureId), familyUserId));
  } catch (err) {
    next(err);
  }
});

sesionesRouter.get('/:key/evaluacion-fonema/capturas-familia/:captureId/resultado', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionEditAccess(req.user!, key);
    res.json(await sesionesService.obtenerResultadoCapturaFamiliar(key, String(req.params.captureId)));
  } catch (err) {
    next(err);
  }
});

sesionesRouter.post('/:key/evaluacion-fonema/capturas', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    const parsed = phoneticCaptureSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Los datos de captura fonológica no son válidos.' });
    await assertSessionEditAccess(req.user!, key);
    const capture = await sesionesService.iniciarCapturaFonologica(key, req.user!, parsed.data);
    res.status(201).json({ ...capture, frecuencia_muestreo: 16_000, muestras_por_paquete: 4_000 });
  } catch (err) {
    next(err);
  }
});

sesionesRouter.post('/:key/evaluacion-fonema/capturas/:captureId/paquetes', requireRoles(['ADMIN', 'TERAPEUTA']), phoneticsPacketUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const packetNumber = Number(req.body.numero_paquete);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    if (!req.file?.buffer?.length) return res.status(400).json({ error: 'Adjunta un paquete PCM válido.' });
    if (!['application/octet-stream', 'audio/pcm', 'audio/L16'].includes(req.file.mimetype)) {
      return res.status(415).json({ error: 'Los paquetes deben contener PCM de 16 bits y 16 kHz.' });
    }
    await assertSessionEditAccess(req.user!, key);
    const result = await sesionesService.guardarPaqueteFonologico(key, req.user!, String(req.params.captureId), packetNumber, req.file.buffer);
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    req.file?.buffer.fill(0);
  }
});

sesionesRouter.post('/:key/evaluacion-fonema/capturas/:captureId/finalizar', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionEditAccess(req.user!, key);
    const result = await sesionesService.finalizarCapturaFonologica(key, req.user!, String(req.params.captureId));
    res.json(result);
  } catch (err) {
    next(err);
  }
});

sesionesRouter.delete('/:key/evaluacion-fonema/capturas/:captureId', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionEditAccess(req.user!, key);
    res.json(sesionesService.descartarCapturaFonologica(key, req.user!, String(req.params.captureId)));
  } catch (err) {
    next(err);
  }
});

async function evaluateSessionPhonetics(req: Request, res: Response, next: NextFunction) {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionEditAccess(req.user!, key);
    const targetWord = req.body.palabra_objetivo ?? req.body.palabra_esperada;
    if (typeof targetWord !== 'string' || !targetWord.trim()) {
      return res.status(400).json({ error: 'Indica una palabra objetivo.' });
    }
    if (req.file && !['audio/wav', 'audio/x-wav', 'audio/wave'].includes(req.file.mimetype)) {
      return res.status(415).json({ error: 'Envía una muestra WAV mono de 16 kHz.' });
    }
    if (!req.file?.buffer?.length && typeof req.body.audio_base64 !== 'string') {
      return res.status(400).json({ error: 'Adjunta el fragmento WAV para analizarlo.' });
    }
    const result = await sesionesService.evaluarFonemaEnVivo(key, {
      audio_bytes: req.file?.buffer,
      audio_base64: req.body.audio_base64,
      palabra_objetivo: targetWord,
      fonema_objetivo: typeof req.body.fonema_objetivo === 'string' ? req.body.fonema_objetivo : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  } finally {
    req.file?.buffer.fill(0);
    if (req.body && typeof req.body.audio_base64 === 'string') {
      req.body.audio_base64 = '';
      delete req.body.audio_base64;
    }
  }
}

// GET /api/v1/sesiones
sesionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pacienteId = req.query.id_paciente ? parseInt(req.query.id_paciente as string, 10) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const result = await sesionesService.listar({ pacienteId, limit, offset }, req.user!);
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones
sesionesRouter.post('/', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_reserva } = req.body;
    const sesion = await sesionesService.crear(Number(id_reserva), req.user!);
    res.status(201).json(sesion);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key
sesionesRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionReadAccess(req.user!, key);
    const sesion = await sesionesService.detalle(key, req.user!);
    if (!sesion) {
      return res.status(404).json({ detail: 'Sesión no encontrada' });
    }
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/iniciar
sesionesRouter.post('/:key/iniciar', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionEditAccess(req.user!, key);
    const sesion = await sesionesService.iniciar(key, req.user!);
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/cerrar
sesionesRouter.post('/:key/cerrar', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const parsed = z.object({ asistencia: z.enum(['ASISTIO', 'NO_ASISTIO']) }).strict().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Indica si el paciente asistió.' });
      return;
    }
    await assertSessionEditAccess(req.user!, key);
    const sesion = await sesionesService.cerrar(key, parsed.data.asistencia, req.user!);
    res.json(sesion);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/reporte
sesionesRouter.get('/:key/reporte', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionReadAccess(req.user!, key);
    const rep = await sesionesService.reporte(key);
    if (req.user!.rol === 'PADRE' && rep && rep.estado_reporte !== 'FIRMADO') {
      res.status(404).json({ error: 'El reporte estará disponible cuando el terapeuta lo firme.' });
      return;
    }
    res.json(rep);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/reporte/pdf
sesionesRouter.get('/:key/reporte/pdf', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionReadAccess(req.user!, key);
    const [session, report] = await Promise.all([
      sesionesService.detalle(key, req.user!),
      sesionesService.reporte(key),
    ]);
    if (!session || !report) {
      res.status(404).json({ error: 'Guarda el reporte de esta sesión antes de descargarlo.' });
      return;
    }
    if (req.user!.rol === 'PADRE' && report.estado_reporte !== 'FIRMADO') {
      res.status(404).json({ error: 'El reporte estará disponible cuando el terapeuta lo firme.' });
      return;
    }
    const pdf = buildReportPdf({
      sessionId: key,
      patientName: session.cita.paciente_nombre,
      therapistName: session.cita.terapeuta_nombre,
      sessionDate: session.cita.fecha_hora_inicio,
      observations: report.observaciones_iniciales,
      objectives: report.objetivos_trabajados,
      helpLevel: report.nivel_ayuda,
      nextSteps: report.proximos_pasos,
      reportStatus: report.estado_reporte,
      signedBy: report.firmado_por,
      signedAt: report.fecha_firma,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="reporte-sesion-${key}.pdf"`);
    res.setHeader('Content-Length', String(pdf.length));
    res.send(pdf);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/sesiones/:key/reporte
sesionesRouter.put('/:key/reporte', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionEditAccess(req.user!, key);
    const reportSchema = z.object({
      observaciones_iniciales: z.string().trim().max(10000).nullable(),
      objetivos_trabajados: z.string().trim().max(10000).nullable(),
      // Keep older free-text values readable and saveable without allowing new
      // arbitrary values; the service permits those only when unchanged.
      nivel_ayuda: z.string().max(100).nullable(),
      proximos_pasos: z.string().trim().max(10000).nullable(),
    }).strict();
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'El contenido del reporte no tiene un formato válido.' });
      return;
    }
    const rep = await sesionesService.guardarReporte(key, parsed.data, req.user!);
    res.json(rep);
  } catch (err) {
    next(err);
  }
});

sesionesRouter.post('/:key/reporte/firmar', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const report = await sesionesService.firmarReporte(key, req.user!);
    res.json(report);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/plan
sesionesRouter.get('/:key/plan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionReadAccess(req.user!, key);
    const plan = await sesionesService.plan(key, req.user!);
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
  frecuencia_semanal: z.number().int().min(1).max(3),
  fonemas_priorizados: z.array(z.enum(['/rr/', '/r/', '/s/', '/pl/', '/tr/']))
    .max(5).refine((phonemes) => new Set(phonemes).size === phonemes.length),
  id_prediccion: z.number().int().positive().optional(),
  decision_prediccion: z.enum(['CONFIRMADO_CLINICO', 'MODIFICADO_MANUAL', 'DESCARTADO']).optional(),
  observaciones_prediccion: z.string().trim().max(2000).optional(),
}).strict().refine(
  (data) => (data.id_prediccion === undefined) === (data.decision_prediccion === undefined),
  { message: 'Indica la decisión asociada a la predicción seleccionada.' },
).refine(
  (data) => data.decision_prediccion !== 'MODIFICADO_MANUAL' || Boolean(data.observaciones_prediccion?.trim()),
  { message: 'Explica el ajuste manual de sesiones para dejarlo registrado.' },
).refine(
  (data) => !['HABLA', 'VOZ'].includes(data.area) || data.fonemas_priorizados.length > 0,
  { message: 'Selecciona los fonemas de intervención revisados por el terapeuta.' },
).refine(
  (data) => data.fonemas_priorizados.length === 0 || (data.mundos_asignados.includes('HABLA') && data.mundos_asignados.includes('LENGUAJE')),
  { message: 'Asigna el Taller de los Sonidos (Isla Mágica) y La Isla de las Palabras para activar la práctica dirigida a fonemas.' },
);

// POST /api/v1/sesiones/:key/plan
sesionesRouter.post('/:key/plan', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionEditAccess(req.user!, key);
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Completa los campos obligatorios del plan con valores válidos.' });
    const plan = await sesionesService.publicarPlan(key, { ...parsed.data, descripcion: parsed.data.descripcion ?? null }, req.user!);
    res.status(201).json(plan);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/sesiones/:key/valoracion
sesionesRouter.get('/:key/valoracion', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    await assertSessionReadAccess(req.user!, key);
    const val = await sesionesService.valoracion(key);
    res.json(val);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/sesiones/:key/valoracion
sesionesRouter.post('/:key/valoracion', requireRoles(['ADMIN', 'PADRE']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = req.user?.id_usuario;
    if (!userId) return res.status(401).json({ error: 'Inicia sesión para dejar una valoración.' });
    await assertSessionReadAccess(req.user!, key);
    const val = await sesionesService.crearValoracion(key, req.body, userId);
    res.status(201).json(val);
  } catch (err) {
    next(err);
  }
});

// Preferred contract: multipart WAV, kept only in memory while inference runs.
sesionesRouter.post('/:key/evaluacion-fonema', requireRoles(['ADMIN', 'TERAPEUTA']), phoneticsAudioUpload, evaluateSessionPhonetics);
// Backward-compatible JSON route for existing clients.
sesionesRouter.post('/:key/evaluar-fonema-en-vivo', requireRoles(['ADMIN', 'TERAPEUTA']), evaluateSessionPhonetics);

// Retired endpoint: samples must go through the canonical, consent-checked
// 2–3 second workflow and be saved for therapist review.
sesionesRouter.post('/:key/evaluar-fragmento-fonetico', requireRoles(['ADMIN', 'TERAPEUTA']), (_req, res) =>
  res.status(410).json({ error: 'Esta ruta fue retirada. Usa la evaluación fonológica vigente de la sesión.' })
);

// GET /api/v1/sesiones/:key/seguimiento-articulacion
sesionesRouter.get('/:key/seguimiento-articulacion', requireRoles(['ADMIN', 'TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    if (!Number.isInteger(key) || key <= 0) return res.status(400).json({ error: 'La sesión indicada no es válida.' });
    await assertSessionReadAccess(req.user!, key);
    res.json(await sesionesService.historialArticulacion(key));
  } catch (err) {
    next(err);
  }
});

// Whole-session transcripts are outside the approved short-sample workflow.
sesionesRouter.post('/:key/analizar-transcripcion-sesion', requireRoles(['ADMIN', 'TERAPEUTA']), (_req, res) =>
  res.status(410).json({ error: 'El análisis de transcripciones de sesión fue retirado. Usa muestras breves con consentimiento y revisión profesional.' })
);
