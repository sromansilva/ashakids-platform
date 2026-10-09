import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderRoute } from "./helpers";
import { LEARNING_WORLDS, deriveWorldProgress, type VerifiedLearningAttempt } from "@/services/learningWorlds";
import { capabilityNotice } from "@/app/routeCapabilities";
import type { Patient, Appointment, Session } from "@/types/clinical";

const child: Patient = { id_paciente: 1, id_tutor: 1, nombres_paciente: "Alex", apellidos_paciente: "Uno", fecha_nacimiento: "2020-01-01", sexo: "Otro", activo: true, fecha_registro: "2026-01-01" };
const sibling: Patient = { ...child, id_paciente: 2, apellidos_paciente: "Dos" };
const future: Appointment = { id_reserva: 1, id_paciente: 1, id_tratamiento: 1, id_terapeuta: 1, paciente_nombre: "Alex Uno", terapeuta_nombre: "Profesional Uno", fecha_hora_inicio: "2099-10-10T14:00:00Z", fecha_hora_fin: "2099-10-10T14:45:00Z", modalidad: "VIRTUAL", localizacion: null, estado_reserva: "CONFIRMADA", fecha_creacion: "2026-01-01", id_sesion: null };
const completed: Session = { id_sesion: 1, id_reserva: 2, cita: { ...future, id_reserva: 2, estado_reserva: "COMPLETADA" }, estado_sesion: "FINALIZADA", asistencia: "ASISTIO", reporte_disponible: false, fecha_hora_inicio_real: "2026-10-09T10:00:00Z", fecha_hora_fin_real: "2026-10-09T10:45:00Z" };
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "X-Total-Count": String(Array.isArray(body) ? body.length : 1) } });
beforeEach(() => sessionStorage.clear());
function api(options: { error?: boolean; pending?: boolean; children?: Patient[]; writeError?: boolean } = {}) {
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    if (options.writeError && init?.method === "POST") return response({ detail: "Registro de hijo no disponible" }, 503);
    if (options.pending) return new Promise<Response>(() => {});
    if (options.error) return response({ detail: "Panel no disponible" }, 503);
    const path = new URL(String(input), "http://localhost").pathname.replace(/^\/api\/v1/, "");
    if (path === "/pacientes") return response(options.children ?? [child, sibling]);
    if (path === "/citas") return response([future, completed.cita, { ...future, id_reserva: 3, estado_reserva: "CANCELADA" }, { ...future, id_reserva: 4, fecha_hora_fin: "2020-01-01T00:00:00Z" }]);
    if (path === "/sesiones") return response([completed, { ...completed, id_sesion: 2, asistencia: "NO_ASISTIO" }]);
    if (path === "/pacientes/1/tratamientos") return response([{ id_tratamiento: 1, id_paciente: 1, nombre_tratamiento: "Tratamiento autorizado", terapeuta_nombre: "Profesional Uno", estado_tratamiento: "ACTIVO" }]);
    if (path === "/usuarios") return response([{ id_usuario: 1, activo: true }, { id_usuario: 2, activo: false }]);
    if (path === "/padres/me") return response({ user: { id_usuario: 1, nombres: "Usuario", apellidos: "Prueba", codigo_usuario: "test", email: "test@example.invalid" } });
    return response([]);
  });
}

it.each(["/register", "/register/padre", "/register/terapeuta", "/register/verify", "/register/terapeuta/success", "/onboarding", "/forgot-password"])("%s explains real access without invented credentials, email or success", async path => {
  renderRoute(path, null);
  await screen.findByRole("button", { name: "Ir al inicio de sesión" });
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  expect(screen.queryByText(/Correo reenviado|Contraseña actualizada|Solicitud enviada|ana@email.com|Ya verifiqué/)).not.toBeInTheDocument();
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Ir al inicio de sesión" }));
  expect(await screen.findByLabelText(/Código de usuario/i)).toBeInTheDocument();
});
it("Consent is pending, does not record acceptance, and leads to real family settings", async () => {
  api(); renderRoute("/padre/consentimiento", "PADRE");
  await screen.findByRole("heading", { name: "Preferencias y consentimientos" });
  expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  expect(screen.queryByText("Preferencias registradas")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Gestionar hijos" }));
  await screen.findByRole("heading", { name: "Configuración" });
});
it("Family settings expose both siblings without a plan restriction and describe a historical soft delete", async () => {
  api(); renderRoute("/padre/config", "PADRE");
  fireEvent.click(await screen.findByRole("button", { name: /^Mis hijos$/ }));
  await screen.findByText("Alex Dos");
  expect(screen.getByText("Alex Uno")).toBeInTheDocument();
  expect(screen.queryByText(/Plan Exploración|Plan Familia/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Dar de baja a Alex Dos" }));
  await screen.findByText(/Su historial se conserva/);
  expect(screen.queryByText(/No puede deshacerse/)).not.toBeInTheDocument();
});
it("Settings security, privacy and notification tabs do not fake writes", async () => {
  api(); renderRoute("/padre/config", "PADRE");
  for (const name of ["Seguridad", "Privacidad", "Notificaciones"]) {
    fireEvent.click(await screen.findByRole("button", { name: new RegExp(`^${name}$`) }));
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Guardar|Eliminar cuenta|Activar 2FA/ })).not.toBeInTheDocument();
  }
  expect(vi.mocked(fetch).mock.calls.every(([, options]) => !options?.method || options.method === "GET")).toBe(true);
});
it("A failed patient create keeps form values and never announces success", async () => {
  api({ writeError: true }); renderRoute("/padre/config", "PADRE");
  fireEvent.click(await screen.findByRole("button", { name: /^Mis hijos$/ }));
  fireEvent.click(await screen.findByRole("button", { name: /^Añadir hijo$/ }));
  fireEvent.change(screen.getByLabelText("Nombres"), { target: { value: "Hijo sintético" } });
  fireEvent.change(screen.getByLabelText("Apellidos"), { target: { value: "Prueba" } });
  fireEvent.change(screen.getByLabelText("Sexo"), { target: { value: "Otro" } });
  fireEvent.change(screen.getByLabelText("Fecha de nacimiento"), { target: { value: "2020-01-01" } });
  fireEvent.click(screen.getByRole("button", { name: /^Agregar hijo$/ }));
  await screen.findByText("Registro de hijo no disponible");
  expect(screen.getByLabelText("Nombres")).toHaveValue("Hijo sintético");
  expect(screen.queryByText("Hijo registrado en el servidor")).not.toBeInTheDocument();
});
it("Family professionals are treatment assignments, not a mock directory", async () => {
  api(); renderRoute("/padre/psicologos", "PADRE");
  await screen.findByText("Tratamiento autorizado");
  expect(screen.getByRole("button", { name: /^Reservar cita$/ })).toBeInTheDocument();
  expect(screen.queryByText(/Dra. Ana Ruiz|Solicitud enviada|Pago/)).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "Hijo o hija" }), { target: { value: "2" } });
  await screen.findByText(/Este hijo todavía no tiene un tratamiento asignado/);
  expect(screen.queryByRole("button", { name: /^Reservar cita$/ })).not.toBeInTheDocument();
});
it.each(["/padre/recorrido", "/padre/seguimiento"])("%s reuses the persisted tracking model", async path => {
  api(); renderRoute(path, "PADRE");
  await screen.findByText("Seguimiento de Alex Uno");
  expect(screen.queryByText(/60%|6\/10|Dra. Ana Ruiz|Correo electrónico verificado/)).not.toBeInTheDocument();
});
it("Therapist dashboard counts authorised data and never requests administrator accounts", async () => {
  api(); renderRoute("/terapeuta", "TERAPEUTA");
  await screen.findByText("Profesional Uno · CONFIRMADA");
  expect(screen.getByText("Profesional Uno · CONFIRMADA")).toBeInTheDocument();
  expect(screen.getByText("Reportes por registrar").parentElement).toHaveTextContent("1");
  expect(screen.queryByText(/Dra. Ana Ruiz|4.9|94 h|Mensajes nuevos/)).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes("/usuarios"))).toBe(false);
});
it("Admin dashboard derives active account count and excludes cancelled/completed/expired future appointments", async () => {
  api(); renderRoute("/admin", "ADMIN");
  await screen.findByText("Profesional Uno · CONFIRMADA");
  expect(screen.getByText("Cuentas activas").parentElement).toHaveTextContent("1");
  expect(screen.getAllByText("Alex Uno")).toHaveLength(1);
  expect(screen.queryByText(/96.4|Incidencias técnicas abiertas|Modelo ML/)).not.toBeInTheDocument();
});
it("Dashboard loading never looks like zero available records", async () => {
  api({ pending: true }); renderRoute("/admin", "ADMIN");
  await screen.findByText("Cargando registros del panel…");
  expect(screen.queryByLabelText("Resumen de registros")).not.toBeInTheDocument();
});
it("Dashboard failure hides aggregates and can be retried", async () => {
  api({ error: true }); renderRoute("/terapeuta", "TERAPEUTA");
  await screen.findByText("No pudimos actualizar los registros.");
  expect(screen.queryByLabelText("Resumen de registros")).not.toBeInTheDocument();
  api(); fireEvent.click(screen.getByRole("button", { name: "Reintentar panel" }));
  await screen.findByText("Profesional Uno · CONFIRMADA");
});
it("Mundo ASHA uses the selected child ID and exposes proposals rather than fabricated mastery", async () => {
  api(); renderRoute("/mundo-asha", "PADRE");
  const select = await screen.findByRole("combobox", { name: "Hijo o hija" });
  fireEvent.change(select, { target: { value: "2" } });
  expect(await screen.findByText("Avance educativo de Alex Dos: sin seguimiento conectado.")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: /Ver propuesta de niveles/ })[1]);
  await screen.findByRole("heading", { name: "Aventura de la R" });
  expect(screen.getAllByText(/En preparación · Requiere revisión profesional/)).toHaveLength(8);
  expect(screen.queryByText(/47|Racha|Asignada por tu terapeuta|Mateo/)).not.toBeInTheDocument();
  expect(vi.mocked(fetch).mock.calls.every(([url]) => String(url).includes("/pacientes"))).toBe(true);
});
it("Mundo ASHA has an honest empty family state", async () => {
  api({ children: [] }); renderRoute("/mundo-asha", "PADRE");
  await screen.findByText(/Aún no tienes hijos registrados/);
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});
it.each(["/mundo-asha/academia", "/mundo-asha/retos", "/mundo-asha/insignias", "/mundo-asha/perfil"])("%s does not claim verified rewards or completed levels", async path => {
  renderRoute(path, "PADRE");
  await screen.findByText(/El progreso educativo por hijo todavía no está conectado/);
  expect(screen.queryByText(/Mateo|47|80%|60%|100%/)).not.toBeInTheDocument();
});

const world = LEARNING_WORLDS[0];
const attempt = (index: number, extra: Partial<VerifiedLearningAttempt> = {}): VerifiedLearningAttempt => ({ id: `attempt-${index}`, patientId: 1, worldId: world.id, levelId: world.levels[index].id, version: world.version, passed: true, verifiedBy: "server", ...extra });
it("A missing progress connection remains unknown rather than zero", () => expect(deriveWorldProgress(world, 1, null)).toMatchObject({ connected: false, completed: null, percent: null }));
it("An empty verified history opens only the first level", () => expect(deriveWorldProgress(world, 1, []).levels.map(l => l.state)).toEqual(["available", "locked", "locked", "locked", "locked", "locked"]));
it("World progress ignores other children, versions and worlds", () => expect(deriveWorldProgress(world, 1, [attempt(0, { patientId: 2 }), attempt(0, { version: "old" }), attempt(0, { worldId: "other" })]).completed).toBe(0));
it("Out of order completion cannot unlock a skipped level", () => expect(deriveWorldProgress(world, 1, [attempt(1)]).completed).toBe(0));
it("Verified mastery unlocks the next level and repeated attempts do not add duplicate mastery", () => expect(deriveWorldProgress(world, 1, [attempt(0), attempt(0), attempt(0, { id: "replay" })])).toMatchObject({ completed: 1, percent: 17 }));
it("Completing each level once reaches the actual world total without replay inflation", () => expect(deriveWorldProgress(world, 1, world.levels.map((_, index) => attempt(index)))).toMatchObject({ completed: 6, total: 6, percent: 100 }));
it("Conflicting repeated attempt IDs never contribute even when a third duplicate follows", () => expect(deriveWorldProgress(world, 1, [attempt(0), attempt(0, { passed: false }), attempt(0)]).completed).toBe(0));
it("Oral production levels require professional validation, not a server quiz pass", () => {
  const oral = LEARNING_WORLDS[1];
  const a = attempt(0, { worldId: oral.id, levelId: oral.levels[0].id });
  expect(deriveWorldProgress(oral, 1, [a]).completed).toBe(0);
  expect(deriveWorldProgress(oral, 1, [{ ...a, verifiedBy: "professional" }]).completed).toBe(1);
});
it("Unreviewed extensions and session prototypes stay explicitly labelled", () => {
  expect(capabilityNotice("/session/active")).toMatch(/Demostración/);
  expect(capabilityNotice("/padre/mensajes")).toBeNull();
  expect(capabilityNotice("/terapeuta/mensajes")).toBeNull();
  expect(capabilityNotice("/mundo-asha/cuentos")).toMatch(/prototipos/);
  expect(capabilityNotice("/padre/camino")).toBeNull();
});
