import type { PoolClient } from 'pg';

export type NotificationPreferenceKey = 'nueva_cita' | 'cancelacion' | 'reprogramacion' | 'recordatorio' | 'mensajes';
export type NotificationType = 'NUEVA_CITA' | 'CANCELACION' | 'REPROGRAMACION' | 'RECORDATORIO' | 'MENSAJE';

const preferenceColumns: Record<NotificationPreferenceKey, string> = {
  nueva_cita: 'nueva_cita',
  cancelacion: 'cancelacion',
  reprogramacion: 'reprogramacion',
  recordatorio: 'recordatorio',
  mensajes: 'mensajes',
};

export interface NotificationEvent {
  userId: number;
  preference: NotificationPreferenceKey;
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
  if (isMessage !== (event.preference === 'mensajes') ||
      (isMessage && (!event.conversationId || event.reservationId !== undefined)) ||
      (!isMessage && (!event.reservationId || event.conversationId !== undefined))) {
    throw new Error('El tipo y el recurso de la notificación no coinciden.');
  }

  const preferenceColumn = preferenceColumns[event.preference];
  await client.query(
    `INSERT INTO public.notificaciones
       (id_usuario, tipo, titulo, texto, id_reserva, id_conversacion, clave_evento)
     SELECT $1, $2, $3, $4, $5, $6, $7
     WHERE COALESCE((SELECT ${preferenceColumn}
                     FROM public.preferencias_notificacion
                     WHERE id_usuario = $1), TRUE) = TRUE
       AND EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = $1 AND activo = TRUE)
     ON CONFLICT (id_usuario, clave_evento) DO NOTHING;`,
    [event.userId, event.type, event.title, event.text, event.reservationId ?? null,
      event.conversationId ?? null, event.eventKey],
  );
}
