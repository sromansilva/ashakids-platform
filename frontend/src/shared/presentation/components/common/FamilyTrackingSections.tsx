import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  ClipboardList,
  Compass,
  Eye,
  FileText,
  Footprints,
  HandHelping,
  Sparkles,
  Sprout,
  Target,
  User,
} from "lucide-react";
import { parsePlanNarrative, planNarrativeLabels } from "@/shared/application/planDraft";
import type { useFamilyTracking } from "@/modules/padre/application/useFamilyTracking";
import { ApiError } from "@/core/api/client";
import { familyDate, familyTime } from "@/modules/padre/application/familyTracking";
import { attendanceLabel, sessionStatusLabel } from "@/shared/domain/statusLabels";
import { Btn } from "./Btn";
import { Crd } from "./Crd";
import { SessionActions } from "./SessionActions";

export type Tracking = ReturnType<typeof useFamilyTracking>;

const labels = {
  observaciones_iniciales: "Observaciones iniciales",
  objetivos_trabajados: "Objetivos trabajados",
  nivel_ayuda: "Nivel de ayuda",
  proximos_pasos: "Próximos pasos",
} as const;

const reportFieldIcons = {
  observaciones_iniciales: Eye,
  objetivos_trabajados: Target,
  nivel_ayuda: HandHelping,
  proximos_pasos: Footprints,
} as const;

const milestoneIcons = [User, Sparkles, FileText, Compass, Sprout] as const;

export const dotPatternStyle = {
  backgroundImage: "radial-gradient(#C4B5FD 1.5px, transparent 1.5px)",
  backgroundSize: "12px 12px",
} as const;

export function ReadError({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 text-red-800 p-4 space-y-3">
      <p>
        {error instanceof ApiError && error.status === 0
          ? "No pudimos cargar el seguimiento. Comprueba tu conexión y vuelve a intentarlo."
          : error instanceof Error
            ? error.message
            : "No pudimos cargar el seguimiento."}
      </p>
      <Btn variant="outline" onClick={retry}>
        Reintentar
      </Btn>
    </div>
  );
}

export function PlanNarrative({ description }: { description: string }) {
  const narrative = parsePlanNarrative(description);
  return (
    <dl className="space-y-3">
      {Object.entries(planNarrativeLabels).map(([key, label]) => {
        const value = narrative[key as keyof typeof narrative];
        if (!value.trim()) return null;
        return (
          <div key={key} className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
            <dt className="flex items-center gap-2 text-sm font-extrabold text-[#1C1135]">
              <ClipboardList size={15} className="text-[#6B46FE] shrink-0" aria-hidden="true" />
              <span>{label}</span>
            </dt>
            <dd className="mt-1 text-sm text-[#4B4264] font-medium whitespace-pre-wrap break-words leading-relaxed">
              {value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

export function Milestones({ summary }: { summary: NonNullable<Tracking["summary"]> }) {
  return (
    <section aria-label="Recorrido registrado" className="family-milestones space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-700">
            <Sparkles size={14} aria-hidden="true" /> Tu avance
          </p>
          <h2 className="text-xl font-black text-[#1C1135]">Tu recorrido en ASHAKids</h2>
          <p className="mt-1 text-sm text-[#615274]">Un resumen de los pasos registrados por tu equipo.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700">
          <CheckCircle2 size={14} aria-hidden="true" /> {summary.milestones.filter((m) => m.done).length} de{" "}
          {summary.milestones.length} completados
        </span>
      </div>
      <ol className="relative grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-5">
        {summary.milestones.map((m, index) => {
          const Icon = milestoneIcons[index] ?? CheckCircle2;
          return (
            <li
              key={m.title}
              className={`family-milestone-card relative rounded-2xl border p-4 transition-all ${
                m.done ? "border-violet-100 bg-violet-50/70" : "border-dashed border-[#D9D2EA] bg-[#FBFAFF]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-2xl ${
                    m.done ? "bg-white text-violet-700 shadow-sm" : "bg-[#F0EDF8] text-[#9E95B7]"
                  }`}
                  aria-hidden="true"
                >
                  <Icon size={18} />
                </span>
                <span className={`text-xs font-black ${m.done ? "text-emerald-600" : "text-[#9E95B7]"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-start gap-2">
                {m.done ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Circle size={16} className="mt-0.5 shrink-0 text-[#A9A1BB]" aria-hidden="true" />
                )}
                <div className="min-w-0">
                  <p className="font-extrabold leading-tight text-[#1C1135]">{m.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[#615274]">
                    {m.done ? m.detail : "Sin registro todavía"}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function ReportSummary({ data }: { data: Tracking }) {
  const { summary, report } = data;
  const session = summary?.latestReportSession;
  const is404 =
    report.error instanceof ApiError && (report.error.status === 404 || report.error.message.includes("404"));
  const hasNoReport = !session || is404 || (!report.isPending && !report.data && !report.error);

  return (
    <section className="relative space-y-3.5" aria-label="Último reporte">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-2 -right-2 h-16 w-20 opacity-50"
        style={dotPatternStyle}
      />
      <div className="relative">
        <h2 className="text-xl font-black text-[#5B21B6] tracking-tight">Último reporte de sesión</h2>
        {session && !is404 && report.data && !report.error && (
          <p className="mt-1 text-sm font-semibold text-[#615274]">
            {session.cita.terapeuta_nombre} · {familyDate(session.cita.fecha_hora_inicio)}
          </p>
        )}
      </div>

      {hasNoReport && (
        <div className="rounded-2xl border border-dashed border-[#DDD6FE] bg-[#FBFAFF] p-4 text-sm font-medium text-[#615274]">
          Todavía no hay reportes guardados para este hijo.
        </div>
      )}
      {session && !is404 && report.isPending && (
        <p role="status" className="text-sm font-semibold text-[#615274]">
          Cargando reporte…
        </p>
      )}
      {session && !is404 && report.error && <ReadError error={report.error} retry={() => void report.refetch()} />}
      {session && !is404 && report.data && !report.error && (
        <dl className="space-y-3">
          {(Object.entries(labels) as [keyof typeof labels, string][]).map(([key, label]) => {
            const Icon = reportFieldIcons[key];
            return (
              <div key={key} className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
                <dt className="flex items-center gap-2 text-sm font-extrabold text-[#1C1135]">
                  <Icon size={16} className="text-[#6B46FE] shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </dt>
                <dd className="mt-1 text-sm text-[#4B4264] font-medium whitespace-pre-wrap break-words leading-relaxed">
                  {report.data[key] || "No registrado"}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
    </section>
  );
}

export function History({ data, reportsOnly = false }: { data: Tracking; reportsOnly?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const rows = reportsOnly ? data.summary!.reportSessions : data.summary!.sessions;

  return (
    <section className="space-y-4" aria-label={reportsOnly ? "Reportes guardados" : "Historial de sesiones"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-black text-[#5B21B6] tracking-tight">
          {reportsOnly ? "Reportes guardados" : "Historial de sesiones"}
        </h2>
        {rows.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EFFE] border border-[#DDD6FE] px-3 py-1 text-xs font-extrabold text-[#5B21B6]">
            {rows.length} {rows.length === 1 ? "registro" : "registros"}
          </span>
        )}
      </div>

      {!rows.length && (
        <div className="rounded-2xl border border-dashed border-[#DDD6FE] bg-white p-6 text-sm font-medium text-[#615274]">
          {reportsOnly
            ? "Todavía no hay reportes guardados para este hijo."
            : "Todavía no hay sesiones registradas para este hijo."}
        </div>
      )}

      <div className="space-y-3.5">
        {rows.map((s) => {
          const isOpen = open === s.id_sesion;
          return (
            <Crd key={s.id_sesion} className="relative overflow-hidden p-5 sm:p-6">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute top-3 right-3 h-12 w-16 opacity-40"
                style={dotPatternStyle}
              />
              <div className="relative space-y-3">
                <div className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 font-extrabold text-[#1C1135]">
                      {reportsOnly ? (
                        <FileText size={16} className="text-[#6B46FE]" aria-hidden="true" />
                      ) : (
                        <CalendarDays size={16} className="text-[#6B46FE]" aria-hidden="true" />
                      )}
                      <span>
                        Sesión #{s.id_sesion} · {familyDate(s.cita.fecha_hora_inicio)} ·{" "}
                        {familyTime(s.cita.fecha_hora_inicio)}
                      </span>
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-white border border-[#DDD6FE] px-2.5 py-0.5 text-xs font-extrabold text-[#5B21B6]">
                        {sessionStatusLabel(s.estado_sesion)}
                      </span>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700">
                        {attendanceLabel(s.asistencia)}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#615274] break-words">
                    <User size={14} className="text-[#6B46FE] shrink-0" aria-hidden="true" />
                    <span>{s.cita.terapeuta_nombre}</span>
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`family-session-${s.id_sesion}`}
                    onClick={() => setOpen(isOpen ? null : s.id_sesion)}
                    className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-xs sm:text-sm font-extrabold shadow-sm shadow-orange-200 transition-all cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700"
                  >
                    <FileText size={14} aria-hidden="true" />
                    <span>{isOpen ? "Ocultar detalle" : "Ver sesión y reporte"}</span>
                    <ChevronDown
                      size={15}
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {isOpen && (
                  <div id={`family-session-${s.id_sesion}`} className="pt-2 border-t border-[#E8E5F4]">
                    <SessionActions appointmentId={s.id_reserva} />
                  </div>
                )}
              </div>
            </Crd>
          );
        })}
      </div>
    </section>
  );
}
