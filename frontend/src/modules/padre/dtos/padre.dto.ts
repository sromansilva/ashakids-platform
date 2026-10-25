/**
 * Data Transfer Objects (DTOs) para el rol de Padre / Familia.
 */

export interface RegistroHijoDTO {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero?: string;
  parentesco?: string;
  notas_adicionales?: string;
}

export interface ActualizarHijoDTO {
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: string;
  genero?: string;
}

export interface ReservaCitaPadreDTO {
  id_terapeuta: number;
  id_paciente: number;
  fecha: string;
  hora_inicio: string;
  motivo_consulta?: string;
}

export interface ProgresoHijoDTO {
  id_paciente: number;
  puntos_totales: number;
  nivel_actual: number;
  racha_dias: number;
  sesiones_completadas: number;
}

export interface PadrePreferenciasDTO {
  notificaciones_email: boolean;
  recordatorios_sesion: boolean;
  resumen_semanal: boolean;
}

