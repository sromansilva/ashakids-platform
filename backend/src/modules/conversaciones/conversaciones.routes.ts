import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, requireRoles } from '../../core/middleware/auth.middleware.js';
import { requireUser } from '../../core/security/clinical-access.js';
import { conversacionesService } from './conversaciones.service.js';

export const conversacionesRouter = Router();
const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
}).single('archivo');

conversacionesRouter.use(authenticate, requireRoles(['PADRE', 'TERAPEUTA']));

function positiveQuery(value: unknown, label: string): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw Object.assign(new Error('Parámetro ' + label + ' inválido.'), { status: 400 });
  }
  return parsed;
}

function uploadFile(req: Request, res: Response, next: NextFunction): void {
  uploadAttachment(req, res, (err) => {
    if (!err) {
      next();
      return;
    }
    const code = typeof err === 'object' && err !== null && 'code' in err ? String(err.code) : '';
    if (code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'El archivo supera el máximo de 10 MB.' });
      return;
    }
    next(err);
  });
}

// GET /api/v1/conversaciones/contactos
conversacionesRouter.get('/contactos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await conversacionesService.getContactos(requireUser(req));
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones
conversacionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = positiveQuery(req.query.limit, 'limit') ?? 20;
    const beforeId = positiveQuery(req.query.before_id, 'before_id');
    const result = await conversacionesService.listar(requireUser(req), limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/conversaciones
conversacionesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = z.object({
      id_tutor: z.number().int().positive(),
      id_terapeuta: z.number().int().positive(),
    }).parse(req.body);
    const conversation = await conversacionesService.abrir(
      requireUser(req),
      input.id_tutor,
      input.id_terapeuta,
    );
    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones/:key
conversacionesRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = positiveQuery(req.params.key, 'conversación')!;
    const conversation = await conversacionesService.detalle(requireUser(req), key);
    if (!conversation) {
      res.status(404).json({ detail: 'Conversación no encontrada.' });
      return;
    }
    res.json(conversation);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones/:key/mensajes
conversacionesRouter.get('/:key/mensajes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = positiveQuery(req.params.key, 'conversación')!;
    const limit = positiveQuery(req.query.limit, 'limit') ?? 30;
    const beforeId = positiveQuery(req.query.before_id, 'before_id');
    const result = await conversacionesService.getMensajes(requireUser(req), key, limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/conversaciones/:key/mensajes
conversacionesRouter.post('/:key/mensajes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = positiveQuery(req.params.key, 'conversación')!;
    const { texto_mensaje } = z.object({
      texto_mensaje: z.string().trim().min(1).max(4000),
    }).parse(req.body);
    const message = await conversacionesService.enviar(requireUser(req), key, texto_mensaje);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/conversaciones/:key/mensajes/adjunto
conversacionesRouter.post(
  '/:key/mensajes/adjunto',
  uploadFile,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const key = positiveQuery(req.params.key, 'conversación')!;
      const input = z.object({
        texto_mensaje: z.string().max(4000).optional().default(''),
        clave_envio: z.string().uuid(),
      }).parse(req.body);
      const message = await conversacionesService.guardarAdjunto(
        requireUser(req),
        key,
        req.file,
        input.texto_mensaje,
        input.clave_envio,
      );
      res.status(201).json(message);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/conversaciones/:key/adjuntos/:attachment
conversacionesRouter.get('/:key/adjuntos/:attachment', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = positiveQuery(req.params.key, 'conversación')!;
    const attachmentId = positiveQuery(req.params.attachment, 'adjunto')!;
    const attachment = await conversacionesService.descargarAdjunto(
      requireUser(req),
      conversationId,
      attachmentId,
    );
    if (!attachment) {
      res.status(404).json({ detail: 'Adjunto no encontrado.' });
      return;
    }
    const safeName = attachment.nombre_archivo.replace(/[\r\n"]/g, '_');
    res.setHeader('Content-Type', attachment.mime_type);
    res.setHeader('Content-Disposition', "attachment; filename*=UTF-8''" + encodeURIComponent(safeName));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.send(attachment.contenido);
  } catch (err) {
    next(err);
  }
});
