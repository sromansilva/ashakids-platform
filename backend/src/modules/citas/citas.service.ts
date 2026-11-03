import { pool } from '../../core/database.js';
import { GoogleCalendarService } from '../../infrastructure/calendar/google-calendar.service.js';
import { MeetService } from '../../infrastructure/meet/meet.service.js';
import { GmailService } from '../../infrastructure/mailer/gmail.service.js';
import { settings } from '../../core/config.js';
import { getAppointmentLocalParts } from '../../core/appointment-time.js';
import { isGoogleMeetUrl as isMeetingUrl } from '../../core/security/google-meet-url.js';
import type { AuthenticatedUser } from '../../core/middleware/auth.middleware.js';
import { emitNotificationEvent, type NotificationPreferenceKey, type NotificationType } from '../notificaciones/notification-events.js';
import {
  appendReservationScope,
  assertPatientOwner,
  assertReservationAccess,
  isActiveTherapist,
} from '../../core/security/clinical-access.js';

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
  async listar(filters: { idReserva?: number; estado?: string; terapeutaId?: number; pacienteId?: number; limit?: number; offset?: number }, user: AuthenticatedUser) {
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

      const reservationScope = appendReservationScope(params, user, 'r');
      sql += reservationScope;
      const countParams = [...params];
      const countSql = `SELECT COUNT(DISTINCT r.id_reserva) AS total ${sql.slice(sql.indexOf('FROM reservas r'))};`;

      sql += ` ORDER BY r.fecha_hora_inicio ASC`;

      const limit = filters?.limit ?? 50;
      const offset = filters?.offset ?? 0;
      params.push(limit, offset);
      sql += ` LIMIT $${params.length - 1} OFFSET $${params.length};`;

      const res = await pool.query(sql, params);
      const totalRes = await pool.query(countSql, countParams);
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

  async detalle(key: number, user: AuthenticatedUser): Promise<CitaRow | null> {
    const { items } = await this.listar({ idReserva: key, limit: 1 }, user);
    return items.find(c => c.id_reserva === key) ?? null;
  }

  async crear(data: any, user: AuthenticatedUser): Promise<CitaRow> {
    try {
      if (!['PADRE', 'ADMIN'].includes(user.rol)) {
        throw Object.assign(new Error('Solo el padre del paciente o administración pueden crear una cita.'), { status: 403 });
      }
      const patientId = Number(data.id_paciente);
      const therapistId = Number(data.id_terapeuta);
      if (!['INTRODUCTORIA', 'TERAPIA'].includes(data.tipo_cita ?? 'INTRODUCTORIA')) {
        throw Object.assign(new Error('El tipo de cita indicado no es válido.'), { status: 400 });
      }
      if (data.modalidad !== undefined && !['VIRTUAL', 'PRESENCIAL'].includes(data.modalidad)) {
        throw Object.assign(new Error('La modalidad indicada no es válida.'), { status: 400 });
      }
      await assertPatientOwner(user, patientId);
      if (!Number.isInteger(therapistId) || !(await isActiveTherapist(therapistId))) {
        throw Object.assign(new Error('El terapeuta seleccionado no existe o está inactivo.'), { status: 400 });
      }
      if (data.id_tratamiento !== undefined && data.id_tratamiento !== null) {
        const plan = await pool.query(
          `SELECT 1 FROM tratamientos t
           JOIN expedientes e ON e.id_expediente = t.id_expediente
           WHERE t.id_tratamiento = $1 AND e.id_paciente = $2 AND t.estado_tratamiento = 'ACTIVO'
           LIMIT 1;`,
          [data.id_tratamiento, patientId],
        );
        if (!plan.rows.length) throw Object.assign(new Error('El plan no pertenece al paciente o no está activo.'), { status: 400 });
      }
      const fechaInicio = data.fecha_hora_inicio;
      const inicioDate = typeof fechaInicio === 'string' ? new Date(fechaInicio) : new Date(Number.NaN);
      const fechaFin = data.fecha_hora_fin || new Date(new Date(fechaInicio).getTime() + 40 * 60000).toISOString();
      const finDate = new Date(fechaFin);
      if (!Number.isFinite(inicioDate.getTime()) || !Number.isFinite(finDate.getTime()) ||
          inicioDate.getTime() <= Date.now() || finDate.getTime() - inicioDate.getTime() !== 40 * 60000 ||
          inicioDate.getUTCMinutes() !== 0 || inicioDate.getUTCSeconds() !== 0 || inicioDate.getUTCMilliseconds() !== 0) {
        throw Object.assign(new Error('Selecciona un turno futuro de 40 minutos que empiece en punto.'), { status: 400 });
      }
      const localStart = getAppointmentLocalParts(inicioDate);
      const dayOfWeek = localStart.weekday;
      if (dayOfWeek > 5) throw Object.assign(new Error('No hay turnos disponibles los fines de semana.'), { status: 400 });
      const modalidad = data.modalidad ?? 'VIRTUAL';
      const topic = `AshaKids · ${data.tipo_cita === 'TERAPIA' ? 'Sesión de Terapia' : 'Consulta Introductoria'}`;
      let meetMeetingId: string | null = null;
      let meetJoinUrl: string | null = null;
      const client = await pool.connect();
      let row: any;
      try {
        await client.query('BEGIN;');
        await client.query('SELECT pg_advisory_xact_lock(7421, $1::integer);', [therapistId]);
        const available = await client.query(
          'SELECT 1 FROM turnos_semanales WHERE id_terapeuta = $1 AND dia = $2 AND hora = $3 LIMIT 1;',
          [therapistId, dayOfWeek, localStart.hour],
        );
        if (!available.rows.length) {
          throw Object.assign(new Error('El terapeuta no ofrece ese horario en su disponibilidad semanal.'), { status: 409 });
        }
        const overlap = await client.query(
          "SELECT 1 FROM reservas WHERE id_terapeuta = $1 AND estado_reserva <> 'CANCELADA' AND fecha_hora_inicio < $3::timestamptz AND fecha_hora_fin > $2::timestamptz FOR UPDATE;",
          [therapistId, fechaInicio, fechaFin],
        );
        if (overlap.rows.length) throw Object.assign(new Error('Ese horario ya no está disponible.'), { status: 409 });
        const inserted = await client.query(
          "INSERT INTO reservas (id_paciente, id_terapeuta, id_tratamiento, fecha_hora_inicio, fecha_hora_fin, modalidad, tipo_cita, estado_reserva, fecha_creacion, meet_id, meet_url) VALUES ($1, $2, $3, $4::timestamptz, $5::timestamptz, $6, COALESCE($7, 'INTRODUCTORIA'), 'CONFIRMADA', NOW(), NULL, NULL) RETURNING *;",
          [patientId, therapistId, data.id_tratamiento ?? null, fechaInicio, fechaFin, modalidad, data.tipo_cita],
        );
        row = inserted.rows[0];
        const participants = await client.query(
          `SELECT family.id_usuario AS parent_user_id, therapist_user.id_usuario AS therapist_user_id
           FROM pacientes p
           JOIN tutores family ON family.id_tutor = p.id_tutor
           JOIN terapeutas therapist ON therapist.id_terapeuta = $2
           JOIN usuarios therapist_user ON therapist_user.id_usuario = therapist.id_usuario
           WHERE p.id_paciente = $1;`,
          [patientId, therapistId],
        );
        const startLabel = new Intl.DateTimeFormat('es-PE', {
          timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short',
        }).format(new Date(row.fecha_hora_inicio));
        for (const participant of participants.rows) {
          await emitNotificationEvent(client, {
            userId: Number(participant.parent_user_id),
            preference: 'nueva_cita',
            type: 'NUEVA_CITA',
            title: 'Cita confirmada',
            text: `La cita quedó confirmada para el ${startLabel}.`,
            reservationId: Number(row.id_reserva),
            eventKey: `nueva_cita:${row.id_reserva}`,
          });
          await emitNotificationEvent(client, {
            userId: Number(participant.therapist_user_id),
            preference: 'nueva_cita',
            type: 'NUEVA_CITA',
            title: 'Nueva cita confirmada',
            text: `Se confirmó una cita en tu agenda para el ${startLabel}.`,
            reservationId: Number(row.id_reserva),
            eventKey: `nueva_cita:${row.id_reserva}`,
          });
        }
        await client.query('COMMIT;');
      } catch (error) {
        await client.query('ROLLBACK;');
        throw error;
      } finally {
        client.release();
      }

      // External meeting/calendar calls happen only after the database has reserved the slot.
      if (modalidad === 'VIRTUAL') {
        try {
          const meeting = await MeetService.createMeeting({
            topic,
            startTime: fechaInicio,
            durationMinutes: 40,
          });
          if (meeting && isMeetingUrl(meeting.join_url)) {
            meetMeetingId = meeting.id;
            meetJoinUrl = meeting.join_url;
            const savedMeeting = await pool.query(
              'UPDATE reservas SET meet_id = $1, meet_url = $2, google_calendar_event_id = $1 WHERE id_reserva = $3 RETURNING *;',
              [meetMeetingId, meetJoinUrl, row.id_reserva],
            );
            row = savedMeeting.rows[0] ?? row;
          }
        } catch (meetingError) {
          console.warn('[CitasService] La cita se guardó, pero no se pudo crear la reunión:', meetingError);
        }
      }

      if (!row.google_calendar_event_id) {
        const calendarEvent = await GoogleCalendarService.createAppointmentEvent({
          topic,
          startTime: fechaInicio,
          durationMinutes: 40,
          meetUrl: row.meet_url,
        });
        if (calendarEvent?.id) {
          const savedEvent = await pool.query(
            'UPDATE reservas SET google_calendar_event_id = $1 WHERE id_reserva = $2 RETURNING *;',
            [calendarEvent.id, row.id_reserva],
          );
          row = savedEvent.rows[0] ?? row;
        }
      }

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

  async reprogramar(key: number, data: { fecha_hora_inicio: string; fecha_hora_fin?: string }, user: AuthenticatedUser): Promise<CitaRow> {
    await assertReservationAccess(user, key);
    const current = await pool.query(
      'SELECT id_terapeuta, tipo_cita, modalidad, estado_reserva, meet_url, google_calendar_event_id, fecha_hora_inicio FROM reservas WHERE id_reserva = $1 LIMIT 1;',
      [key],
    );
    if (!current.rows[0]) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    if (current.rows[0].estado_reserva === 'CANCELADA') throw Object.assign(new Error('No se puede reprogramar una cita cancelada.'), { status: 409 });
    const inicio = new Date(data.fecha_hora_inicio);
    const fechaFin = data.fecha_hora_fin || new Date(new Date(data.fecha_hora_inicio).getTime() + 40 * 60000).toISOString();
    const fin = new Date(fechaFin);
    if (!Number.isFinite(inicio.getTime()) || !Number.isFinite(fin.getTime()) || inicio.getTime() <= Date.now() ||
        fin.getTime() - inicio.getTime() !== 40 * 60000 || inicio.getUTCMinutes() !== 0 ||
        inicio.getUTCSeconds() !== 0 || inicio.getUTCMilliseconds() !== 0) {
      throw Object.assign(new Error('Selecciona un turno futuro de 40 minutos que empiece en punto.'), { status: 400 });
    }
    const localStart = getAppointmentLocalParts(inicio);
    const dia = localStart.weekday;
    if (dia > 5) throw Object.assign(new Error('No hay turnos disponibles los fines de semana.'), { status: 400 });
    const therapistId = Number(current.rows[0].id_terapeuta);
    const client = await pool.connect();
    let previousStart: Date | null = null;
    try {
      await client.query('BEGIN;');
      await client.query('SELECT pg_advisory_xact_lock(7421, $1::integer);', [therapistId]);
      const locked = await client.query(
        'SELECT fecha_hora_inicio, estado_reserva FROM reservas WHERE id_reserva = $1 FOR UPDATE;',
        [key],
      );
      if (!locked.rows[0]) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
      if (locked.rows[0].estado_reserva === 'CANCELADA') throw Object.assign(new Error('No se puede reprogramar una cita cancelada.'), { status: 409 });
      previousStart = new Date(locked.rows[0].fecha_hora_inicio);
      const available = await client.query(
        'SELECT 1 FROM turnos_semanales WHERE id_terapeuta = $1 AND dia = $2 AND hora = $3 LIMIT 1;',
        [therapistId, dia, localStart.hour],
      );
      if (!available.rows.length) throw Object.assign(new Error('El terapeuta no ofrece ese horario en su disponibilidad semanal.'), { status: 409 });
      const overlap = await client.query(
        "SELECT 1 FROM reservas WHERE id_reserva <> $4 AND id_terapeuta = $1 AND estado_reserva <> 'CANCELADA' AND fecha_hora_inicio < $3::timestamptz AND fecha_hora_fin > $2::timestamptz FOR UPDATE;",
        [therapistId, data.fecha_hora_inicio, fechaFin, key],
      );
      if (overlap.rows.length) throw Object.assign(new Error('Ese horario ya no está disponible.'), { status: 409 });
      await client.query(
        'UPDATE reservas SET fecha_hora_inicio = $1::timestamptz, fecha_hora_fin = $2::timestamptz WHERE id_reserva = $3;',
        [data.fecha_hora_inicio, fechaFin, key],
      );
      if (previousStart.getTime() !== inicio.getTime()) {
        const participants = await client.query(
          `SELECT family.id_usuario AS parent_user_id, therapist_user.id_usuario AS therapist_user_id
           FROM reservas r
           JOIN pacientes p ON p.id_paciente = r.id_paciente
           JOIN tutores family ON family.id_tutor = p.id_tutor
           JOIN terapeutas therapist ON therapist.id_terapeuta = r.id_terapeuta
           JOIN usuarios therapist_user ON therapist_user.id_usuario = therapist.id_usuario
           WHERE r.id_reserva = $1;`,
          [key],
        );
        const startLabel = new Intl.DateTimeFormat('es-PE', {
          timeZone: 'America/Lima', dateStyle: 'long', timeStyle: 'short',
        }).format(inicio);
        const eventKey = `reprogramacion:${key}:${inicio.toISOString()}`;
        for (const participant of participants.rows) {
          await emitNotificationEvent(client, {
            userId: Number(participant.parent_user_id), preference: 'reprogramacion', type: 'REPROGRAMACION',
            title: 'Cita reprogramada', text: `La cita ahora será el ${startLabel}.`,
            reservationId: key, eventKey,
          });
          await emitNotificationEvent(client, {
            userId: Number(participant.therapist_user_id), preference: 'reprogramacion', type: 'REPROGRAMACION',
            title: 'Cita reprogramada', text: `Una cita de tu agenda ahora será el ${startLabel}.`,
            reservationId: key, eventKey,
          });
        }
      }
      await client.query('COMMIT;');
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
    const eventId = current.rows[0].google_calendar_event_id;
    if (eventId) {
      const topic = 'AshaKids · ' + (current.rows[0].tipo_cita === 'TERAPIA' ? 'Sesión de Terapia' : 'Consulta Introductoria');
      await GoogleCalendarService.updateAppointmentEvent(String(eventId), {
        topic,
        startTime: data.fecha_hora_inicio,
        durationMinutes: 40,
        meetUrl: current.rows[0].meet_url,
      });
    }
    const cita = await this.detalle(key, user);
    if (!cita) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    return cita;
  }

  async cambiarEstado(key: number, estado_reserva: string, user: AuthenticatedUser): Promise<CitaRow> {
    await assertReservationAccess(user, key);
    if (estado_reserva !== 'CONFIRMADA' && estado_reserva !== 'CANCELADA') {
      throw Object.assign(new Error('El estado solicitado no está permitido.'), { status: 400 });
    }
    if (estado_reserva === 'CONFIRMADA' && user.rol === 'PADRE') {
      throw Object.assign(new Error('Solo el terapeuta o administración pueden confirmar una cita.'), { status: 403 });
    }
    const client = await pool.connect();
    let calendarEventId: string | null = null;
    try {
      await client.query('BEGIN;');
      const current = await client.query(
        `SELECT r.estado_reserva, r.google_calendar_event_id, s.estado_sesion
         FROM reservas r LEFT JOIN sesiones s ON s.id_reserva = r.id_reserva
         WHERE r.id_reserva = $1 FOR UPDATE OF r;`,
        [key],
      );
      if (!current.rows[0]) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
      if (estado_reserva === 'CANCELADA' && ['EN_CURSO', 'FINALIZADA'].includes(current.rows[0].estado_sesion)) {
        throw Object.assign(new Error('No se puede cancelar una sesión que ya comenzó o terminó.'), { status: 409 });
      }
      if (current.rows[0].estado_reserva === 'CANCELADA' && estado_reserva !== 'CANCELADA') {
        throw Object.assign(new Error('La cita cancelada debe volver a reservarse desde la agenda.'), { status: 409 });
      }
      const previousState = String(current.rows[0].estado_reserva);
      calendarEventId = current.rows[0].google_calendar_event_id ? String(current.rows[0].google_calendar_event_id) : null;
      await client.query('UPDATE reservas SET estado_reserva = $1 WHERE id_reserva = $2;', [estado_reserva, key]);

      const eventType: NotificationType | null = previousState !== estado_reserva
        ? estado_reserva === 'CANCELADA' ? 'CANCELACION' : 'NUEVA_CITA'
        : null;
      if (eventType) {
        const participants = await client.query(
          `SELECT family.id_usuario AS parent_user_id, therapist_user.id_usuario AS therapist_user_id
           FROM reservas r
           JOIN pacientes p ON p.id_paciente = r.id_paciente
           JOIN tutores family ON family.id_tutor = p.id_tutor
           JOIN terapeutas therapist ON therapist.id_terapeuta = r.id_terapeuta
           JOIN usuarios therapist_user ON therapist_user.id_usuario = therapist.id_usuario
           WHERE r.id_reserva = $1;`,
          [key],
        );
        const preference: NotificationPreferenceKey = eventType === 'CANCELACION' ? 'cancelacion' : 'nueva_cita';
        const eventKey = `${eventType.toLowerCase()}:${key}`;
        for (const participant of participants.rows) {
          await emitNotificationEvent(client, {
            userId: Number(participant.parent_user_id), preference, type: eventType,
            title: eventType === 'CANCELACION' ? 'Cita cancelada' : 'Cita confirmada',
            text: eventType === 'CANCELACION' ? 'Una cita de tu familia fue cancelada.' : 'Una cita de tu familia fue confirmada.',
            reservationId: key, eventKey,
          });
          await emitNotificationEvent(client, {
            userId: Number(participant.therapist_user_id), preference, type: eventType,
            title: eventType === 'CANCELACION' ? 'Cita cancelada' : 'Cita confirmada',
            text: eventType === 'CANCELACION' ? 'Una cita de tu agenda fue cancelada.' : 'Una cita de tu agenda fue confirmada.',
            reservationId: key, eventKey,
          });
        }
      }
      await client.query('COMMIT;');
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    } finally {
      client.release();
    }
    if (estado_reserva === 'CANCELADA' && calendarEventId) {
      await GoogleCalendarService.cancelAppointmentEvent(calendarEventId);
    }
    const cita = await this.detalle(key, user);
    if (!cita) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    return { ...cita, estado_reserva: estado_reserva as any };
  }

  async actualizarReunion(key: number, meet_url: string | null, user: AuthenticatedUser): Promise<CitaRow> {
    if (user.rol !== 'ADMIN' && user.rol !== 'TERAPEUTA') {
      throw Object.assign(new Error('Solo el terapeuta asignado o administración pueden modificar el enlace.'), { status: 403 });
    }
    await assertReservationAccess(user, key);
    if (meet_url && !isMeetingUrl(meet_url)) {
      throw Object.assign(new Error('Comparte un enlace HTTPS de Google Meet válido.'), { status: 400 });
    }
    await pool.query(
      `UPDATE reservas SET meet_url = $1, meet_id = NULL WHERE id_reserva = $2;`,
      [meet_url, key]
    );
    const cita = await this.detalle(key, user);
    if (!cita) throw Object.assign(new Error('Cita no encontrada.'), { status: 404 });
    // Calendar event IDs are not stored, so a manually changed link updates the reservation only.
    return { ...cita, meet_url, meet_origen: meet_url ? 'MANUAL' : null, meet_automatico_configurado: MeetService.isConfigured() };
  }
}

export const citasService = new CitasService();

export { isMeetingUrl };

