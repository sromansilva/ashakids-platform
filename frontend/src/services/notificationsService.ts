import { apiClient } from '@/api/client';
export interface NotificationPreferences {
  nueva_cita: boolean; cancelacion: boolean; reprogramacion: boolean; recordatorio: boolean; mensajes: boolean;
}
export interface Notification {
  id_notificacion: number; tipo: string; titulo: string; texto: string;
  id_reserva: number | null; id_conversacion: number | null; fecha_creacion: string; leida_en: string | null;
}
export interface NotificationInbox { items: Notification[]; total: number; sin_leer: number }
export const notificationsService = {
  inbox: (offset = 0, unread = false, signal?: AbortSignal) => apiClient.get<NotificationInbox>('/notificaciones', {params:{limit:20,offset,solo_sin_leer:unread},signal}),
  preferences: (signal?: AbortSignal) => apiClient.get<NotificationPreferences>('/notificaciones/preferencias',{signal}),
  savePreferences: (data: NotificationPreferences) => apiClient.put<NotificationPreferences>('/notificaciones/preferencias',data),
  read: (id: number) => apiClient.patch<Notification>(`/notificaciones/${id}/leida`,{}),
  readAll: () => apiClient.post<void>('/notificaciones/leidas',{}),
};
