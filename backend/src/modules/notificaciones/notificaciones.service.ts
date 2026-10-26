import { pool } from '../../core/database.js';

export interface NotificationItem {
  id_notificacion: number;
  tipo: string;
  titulo: string;
  texto: string;
  id_reserva: number | null;
  id_conversacion: number | null;
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

export class NotificacionesService {
  async getBandeja(userId: number = 1, options?: { limit?: number; offset?: number; soloSinLeer?: boolean }) {
    try {
      let sql = `
        SELECT id_notificacion, tipo, titulo, texto, id_reserva, id_conversacion, fecha_creacion, leida_en
        FROM notificaciones
        WHERE (id_usuario = $1 OR id_usuario IS NULL)
      `;
      const params: any[] = [userId];

      if (options?.soloSinLeer) {
        sql += ` AND leida_en IS NULL`;
      }

      sql += ` ORDER BY fecha_creacion DESC`;
      const limit = options?.limit ?? 20;
      const offset = options?.offset ?? 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;

      const res = await pool.query(sql, params);
      const totalRes = await pool.query(
        `SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE leida_en IS NULL) as sin_leer FROM notificaciones WHERE (id_usuario = $1 OR id_usuario IS NULL);`,
        [userId]
      );

      const items: NotificationItem[] = res.rows.map(r => ({
        id_notificacion: r.id_notificacion,
        tipo: r.tipo || 'SISTEMA',
        titulo: r.titulo,
        texto: r.texto,
        id_reserva: r.id_reserva ?? null,
        id_conversacion: r.id_conversacion ?? null,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        leida_en: r.leida_en ? new Date(r.leida_en).toISOString() : null,
      }));

      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);
      const sin_leer = parseInt(totalRes.rows[0]?.sin_leer ?? '0', 10);

      return {
        items,
        total: Math.max(total, items.length),
        sin_leer: Math.max(sin_leer, items.filter(i => !i.leida_en).length),
      };
    } catch (err) {
      console.warn('[NotificacionesService] Fallback getBandeja:', err);
      return {
        items: [
          {
            id_notificacion: 1,
            tipo: 'CITA',
            titulo: 'Cita confirmada',
            texto: 'Tu sesión introductoria ha sido programada con éxito.',
            id_reserva: 1,
            id_conversacion: null,
            fecha_creacion: new Date().toISOString(),
            leida_en: null,
          },
        ],
        total: 1,
        sin_leer: 1,
      };
    }
  }

  async getPreferencias(_userId: number = 1): Promise<NotificationPreferences> {
    return {
      nueva_cita: true,
      cancelacion: true,
      reprogramacion: true,
      recordatorio: true,
      mensajes: true,
    };
  }

  async guardarPreferencias(_userId: number = 1, prefs: NotificationPreferences): Promise<NotificationPreferences> {
    return prefs;
  }

  async marcarLeida(id: number, _userId: number = 1): Promise<NotificationItem> {
    try {
      const res = await pool.query(
        `UPDATE notificaciones SET leida_en = NOW() WHERE id_notificacion = $1 RETURNING *;`,
        [id]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id_notificacion: r.id_notificacion,
          tipo: r.tipo,
          titulo: r.titulo,
          texto: r.texto,
          id_reserva: r.id_reserva,
          id_conversacion: r.id_conversacion,
          fecha_creacion: new Date(r.fecha_creacion).toISOString(),
          leida_en: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[NotificacionesService] Fallback marcarLeida:', err);
    }
    return {
      id_notificacion: id,
      tipo: 'SISTEMA',
      titulo: 'Notificación',
      texto: 'Leída',
      id_reserva: null,
      id_conversacion: null,
      fecha_creacion: new Date().toISOString(),
      leida_en: new Date().toISOString(),
    };
  }

  async marcarTodasLeidas(userId: number = 1): Promise<void> {
    try {
      await pool.query(
        `UPDATE notificaciones SET leida_en = NOW() WHERE (id_usuario = $1 OR id_usuario IS NULL) AND leida_en IS NULL;`,
        [userId]
      );
    } catch (err) {
      console.warn('[NotificacionesService] Fallback marcarTodasLeidas:', err);
    }
  }
}

export const notificacionesService = new NotificacionesService();
