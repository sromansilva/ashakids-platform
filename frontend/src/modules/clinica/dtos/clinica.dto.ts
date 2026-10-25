/**
 * Data Transfer Objects (DTOs) para el área Clínica (Sesiones, Valoraciones, Planes).
 */

export interface SesionClinicaDTO {
  id_sesion: number;
  id_cita: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha: string;
  hora_inicio: string;
  hora_fin?: string;
  estado: string;
  resumen?: string;
  objetivos?: string[];
}

export interface CrearSesionClinicaDTO {
  id_cita: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha: string;
  hora_inicio: string;
  objetivos?: string[];
}

export interface ValoracionClinicaDTO {
  id_valoracion: number;
  id_paciente: number;
  id_terapeuta: number;
  fecha_evaluacion: string;
  diagnostico: string;
  plan_recomendado?: string;
  nivel_severidad?: string;
}

export interface PlanTerapeuticoDTO {
  id_plan: number;
  id_paciente: number;
  id_terapeuta: number;
  frecuencia_semanal: number;
  total_sesiones: number;
  fecha_inicio: string;
  activo: boolean;
}

