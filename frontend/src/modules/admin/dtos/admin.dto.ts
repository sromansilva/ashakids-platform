/**
 * Data Transfer Objects (DTOs) para el rol de Administración.
 */

export interface AuditoriaItemDTO {
  id_auditoria: number;
  actor: string | null;
  nombre_tabla: string;
  nombre_entidad: string;
  accion: string;
  fecha_evento: string;
}

export interface AuditoriaResponseDTO {
  items: AuditoriaItemDTO[];
  total: number;
}

export interface CuentaFiltrosDTO {
  rol?: string;
  search?: string;
  activo?: boolean;
}

export interface CrearCuentaDTO {
  nombres: string;
  apellidos: string;
  email: string;
  password?: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  rol: 'ADMIN' | 'TERAPEUTA' | 'PADRE';
  activo?: boolean;
}

export interface ActualizarCuentaDTO {
  nombres?: string;
  apellidos?: string;
  email?: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  activo?: boolean;
}

export interface CuentaStatsDTO {
  total: number;
  padres: number;
  terapeutas: number;
  administradores: number;
  activos: number;
  inactivos: number;
}

