import { Router, Request, Response, NextFunction } from 'express';
import { conversacionesService } from './conversaciones.service.js';

export const conversacionesRouter = Router();

// GET /api/v1/conversaciones/contactos
conversacionesRouter.get('/contactos', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await conversacionesService.getContactos();
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones
conversacionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const beforeId = req.query.before_id ? parseInt(req.query.before_id as string, 10) : undefined;
    const result = await conversacionesService.listar(limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/conversaciones
conversacionesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_tutor, id_terapeuta } = req.body;
    const conv = await conversacionesService.abrir(id_tutor, id_terapeuta);
    res.status(201).json(conv);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones/:key
conversacionesRouter.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const conv = await conversacionesService.detalle(key);
    if (!conv) {
      return res.status(404).json({ detail: 'Conversación no encontrada' });
    }
    res.json(conv);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones/:key/mensajes
conversacionesRouter.get('/:key/mensajes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
    const beforeId = req.query.before_id ? parseInt(req.query.before_id as string, 10) : undefined;
    const result = await conversacionesService.getMensajes(key, limit, beforeId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/conversaciones/:key/mensajes
conversacionesRouter.post('/:key/mensajes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = (req as any).user?.id_usuario || 1;
    const { texto_mensaje } = req.body;
    const msg = await conversacionesService.enviar(key, userId, texto_mensaje);
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/conversaciones/:key/mensajes/adjunto
conversacionesRouter.post('/:key/mensajes/adjunto', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const userId = (req as any).user?.id_usuario || 1;
    const msg = await conversacionesService.enviar(key, userId, 'Adjunto enviado');
    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/conversaciones/:key/adjuntos/:attachment
conversacionesRouter.get('/:key/adjuntos/:attachment', (_req: Request, res: Response) => {
  res.status(404).send('Adjunto no disponible');
});
