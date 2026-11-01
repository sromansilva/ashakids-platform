import { apiClient, type QueryParams } from "@/core/api/client";
import type { Account, AccountCreate, AccountEdit, Patient, PatientData, Treatment, TreatmentData,
  Appointment, AppointmentTime, Session, Report, ReportData, Professional, Availability, AvailableSlot, JourneyState, PlanData } from "@/modules/clinica/domain/clinical";

export interface ArticulationHistoryRecord {
  id_sesion: number;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  fecha_hora_inicio: string;
  objetivos_trabajados: string;
}

const resource = <T>(path: string) => ({
  list: (params?: QueryParams, signal?: AbortSignal) => apiClient.page<T>(path, params, signal),
  get: (id: number, signal?: AbortSignal) => apiClient.get<T>(`${path}/${id}`, { signal }),
});
export const usersService = {
  ...resource<Account>("/usuarios"),
  create: (data: AccountCreate) => {
    const { password, ...account } = data;
    return apiClient.post<Account>("/usuarios", account);
  },
  edit: (id: number, data: AccountEdit) => apiClient.patch<Account>(`/usuarios/${id}`, data),
};
export const patientsService = {
  ...resource<Patient>("/pacientes"),
  create: (data: PatientData & { id_tutor?: number }) => apiClient.post<Patient>("/pacientes", data),
  edit: (id: number, data: PatientData) => apiClient.put<Patient>(`/pacientes/${id}`, data),
  deactivate: (id: number) => apiClient.del<Patient>(`/pacientes/${id}`),
  journey: (id: number, signal?: AbortSignal) => apiClient.get<JourneyState>(`/pacientes/${id}/recorrido`, { signal }),
};
export const treatmentsService = {
  list: (patient: number, params?: QueryParams, signal?: AbortSignal) => apiClient.page<Treatment>(`/pacientes/${patient}/tratamientos`, params, signal),
  create: (data: TreatmentData) => apiClient.post<Treatment>("/tratamientos", data),
};
export const appointmentsService = {
  meeting: (id: number, meet_url: string | null) => apiClient.put<Appointment>(`/citas/${id}/reunion`, { meet_url }),
  ...resource<Appointment>("/citas"),
  create: (data: Omit<AppointmentTime, 'fecha_hora_fin'> & { fecha_hora_fin?: string; id_tratamiento?: number | null; id_paciente?: number; id_terapeuta?: number; tipo_cita?: 'INTRODUCTORIA' | 'TERAPIA' }) => apiClient.post<Appointment>("/citas", data),
  reschedule: (id: number, data: AppointmentTime) => apiClient.put<Appointment>(`/citas/${id}`, data),
  state: (id: number, estado_reserva: "CONFIRMADA" | "CANCELADA") => apiClient.patch<Appointment>(`/citas/${id}/estado`, { estado_reserva }),
};
export const sessionsService = {
  plan: (id: number, signal?: AbortSignal) => apiClient.get<Treatment | null>(`/sesiones/${id}/plan`, { signal }),
  publishPlan: (id: number, data: PlanData) => apiClient.post<Treatment>(`/sesiones/${id}/plan`, data),
  ...resource<Session>("/sesiones"),
  create: (id_reserva: number) => apiClient.post<Session>("/sesiones", { id_reserva }),
  start: (id: number) => apiClient.post<Session>(`/sesiones/${id}/iniciar`),
  close: (id: number, asistencia: "ASISTIO" | "NO_ASISTIO") => apiClient.post<Session>(`/sesiones/${id}/cerrar`, { asistencia }),
  report: (id: number, signal?: AbortSignal) => apiClient.get<Report | null>(`/sesiones/${id}/reporte`, { signal }),
  articulationHistory: (id: number, signal?: AbortSignal) => apiClient.get<ArticulationHistoryRecord[]>(`/sesiones/${id}/seguimiento-articulacion`, { signal }),
  reportPdf: (id: number, signal?: AbortSignal) => apiClient.pdf(`/sesiones/${id}/reporte/pdf`, signal),
  saveReport: (id: number, data: ReportData) => apiClient.put<Report>(`/sesiones/${id}/reporte`, data),
  evaluarFonemaEnVivo: (
    id: number,
    data: {
      audio_base64?: string;
      palabra_esperada: string;
    }
  ) =>
    apiClient.post<{
      estado: string;
      palabra_esperada: string;
      transcripcion_acustica: string;
      similitud_fonetica_porcentaje: number;
      diagnostico_biomedico: string;
      fonema_afectado: string | null;
      observacion_tecnica: string;
    }>(`/sesiones/${id}/evaluar-fonema-en-vivo`, data),
  evaluarFragmentoFonetico: (id: number, data: {
    audio_base64: string;
    palabra_esperada: string;
    inicio_segundo: number;
    fin_segundo: number;
  }) => apiClient.post<{
    estado: 'SUGERENCIA_LISTA';
    palabra_esperada: string;
    transcripcion_sugerida: string;
    fragmento: { inicio_segundo: number; fin_segundo: number };
    duracion_analizada_segundos: number;
  }>(`/sesiones/${id}/evaluar-fragmento-fonetico`, data),
  analizarTranscripcionSesion: (
    id: number,
    data?: {
      texto?: string;
      archivo_base64?: string;
      nombre_archivo?: string;
    }
  ) => apiClient.post<any>(`/sesiones/${id}/analizar-transcripcion-sesion`, data ?? {}),
};
export const agendaService = {
  professionals: (params?: QueryParams, signal?: AbortSignal) => apiClient.page<Professional>('/terapeutas', params, signal),
  availability: (id: number, signal?: AbortSignal) => apiClient.get<Availability>(`/terapeutas/${id}/disponibilidad`, { signal }),
  publish: (id: number, data: Availability) => apiClient.put<Availability>(`/terapeutas/${id}/disponibilidad`, data),
  slots: (id: number, day: string, signal?: AbortSignal) => apiClient.get<AvailableSlot[]>(`/terapeutas/${id}/turnos`, { params: { fecha: day }, signal }),
};
