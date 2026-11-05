import type { EstadoIncidencia } from '../../incidencias/domain/estado.js';
export { estadosIncidencia as estadosSoporte } from '../../incidencias/domain/estado.js';
export type EstadoSoporte = EstadoIncidencia;

/** Explicit projection: no contact details, patient/therapist identifiers or clinical joins. */
export interface TicketSoporte {
  id_incidencia: number;
  ticket: string;
  tipo: string;
  descripcion: string;
  rol_solicitante: string;
  prioridad: number;
  estado: EstadoSoporte;
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
