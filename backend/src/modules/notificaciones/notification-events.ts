import type { PoolClient } from 'pg';

export type NotificationPreferenceKey = 'nueva_cita' | 'cancelacion' | 'reprogramacion' | 'recordatorio' | 'mensajes';
/**
 * Avisos operativos del flujo terapeuta-familia (reunión iniciada, muestra solicitada, reporte
 * publicado). No dependen de ninguna preferencia: son necesarios para poder atender la sesión.
 */
export type CriticalNotificationType = 'SESION_INICIADA' | 'MUESTRA_SOLICITADA' | 'REPORTE_PUBLICADO';
export type NotificationType = 'NUEVA_CITA' | 'CANCELACION' | 'REPROGRAMACION' | 'RECORDATORIO' | 'MENSAJE' | CriticalNotificationType;
export const CRITICAL_NOTIFICATION_TYPES: readonly CriticalNotificationType[] = ['SESION_INICIADA', 'MUESTRA_SOLICITADA', 'REPORTE_PUBLICADO'];

const preferenceColumns: Record<NotificationPreferenceKey, string> = {
  nueva_cita: 'nueva_cita',
  cancelacion: 'cancelacion',
  reprogramacion: 'reprogramacion',
  recordatorio: 'recordatorio',
  mensajes: 'mensajes',
};

export interface NotificationEvent {
  userId: number;
  /** Los tipos críticos usan `null`: se entregan siempre, sin consultar preferencias. */
  preference: NotificationPreferenceKey | null;
  type: NotificationType;
  title: string;
  text: string;
  eventKey: string;
  reservationId?: number;
  conversationId?: number;
}

/** Persist an in-app event atomically with the domain operation that produced it. */
export async function emitNotificationEvent(client: Pick<PoolClient, 'query'>, event: NotificationEvent): Promise<void> {
  const isMessage = event.type === 'MENSAJE';
  const isCritical = (CRITICAL_NOTIFICATION_TYPES as readonly string[]).includes(event.type);
  if (isCritical !== (event.preference === null) ||
      (!isCritical && isMessage !== (event.preference === 'mensajes')) ||
      (isMessage && (!event.conversationId || event.reservationId !== undefined)) ||
      (!isMessage && (!event.reservationId || event.conversationId !== undefined))) {
    throw new Error('El tipo y el recurso de la notificación no coinciden.');
  }

  const preferenceFilter = event.preference === null
    ? 'TRUE'
    : `COALESCE((SELECT ${preferenceColumns[event.preference]}
                     FROM public.preferencias_notificacion
                     WHERE id_usuario = $1), TRUE) = TRUE`;
  await client.query(
    `INSERT INTO public.notificaciones
       (id_usuario, tipo, titulo, texto, id_reserva, id_conversacion, clave_evento)
     SELECT $1, $2, $3, $4, $5, $6, $7
     WHERE ${preferenceFilter}
       AND EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = $1 AND activo = TRUE)
     ON CONFLICT (id_usuario, clave_evento) DO NOTHING;`,
    [event.userId, event.type, event.title, event.text, event.reservationId ?? null,
      event.conversationId ?? null, event.eventKey],
  );
}
