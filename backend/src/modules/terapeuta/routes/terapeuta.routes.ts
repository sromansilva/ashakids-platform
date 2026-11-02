import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { terapeutaService } from '../services/terapeuta.service.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const terapeutaRouter = Router();

const profileChangesSchema = z.object({
  telefono: z.string().trim().max(20).regex(/^[+()\d\s.-]*$/, 'El teléfono contiene caracteres no válidos.').optional(),
  cedula_profesional: z.string().trim().max(40).regex(/^[A-Za-z0-9./ -]*$/, 'La cédula contiene caracteres no válidos.').optional(),
}).refine((value) => Object.keys(value).length > 0, 'Indica al menos un dato para actualizar.');

const allowedPhotoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!allowedPhotoTypes.has(file.mimetype)) {
      callback(new Error('La foto debe ser JPG, PNG o WebP.'));
      return;
    }
    callback(null, true);
  },
}).single('foto');

function handlePhotoUpload(req: Request, res: Response, next: NextFunction): void {
  photoUpload(req, res, (err: unknown) => {
    if (!err) return next();
    const isLimit = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE';
    res.status(isLimit ? 413 : 400).json({ message: isLimit ? 'La foto no puede superar 3 MB.' : (err instanceof Error ? err.message : 'No se pudo leer la foto.') });
  });
}

function hasExpectedImageSignature(file: Express.Multer.File): boolean {
  const bytes = file.buffer;
  if (file.mimetype === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (file.mimetype === 'image/webp') return bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  return false;
}

// GET /api/v1/terapeutas (directorio público y paginado)
terapeutaRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;
    const result = await terapeutaService.getDirectorio({ limit, offset });
    res.header('X-Total-Count', String(result.total));
    res.json(result.items);
  } catch (err) {
    next(err);
  }
});

// The public therapist directory remains available; personal and operational routes require authentication.
terapeutaRouter.use(authenticate);

// GET /api/v1/terapeutas/me
terapeutaRouter.get('/me', requireRoles(['TERAPEUTA', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 2;
    const profile = await terapeutaService.getMe(userId);
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/terapeutas/me/perfil
terapeutaRouter.patch('/me/perfil', requireRoles(['TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = profileChangesSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.issues[0]?.message || 'Revisa los datos del perfil.' });
      return;
    }
    await terapeutaService.updateMyProfile(req.user!.id_usuario, parsed.data);
    res.json({ message: 'Datos de contacto actualizados.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/terapeutas/me/foto-perfil
terapeutaRouter.post('/me/foto-perfil', requireRoles(['TERAPEUTA']), handlePhotoUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'Selecciona una foto para subir.' });
      return;
    }
    if (!hasExpectedImageSignature(file)) {
      res.status(400).json({ message: 'El contenido del archivo no coincide con una imagen JPG, PNG o WebP válida.' });
      return;
    }
    await terapeutaService.updateMyProfilePhoto(req.user!.id_usuario, file.buffer, file.mimetype);
    res.json({ message: 'Foto de perfil actualizada.' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/terapeutas/me/foto-perfil
terapeutaRouter.delete('/me/foto-perfil', requireRoles(['TERAPEUTA']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await terapeutaService.removeMyProfilePhoto(req.user!.id_usuario);
    res.json({ message: 'Foto de perfil eliminada.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/disponibilidad (para terapeuta autenticado y tests)
terapeutaRouter.get('/disponibilidad', requireRoles(['TERAPEUTA', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id_usuario || 1;
    const disp = await terapeutaService.getDisponibilidad(userId);
    res.json({
      ...disp,
      slots: disp.turnos.map(t => ({
        dia_semana: t.dia,
        hora_inicio: `${String(t.hora).padStart(2, '0')}:00`,
        hora_fin: `${String(t.hora + 1).padStart(2, '0')}:00`,
        activo: true,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/:key/disponibilidad
terapeutaRouter.get('/:key/disponibilidad', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const disp = await terapeutaService.getDisponibilidad(key);
    res.json(disp);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/terapeutas/:key/disponibilidad
terapeutaRouter.put('/:key/disponibilidad', requireRoles(['TERAPEUTA', 'ADMIN']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const disp = await terapeutaService.updateDisponibilidad(key, req.body);
    res.json(disp);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/terapeutas/:key/turnos
terapeutaRouter.get('/:key/turnos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = parseInt(String(req.params.key), 10);
    const fecha = (req.query.fecha as string) || new Date().toISOString().split('T')[0];
    const slots = await terapeutaService.getTurnosDelDia(key, fecha);
    res.json(slots);
  } catch (err) {
    next(err);
  }
});
