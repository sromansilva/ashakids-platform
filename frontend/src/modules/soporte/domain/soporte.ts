export const estadosSoporte = ['RECIBIDA', 'LEÍDA', 'EN PROCESO', 'SOLUCIONADA'] as const;
export type EstadoSoporte = typeof estadosSoporte[number];
export interface TicketSoporte {
  id_incidencia: number;
  ticket: string;
  tipo: string;
  descripcion: string;
  rol_solicitante: string;
  estado: string;
  prioridad: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
export interface FiltrosSoporte { estado?: string; prioridad?: number; search?: string; offset: number; limit: number }
