import { pool } from '../../core/database.js';
import { GoogleCalendarService } from '../../infrastructure/calendar/google-calendar.service.js';
import { MeetService } from '../../infrastructure/meet/meet.service.js';
import { GmailService } from '../../infrastructure/mailer/gmail.service.js';
import { settings } from '../../core/config.js';

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
  meet_url: string | null;
  meet_origen: 'AUTOMATICA' | 'MANUAL' | null;
  meet_automatico_configurado: boolean;
}

export class CitasService {
  async listar(filters?: { idReserva?: number; estado?: string; terapeutaId?: number; pacienteId?: number; limit?: number; offset?: number }) {
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
          r.meet_id,
          r.meet_url,
          CASE WHEN r.meet_id IS NOT NULL THEN 'AUTOMATICA'
               WHEN r.meet_url IS NOT NULL THEN 'MANUAL'
               ELSE NULL END as meet_origen
        FROM reservas r
        LEFT JOIN pacientes p ON r.id_paciente = p.id_paciente
        LEFT JOIN terapeutas t ON r.id_terapeuta = t.id_terapeuta
        LEFT JOIN usuarios u ON t.id_usuario = u.id_usuario
        LEFT JOIN sesiones s ON s.id_reserva = r.id_reserva
        WHERE 1=1
      `;
      const params: any[] = [];

      if (filters?.idReserva) {
        params.push(filters.idReserva);
        sql += ` AND r.id_reserva = $${params.length}`;
      }

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
        meet_url: isMeetingUrl(r.meet_url) ? r.meet_url : null,
        meet_origen: isMeetingUrl(r.meet_url) ? r.meet_origen as any : null,
        meet_automatico_configurado: MeetService.isConfigured(),
      }));

      return { items, total: Math.max(total, items.length) };
    } catch (err) {
      throw err;
    }
  }

  async detalle(key: number): Promise<CitaRow | null> {
    const { items } = await this.listar({ idReserva: key, limit: 1 });
    return items.find(c => c.id_reserva === key) ?? null;
  }

  async crear(data: any): Promise<CitaRow> {
    try {
      const fechaInicio = data.fecha_hora_inicio;
      const fechaFin = data.fecha_hora_fin || new Date(new Date(fechaInicio).getTime() + 40 * 60000).toISOString();
      const modalidad = data.modalidad === 'PRESENCIAL' ? 'PRESENCIAL' : 'VIRTUAL';
      const topic = `AshaKids · ${data.tipo_cita === 'TERAPIA' ? 'Sesión de Terapia' : 'Consulta Introductoria'}`;
      let meetMeetingId: string | null = null;
      let meetJoinUrl: string | null = null;

      if (modalidad === 'VIRTUAL') {
        const meeting = await MeetService.createMeeting({
          topic,
          startTime: fechaInicio,
          durationMinutes: Math.max(1, Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 60_000)),
        });
        if (meeting && isMeetingUrl(meeting.join_url)) {
          meetMeetingId = meeting.id;
          meetJoinUrl = meeting.join_url;
        }
      }

      const res = await pool.query(
        `INSERT INTO reservas (id_paciente, id_terapeuta, id_tratamiento, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, fecha_creacion, meet_id, meet_url)
         VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, $6, COALESCE($7, 'INTRODUCTORIA'), 'CONFIRMADA', NOW(), $8, $9)
         RETURNING *;`,
        [data.id_paciente, data.id_terapeuta, data.id_tratamiento ?? null, fechaInicio, fechaFin, modalidad, data.tipo_cita, meetMeetingId, meetJoinUrl]
      );
      const row = res.rows[0];

      // Existing reservation schema does not retain the Calendar event ID; later reschedules or link edits are not synced to that event.
      await GoogleCalendarService.createAppointmentEvent({
        topic,
        startTime: fechaInicio,
        durationMinutes: Math.max(1, Math.round((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / 60_000)),
        meetUrl: row.meet_url,
      });

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

      // Enviar confirmación por correo electrónico
      try {
        const contactRes = await pool.query(
          `SELECT u.email as tutor_email, u.nombres as tutor_nombre, p.nombres_paciente,
                  ut.email as terapeuta_email, ut.nombres as terapeuta_nombre
           FROM pacientes p
           LEFT JOIN tutores tu ON p.id_tutor = tu.id_tutor
           LEFT JOIN usuarios u ON tu.id_usuario = u.id_usuario
           LEFT JOIN terapeutas t ON t.id_terapeuta = $2
           LEFT JOIN usuarios ut ON t.id_usuario = ut.id_usuario
           WHERE p.id_paciente = $1;`,
          [data.id_paciente, data.id_terapeuta]
        );
        const contacts = contactRes.rows[0];
        const dateObj = new Date(row.fecha_hora_inicio);
        const dateStr = dateObj.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Lima' });
        const timeStr = dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Lima' });

        // Si el correo del tutor es de prueba (@ashakids.test), enviamos la copia a GMAIL_SENDER_EMAIL para que el usuario pueda comprobarlo en su bandeja
        const tutorRecipient = (contacts?.tutor_email && !contacts.tutor_email.endsWith('@ashakids.test'))
          ? contacts.tutor_email
          : settings.GMAIL_SENDER_EMAIL;

        if (tutorRecipient) {
          void GmailService.sendAppointmentConfirmation({
            to: tutorRecipient,
            patientOrTherapistName: contacts?.nombres_paciente || contacts?.tutor_nombre || 'Familia ASHAKids',
            topic: `Sesión de ${data.tipo_cita === 'TERAPIA' ? 'Terapia' : 'Consulta Introductoria'}`,
            date: dateStr,
            time: timeStr,
            meetUrl: row.meet_url || undefined,
          }).catch((e) => console.warn('[CitasService] Error enviando correo de cita al tutor:', e));
        }

        if (contacts?.terapeuta_email && !contacts.terapeuta_email.endsWith('@ashakids.test')) {
          void GmailService.sendAppointmentConfirmation({
            to: contacts.terapeuta_email,
            patientOrTherapistName: `Terapeuta ${contacts.terapeuta_nombre}`,
            topic: `Cita con ${contacts?.nombres_paciente || 'paciente'}`,
            date: dateStr,
            time: timeStr,
            meetUrl: row.meet_url || undefined,
          }).catch((e) => console.warn('[CitasService] Error enviando correo de cita al terapeuta:', e));
        }
      } catch (errEmail) {
        console.warn('[CitasService] Error obteniendo datos para enviar correo de cita:', errEmail);
      }

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
        meet_url: row.meet_url,
        meet_origen: row.meet_id ? 'AUTOMATICA' : row.meet_url ? 'MANUAL' : null,
        meet_automatico_configurado: MeetService.isConfigured(),
      };
    } catch (err) {
      throw err;
    }
  }

  async reprogramar(key: number, data: { fecha_hora_inicio: string; fecha_hora_fin?: string }): Promise<CitaRow> {
    const fechaFin = data.fecha_hora_fin || new Date(new Date(data.fecha_hora_inicio).getTime() + 40 * 60000).toISOString();
    // Calendar event IDs are not stored, so this updates the reservation only.
    await pool.query(
      `UPDATE reservas SET fecha_hora_inicio = $1::timestamptz, fecha_hora_fin = $2::timestamptz WHERE id_reserva = $3;`,
      [data.fecha_hora_inicio, fechaFin, key]
    );
    const cita = await this.detalle(key);
    if (!cita) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    return cita;
  }

  async cambiarEstado(key: number, estado_reserva: string): Promise<CitaRow> {
    await pool.query(
      `UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2;`,
      [estado_reserva, key]
    );
    const cita = await this.detalle(key);
    if (!cita) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    return { ...cita, estado_reserva: estado_reserva as any };
  }

  async actualizarReunion(key: number, meet_url: string | null): Promise<CitaRow> {
    if (meet_url && !isMeetingUrl(meet_url)) {
      throw Object.assign(new Error('Comparte un enlace HTTPS de Google Meet válido.'), { status: 400 });
    }
    await pool.query(
      `UPDATE reservas SET meet_url = $1, meet_id = NULL WHERE id_reserva = $2;`,
      [meet_url, key]
    );
    const cita = await this.detalle(key);
    if (!cita) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    // Calendar event IDs are not stored, so a manually changed link updates the reservation only.
    return { ...cita, meet_url, meet_origen: meet_url ? 'MANUAL' : null, meet_automatico_configurado: MeetService.isConfigured() };
  }
}

export const citasService = new CitasService();

export function isMeetingUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

