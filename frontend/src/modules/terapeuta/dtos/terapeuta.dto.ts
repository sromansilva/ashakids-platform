/**
 * Data Transfer Objects (DTOs) para el rol de Terapeuta.
 */

export interface DisponibilidadSlotDTO {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
  activo: boolean;
}

export interface ActualizarDisponibilidadDTO {
  id_terapeuta: number;
  slots: DisponibilidadSlotDTO[];
}

export interface ReporteClinicoDTO {
  id_reporte?: number;
  id_sesion: number;
  id_paciente: number;
  observaciones: string;
  plan_trabajo?: string;
  nivel_logro?: string;
  creado_en?: string;
}

export interface TerapeutaReviewDTO {
  id_valoracion: number;
  id_cita: number;
  calificacion: number;
  comentario?: string;
  fecha: string;
}

export interface PacienteAsignadoDTO {
  id_paciente: number;
  codigo_paciente: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  diagnostico_principal?: string;
  ultima_sesion?: string;
}

