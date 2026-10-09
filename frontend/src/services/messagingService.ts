import { apiClient, ApiError } from '@/api/client';
export type Contact = { id_tutor: number; id_terapeuta: number; tutor_nombre: string; terapeuta_nombre: string };
export type Conversation = Contact & { id_conversacion: number; estado: string; ultima_actividad: string; puede_enviar: boolean; id_usuario_tutor: number; id_usuario_terapeuta: number };
export type Message = { id_mensaje: number; id_conversacion: number; id_usuario_emisor: number | null; texto_mensaje: string | null; fecha_envio: string };
export type CursorPage<T> = { items: T[]; next_before_id: number | null };
export const messagingService = {
  contacts: (offset: number, signal?: AbortSignal) => apiClient.page<Contact>('/conversaciones/contactos', { limit: 100, offset }, signal),
  conversations: (before?: number, signal?: AbortSignal) => apiClient.get<CursorPage<Conversation>>('/conversaciones', { params: { limit: 20, before_id: before }, signal }),
  open: async (contact: Contact) => {
    const row = await apiClient.post<Conversation>('/conversaciones', { id_tutor: contact.id_tutor, id_terapeuta: contact.id_terapeuta });
    if (!row || !Number.isSafeInteger(row.id_conversacion) || row.id_conversacion <= 0 || row.id_tutor !== contact.id_tutor || row.id_terapeuta !== contact.id_terapeuta) {
      throw new ApiError('El servidor no confirmó una conversación válida.', 502);
    }
    return row;
  },
  get: (id: number, signal?: AbortSignal) => apiClient.get<Conversation>(`/conversaciones/${id}`, { signal }),
  messages: (id: number, before?: number, signal?: AbortSignal) => apiClient.get<CursorPage<Message>>(`/conversaciones/${id}/mensajes`, { params: { limit: 30, before_id: before }, signal }),
  send: async (id: number, text: string) => {
    const row = await apiClient.post<Message>(`/conversaciones/${id}/mensajes`, { texto_mensaje: text });
    if (!row || !Number.isSafeInteger(row.id_mensaje) || row.id_mensaje <= 0 || row.id_conversacion !== id || row.texto_mensaje !== text || !row.id_usuario_emisor || !Number.isFinite(Date.parse(row.fecha_envio))) {
      throw new ApiError('El servidor no confirmó un mensaje guardado válido.', 502);
    }
    return row;
  },
};
