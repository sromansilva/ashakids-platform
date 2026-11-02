import { Router, Request, Response, NextFunction } from 'express';
import { pool } from '../../core/database.js';
import { authenticate } from '../../core/middleware/auth.middleware.js';
import { appendPatientScope } from '../../core/security/clinical-access.js';

export const valoracionesRouter = Router();
valoracionesRouter.use(authenticate);

// GET /api/v1/valoraciones
valoracionesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : 0;

    const params: unknown[] = [];
    const scope = appendPatientScope(params, req.user!, 'r.id_paciente');
    const countParams = [...params];
    params.push(limit, offset);
    const limitParam = params.length - 1;
    const offsetParam = params.length;
    const resVal = await pool.query(
        `SELECT v.id_valoracion, v.id_sesion, v.calificacion, v.comentario, v.fecha_creacion,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as autor_nombre,
                COALESCE(r.fecha_hora_inicio, NOW()) as fecha_sesion
         FROM valoraciones_sesion v
         JOIN usuarios u ON v.id_usuario = u.id_usuario
         JOIN sesiones s ON v.id_sesion = s.id_sesion
         JOIN reservas r ON s.id_reserva = r.id_reserva
         WHERE 1=1 ${scope}
         ORDER BY v.fecha_creacion DESC
         LIMIT $${limitParam} OFFSET $${offsetParam};`,
        params
      );
    const countRes = await pool.query(
      `SELECT COUNT(*) AS total
       FROM valoraciones_sesion v
       JOIN sesiones s ON s.id_sesion = v.id_sesion
       JOIN reservas r ON r.id_reserva = s.id_reserva
       WHERE 1=1 ${scope};`,
      countParams,
    );
    const total = Number.parseInt(countRes.rows[0]?.total ?? '0', 10);

    const items = resVal.rows.map(r => ({
        id_valoracion: r.id_valoracion,
        id_sesion: r.id_sesion,
        calificacion: r.calificacion,
        comentario: r.comentario,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        autor_nombre: r.autor_nombre.trim() || 'Tutor',
        fecha_sesion: new Date(r.fecha_sesion).toISOString(),
      }));

    res.header('X-Total-Count', String(total));
    res.json(items);
  } catch (err) {
    next(err);
  }
});
