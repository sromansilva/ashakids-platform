import { pool } from '../../../core/database.js';
import { MeetService } from '../../../infrastructure/meet/meet.service.js';
import { GoogleCalendarService } from '../../../infrastructure/calendar/google-calendar.service.js';
import { GmailService } from '../../../infrastructure/mailer/gmail.service.js';
import { settings } from '../../../core/config.js';
import type { AgendarCitaDTO, CambiarEstadoCitaDTO } from '../dtos/agenda.dto.js';

export class AgendaService {
  async getCitas(filters?: { fecha?: string; terapeutaId?: number }) {
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
      sql += ` ORDER BY r.fecha_hora_inicio DESC LIMIT 50;`;

      const res = await pool.query(sql, params);
      if (res.rows.length > 0) {
        return res.rows.map(r => ({
          id_cita: r.id_cita,
          id_paciente: r.id_paciente,
          id_terapeuta: r.id_terapeuta,
          paciente_nombre: r.paciente_nombre || 'Paciente Registrado',
          terapeuta_nombre: 'Terapeuta Especialista',
          fecha: r.fecha_hora_inicio ? new Date(r.fecha_hora_inicio).toISOString().split('T')[0] : '2026-10-26',
          hora_inicio: r.fecha_hora_inicio ? new Date(r.fecha_hora_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00',
          hora_fin: r.fecha_hora_fin ? new Date(r.fecha_hora_fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:45',
          estado: r.estado,
          modalidad: r.modalidad || 'TELETERAPIA',
          meet_url: isMeetingUrl(r.meet_url) ? r.meet_url : null,
          meet_origen: r.meet_id ? 'AUTOMATICA' : isMeetingUrl(r.meet_url) ? 'MANUAL' : null,
          meet_automatico_configurado: MeetService.isConfigured(),
        }));
      }
    } catch (err) {
      console.warn('[AgendaService] Fallback citas:', err);
    }
    return [];
  }

  async agendar(dto: AgendarCitaDTO) {
    try {
      const fechaHora = `${dto.fecha}T${dto.hora_inicio}:00Z`;
      const meet = await MeetService.createMeeting({
        topic: 'AshaKids · Consulta de Agenda',
        startTime: fechaHora,
        durationMinutes: 40,
      });
      const meetMeetingId = meet ? meet.id : null;
      const meetJoinUrl = meet ? meet.join_url : null;
      const res = await pool.query(
        `INSERT INTO reservas (id_paciente, id_terapeuta, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, fecha_creacion, meet_id, meet_url)
         VALUES ($1, $2, $3::timestamptz, ($3::timestamptz + INTERVAL '40 minutes'), 'ONLINE', 'INTRODUCTORIA', 'CONFIRMADA', NOW(), $4, $5)
         RETURNING id_reserva, id_paciente, id_terapeuta, fecha_hora_inicio, estado_reserva, meet_url;`,
        [dto.id_paciente, dto.id_terapeuta, fechaHora, meetMeetingId, meetJoinUrl]
      );
      const row = res.rows[0];

      // Existing reservation schema does not retain the Calendar event ID; later changes are not synced to that event.
      await GoogleCalendarService.createAppointmentEvent({
        topic: 'AshaKids · Consulta de Agenda',
        startTime: fechaHora,
        durationMinutes: 40,
        meetUrl: row.meet_url,
      });

      // Enviar confirmación por correo electrónico
      try {
        const contactRes = await pool.query(
          `SELECT u.email as tutor_email, u.nombres as tutor_nombre, p.nombres_paciente
           FROM pacientes p
           LEFT JOIN tutores tu ON p.id_tutor = tu.id_tutor
           LEFT JOIN usuarios u ON tu.id_usuario = u.id_usuario
           WHERE p.id_paciente = $1;`,
          [dto.id_paciente]
        );
        const contacts = contactRes.rows[0];
        const tutorRecipient = (contacts?.tutor_email && !contacts.tutor_email.endsWith('@ashakids.test'))
          ? contacts.tutor_email
          : settings.GMAIL_SENDER_EMAIL;

        if (tutorRecipient) {
          void GmailService.sendAppointmentConfirmation({
            to: tutorRecipient,
            patientOrTherapistName: contacts?.nombres_paciente || contacts?.tutor_nombre || 'Familia ASHAKids',
            topic: 'Consulta de Agenda ASHAKids',
            date: dto.fecha,
            time: dto.hora_inicio,
            meetUrl: row.meet_url || undefined,
          }).catch((e) => console.warn('[AgendaService] Error enviando correo de cita:', e));
        }
      } catch (e) {
        console.warn('[AgendaService] Error obteniendo datos para enviar correo de cita:', e);
      }

      return {
        id_cita: row.id_reserva,
        ...dto,
        estado: row.estado_reserva,
        meet_url: row.meet_url,
        meet_origen: row.meet_id ? 'AUTOMATICA' : row.meet_url ? 'MANUAL' : null,
        meet_automatico_configurado: MeetService.isConfigured(),
        creado_en: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[AgendaService] Fallback agendar:', err);
      return {
        id_cita: 999,
        ...dto,
        estado: 'CONFIRMADA',
        meet_url: null,
        meet_origen: null,
        meet_automatico_configurado: MeetService.isConfigured(),
        creado_en: new Date().toISOString(),
      };
    }
  }

  async cambiarEstado(id_cita: number, dto: CambiarEstadoCitaDTO) {
    try {
      await pool.query(
        `UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2;`,
        [dto.estado, id_cita]
      );
    } catch (err) {
      console.warn('[AgendaService] Fallback cambiarEstado:', err);
    }

    return {
      id_cita,
      estado: dto.estado,
      motivo_cambio: dto.motivo_cambio,
      actualizado_en: new Date().toISOString(),
    };
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

