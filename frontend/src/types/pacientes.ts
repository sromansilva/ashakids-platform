/**
 * Tipos de dominio para Pacientes (Hijos) y Perfiles Infantiles en ASHAKids.
 */

export interface PerfilInfantil {
  id_perfil: number;
  id_paciente: number;
  progreso: number;
  racha_dias: number;
  objetivos_totales: number;
  objetivos_completados: number;
  actividades_desarrolladas_total: number;
  sesiones_totales: number;
  fecha_ultima_sesion?: string | null;
  experiencia: number;
  nivel: number;
}

export interface PacienteItem {
  id_paciente: number;
  id_tutor: number;
  nombres_paciente: string;
  apellidos_paciente: string;
  fecha_nacimiento: string;
  edad: number;
  sexo: "Masculino" | "Femenino" | "Otro" | string;
  avatar_nombre: string;
  activo: boolean;
  fecha_registro: string;
  perfil?: PerfilInfantil | null;
}

export interface CrearHijoPayload {
  nombres_paciente: string;
  apellidos_paciente: string;
  fecha_nacimiento: string;
  sexo: "Masculino" | "Femenino" | "Otro";
  avatar_nombre: string;
}

export interface ActualizarHijoPayload {
  nombres_paciente?: string;
  apellidos_paciente?: string;
  fecha_nacimiento?: string;
  sexo?: "Masculino" | "Femenino" | "Otro";
  avatar_nombre?: string;
}

export interface HijoListResponse {
  items: PacienteItem[];
  total: number;
}

export interface OperacionHijoResponse {
  message: string;
  paciente?: PacienteItem | null;
}
