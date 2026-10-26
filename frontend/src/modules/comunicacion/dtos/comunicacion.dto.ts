/**
 * Data Transfer Objects (DTOs) para Comunicación (Mensajes, Notificaciones, Incidencias).
 */

export interface MensajeDTO {
  id_mensaje: number;
  remitente_id: number;
  destinatario_id: number;
  contenido: string;
  adjunto_url?: string;
  leido: boolean;
  creado_en: string;
}

export interface EnviarMensajeDTO {
  destinatario_id: number;
  contenido: string;
  adjunto?: File | Blob;
}

export interface NotificacionDTO {
  id_notificacion: number;
  usuario_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  creada_en: string;
  datos_extra?: Record<string, unknown>;
}

export interface IncidenciaDTO {
  id_incidencia: number;
  usuario_id: number;
  categoria: string;
  descripcion: string;
  estado: 'ABIERTA' | 'EN_REVISION' | 'RESUELTA' | 'CERRADA';
  creada_en: string;
}

export interface CrearIncidenciaDTO {
  categoria: string;
  descripcion: string;
  prioridad?: 'BAJA' | 'MEDIA' | 'ALTA';
}

