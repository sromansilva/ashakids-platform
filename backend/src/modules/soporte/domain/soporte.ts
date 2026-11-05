export const estadosSoporte = ['RECIBIDA', 'LEÍDA', 'EN PROCESO', 'SOLUCIONADA'] as const;
export type EstadoSoporte = typeof estadosSoporte[number];

/** Explicit projection: no contact details, patient/therapist identifiers or clinical joins. */
export interface TicketSoporte {
  id_incidencia: number;
  ticket: string;
  tipo: string;
  descripcion: string;
  rol_solicitante: string;
  prioridad: number;
  estado: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
export interface FiltrosSoporte {
  estado?: EstadoSoporte;
  prioridad?: number;
  search?: string;
  offset: number;
  limit: number;
}
