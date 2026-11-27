import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  HeartPulse,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  User,
  Users,
  Video,
} from "lucide-react";
import { areaLabels } from "./planLabels";
import { IntroductionStatus } from "./IntroductionStatus";
import { useFamilyTracking } from "@/modules/padre/application/useFamilyTracking";
import { familyDate, familyTime } from "@/modules/padre/application/familyTracking";
import { Ashi } from "@/shared/presentation/components/illustrations/Ashi";
import { B } from "@/shared/presentation/theme/brand/B";
import type { View } from "@/shared/domain/types/navigation";
import { reservationStatusLabel } from "@/shared/domain/statusLabels";
import { Btn } from "./Btn";
import { Crd } from "./Crd";
import { dotPatternStyle, History, Milestones, PlanNarrative, ReadError, ReportSummary } from "./FamilyTrackingSections";

const tabs = ["Resumen", "Planes", "Sesiones", "Reportes"] as const;

export function FamilyTrackingPanel({
  mode,
  go,
  familyName = "Familia",
  embedded = false,
}: {
  mode: "home" | "journey";
  go: (view: View) => void;
  familyName?: string;
  embedded?: boolean;
}) {
  const navigate = useNavigate();
  const data = useFamilyTracking();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Resumen");
  const { patient, summary } = data;
  const activeTreatment = data.treatments.find((t) => t.estado_tratamiento === "ACTIVO");
  const totalRec = activeTreatment?.sesiones_recomendadas;
  const attendedCount = summary
    ? activeTreatment
      ? summary.attended.filter((session) => session.cita.id_tratamiento === activeTreatment.id_tratamiento).length
      : summary.attended.length
    : 0;
  const clinicalProgress =
    totalRec != null && totalRec > 0
      ? `${attendedCount} de ${totalRec} sesiones`
      : attendedCount > 0
        ? `${attendedCount} realizadas`
        : "Sin medición";

  const metrics = summary
    ? [
        { label: "Sesiones realizadas", value: summary.attended.length, icon: CalendarDays, tone: "text-violet-700 bg-violet-100" },
        { label: "Este mes", value: summary.thisMonth, icon: HeartPulse, tone: "text-teal-700 bg-teal-100" },
        { label: "Reportes disponibles", value: summary.reportSessions.length, icon: FileText, tone: "text-orange-700 bg-orange-100" },
        { label: "Progreso clínico", value: clinicalProgress, icon: Target, tone: "text-sky-700 bg-sky-100" },
      ]
    : [];

  return (
    <div
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
      className={`family-panel ${mode === "journey" ? "family-journey" : ""} mx-auto max-w-7xl space-y-6 p-4 pb-10 sm:p-6`}
    >
      {embedded && (
        <div className="flex justify-end">
          <Btn variant="outline" disabled={data.refreshing} onClick={data.retry}>
            <RefreshCw size={16} aria-hidden="true" className={data.refreshing ? "animate-spin" : ""} /> Actualizar seguimiento
          </Btn>
        </div>
      )}

      {!embedded && (
        <header className="family-heading flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-700">
              <Sparkles size={14} aria-hidden="true" /> {mode === "home" ? "Centro familiar" : "Seguimiento familiar"}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-[#1C1135] sm:text-4xl">
              {mode === "home" ? "Centro Familiar" : "Mi Camino ASHA"}
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#615274]">
              {mode === "home"
                ? `Hola, ${familyName}. Consulta las citas y el seguimiento de tu familia.`
                : "Acompaña cada paso del desarrollo de tu hijo con información clara y cercana."}
            </p>
          </div>
          <Btn variant="outline" className="rounded-2xl border-violet-100 bg-white/80 shadow-sm" disabled={data.refreshing} onClick={data.retry}>
            <RefreshCw size={16} aria-hidden="true" className={data.refreshing ? "animate-spin" : ""} /> Actualizar seguimiento
          </Btn>
        </header>
      )}

      {!embedded && !!data.children.length && (
        <div className="family-child-picker flex flex-col gap-3 rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-100/40 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700" aria-hidden="true">
              <User size={20} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-violet-700">Perfil que estás viendo</p>
              <p className="text-sm text-[#615274]">Selecciona un hijo para ver su recorrido.</p>
            </div>
          </div>
          <label className="block text-sm font-extrabold text-[#1C1135] sm:min-w-64">
            Hijo o hija
            <select
              aria-label="Hijo o hija"
              value={patient?.id_paciente ?? ""}
              onChange={(e) => data.selectPatient(Number(e.target.value))}
              className="mt-1.5 block w-full rounded-2xl border border-[#D6CCEB] bg-white px-4 py-3 text-base font-bold text-[#1C1135] shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            >
              {data.children.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombres_paciente} {p.apellidos_paciente}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {data.error ? (
        <ReadError error={data.error} retry={data.retry} />
      ) : data.pending ? (
        <p role="status" className="py-6 text-[#4B4264]">Cargando seguimiento…</p>
      ) : !patient || !summary ? (
        <Crd className="p-6 space-y-3">
          <Users size={28} className="text-violet-700" aria-hidden="true" />
          <h2 className="font-extrabold text-lg text-[#1C1135]">Aún no tienes hijos registrados</h2>
          <p className="text-[#4B4264]">Añade un perfil para consultar sus tratamientos, citas y reportes.</p>
          <Btn variant="cta" className="rounded-full" onClick={() => go("padre/config")}>Gestionar hijos</Btn>
        </Crd>
      ) : (
        <>
          {!embedded && (
            <section
              className="family-summary relative isolate overflow-hidden rounded-[2rem] p-6 text-white shadow-xl shadow-violet-200/40 sm:p-8"
              style={{ background: `linear-gradient(125deg, ${B.violetDeep} 0%, #4C1D95 58%, ${B.violet} 100%)` }}
            >
              <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-orange-300/10" />
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-violet-100">Perfil activo</span>
                    {data.treatments.some((t) => t.estado_tratamiento === "ACTIVO") && (
                      <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-black text-emerald-100">Plan en curso</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white/15 text-3xl shadow-inner shadow-white/10">
                      {patient.nombres_paciente.charAt(0)}{patient.apellidos_paciente.charAt(0)}
                    </span>
                    <div>
                      <h2 className="break-words text-2xl font-black sm:text-3xl">{patient.nombres_paciente} {patient.apellidos_paciente}</h2>
                      <p className="mt-1 text-sm font-semibold text-violet-100">Información guardada por tu equipo de ASHAKids.</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Btn variant="cta" className="rounded-full" onClick={() => (mode === "home" ? navigate("/padre?section=journey") : go("padre/agenda"))}>
                      {mode === "home" ? "Ver Mi Camino ASHA" : "Ir a agenda"}<ArrowRight size={16} />
                    </Btn>
                    <Btn variant="outline" className="rounded-full !border-white/30 !bg-white/10 !text-white hover:!bg-white/20" onClick={() => go("padre/config")}>
                      Gestionar hijos
                    </Btn>
                  </div>
                </div>
                <div className="hidden shrink-0 lg:block"><Ashi size={124} mood="happy" /></div>
              </div>
            </section>
          )}

          <IntroductionStatus key={patient.id_paciente} patientId={patient.id_paciente} />

          {mode === "home" && data.treatments.some((t) => t.estado_tratamiento === "ACTIVO" && t.id_sesion_origen) && (
            <section className="family-plan space-y-3">
              <h2 className="text-xl font-black text-[#5B21B6]">Plan vigente</h2>
              {data.treatments.filter((t) => t.estado_tratamiento === "ACTIVO" && t.id_sesion_origen).map((t) => (
                <div key={t.id_tratamiento} className="text-[#4B4264] space-y-3 rounded-3xl bg-white p-5 sm:p-6 border border-[#E8E5F4]">
                  <div className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
                    <p className="font-extrabold text-[#1C1135]">{t.nombre_tratamiento} · {t.terapeuta_nombre}</p>
                    <p className="text-sm text-[#615274] mt-1">
                      {t.area && areaLabels[t.area]} · {t.sesiones_recomendadas ? `${t.sesiones_recomendadas} sesiones recomendadas` : "Sesiones según evolución"} · Mes: {t.fecha_inicio}
                    </p>
                  </div>
                  {!!t.mundos_asignados?.length && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                      <p className="text-xs font-black text-amber-900 mb-0.5">Mundos asignados en este plan:</p>
                      <p className="text-xs font-bold text-amber-800">{t.mundos_asignados.map((w) => areaLabels[w]).join(", ")}</p>
                    </div>
                  )}
                  <Btn variant="cta" className="rounded-full" onClick={() => go("mundo-asha")}>
                    <Sparkles size={16} aria-hidden="true" /> Practicar en Mundo ASHA
                  </Btn>
                </div>
              ))}
            </section>
          )}

          {!embedded && (
            <dl aria-label="Registros del hijo seleccionado" className="family-stats grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metrics.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="group rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-violet-100/50 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                    <div className="flex items-start justify-between gap-2">
                      <span className={`grid h-10 w-10 place-items-center rounded-2xl ${s.tone}`}><Icon size={18} aria-hidden="true" /></span>
                      <span className="text-xs font-black text-[#B0A8C1]">ASHA</span>
                    </div>
                    <dd className={`mt-4 break-words font-black ${typeof s.value === "number" ? "text-2xl" : "text-base"} text-[#1C1135]`}>{s.value}</dd>
                    <dt className="mt-1 text-xs font-bold text-[#615274]">{s.label}</dt>
                  </div>
                );
              })}
            </dl>
          )}

          {mode === "journey" && (
            <div role="group" aria-label="Secciones del seguimiento" className="flex flex-wrap items-center gap-1.5 rounded-3xl border border-violet-100 bg-white/80 p-2 shadow-sm shadow-violet-100/40">
              <span className="hidden px-3 text-xs font-black uppercase tracking-wider text-[#9E95B7] lg:block">Explora tu seguimiento</span>
              {tabs.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700 ${
                    tab === t ? "bg-violet-700 text-white shadow-md shadow-violet-200" : "text-[#615274] hover:bg-violet-50 hover:text-violet-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {(mode === "home" || tab === "Resumen") && (
            <>
              {!embedded && <Milestones summary={summary} />}
              <div className="family-workspace grid lg:grid-cols-2 gap-5 items-start">
                <Crd className="relative overflow-hidden p-5 sm:p-6 space-y-4">
                  <div aria-hidden="true" className="pointer-events-none absolute top-3 right-3 h-16 w-20 opacity-50" style={dotPatternStyle} />
                  <div className="relative">
                    <h2 className="text-xl font-black text-[#5B21B6] tracking-tight">Próxima cita o sesión en curso</h2>
                    <p className="mt-1 text-sm font-semibold text-[#615274]">Detalle de tu próximo encuentro programado.</p>
                  </div>
                  {summary.next ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
                        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#5B21B6]"><User size={14} aria-hidden="true" /> Especialista</p>
                        <p className="mt-1 font-extrabold text-[#1C1135] break-words">{summary.next.terapeuta_nombre}</p>
                      </div>
                      <div className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
                        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#5B21B6]"><Clock size={14} aria-hidden="true" /> Fecha y modalidad</p>
                        <p className="mt-1 text-sm font-bold text-[#1C1135] flex flex-wrap items-center gap-2">
                          <span>{familyDate(summary.next.fecha_hora_inicio)} · {familyTime(summary.next.fecha_hora_inicio)}</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white border border-[#DDD6FE] px-2.5 py-0.5 text-xs font-extrabold text-[#5B21B6]">
                            {summary.next.modalidad === "VIRTUAL" ? <Video size={12} aria-hidden="true" /> : <MapPin size={12} aria-hidden="true" />}
                            {summary.next.modalidad === "VIRTUAL" ? "Virtual" : "Presencial"}
                          </span>
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#DDD6FE] bg-[#F3EFFE]/75 px-4 py-3.5">
                        <p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#5B21B6]"><CheckCircle2 size={14} aria-hidden="true" /> Estado de cita</p>
                        <p className="mt-1 text-sm font-bold text-[#4B4264]">Estado de cita: {reservationStatusLabel(summary.next.estado_reserva)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[#DDD6FE] bg-[#FBFAFF] p-4 text-sm font-medium text-[#615274]">
                      No hay próximas citas ni sesiones en curso para este hijo.
                    </div>
                  )}
                  <Btn variant="cta" className="rounded-full" onClick={() => go("padre/agenda")}>
                    <CalendarDays size={16} aria-hidden="true" />
                    {summary.next ? "Consultar o reprogramar en agenda" : "Ir a agenda para reservar"}
                  </Btn>
                </Crd>

                <Crd className="p-5 sm:p-6">
                  <ReportSummary data={data} />
                  <Btn variant="cta" className="mt-5 rounded-full" onClick={() => go("padre/reportes")}>
                    <FileText size={16} aria-hidden="true" /> Ver reportes de la familia
                  </Btn>
                </Crd>
              </div>
            </>
          )}

          {mode === "journey" && tab === "Planes" && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-[#5B21B6] tracking-tight">Planes de trabajo</h2>
                {data.treatments.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3EFFE] border border-[#DDD6FE] px-3 py-1 text-xs font-extrabold text-[#5B21B6]">
                    {data.treatments.length} {data.treatments.length === 1 ? "plan" : "planes"}
                  </span>
                )}
              </div>
              {!data.treatments.length && (
                <div className="rounded-2xl border border-dashed border-[#DDD6FE] bg-white p-6 text-sm font-medium text-[#615274]">
                  Todavía no hay un plan publicado para este hijo. Primero completa su introducción.
                </div>
              )}
              <div className="space-y-4">
                {data.treatments.map((t) => (
                  <Crd key={t.id_tratamiento} className="relative overflow-hidden p-5 sm:p-6 space-y-4">
                    <div aria-hidden="true" className="pointer-events-none absolute top-3 right-3 h-14 w-20 opacity-45" style={dotPatternStyle} />
                    <div className="relative flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[#5B21B6] break-words">{t.nombre_tratamiento}</h3>
                        <p className="mt-0.5 text-sm font-semibold text-[#615274] break-words">{t.terapeuta_nombre} · {t.estado_tratamiento}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${t.estado_tratamiento === "ACTIVO" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-[#F3EFFE] text-[#5B21B6] border border-[#DDD6FE]"}`}>
                        {t.estado_tratamiento}
                      </span>
                    </div>
                    {t.descripcion && <PlanNarrative description={t.descripcion} />}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-[#F8F7FC] px-3 py-1 text-xs font-bold text-[#4B4264]">
                        <Target size={13} className="text-[#6B46FE]" aria-hidden="true" />
                        {t.area ? areaLabels[t.area] : "Plan anterior al nuevo flujo"} · Mes: {t.fecha_inicio ?? "Sin fecha"}{t.id_sesion_origen ? ` · Origen: sesión #${t.id_sesion_origen}` : ""}
                      </span>
                      {t.sesiones_recomendadas != null && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD6FE] bg-[#F8F7FC] px-3 py-1 text-xs font-bold text-[#4B4264]">
                          <CalendarDays size={13} className="text-[#6B46FE]" aria-hidden="true" />
                          Sesiones recomendadas: {t.sesiones_recomendadas}
                        </span>
                      )}
                      {!!t.mundos_asignados?.length && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                          <Sparkles size={13} className="text-amber-600" aria-hidden="true" />
                          Mundos: {t.mundos_asignados.map((w) => areaLabels[w]).join(", ")}
                        </span>
                      )}
                    </div>
                    {!!t.mundos_asignados?.length && (
                      <div>
                        <Btn variant="cta" className="rounded-full" onClick={() => go("mundo-asha")}>
                          <Sparkles size={15} aria-hidden="true" /> Practicar en Mundo ASHA
                        </Btn>
                      </div>
                    )}
                  </Crd>
                ))}
              </div>
            </section>
          )}

          {mode === "journey" && (tab === "Sesiones" || tab === "Reportes") && (
            <History key={`${patient.id_paciente}:${tab}`} data={data} reportsOnly={tab === "Reportes"} />
          )}

          <p className="text-sm text-[#4B4264]">El número de sesiones no mide la mejoría clínica. Las recomendaciones para casa aparecen en el reporte del profesional.</p>
          <aside className="border-t border-[#E8E5F4] pt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-[#4B4264]">Mundo ASHA ofrece niveles de demostración en los mundos asignados por el profesional. El avance del juego no mide mejoría clínica.</p>
            <Btn variant="cta" size="sm" className="rounded-full" onClick={() => go("mundo-asha")}>Explorar demostración</Btn>
          </aside>
        </>
      )}
    </div>
  );
}
