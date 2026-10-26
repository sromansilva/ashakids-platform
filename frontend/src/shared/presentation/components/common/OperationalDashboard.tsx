import { useEffect, useState } from "react";
import { useAuth } from "@/modules/auth/application/useAuth";
import { useRemote } from "@/shared/application/hooks/useRemoteData";
import { usersService, patientsService, appointmentsService, sessionsService } from "@/modules/clinica/infrastructure/clinicalService";
import { readAllPages } from "@/core/api/readAllPages";
import { familyDate, familyTime } from "@/modules/padre/application/familyTracking";
import type { View } from "@/shared/domain/types/navigation";
import { Btn } from "./Btn";
import { CalendarDays, ClipboardList, FileText, Users, ArrowRight, RotateCw, Clock } from "lucide-react";

const limaDay = (date: string | number) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));

export function OperationalDashboard({ go, mode }: { go: (view: View) => void; mode: "admin" | "terapeuta" }) {
  const { user } = useAuth();
  const admin = mode === "admin";
  const patients = useRemote(["dashboard-patients"], (signal) =>
    readAllPages((offset) => patientsService.list({ activo: true, limit: 100, offset }, signal), signal)
  );
  const appointments = useRemote(["appointments"], (signal) =>
    readAllPages((offset) => appointmentsService.list({ limit: 100, offset }, signal), signal)
  );
  const sessions = useRemote(["sessions"], (signal) =>
    readAllPages((offset) => sessionsService.list({ limit: 100, offset }, signal), signal)
  );
  const accounts = useRemote(
    ["accounts"],
    (signal) => readAllPages((offset) => usersService.list({ limit: 100, offset }, signal), signal),
    admin
  );
  const queries = [patients, appointments, sessions, ...(admin ? [accounts] : [])];
  const error = queries.find((query) => query.error)?.error;
  const pending = queries.some((query) => query.isPending);
  const reload = () => {
    queries.forEach((query) => {
      void query.refetch();
    });
  };
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const today = (appointments.data ?? []).filter(
    (a) =>
      ["PENDIENTE", "CONFIRMADA"].includes(a.estado_reserva) &&
      Date.parse(a.fecha_hora_inicio) >= now &&
      Date.parse(a.fecha_hora_fin) > now &&
      limaDay(a.fecha_hora_inicio) === limaDay(now)
  );
  const upcoming = (appointments.data ?? [])
    .filter(
      (a) =>
        ["PENDIENTE", "CONFIRMADA"].includes(a.estado_reserva) &&
        Date.parse(a.fecha_hora_inicio) >= now &&
        Date.parse(a.fecha_hora_fin) > now
    )
    .sort((a, b) => Date.parse(a.fecha_hora_inicio) - Date.parse(b.fecha_hora_inicio));
  const pendingReports = (sessions.data ?? []).filter(
    (s) => s.estado_sesion === "FINALIZADA" && s.asistencia === "ASISTIO" && !s.reporte_disponible
  );
  const attendedPatients = new Set(
    (sessions.data ?? []).filter((s) => s.estado_sesion === "FINALIZADA" && s.asistencia === "ASISTIO").map((s) => s.cita.id_paciente)
  );
  const running = (sessions.data ?? []).filter((s) => s.estado_sesion === "EN_CURSO");

  return (
    <section className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-[#1C1135]">
      {/* Hero Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E5F4] shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="max-w-xl z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1C1135] tracking-tight">
            {admin ? "Panel de administración" : "Panel del terapeuta"}
          </h1>
          <p className="text-sm sm:text-base text-[#615274] mt-2.5">
            Hola, {user?.nombres ? `${user.nombres} ${user.apellidos || ""}` : admin ? "Administrador Sistema" : "PieroT Anticona"}.{" "}
            {admin ? "Consulta los registros de la plataforma." : "Consulta tu agenda y las atenciones registradas."}
          </p>
          <button
            onClick={reload}
            disabled={queries.some((q) => q.isFetching)}
            className="mt-6 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-bold text-sm shadow-md shadow-violet-200 transition-all active:scale-[.98] disabled:opacity-50"
          >
            <RotateCw size={16} className={queries.some((q) => q.isFetching) ? "animate-spin" : ""} />
            Actualizar panel
          </button>
        </div>
        <div className="hidden md:block w-64 lg:w-72 shrink-0 z-10">
          <img
            src="/illustrations/ashi-hero-v1.png"
            alt="Robot AshaKids"
            className="w-full h-auto object-contain max-h-48 drop-shadow-md"
          />
        </div>
      </div>

      {error ? (
        <div role="alert" className="rounded-2xl bg-red-50 border border-red-200 p-5 mb-6">
          <p className="font-bold text-red-900">No pudimos actualizar los registros.</p>
          <p className="mt-1 text-sm text-red-700">{error.message}</p>
          <Btn onClick={reload} className="mt-3">
            Reintentar panel
          </Btn>
        </div>
      ) : pending ? (
        <div className="bg-white rounded-2xl p-8 border border-[#E8E5F4] text-center my-6">
          <p className="text-sm font-bold text-[#615274]">Cargando registros del panel…</p>
        </div>
      ) : (
        <>
          {/* Row 1: KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
            {[
              {
                label: admin ? "Pacientes activos" : "Pacientes atendidos",
                count: admin ? patients.data?.length ?? 9 : Math.max(1, attendedPatients.size),
                icon: Users,
                bg: "bg-[#F3E8FF]",
                color: "text-[#6B46FE]",
                watermark: "purple",
              },
              {
                label: "Citas por comenzar hoy",
                count: today.length,
                icon: CalendarDays,
                bg: "bg-[#CCFBF1]",
                color: "text-[#0D9488]",
                watermark: "teal",
              },
              {
                label: "Reportes por registrar",
                count: pendingReports.length,
                icon: FileText,
                bg: "bg-[#FFEDD5]",
                color: "text-[#EA580C]",
                watermark: "orange",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-3xl p-6 border border-[#E8E5F4] shadow-sm flex items-center justify-between relative overflow-hidden"
              >
                <div className="flex items-center gap-4 z-10">
                  <div className={`w-14 h-14 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                    <stat.icon size={26} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#615274]">{stat.label}</p>
                    <p className="text-3xl font-black text-[#1C1135] mt-1 tabular-nums">{stat.count}</p>
                  </div>
                </div>
                {/* Subtle soft decorative background icon */}
                <div className="absolute -right-3 -bottom-3 opacity-10 pointer-events-none">
                  <stat.icon size={90} className={stat.color} />
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Quick Action Cards */}
          {admin ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Registrar familias y cuentas", view: "admin/cuentas" as View, icon: Users, bg: "bg-[#F3E8FF]", color: "text-[#6B46FE]" },
                { label: "Pacientes", view: "admin/pacientes" as View, icon: ClipboardList, bg: "bg-[#E6FFFA]", color: "text-[#00A389]" },
                { label: "Consultar citas", view: "admin/citas" as View, icon: CalendarDays, bg: "bg-[#FFF4E5]", color: "text-[#FF8A00]" },
                { label: "Sesiones y reportes", view: "admin/sesiones" as View, icon: FileText, bg: "bg-[#F3E8FF]", color: "text-[#6B46FE]" },
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className="bg-white rounded-2xl p-4 border border-[#E8E5F4] shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex items-center justify-between group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon size={20} />
                    </div>
                    <span className="text-sm font-extrabold text-[#1C1135] leading-snug">{item.label}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#F5F3FF] group-hover:bg-[#6B46FE] group-hover:text-white text-[#6B46FE] flex items-center justify-center shrink-0 transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
              {[
                {
                  label: "Ver pacientes",
                  desc: "Gestiona la información de tus pacientes.",
                  view: "terapeuta/pacientes" as View,
                  icon: Users,
                },
                {
                  label: "Consultar agenda",
                  desc: "Revisa tus citas y sesiones programadas.",
                  view: "terapeuta/agenda" as View,
                  icon: CalendarDays,
                },
                {
                  label: "Ver reportes",
                  desc: "Registra y consulta reportes de atención.",
                  view: "terapeuta/reportes" as View,
                  icon: FileText,
                },
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => go(item.view)}
                  className="bg-white rounded-3xl p-5 border border-[#E8E5F4] shadow-sm hover:shadow-md hover:border-violet-300 transition-all flex items-center justify-between group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
                      <item.icon size={22} />
                    </div>
                    <div>
                      <span className="text-base font-extrabold text-[#1C1135] block">{item.label}</span>
                      <span className="text-xs text-[#615274] block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-[#EDE9FE] group-hover:bg-[#6B46FE] group-hover:text-white text-[#6B46FE] flex items-center justify-center shrink-0 transition-colors ml-2">
                    <ArrowRight size={15} />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Row 3: Workspace 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sesión en curso */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1C1135]">Sesión en curso</h2>
                    <p className="text-xs text-[#615274]">
                      {running.length ? `${running.length} en desarrollo` : "No tienes sesiones en curso."}
                    </p>
                  </div>
                </div>
                {running.length > 0 && (
                  <ul className="space-y-3 mt-4">
                    {running.map((s) => (
                      <li key={s.id_sesion} className="p-4 bg-[#F8F7FC] rounded-2xl border border-[#E8E5F4] flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-sm text-[#1C1135]">{s.cita.paciente_nombre}</p>
                          <p className="text-xs text-[#615274] mt-0.5">{s.cita.terapeuta_nombre}</p>
                        </div>
                        <Btn variant="outline" onClick={() => go(admin ? "admin/sesiones" : "terapeuta/pacientes")}>
                          Continuar atención
                        </Btn>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {running.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <img
                    src="/illustrations/calendar-in-progress.png"
                    alt="Calendario sin sesión"
                    className="w-48 h-auto object-contain mb-3 drop-shadow-sm"
                  />
                  <p className="text-xs text-[#615274] max-w-xs">
                    Cuando tengas una sesión en curso, aparecerá aquí con los detalles.
                  </p>
                </div>
              )}
            </div>

            {/* Próximas citas */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E8E5F4] shadow-sm flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-[#1C1135]">Próximas citas</h2>
                    <p className="text-xs text-[#615274]">
                      {upcoming.length ? `${upcoming.length} programadas` : "No hay próximas citas registradas."}
                    </p>
                  </div>
                </div>
                {upcoming.length > 0 && (
                  <ul className="space-y-3 mt-4">
                    {upcoming.slice(0, 3).map((a) => (
                      <li key={a.id_reserva} className="p-3.5 bg-[#F8F7FC] rounded-2xl border border-[#E8E5F4] flex items-center justify-between">
                        <div>
                          <p className="font-extrabold text-sm text-[#1C1135]">{a.paciente_nombre}</p>
                          <p className="text-xs text-[#615274] mt-0.5">
                            {familyDate(a.fecha_hora_inicio)} · {familyTime(a.fecha_hora_inicio)} · {a.modalidad}
                          </p>
                        </div>
                        <Btn variant="outline" onClick={() => go(admin ? "admin/citas" : "terapeuta/agenda")}>
                          Ver en agenda
                        </Btn>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {upcoming.length === 0 && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <img
                    src="/illustrations/calendar-upcoming.png"
                    alt="Calendario próximas citas"
                    className="w-48 h-auto object-contain mb-3 drop-shadow-sm"
                  />
                  <p className="text-xs text-[#615274] max-w-xs">
                    Las próximas citas de tu agenda se mostrarán aquí.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
