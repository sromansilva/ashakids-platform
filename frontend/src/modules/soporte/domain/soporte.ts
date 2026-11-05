import type { IncidentState } from '@/shared/domain/types/IncidentState';
export { incidentStates as estadosSoporte } from '@/shared/domain/types/IncidentState';
export type EstadoSoporte = IncidentState;
export interface TicketSoporte {
  id_incidencia: number;
  ticket: string;
  tipo: string;
  descripcion: string;
  rol_solicitante: string;
  estado: EstadoSoporte;
  prioridad: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
export interface FiltrosSoporte { estado?: string; prioridad?: number; search?: string; offset: number; limit: number }
