import { apiClient, type QueryParams } from "@/api/client";
import type { Account, AccountCreate, AccountEdit, Patient, PatientData, Treatment, TreatmentData,
  Appointment, AppointmentTime, Session, Report, ReportData } from "@/types/clinical";

const resource = <T>(path: string) => ({
  list: (params?: QueryParams, signal?: AbortSignal) => apiClient.page<T>(path, params, signal),
  get: (id: number, signal?: AbortSignal) => apiClient.get<T>(`${path}/${id}`, { signal }),
});
export const usersService = {
  ...resource<Account>("/usuarios"),
  create: (data: AccountCreate) => apiClient.post<Account>("/usuarios", data),
  edit: (id: number, data: AccountEdit) => apiClient.patch<Account>(`/usuarios/${id}`, data),
};
export const patientsService = {
  ...resource<Patient>("/pacientes"),
  create: (data: PatientData & { id_tutor?: number }) => apiClient.post<Patient>("/pacientes", data),
  edit: (id: number, data: PatientData) => apiClient.put<Patient>(`/pacientes/${id}`, data),
  deactivate: (id: number) => apiClient.del<Patient>(`/pacientes/${id}`),
};
export const treatmentsService = {
  list: (patient: number, params?: QueryParams, signal?: AbortSignal) => apiClient.page<Treatment>(`/pacientes/${patient}/tratamientos`, params, signal),
  create: (data: TreatmentData) => apiClient.post<Treatment>("/tratamientos", data),
};
export const appointmentsService = {
  ...resource<Appointment>("/citas"),
  create: (data: AppointmentTime & { id_tratamiento: number }) => apiClient.post<Appointment>("/citas", data),
  reschedule: (id: number, data: AppointmentTime) => apiClient.put<Appointment>(`/citas/${id}`, data),
  state: (id: number, estado_reserva: "CONFIRMADA" | "CANCELADA") => apiClient.patch<Appointment>(`/citas/${id}/estado`, { estado_reserva }),
};
export const sessionsService = {
  ...resource<Session>("/sesiones"),
  create: (id_reserva: number) => apiClient.post<Session>("/sesiones", { id_reserva }),
  start: (id: number) => apiClient.post<Session>(`/sesiones/${id}/iniciar`),
  close: (id: number, asistencia: "ASISTIO" | "NO_ASISTIO") => apiClient.post<Session>(`/sesiones/${id}/cerrar`, { asistencia }),
  report: (id: number, signal?: AbortSignal) => apiClient.get<Report>(`/sesiones/${id}/reporte`, { signal }),
  reportPdf: (id: number, signal?: AbortSignal) => apiClient.pdf(`/sesiones/${id}/reporte/pdf`, signal),
  saveReport: (id: number, data: ReportData) => apiClient.put<Report>(`/sesiones/${id}/reporte`, data),
};
