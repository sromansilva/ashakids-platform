import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderRoute } from "./helpers";
import { summarizeFamily } from "@/services/familyTracking";
import type { Appointment, Patient, Report, Session, Treatment } from "@/types/clinical";

const now = Date.parse("2026-10-09T12:00:00Z");
const patient: Patient = { id_paciente: 1, id_tutor: 1, nombres_paciente: "Alex", apellidos_paciente: "Primero", fecha_nacimiento: "2020-01-01", sexo: "Otro", activo: true, fecha_registro: "2026-01-01" };
const sibling: Patient = { ...patient, id_paciente: 2, apellidos_paciente: "Segundo" };
const appointment: Appointment = { id_reserva: 1, id_paciente: 1, id_tratamiento: 1, id_terapeuta: 1, paciente_nombre: "Alex Primero", terapeuta_nombre: "Profesional Uno", fecha_hora_inicio: "2099-10-10T14:00:00Z", fecha_hora_fin: "2099-10-10T14:45:00Z", modalidad: "VIRTUAL", localizacion: null, estado_reserva: "CONFIRMADA", fecha_creacion: "2026-01-01", id_sesion: 1 };
const session: Session = { id_sesion: 1, id_reserva: 1, cita: { ...appointment, estado_reserva: "COMPLETADA", fecha_hora_inicio: "2026-10-09T10:00:00Z" }, estado_sesion: "FINALIZADA", asistencia: "ASISTIO", reporte_disponible: true, fecha_hora_inicio_real: "2026-10-09T10:00:00Z", fecha_hora_fin_real: "2026-10-09T10:45:00Z" };
const treatment: Treatment = { id_tratamiento: 1, id_expediente: 1, id_paciente: 1, id_terapeuta: 1, nombre_tratamiento: "Plan persistente", paciente_nombre: "Alex Primero", terapeuta_nombre: "Profesional Uno", estado_tratamiento: "ACTIVO", fecha_fin: null };
const report: Report = { id_sesion: 1, id_reporte_sesion: 1, fecha_creacion: "2026-10-09", observaciones_iniciales: "Observación real del servidor", objetivos_trabajados: "Objetivo registrado", nivel_ayuda: "Apoyo registrado", proximos_pasos: "Recomendación persistente" };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "X-Total-Count": String(Array.isArray(body) ? body.length : 1) } });

beforeEach(() => sessionStorage.clear());
function api(options: { patients?: Patient[]; error?: boolean; emptyReport?: boolean; reportError?: boolean; pending?: boolean } = {}) {
  vi.mocked(fetch).mockImplementation(async input => {
    const path = new URL(String(input), "http://localhost").pathname.replace(/^\/api\/v1/, "");
    if (options.pending) return new Promise<Response>(() => {});
    if (options.error) return response({ detail: "Servidor de seguimiento no disponible" }, 503);
    if (path === "/pacientes") return response(options.patients ?? [patient, sibling]);
    if (path === "/citas") return response([appointment, session.cita]);
    if (path === "/sesiones") return response([{ ...session, reporte_disponible: !options.emptyReport }]);
    if (path === "/pacientes/1/tratamientos") return response([treatment]);
    if (path === "/sesiones/1/reporte") return options.reportError ? response({ detail: "Reporte no disponible" }, 503) : response(report);
    return response([]);
  });
}

it("Scopes identical first names by ID and excludes completed, cancelled and expired appointments", () => {
  const other = { ...appointment, id_paciente: 2, id_reserva: 2 };
  const completed = { ...appointment, id_reserva: 3, estado_reserva: "COMPLETADA" as const };
  const cancelled = { ...appointment, id_reserva: 4, estado_reserva: "CANCELADA" as const };
  const expired = { ...appointment, id_reserva: 5, fecha_hora_fin: "2020-01-01T00:00:00Z" };
  const result = summarizeFamily(patient, [other, completed, cancelled, expired, appointment], [session, { ...session, cita: other }], [treatment], now);
  expect(result.next?.id_reserva).toBe(1);
  expect(result.attended).toHaveLength(1);
  expect(result.reportSessions).toHaveLength(1);
});

it("Counts only finalised attended sessions and uses the Lima month boundary", () => {
  const lastMonth = { ...session, id_sesion: 2, fecha_hora_inicio_real: "2026-10-01T02:00:00Z" };
  const absent = { ...session, asistencia: "NO_ASISTIO" as const };
  const running = { ...session, estado_sesion: "EN_CURSO" as const };
  const result = summarizeFamily(patient, [], [session, lastMonth, absent, running], [], now);
  expect(result.attended).toHaveLength(2);
  expect(result.thisMonth).toBe(1);
  expect(result.next).toEqual(running.cita);
});

it("Has no upcoming appointment after completing the only session", () => {
  const result = summarizeFamily(patient, [session.cita], [session], [treatment], now);
  expect(result.next).toBeUndefined();
});

it("Does not mark reservation, therapy, attendance or report milestones without records", () => {
  const result = summarizeFamily(patient, [{ ...appointment, estado_reserva: "CANCELADA" }], [], [], now);
  expect(result.milestones.filter(m => m.done).map(m => m.title)).toEqual(["Perfil del hijo"]);
});

it("Home presents persisted reports and no invented progress, steps or professionals", async () => {
  api(); renderRoute("/padre", "PADRE");
  expect(await screen.findByText("Recomendación persistente")).toBeInTheDocument();
  expect(screen.getByRole("combobox", { name: "Hijo o hija" })).toBeInTheDocument();
  expect(screen.getByText("Sin medición")).toBeInTheDocument();
  expect(screen.queryByText(/Dra. Ana Ruiz|78%|8\/10|Racha 7|Paso 7|Mateo/)).not.toBeInTheDocument();
});

it("Switches siblings with identical names and retains selection after a new route mount", async () => {
  api(); const first = renderRoute("/padre", "PADRE");
  await screen.findByText("Recomendación persistente");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
  await screen.findByText("Seguimiento de Alex Segundo");
  await screen.findByText("Todavía no hay reportes guardados para este hijo.");
  expect(screen.queryByText("Recomendación persistente")).not.toBeInTheDocument();
  first.unmount(); renderRoute("/padre/camino", "PADRE");
  expect(await screen.findByText("Seguimiento de Alex Segundo")).toBeInTheDocument();
});

it("Shows empty family state without falling back to fictional children", async () => {
  api({ patients: [] }); renderRoute("/padre/camino", "PADRE");
  expect(await screen.findByText("Aún no tienes hijos registrados")).toBeInTheDocument();
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  expect(screen.queryByText(/Mateo|Gómez|78%|Dra. Ana Ruiz/)).not.toBeInTheDocument();
});

it("Shows loading instead of synthetic or zero-value metrics", async () => {
  api({ pending: true }); renderRoute("/padre", "PADRE");
  expect(await screen.findByText("Cargando seguimiento…")).toBeInTheDocument();
  expect(screen.queryByLabelText("Registros del hijo seleccionado")).not.toBeInTheDocument();
});

it("Keeps server failures visible and retries a read", async () => {
  api({ error: true }); renderRoute("/padre", "PADRE");
  expect(await screen.findByRole("alert")).toHaveTextContent("Servidor de seguimiento no disponible");
  expect(screen.queryByLabelText("Registros del hijo seleccionado")).not.toBeInTheDocument();
  api(); fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Recomendación persistente")).toBeInTheDocument();
});

it("Journey shows real treatments and sessions in its sections", async () => {
  api(); renderRoute("/padre/camino", "PADRE");
  await screen.findByText("Recomendación persistente");
  fireEvent.click(screen.getByRole("button", { name: /^Planes$/ }));
  expect(await screen.findByText("Plan persistente")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /^Sesiones$/ }));
  expect(await screen.findByText(/Sesión #1 ·/)).toBeInTheDocument();
});

it("Reports without rows do not invent recommendations", async () => {
  api({ emptyReport: true }); renderRoute("/padre", "PADRE");
  expect(await screen.findByText("Todavía no hay reportes guardados para este hijo.")).toBeInTheDocument();
  expect(screen.queryByText("Recomendación persistente")).not.toBeInTheDocument();
});

it("A failed report read offers retry without presenting a made-up report", async () => {
  api({ reportError: true }); renderRoute("/padre/camino", "PADRE");
  expect(await screen.findByRole("alert")).toHaveTextContent("Reporte no disponible");
  expect(screen.queryByText("Recomendación persistente")).not.toBeInTheDocument();
});
