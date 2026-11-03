import { apiClient, type QueryParams } from "@/core/api/client";
import type { Account, AccountCreate, AccountEdit, Patient, PatientData, Treatment, TreatmentData,
  Appointment, AppointmentTime, Session, Report, ReportData, Professional, Availability, AvailableSlot, JourneyState, PlanData } from "@/modules/clinica/domain/clinical";

export interface ArticulationHistoryRecord {
  id_sesion: number;
  tipo_cita: 'INTRODUCTORIA' | 'TERAPIA';
  fecha_hora_inicio: string;
  observaciones_iniciales?: string | null;
  objetivos_trabajados?: string | null;
}

export interface PhonologicalEvaluationRecord {
  id_evaluacion: number;
  id_sesion: number | null;
  fonema_objetivo: string | null;
  palabra_objetivo: string | null;
  estado: 'PENDIENTE_REVISION' | 'CONFIRMADO_TERAPEUTA' | 'DESCARTADO';
  resultado_clinico?: 'ALCANZADO' | 'EN_PROCESO' | 'REQUIERE_APOYO' | null;
}

export interface FamilyCaptureStatus {
  captura_id: string;
  palabra_objetivo: string;
  fonema_objetivo: string;
  estado: 'SOLICITADA' | 'EN_CAPTURA' | 'PROCESANDO' | 'COMPLETADA' | 'OCUPADA';
  resultado?: {
    id_evaluacion: number;
    estado: 'PENDIENTE_REVISION';
    palabra_esperada: string;
    transcripcion_tentativa: string;
    duracion_segundos: number | null;
    aviso: string;
  };
}
export type FamilyCapturePending = FamilyCaptureStatus | { estado: 'OCUPADA' } | null;

export interface PhonemeActivityAnalytics {
  id_paciente: number;
  periodo_dias: number;
  resultados_clinicos: Array<{
    fonema_objetivo: string;
    alcanzado: number;
    en_proceso: number;
    requiere_apoyo: number;
    total: number;
  }>;
  practica_ludica: Array<{
    mundo: string;
    nivel: number;
    palabra_objetivo: string;
    fonema_objetivo: string;
    intentos: number;
    respuestas_correctas: number;
    ultima_practica: string | null;
  }>;
  actividades_adaptativas: Array<{
    mundo: string;
    actividad: string;
    intentos: number;
    completadas: number;
    duracion_segundos: number;
    ultima_practica: string | null;
  }>;
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
  phonemeAnalytics: (id: number, periodDays = 30, signal?: AbortSignal) =>
    apiClient.get<PhonemeActivityAnalytics>(`/pacientes/${id}/analiticas/fonemas?periodo_dias=${periodDays}`, { signal }),
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
  signReport: (id: number) => apiClient.post<Report>(`/sesiones/${id}/reporte/firmar`, {}),
  evaluarFonemaEnVivo: (id: number, data: FormData) =>
    apiClient.upload<{
      id_evaluacion: number;
      estado: 'PENDIENTE_REVISION';
      palabra_esperada: string;
      transcripcion_tentativa: string;
      duracion_segundos: number | null;
      aviso: string;
    }>(`/sesiones/${id}/evaluacion-fonema`, data),
  iniciarCapturaFonologica: (id: number, data: { captura_id: string; palabra_objetivo: string; fonema_objetivo: string }) =>
    apiClient.post<{ captura_id: string; paquetes_recibidos: number; frecuencia_muestreo: number; muestras_por_paquete: number }>(
      `/sesiones/${id}/evaluacion-fonema/capturas`, data,
    ),
  solicitarCapturaFamiliar: (id: number, data: { captura_id: string; palabra_objetivo: string; fonema_objetivo: string }) =>
    apiClient.post<FamilyCaptureStatus>(`/sesiones/${id}/evaluacion-fonema/capturas-familia`, data),
  capturaFamiliarPendiente: (id: number, signal?: AbortSignal) =>
    apiClient.get<FamilyCapturePending>(`/sesiones/${id}/evaluacion-fonema/capturas-familia/pendiente`, { signal }),
  iniciarCapturaFamiliar: (id: number, captureId: string) =>
    apiClient.post<FamilyCaptureStatus>(`/sesiones/${id}/evaluacion-fonema/capturas-familia/${encodeURIComponent(captureId)}/iniciar`, {}),
  enviarPaqueteCapturaFamiliar: (id: number, captureId: string, data: FormData) =>
    apiClient.upload<{ captura_id: string; paquetes_recibidos: number }>(
      `/sesiones/${id}/evaluacion-fonema/capturas-familia/${encodeURIComponent(captureId)}/paquetes`, data,
    ),
  finalizarCapturaFamiliar: (id: number, captureId: string) =>
    apiClient.post<{ estado: 'ENVIADA'; aviso: string }>(
      `/sesiones/${id}/evaluacion-fonema/capturas-familia/${encodeURIComponent(captureId)}/finalizar`, {},
    ),
  descartarCapturaFamiliar: (id: number, captureId: string) =>
    apiClient.del<{ captura_id: string; descartada: boolean }>(
      `/sesiones/${id}/evaluacion-fonema/capturas-familia/${encodeURIComponent(captureId)}`,
    ),
  resultadoCapturaFamiliar: (id: number, captureId: string, signal?: AbortSignal) =>
    apiClient.get<FamilyCaptureStatus>(
      `/sesiones/${id}/evaluacion-fonema/capturas-familia/${encodeURIComponent(captureId)}/resultado`, { signal },
    ),
  enviarPaqueteFonologico: (id: number, captureId: string, data: FormData) =>
    apiClient.upload<{ captura_id: string; paquetes_recibidos: number }>(
      `/sesiones/${id}/evaluacion-fonema/capturas/${encodeURIComponent(captureId)}/paquetes`, data,
    ),
  finalizarCapturaFonologica: (id: number, captureId: string) =>
    apiClient.post<{
      id_evaluacion: number;
      estado: 'PENDIENTE_REVISION';
      palabra_esperada: string;
      transcripcion_tentativa: string;
      duracion_segundos: number | null;
      aviso: string;
    }>(`/sesiones/${id}/evaluacion-fonema/capturas/${encodeURIComponent(captureId)}/finalizar`, {}),
  descartarCapturaFonologica: (id: number, captureId: string) =>
    apiClient.del<{ captura_id: string; descartada: boolean }>(
      `/sesiones/${id}/evaluacion-fonema/capturas/${encodeURIComponent(captureId)}`,
    ),
};
export const agendaService = {
  professionals: (params?: QueryParams, signal?: AbortSignal) => apiClient.page<Professional>('/terapeutas', params, signal),
  availability: (id: number, signal?: AbortSignal) => apiClient.get<Availability>(`/terapeutas/${id}/disponibilidad`, { signal }),
  publish: (id: number, data: Availability) => apiClient.put<Availability>(`/terapeutas/${id}/disponibilidad`, data),
  slots: (id: number, day: string, signal?: AbortSignal) => apiClient.get<AvailableSlot[]>(`/terapeutas/${id}/turnos`, { params: { fecha: day }, signal }),
};

export interface TreatmentPredictionResponse {
  id_prediccion: number;
  estado_confirmacion: 'SUGERIDO';
  sesiones_estimadas: number;
  rango_min: number;
  rango_max: number;
  riesgo_desercion: 'BAJO' | 'MEDIO' | 'ALTO';
  probabilidad_desercion?: number;
  confianza: number;
  diagnostico_descripcion?: string;
  advertencia_clinica: string;
  version_modelo: string;
}

export interface TreatmentPredictionCatalog {
  version_modelo: string;
  diagnosis_codes: { code: number; label: string }[];
}

export interface MlServiceHealth {
  status: string;
  service: string;
  dispositivo: string;
  modelo: string;
  modelo_revision?: string;
  modelo_listo: boolean;
  predictor_listo: boolean;
}

export const clinicaService = {
  mlHealth: (signal?: AbortSignal) => apiClient.get<MlServiceHealth>('/clinica/ml/health', { signal }),
  phonologicalEvaluations: (patientId: number, signal?: AbortSignal) =>
    apiClient.get<PhonologicalEvaluationRecord[]>(`/clinica/evaluaciones-fonologicas/${patientId}`, { signal }),
  treatmentPredictionCatalog: (signal?: AbortSignal) =>
    apiClient.get<TreatmentPredictionCatalog>('/clinica/tratamientos/predictor-catalog', { signal }),
  predictTreatmentPlan: (data: {
    id_sesion: number;
    codigo_diagnostico: number;
    frecuencia_semanal: number;
  }) => apiClient.post<TreatmentPredictionResponse>('/clinica/tratamientos/predecir-plan', data),

  discardTreatmentPrediction: (id: number, observations?: string) =>
    apiClient.patch<{ id_prediccion: number; estado_confirmacion: 'DESCARTADO' }>(
      `/clinica/tratamientos/predicciones/${id}/descartar`,
      { observaciones_terapeuta: observations },
    ),

  getConsent: (patientId: number, signal?: AbortSignal) =>
    apiClient.get<{
      id_paciente: number;
      consentido: boolean;
      estado: 'CONCEDIDO' | 'REVOCADO' | 'NO_SOLICITADO';
      tipo_consentimiento: string;
      fecha_concesion: string | null;
    }>(`/clinica/consentimientos/${patientId}`, { signal }),

  grantConsent: (data: {
    id_paciente: number;
    tipo_consentimiento?: string;
    estado: 'CONCEDIDO' | 'REVOCADO';
  }) =>
    apiClient.post<{
      id_consentimiento: number;
      id_paciente: number;
      consentido: boolean;
      estado: string;
      tipo_consentimiento: string;
    }>('/clinica/consentimientos', data),

  reviewPhoneticEvaluation: (id: number, data: {
    estado: 'CONFIRMADO_TERAPEUTA' | 'DESCARTADO';
    transcripcion_revisada?: string;
    observacion_terapeuta?: string;
    resultado_clinico?: 'ALCANZADO' | 'EN_PROCESO' | 'REQUIERE_APOYO';
  }) => apiClient.patch<{
    id_evaluacion: number;
    id_sesion: number;
    estado: 'CONFIRMADO_TERAPEUTA' | 'DESCARTADO';
    transcripcion_detectada: string;
    transcripcion_revisada: string | null;
    observacion_terapeuta: string | null;
    resultado_clinico: 'ALCANZADO' | 'EN_PROCESO' | 'REQUIERE_APOYO' | null;
  }>(`/clinica/evaluaciones-fonologicas/${id}/revision`, data),
};
