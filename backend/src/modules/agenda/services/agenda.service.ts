import { pool } from '../../../core/database.js';
import { MeetService } from '../../../infrastructure/meet/meet.service.js';
import type { AuthenticatedUser } from '../../../core/middleware/auth.middleware.js';
import { appendReservationScope } from '../../../core/security/clinical-access.js';

export class AgendaService {
  async getCitas(filters: { fecha?: string; terapeutaId?: number }, user: AuthenticatedUser) {
    try {
      let sql = `
        SELECT 
          r.id_reserva as id_cita,
          r.id_paciente,
          r.id_terapeuta,
          CONCAT(p.nombres_paciente, ' ', p.apellidos_paciente) as paciente_nombre,
          r.fecha_hora_inicio,
          r.fecha_hora_fin,
          r.estado_reserva as estado,
          r.modalidad,
          r.meet_id,
          r.meet_url
        FROM reservas r
        LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
        WHERE 1=1
      `;
      const params: any[] = [];
      if (filters?.terapeutaId) {
        params.push(filters.terapeutaId);
        sql += ` AND r.id_terapeuta = $${params.length}`;
      }
      if (filters?.fecha) {
        params.push(filters.fecha);
        sql += ` AND r.fecha_hora_inicio::date = $${params.length}::date`;
      }
      sql += appendReservationScope(params, user, 'r');
      sql += ` ORDER BY r.fecha_hora_inicio DESC LIMIT 50;`;

      const res = await pool.query(sql, params);
      return res.rows.map(r => ({
          id_cita: r.id_cita,
          id_paciente: r.id_paciente,
          id_terapeuta: r.id_terapeuta,
          paciente_nombre: r.paciente_nombre || 'Paciente Registrado',
          terapeuta_nombre: 'Terapeuta Especialista',
          fecha: r.fecha_hora_inicio ? new Date(r.fecha_hora_inicio).toISOString().split('T')[0] : null,
          hora_inicio: r.fecha_hora_inicio ? new Date(r.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          hora_fin: r.fecha_hora_fin ? new Date(r.fecha_hora_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          estado: r.estado,
          modalidad: r.modalidad || 'TELETERAPIA',
          meet_url: isMeetingUrl(r.meet_url) ? r.meet_url : null,
          meet_origen: r.meet_id ? 'AUTOMATICA' : isMeetingUrl(r.meet_url) ? 'MANUAL' : null,
          meet_automatico_configurado: MeetService.isConfigured(),
        }));
    } catch (err) {
      throw err;
    }
  }
}

export const agendaService = new AgendaService();

export function isMeetingUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

