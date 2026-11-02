import { pool } from '../../core/database.js';
import { safeGoogleMeetUrl } from '../../core/security/google-meet-url.js';

export interface NotificationItem {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  texto: string;
  id_reserva: number | null;
  id_conversacion: number | null;
  meet_url?: string | null;
  fecha_creacion: string;
  leida_en: string | null;
}

export interface NotificationPreferences {
  nueva_cita: boolean;
  cancelacion: boolean;
  reprogramacion: boolean;
  recordatorio: boolean;
  mensajes: boolean;
}

const defaultPreferences: NotificationPreferences = {
  nueva_cita: true,
  cancelacion: true,
  reprogramacion: true,
  recordatorio: true,
  mensajes: true,
};

function userError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

export class NotificacionesService {
  async getBandeja(userId: number, options?: { limit?: number; offset?: number; soloSinLeer?: boolean }) {
    const limit = Math.min(100, Math.max(1, Math.trunc(options?.limit ?? 20)));
    const offset = Math.max(0, Math.trunc(options?.offset ?? 0));
    const unreadClause = options?.soloSinLeer ? ' AND n.leida_en IS NULL' : '';
    const [res, totalRes] = await Promise.all([
      pool.query(
        `SELECT n.id_notificacion, n.tipo, n.titulo, n.texto, n.id_reserva, n.id_conversacion,
                n.fecha_creacion, n.leida_en,
                CASE WHEN n.tipo = 'RECORDATORIO'
                       AND r.estado_reserva = 'CONFIRMADA'
                       AND r.modalidad IN ('VIRTUAL', 'ONLINE')
                       AND r.fecha_hora_fin > NOW()
                       AND (family.id_usuario = n.id_usuario OR therapist_user.id_usuario = n.id_usuario)
                     THEN r.meet_url
                     ELSE NULL
                END AS meet_url
         FROM public.notificaciones n
         LEFT JOIN public.reservas r ON r.id_reserva = n.id_reserva
         LEFT JOIN public.pacientes p ON p.id_paciente = r.id_paciente
         LEFT JOIN public.tutores family ON family.id_tutor = p.id_tutor
         LEFT JOIN public.terapeutas therapist ON therapist.id_terapeuta = r.id_terapeuta
         LEFT JOIN public.usuarios therapist_user ON therapist_user.id_usuario = therapist.id_usuario
         WHERE n.id_usuario = $1${unreadClause}
         ORDER BY n.fecha_creacion DESC, n.id_notificacion DESC LIMIT $2 OFFSET $3;`,
        [userId, limit, offset],
      ),
      pool.query(
        `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE leida_en IS NULL) AS sin_leer
         FROM public.notificaciones WHERE id_usuario = $1;`,
        [userId],
      ),
    ]);
    return {
      items: res.rows.map((row): NotificationItem => ({
        id_notificacion: Number(row.id_notificacion),
        tipo: String(row.tipo),
        titulo: String(row.titulo),
        texto: String(row.texto),
        id_reserva: row.id_reserva === null ? null : Number(row.id_reserva),
        id_conversacion: row.id_conversacion === null ? null : Number(row.id_conversacion),
        meet_url: safeGoogleMeetUrl(row.meet_url),
        fecha_creacion: new Date(row.fecha_creacion).toISOString(),
        leida_en: row.leida_en ? new Date(row.leida_en).toISOString() : null,
      })),
      total: Number(totalRes.rows[0]?.total ?? 0),
      sin_leer: Number(totalRes.rows[0]?.sin_leer ?? 0),
    };
  }

  async getPreferencias(userId: number): Promise<NotificationPreferences> {
    const result = await pool.query(
      `SELECT nueva_cita, cancelacion, reprogramacion, recordatorio, mensajes
       FROM public.preferencias_notificacion WHERE id_usuario = $1 LIMIT 1;`,
      [userId],
    );
    const row = result.rows[0];
    return row ? {
      nueva_cita: Boolean(row.nueva_cita),
      cancelacion: Boolean(row.cancelacion),
      reprogramacion: Boolean(row.reprogramacion),
      recordatorio: Boolean(row.recordatorio),
      mensajes: Boolean(row.mensajes),
    } : { ...defaultPreferences };
  }

  async guardarPreferencias(userId: number, prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const result = await pool.query(
      `INSERT INTO public.preferencias_notificacion
        (id_usuario, nueva_cita, cancelacion, reprogramacion, recordatorio, mensajes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id_usuario) DO UPDATE SET
         nueva_cita = EXCLUDED.nueva_cita,
         cancelacion = EXCLUDED.cancelacion,
         reprogramacion = EXCLUDED.reprogramacion,
         recordatorio = EXCLUDED.recordatorio,
         mensajes = EXCLUDED.mensajes
       RETURNING nueva_cita, cancelacion, reprogramacion, recordatorio, mensajes;`,
      [userId, prefs.nueva_cita, prefs.cancelacion, prefs.reprogramacion, prefs.recordatorio, prefs.mensajes],
    );
    const row = result.rows[0];
    return {
      nueva_cita: Boolean(row.nueva_cita),
      cancelacion: Boolean(row.cancelacion),
      reprogramacion: Boolean(row.reprogramacion),
      recordatorio: Boolean(row.recordatorio),
      mensajes: Boolean(row.mensajes),
    };
  }

  async marcarLeida(id: number, userId: number): Promise<NotificationItem> {
    const result = await pool.query(
      `UPDATE public.notificaciones SET leida_en = COALESCE(leida_en, NOW())
       WHERE id_notificacion = $1 AND id_usuario = $2 RETURNING *;`,
      [id, userId],
    );
    const row = result.rows[0];
    if (!row) throw userError('Notificación no encontrada.', 404);
    return {
      id_notificacion: Number(row.id_notificacion),
      tipo: String(row.tipo),
      titulo: String(row.titulo),
      texto: String(row.texto),
      id_reserva: row.id_reserva === null ? null : Number(row.id_reserva),
      id_conversacion: row.id_conversacion === null ? null : Number(row.id_conversacion),
      fecha_creacion: new Date(row.fecha_creacion).toISOString(),
      leida_en: new Date(row.leida_en).toISOString(),
    };
  }

  async marcarTodasLeidas(userId: number): Promise<void> {
    await pool.query(
      `UPDATE public.notificaciones SET leida_en = NOW()
       WHERE id_usuario = $1 AND leida_en IS NULL;`,
      [userId],
    );
  }
}

export const notificacionesService = new NotificacionesService();
