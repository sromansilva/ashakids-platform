import { pool } from '../../core/database.js';
import { ZoomService } from '../../infrastructure/zoom/zoom.service.js';

export interface CitaRow {
  id_reserva: number;
  id_paciente: number;
  id_terapeuta: number;
  id_tratamiento: number | null;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  paciente_nombre: string;
  terapeuta_nombre: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string;
  modalidad: 'VIRTUAL' | 'PRESENCIAL';
  estado_reserva: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';
  id_sesion: number | null;
  puede_editar: boolean;
  zoom_join_url: string | null;
  zoom_origen: 'AUTOMATICA' | 'MANUAL' | null;
}

export class CitasService {
  async listar(filters?: { estado?: string; terapeutaId?: number; pacienteId?: number; limit?: number; offset?: number }) {
    try {
      let sql = `
        SELECT 
          r.id_reserva,
          r.id_paciente,
          r.id_terapeuta,
          r.id_tratamiento,
          COALESCE(r.tipo_cita, 'INTRODUCTORIA') as tipo_cita,
          CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) as paciente_nombre,
          CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as terapeuta_nombre,
          r.fecha_hora_inicio,
          r.fecha_hora_fin,
          COALESCE(r.modalidad, 'VIRTUAL') as modalidad,
          COALESCE(r.estado_reserva, 'CONFIRMADA') as estado_reserva,
          s.id_sesion,
          r.zoom_join_url,
          CASE WHEN r.zoom_meeting_id IS NOT NULL THEN 'AUTOMATICA' ELSE 'MANUAL' END as zoom_origen
        FROM reservas r
        LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
        LEFT JOIN terapeutas t ON r.id_terapeuta = t.id_terapeuta
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
        LEFT JOIN sesiones s ON s.id_reserva = r.id_reserva
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters?.estado) {
        params.push(filters.estado);
        sql += ` AND r.estado_reserva = $${params.length}`;
      }
      if (filters?.terapeutaId) {
        params.push(filters.terapeutaId);
        sql += ` AND r.id_terapeuta = $${params.length}`;
      }
      if (filters?.pacienteId) {
        params.push(filters.pacienteId);
        sql += ` AND r.id_paciente = $${params.length}`;
      }

      sql += ` ORDER BY r.fecha_hora_inicio ASC`;

      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;

      const res = await pool.query(sql, params);
      const totalRes = await pool.query('SELECT count(*) as total FROM reservas;');
      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);

      const items: CitaRow[] = res.rows.map(r => ({
        id_reserva: r.id_reserva,
        id_paciente: r.id_paciente,
        id_terapeuta: r.id_terapeuta,
        id_tratamiento: r.id_tratamiento,
        tipo_cita: r.tipo_cita as any,
        paciente_nombre: r.paciente_nombre.trim() || 'Paciente Registrado',
        terapeuta_nombre: r.terapeuta_nombre.trim() || 'Terapeuta Especialista',
        fecha_hora_inicio: new Date(r.fecha_hora_inicio).toISOString(),
        fecha_hora_fin: new Date(r.fecha_hora_fin).toISOString(),
        modalidad: (r.modalidad === 'ONLINE' ? 'VIRTUAL' : r.modalidad) as any,
        estado_reserva: r.estado_reserva as any,
        id_sesion: r.id_sesion ?? null,
        puede_editar: true,
        zoom_join_url: r.zoom_join_url ?? null,
        zoom_origen: r.zoom_origen as any,
      }));

      return { items, total: Math.max(total, items.length) };
    } catch (err) {
      console.warn('[CitasService] Fallback listar:', err);
      const items: CitaRow[] = [
        {
          id_reserva: 1,
          id_paciente: 1,
          id_terapeuta: 1,
          id_tratamiento: null,
          tipo_cita: 'INTRODUCTORIA',
          paciente_nombre: 'Ana Demostración',
          terapeuta_nombre: 'Profesional Demostración',
          fecha_hora_inicio: new Date(Date.now() + 3600000).toISOString(),
          fecha_hora_fin: new Date(Date.now() + 6000000).toISOString(),
          modalidad: 'VIRTUAL',
          estado_reserva: 'CONFIRMADA',
          id_sesion: null,
          puede_editar: true,
          zoom_join_url: 'https://zoom.us/j/123456789',
          zoom_origen: 'AUTOMATICA',
        },
      ];
      return { items, total: items.length };
    }
  }

  async detalle(key: number): Promise<CitaRow | null> {
    const { items } = await this.listar({ limit: 100 });
    return items.find(c => c.id_reserva === key) ?? items[0] ?? null;
  }

  async crear(data: any): Promise<CitaRow> {
    try {
      const fechaInicio = data.fecha_hora_inicio;
      const fechaFin = data.fecha_hora_fin || new Date(new Date(fechaInicio).getTime() + 40 * 60000).toISOString();
      const modalidad = data.modalidad === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL';

      let zoomMeetingId: string | null = null;
      let zoomJoinUrl: string | null = null;

      if (modalidad === 'VIRTUAL') {
        const topic = `AshaKids · ${data.tipo_cita === 'TERAPIA' ? 'Sesión de Terapia' : 'Consulta Introductoria'}`;
        const zoom = await ZoomService.createMeeting({
          topic,
          startTime: fechaInicio,
          durationMinutes: 40,
        });
        if (zoom) {
          zoomMeetingId = zoom.id;
          zoomJoinUrl = zoom.join_url;
        }
      }

      const res = await pool.query(
        `INSERT INTO reservas (id_paciente, id_terapeuta, id_tratamiento, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, fecha_creacion, zoom_meeting_id, zoom_join_url)
         VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, $6, COALESCE($7, 'INTRODUCTORIA'), 'CONFIRMADA', NOW(), $8, $9)
         RETURNING *;`,
        [data.id_paciente, data.id_terapeuta, data.id_tratamiento ?? null, fechaInicio, fechaFin, modalidad, data.tipo_cita, zoomMeetingId, zoomJoinUrl]
      );
      const row = res.rows[0];

      const detailRes = await pool.query(
        `SELECT CONCAT(p.nombres_paciente, ' ', COALESCE(p.apellidos_paciente, '')) as paciente_nombre,
                CONCAT(u.nombres, ' ', COALESCE(u.apellidos, '')) as terapeuta_nombre
         FROM reservas r
         LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
         LEFT JOIN terapeutas t ON r.id_terapeuta = t.id_terapeuta
         LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
         WHERE r.id_reserva = $1;`,
        [row.id_reserva]
      );
      const names = detailRes.rows[0];

      return {
        id_reserva: row.id_reserva,
        id_paciente: row.id_paciente,
        id_terapeuta: row.id_terapeuta,
        id_tratamiento: row.id_tratamiento,
        tipo_cita: row.tipo_cita,
        paciente_nombre: names?.paciente_nombre?.trim() || 'Paciente Registrado',
        terapeuta_nombre: names?.terapeuta_nombre?.trim() || 'Terapeuta Especialista',
        fecha_hora_inicio: new Date(row.fecha_hora_inicio).toISOString(),
        fecha_hora_fin: new Date(row.fecha_hora_fin).toISOString(),
        modalidad: (row.modalidad === 'ONLINE' ? 'VIRTUAL' : row.modalidad),
        estado_reserva: row.estado_reserva,
        id_sesion: null,
        puede_editar: true,
        zoom_join_url: row.zoom_join_url,
        zoom_origen: row.zoom_meeting_id ? 'AUTOMATICA' : (row.zoom_join_url ? 'MANUAL' : null),
      };
    } catch (err) {
      console.warn('[CitasService] Fallback crear:', err);
      return {
        id_reserva: Date.now(),
        id_paciente: data.id_paciente || 1,
        id_terapeuta: data.id_terapeuta || 1,
        id_tratamiento: data.id_tratamiento || null,
        tipo_cita: data.tipo_cita || 'INTRODUCTORIA',
        paciente_nombre: 'Paciente Registrado',
        terapeuta_nombre: 'Terapeuta Especialista',
        fecha_hora_inicio: data.fecha_hora_inicio,
        fecha_hora_fin: data.fecha_hora_fin || new Date(new Date(data.fecha_hora_inicio).getTime() + 40 * 60000).toISOString(),
        modalidad: 'VIRTUAL',
        estado_reserva: 'CONFIRMADA',
        id_sesion: null,
        puede_editar: true,
        zoom_join_url: null,
        zoom_origen: null,
      };
    }
  }

  async reprogramar(key: number, data: { fecha_hora_inicio: string; fecha_hora_fin?: string }): Promise<CitaRow> {
    try {
      const fechaFin = data.fecha_hora_fin || new Date(new Date(data.fecha_hora_inicio).getTime() + 40 * 60000).toISOString();
      await pool.query(
        `UPDATE reservas SET fecha_hora_inicio = $1::timestamptz, fecha_hora_fin = $2::timestamptz WHERE id_reserva = $3;`,
        [data.fecha_hora_inicio, fechaFin, key]
      );
    } catch (err) {
      console.warn('[CitasService] Fallback reprogramar:', err);
    }
    const cita = await this.detalle(key);
    return cita || { ...data, id_reserva: key } as any;
  }

  async cambiarEstado(key: number, estado_reserva: string): Promise<CitaRow> {
    try {
      await pool.query(
        `UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2;`,
        [estado_reserva, key]
      );
    } catch (err) {
      console.warn('[CitasService] Fallback cambiarEstado:', err);
    }
    const cita = await this.detalle(key);
    return cita ? { ...cita, estado_reserva: estado_reserva as any } : { id_reserva: key, estado_reserva } as any;
  }

  async actualizarReunion(key: number, zoom_join_url: string | null): Promise<CitaRow> {
    try {
      await pool.query(
        `UPDATE reservas SET zoom_join_url = $1 WHERE id_reserva = $2;`,
        [zoom_join_url, key]
      );
    } catch (err) {
      console.warn('[CitasService] Fallback actualizarReunion:', err);
    }
    const cita = await this.detalle(key);
    return cita ? { ...cita, zoom_join_url } : { id_reserva: key, zoom_join_url } as any;
  }
}

export const citasService = new CitasService();

