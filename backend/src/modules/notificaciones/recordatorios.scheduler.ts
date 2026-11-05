import type { PoolClient } from 'pg';
import { pool } from '../../core/database.js';
import { GmailService } from '../../infrastructure/mailer/gmail.service.js';
import { isReminderRecipientEnabled } from './notification-recipient.js';
import { safeGoogleMeetUrl } from '../../core/security/google-meet-url.js';

const SCHEDULER_LOCK_A = 8612;
const SCHEDULER_LOCK_B = 3;
const POLL_MS = 30_000;
const EMAIL_BATCH_SIZE = 20;

interface DueAppointment {
  id_reserva: number;
  fecha_hora_inicio: Date | string;
  patient_name: string;
  parent_user_id: number;
  therapist_user_id: number;
  parent_recordatorio: boolean;
  therapist_recordatorio: boolean;
}

interface EmailOutboxItem {
  id_usuario: number;
  id_reserva: number;
  fecha_hora_inicio: Date | string;
  clave_evento: string;
  intentos: number;
}

function eventKey(minutes: 5 | 10, appointment: DueAppointment) {
  const utc = new Date(appointment.fecha_hora_inicio).toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `recordatorio:${minutes}:${appointment.id_reserva}:${utc}`;
}

function dateParts(value: Date | string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', dateStyle: 'long' }).format(date),
    time: new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date),
  };
}

export class AppointmentReminderScheduler {
  private timer: ReturnType<typeof setInterval> | null = null;
  private inFlight: Promise<void> | null = null;

  start() {
    if (this.timer) return;
    void this.runOnce();
    this.timer = setInterval(() => void this.runOnce(), POLL_MS);
    this.timer.unref?.();
  }

  async stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await this.inFlight;
  }

  runOnce() {
    if (this.inFlight) return this.inFlight;
    this.inFlight = this.execute()
      .catch((error) => {
        console.warn('[AppointmentReminderScheduler] Error en ciclo de recordatorios:', error instanceof Error ? error.message : String(error));
      })
      .finally(() => { this.inFlight = null; });
    return this.inFlight;
  }

  private async execute() {
    let client;
    let locked = false;
    try {
      client = await pool.connect();
      const lockResult = await client.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock($1, $2) AS locked;',
        [SCHEDULER_LOCK_A, SCHEDULER_LOCK_B],
      );
      locked = Boolean(lockResult.rows[0]?.locked);
      if (!locked) return;
      await this.notifyDueAppointments(client, 10);
      await this.notifyDueAppointments(client, 5);
      if (GmailService.isConfigured()) await this.deliverEmailOutbox(client);
    } catch (error) {
      console.error('[AppointmentReminderScheduler] No se pudo procesar los recordatorios:', error instanceof Error ? error.message : String(error));
    } finally {
      if (client) {
        if (locked) {
          try { await client.query('SELECT pg_advisory_unlock($1, $2);', [SCHEDULER_LOCK_A, SCHEDULER_LOCK_B]); }
          catch (error) { console.error('[AppointmentReminderScheduler] No se pudo liberar el bloqueo del planificador.'); }
        }
        client.release();
      }
    }
  }

  private async notifyDueAppointments(client: PoolClient, minutes: 5 | 10) {
    const lowerBound = minutes - 1;
    const due = await client.query<DueAppointment>(
      `SELECT r.id_reserva, r.fecha_hora_inicio,
              CONCAT(p.nombres_paciente, ' ', p.apellidos_paciente) AS patient_name,
              family.id_usuario AS parent_user_id,
              therapist_user.id_usuario AS therapist_user_id,
              COALESCE(parent_pref.recordatorio, TRUE) AS parent_recordatorio,
              COALESCE(therapist_pref.recordatorio, TRUE) AS therapist_recordatorio
       FROM public.reservas r
       JOIN public.pacientes p ON p.id_paciente = r.id_paciente
       JOIN public.tutores family ON family.id_tutor = p.id_tutor
       JOIN public.usuarios parent ON parent.id_usuario = family.id_usuario AND parent.activo = TRUE
       JOIN public.terapeutas therapist ON therapist.id_terapeuta = r.id_terapeuta
       JOIN public.usuarios therapist_user ON therapist_user.id_usuario = therapist.id_usuario AND therapist_user.activo = TRUE
       LEFT JOIN public.preferencias_notificacion parent_pref ON parent_pref.id_usuario = family.id_usuario
       LEFT JOIN public.preferencias_notificacion therapist_pref ON therapist_pref.id_usuario = therapist.id_usuario
       WHERE r.estado_reserva = 'CONFIRMADA'
         AND r.fecha_hora_inicio > NOW() + ($1::text || ' minutes')::interval
         AND r.fecha_hora_inicio <= NOW() + ($2::text || ' minutes')::interval
       ORDER BY r.fecha_hora_inicio
       LIMIT 500;`,
      [lowerBound, minutes],
    );

    for (const appointment of due.rows) {
      if (!isReminderRecipientEnabled(minutes, appointment)) continue;
      const key = eventKey(minutes, appointment);
      const starts = new Date(appointment.fecha_hora_inicio);
      const { date, time } = dateParts(starts);
      const text = minutes === 10
        ? `La sesión de ${appointment.patient_name} comienza en 10 minutos (${date}, ${time}).`
        : `La sesión de ${appointment.patient_name} comienza en 5 minutos (${date}, ${time}).`;

      await client.query('BEGIN;');
      try {
        const recipients = minutes === 10
          ? [{ userId: appointment.therapist_user_id, title: 'Sesión en 10 minutos', message: text }]
          : [{ userId: appointment.parent_user_id, title: 'Tu sesión empieza en 5 minutos', message: text }];
        for (const recipient of recipients) {
          await client.query(
            `INSERT INTO public.notificaciones
              (id_usuario, tipo, titulo, texto, id_reserva, id_conversacion, clave_evento)
             VALUES ($1, 'RECORDATORIO', $2, $3, $4, NULL, $5)
             ON CONFLICT (id_usuario, clave_evento) DO NOTHING;`,
            [recipient.userId, recipient.title, recipient.message, appointment.id_reserva, key],
          );
        }
        if (minutes === 5) {
          await client.query(
            `INSERT INTO public.notificacion_email_outbox
              (id_usuario, id_reserva, fecha_hora_inicio, clave_evento)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (id_usuario, clave_evento) DO NOTHING;`,
            [appointment.parent_user_id, appointment.id_reserva, starts, key],
          );
        }
        await client.query('COMMIT;');
      } catch (error) {
        await client.query('ROLLBACK;');
        throw error;
      }
    }
  }

  private async deliverEmailOutbox(client: PoolClient) {
    let claimed: EmailOutboxItem[] = [];
    await client.query('BEGIN;');
    try {
      const rows = await client.query<EmailOutboxItem>(
        `SELECT id_usuario, id_reserva, fecha_hora_inicio, clave_evento, intentos
         FROM public.notificacion_email_outbox
         WHERE intentos < 5
           AND siguiente_intento <= NOW()
           AND (estado IN ('PENDIENTE', 'FALLO') OR (estado = 'ENVIANDO' AND lease_hasta < NOW()))
         ORDER BY fecha_creacion
         LIMIT $1
         FOR UPDATE SKIP LOCKED;`,
        [EMAIL_BATCH_SIZE],
      );
      claimed = rows.rows;
      for (const item of claimed) {
        await client.query(
          `UPDATE public.notificacion_email_outbox
           SET estado = 'ENVIANDO', intentos = intentos + 1,
               lease_hasta = NOW() + INTERVAL '2 minutes', fecha_actualizacion = NOW()
           WHERE id_usuario = $1 AND clave_evento = $2;`,
          [item.id_usuario, item.clave_evento],
        );
      }
      await client.query('COMMIT;');
    } catch (error) {
      await client.query('ROLLBACK;');
      throw error;
    }

    for (const item of claimed) {
      const details = await client.query<{
        email: string;
        parent_name: string;
        patient_name: string;
        meet_url: string | null;
      }>(
        `SELECT u.email, CONCAT(u.nombres, ' ', u.apellidos) AS parent_name,
                CONCAT(p.nombres_paciente, ' ', p.apellidos_paciente) AS patient_name,
                r.meet_url
         FROM public.notificacion_email_outbox outbox
         JOIN public.reservas r ON r.id_reserva = outbox.id_reserva
           AND r.fecha_hora_inicio = outbox.fecha_hora_inicio
           AND r.estado_reserva = 'CONFIRMADA'
           AND r.fecha_hora_inicio > NOW()
         JOIN public.pacientes p ON p.id_paciente = r.id_paciente
         JOIN public.tutores t ON t.id_tutor = p.id_tutor AND t.id_usuario = outbox.id_usuario
         JOIN public.usuarios u ON u.id_usuario = outbox.id_usuario AND u.activo = TRUE
         WHERE outbox.id_usuario = $1 AND outbox.clave_evento = $2
           AND COALESCE((SELECT pref.recordatorio
                         FROM public.preferencias_notificacion pref
                         WHERE pref.id_usuario = outbox.id_usuario), TRUE) = TRUE;`,
        [item.id_usuario, item.clave_evento],
      );

      if (!details.rows[0]) {
        await client.query(
          `UPDATE public.notificacion_email_outbox SET estado = 'OMITIDO', lease_hasta = NULL,
              ultimo_error = 'La cita cambió, dejó de estar confirmada o se desactivaron los recordatorios.', fecha_actualizacion = NOW()
           WHERE id_usuario = $1 AND clave_evento = $2;`,
          [item.id_usuario, item.clave_evento],
        );
        continue;
      }

      const start = new Date(item.fecha_hora_inicio);
      const { date, time } = dateParts(start);
      const row = details.rows[0];
      const result = await GmailService.sendAppointmentReminder({
        to: row.email,
        responsibleName: row.parent_name,
        childName: row.patient_name,
        date,
        time,
        meetUrl: safeGoogleMeetUrl(row.meet_url) ?? undefined,
      });
      if (result.success && result.status === 'ENVIADO') {
        await client.query(
          `UPDATE public.notificacion_email_outbox SET estado = 'ENVIADO', lease_hasta = NULL,
             ultimo_error = NULL, fecha_actualizacion = NOW()
           WHERE id_usuario = $1 AND clave_evento = $2;`,
          [item.id_usuario, item.clave_evento],
        );
        continue;
      }

      const nextState = Number(item.intentos) + 1 >= 5 ? 'FALLO' : 'PENDIENTE';
      const delayMinutes = Math.min(30, 2 ** (Number(item.intentos) + 1));
      await client.query(
        `UPDATE public.notificacion_email_outbox SET estado = $3, lease_hasta = NULL,
           siguiente_intento = NOW() + ($4::text || ' minutes')::interval,
           ultimo_error = $5, fecha_actualizacion = NOW()
         WHERE id_usuario = $1 AND clave_evento = $2;`,
        [item.id_usuario, item.clave_evento, nextState, delayMinutes, result.error ?? result.status],
      );
    }
  }
}

export const appointmentReminderScheduler = new AppointmentReminderScheduler();
