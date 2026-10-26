/**
 * Data Transfer Objects (DTOs) para Pacientes (Niños).
 */

export interface PacienteItemDTO {
  id_paciente: number;
  codigo_paciente: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero?: string;
  edad?: number;
  id_padre?: number;
  activo: boolean;
  avatar?: string;
}

export interface PacienteListResponseDTO {
  pacientes: PacienteItemDTO[];
  total: number;
}

export interface PacienteCrearDTO {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero?: string;
  id_padre?: number;
  diagnostico_inicial?: string;
}

export interface PacienteActualizarDTO {
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  genero?: string;
  activo?: boolean;
}

