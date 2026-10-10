import type { SemanticRole } from "./auth";
export interface Account {
  id_usuario: number; nombres: string; apellidos: string; email: string;
  codigo_usuario: string; activo: boolean; roles: SemanticRole[];
  id_tutor: number | null; id_terapeuta: number | null;
}
export type AccountCreate = Pick<Account, "nombres" | "apellidos" | "email" | "codigo_usuario"> & { password: string; rol: SemanticRole };
export type AccountEdit = Partial<Pick<Account, "nombres" | "apellidos" | "email" | "activo"> & { password: string }>;
export interface PatientData { nombres_paciente: string; apellidos_paciente: string; fecha_nacimiento: string; sexo: string }
export interface Patient extends PatientData { id_paciente: number; id_tutor: number; activo: boolean; fecha_registro: string }
export interface TreatmentData {
  id_paciente: number; id_terapeuta: number; nombre_tratamiento: string;
  descripcion?: string | null; sesiones_recomendadas?: number | null; fecha_inicio?: string | null;
}
export interface Treatment extends TreatmentData {
  id_sesion_origen?: number | null; area?: WorldArea | null; mundos_asignados?: WorldArea[];
  id_tratamiento: number; id_expediente: number; estado_tratamiento: string;
  paciente_nombre: string; terapeuta_nombre: string; fecha_fin: string | null;
}
export interface AppointmentTime { fecha_hora_inicio: string; fecha_hora_fin: string; modalidad: "VIRTUAL" | "PRESENCIAL"; localizacion: string | null }
export interface Appointment extends AppointmentTime {
  puede_editar?: boolean; zoom_join_url?: string | null;
  id_reserva: number; id_paciente: number; id_terapeuta: number; id_tratamiento: number | null;
  tipo_cita?: "INTRODUCTORIA" | "TERAPIA";
  paciente_nombre: string; terapeuta_nombre: string; id_sesion: number | null;
  estado_reserva: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA"; fecha_creacion: string;
}
export interface Session {
  puede_editar?: boolean;
  id_sesion: number; id_reserva: number; cita: Appointment; reporte_disponible: boolean;
  fecha_hora_inicio_real: string | null; fecha_hora_fin_real: string | null;
  asistencia: "ASISTIO" | "NO_ASISTIO" | null; estado_sesion: "PROGRAMADA" | "EN_CURSO" | "FINALIZADA";
}
export interface ReportData {
  observaciones_iniciales: string | null; objetivos_trabajados: string | null;
  nivel_ayuda: string | null; proximos_pasos: string | null;
}
export interface Report extends ReportData { id_reporte_sesion: number; id_sesion: number; fecha_creacion: string }
export interface Professional { id_terapeuta: number; nombres: string; apellidos: string; especialidad: string | null; descripcion_profesional: string | null }
export interface Availability { turnos: { dia: number; hora: number }[]; bloqueos: { inicio: string; fin: string }[] }
export interface AvailableSlot { inicio: string; fin: string; disponible: boolean; motivo: string | null }
export interface JourneyState { introduccion_atendida: boolean; introduccion_pendiente: number | null; terapia_habilitada: boolean }
export type WorldArea = 'FLUIDEZ' | 'HABLA' | 'LENGUAJE';
export interface PlanData { nombre_tratamiento: string; descripcion: string | null; area: WorldArea; mundos_asignados: WorldArea[]; sesiones_recomendadas: number }
