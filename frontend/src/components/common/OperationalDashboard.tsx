import { useAuth } from "@/hooks/useAuth";
import { useRemote } from "@/hooks/useRemoteData";
import { usersService, patientsService, appointmentsService, sessionsService } from "@/services/clinicalService";
import { readAllPages } from "@/services/readAllPages";
import { familyDate, familyTime } from "@/services/familyTracking";
import type { View } from "@/types/navigation";
import { Btn } from "./Btn";

const limaDay = (date: string | number) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(date));
export function OperationalDashboard({ go, mode }: { go: (view: View) => void; mode: "admin" | "terapeuta" }) {
  const { user } = useAuth();
  const admin = mode === "admin";
  const patients = useRemote(["dashboard-patients"], signal => readAllPages(offset => patientsService.list({ activo: true, limit: 100, offset }, signal), signal));
  const appointments = useRemote(["appointments"], signal => readAllPages(offset => appointmentsService.list({ limit: 100, offset }, signal), signal));
  const sessions = useRemote(["sessions"], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const accounts = useRemote(["accounts"], signal => readAllPages(offset => usersService.list({ limit: 100, offset }, signal), signal), admin);
  const queries = [patients, appointments, sessions, ...(admin ? [accounts] : [])];
  const error = queries.find(query => query.error)?.error;
  const pending = queries.some(query => query.isPending);
  const reload = () => queries.forEach(query => { void query.refetch(); });
  const now = Date.now();
  const today = (appointments.data ?? []).filter(a => a.estado_reserva !== "CANCELADA" && limaDay(a.fecha_hora_inicio) === limaDay(now));
  const upcoming = (appointments.data ?? []).filter(a => ["PENDIENTE", "CONFIRMADA"].includes(a.estado_reserva) && Date.parse(a.fecha_hora_fin) > now).sort((a, b) => Date.parse(a.fecha_hora_inicio) - Date.parse(b.fecha_hora_inicio));
  const pendingReports = (sessions.data ?? []).filter(s => s.estado_sesion === "FINALIZADA" && s.asistencia === "ASISTIO" && !s.reporte_disponible);
  const stats: [string, number][] = [[admin ? "Pacientes activos" : "Pacientes asignados activos", patients.data?.length ?? 0], ["Citas de hoy no canceladas", today.length], ["Reportes por registrar", pendingReports.length], ...(admin ? [["Cuentas activas", (accounts.data ?? []).filter(a => a.activo).length] as [string, number]] : [])];
  const actions: [string, View][] = admin ? [["Gestionar usuarios", "admin/usuarios"], ["Pacientes y tratamientos", "admin/pacientes"], ["Consultar citas", "admin/citas"], ["Sesiones y reportes", "admin/sesiones"]] : [["Pacientes asignados", "terapeuta/pacientes"], ["Consultar agenda", "terapeuta/agenda"], ["Sesiones y reportes", "terapeuta/reportes"]];
  return <section className="p-4 sm:p-6 max-w-6xl mx-auto text-[#1C1135]">
    <header className="flex items-start justify-between gap-4 flex-wrap mb-6">
      <div><h1 className="text-2xl font-black">{admin ? "Panel de administración" : "Panel del terapeuta"}</h1><p className="text-base mt-2 text-[#4B4264]">Hola, {user?.nombres} {user?.apellidos}. {admin ? "Consulta los registros de la plataforma." : "Consulta los registros de tus pacientes asignados."}</p></div>
      <Btn variant="outline" onClick={reload} disabled={queries.some(q => q.isFetching)}>Actualizar panel</Btn>
    </header>
    <nav aria-label="Acciones del panel" className="flex gap-3 flex-wrap mb-7">{actions.map(([label, view]) => <Btn key={view} variant="secondary" onClick={() => go(view)}>{label}</Btn>)}</nav>
    {error ? <div role="alert" className="rounded-2xl bg-red-50 p-5"><p className="font-bold">No pudimos actualizar los registros.</p><p className="mt-2">{error.message}</p><Btn onClick={reload} className="mt-3">Reintentar panel</Btn></div> : pending ? <p role="status">Cargando registros del panel…</p> : <>
      <dl aria-label="Resumen de registros" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">{stats.map(([label, count]) => <div key={label} className="bg-white border border-[#E8E5F4] rounded-2xl p-5"><dt className="text-sm text-[#4B4264] font-bold">{label}</dt><dd className="text-3xl font-black mt-3 tabular-nums">{count}</dd></div>)}</dl>
      <h2 className="text-xl font-extrabold mb-3">Próximas citas</h2>
      {upcoming.length ? <ul className="space-y-3">{upcoming.slice(0, 5).map(a => <li key={a.id_reserva} className="p-4 bg-white border border-[#E8E5F4] rounded-2xl flex items-start justify-between gap-4 flex-wrap"><div><p className="font-extrabold break-words">{a.paciente_nombre}</p><p className="text-base text-[#4B4264] mt-1">{familyDate(a.fecha_hora_inicio)} · {familyTime(a.fecha_hora_inicio)} · {a.modalidad}</p><p className="text-sm mt-1">{a.terapeuta_nombre} · {a.estado_reserva}</p></div><Btn variant="outline" onClick={() => go(admin ? "admin/citas" : "terapeuta/agenda")}>Ver en agenda</Btn></li>)}</ul> : <p className="text-base text-[#4B4264]">No hay próximas citas registradas.</p>}
      <p className="text-sm text-[#4B4264] mt-6">Los conteos reflejan registros autorizados. No miden evolución clínica, disponibilidad del servicio ni mensajes pendientes.</p>
    </>}
  </section>;
}
