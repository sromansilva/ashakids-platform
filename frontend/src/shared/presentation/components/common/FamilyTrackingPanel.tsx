import { areaLabels } from "./SessionPlan";
import { IntroductionStatus } from "./IntroductionStatus";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, CheckCircle2, Circle, FileText, HeartPulse, RefreshCw, Sparkles, Target, Users } from "lucide-react";
import { useFamilyTracking } from "@/modules/padre/application/useFamilyTracking";
import { ApiError } from "@/core/api/client";
import { familyDate, familyTime } from "@/modules/padre/application/familyTracking";
import { Ashi } from "@/shared/presentation/components/illustrations/Ashi";
import { B } from "@/shared/presentation/theme/brand/B";
import type { View } from "@/shared/domain/types/navigation";
import { Btn } from "./Btn";
import { Crd } from "./Crd";
import { SessionActions } from "./SessionActions";

type Tracking = ReturnType<typeof useFamilyTracking>;
const labels = { observaciones_iniciales: "Observaciones iniciales", objetivos_trabajados: "Objetivos trabajados", nivel_ayuda: "Nivel de ayuda", proximos_pasos: "Próximos pasos" } as const;
const tabs = ["Resumen", "Planes", "Sesiones", "Reportes"] as const;

function ReadError({ error, retry }: { error: unknown; retry: () => void }) {
  return <div role="alert" className="rounded-2xl bg-red-50 text-red-800 p-4 space-y-3">
    <p>{error instanceof ApiError && error.status === 0 ? "No pudimos cargar el seguimiento. Comprueba tu conexión y vuelve a intentarlo." : error instanceof Error ? error.message : "No pudimos cargar el seguimiento."}</p>
    <Btn variant="outline" onClick={retry}>Reintentar</Btn>
  </div>;
}

function Milestones({ summary }: { summary: NonNullable<Tracking["summary"]> }) {
  return <section aria-label="Recorrido registrado" className="family-milestones space-y-3">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-violet-700"><Sparkles size={14} aria-hidden="true" /> Tu avance</p>
        <h2 className="text-xl font-black text-[#1C1135]">Tu recorrido en ASHAKids</h2>
        <p className="mt-1 text-sm text-[#615274]">Un resumen de los pasos registrados por tu equipo.</p>
      </div>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700"><CheckCircle2 size={14} aria-hidden="true" /> {summary.milestones.filter(m => m.done).length} de {summary.milestones.length} completados</span>
    </div>
    <ol className="relative grid gap-3 pt-2 sm:grid-cols-2 lg:grid-cols-5">
      {summary.milestones.map((m, index) => <li key={m.title} className={`family-milestone-card relative rounded-2xl border p-4 transition-all ${m.done ? "border-violet-100 bg-violet-50/70" : "border-dashed border-[#D9D2EA] bg-[#FBFAFF]"}`}>
        <div className="mb-4 flex items-center justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-2xl text-lg ${m.done ? "bg-white text-violet-700 shadow-sm" : "bg-[#F0EDF8] text-[#9E95B7]"}`} aria-hidden="true">{["👤", "✨", "📄", "🧭", "🌱"][index] ?? (m.done ? "✓" : "•")}</span>
          <span className={`text-xs font-black ${m.done ? "text-emerald-600" : "text-[#9E95B7]"}`}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div className="flex items-start gap-2">
          {m.done ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" /> : <Circle size={16} className="mt-0.5 shrink-0 text-[#A9A1BB]" aria-hidden="true" />}
          <div className="min-w-0"><p className="font-extrabold leading-tight text-[#1C1135]">{m.title}</p><p className="mt-1 text-sm leading-relaxed text-[#615274]">{m.done ? m.detail : "Sin registro todavía"}</p></div>
        </div>
      </li>)}
    </ol>
  </section>;
}

function ReportSummary({ data }: { data: Tracking }) {
  const { summary, report } = data;
  const session = summary?.latestReportSession;
  return <section className="space-y-3" aria-label="Último reporte">
    <h2 className="text-lg font-extrabold text-[#1C1135]">Último reporte de sesión</h2>
    {!session && <p className="text-[#4B4264]">Todavía no hay reportes guardados para este hijo.</p>}
    {session && report.isPending && <p role="status">Cargando reporte…</p>}
    {session && report.error && <ReadError error={report.error} retry={() => void report.refetch()} />}
    {session && report.data && !report.error && <>
      <p className="text-sm text-[#4B4264]">{session.cita.terapeuta_nombre} · {familyDate(session.cita.fecha_hora_inicio)}</p>
      <dl className="space-y-4">{Object.entries(labels).map(([key, label]) => <div key={key}>
        <dt className="font-bold text-[#1C1135]">{label}</dt>
        <dd className="mt-1 text-[#4B4264] whitespace-pre-wrap break-words">{report.data[key as keyof typeof labels] || "No registrado"}</dd>
      </div>)}</dl>
    </>}
  </section>;
}

function History({ data, reportsOnly = false }: { data: Tracking; reportsOnly?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const rows = reportsOnly ? data.summary!.reportSessions : data.summary!.sessions;
  return <section className="space-y-3" aria-label={reportsOnly ? "Reportes guardados" : "Historial de sesiones"}>
    <h2 className="text-lg font-extrabold text-[#1C1135]">{reportsOnly ? "Reportes guardados" : "Historial de sesiones"}</h2>
    {!rows.length && <p className="text-[#4B4264]">{reportsOnly ? "Todavía no hay reportes guardados para este hijo." : "Todavía no hay sesiones registradas para este hijo."}</p>}
    {rows.map(s => <Crd key={s.id_sesion} className="p-4 sm:p-5">
      <button type="button" aria-expanded={open === s.id_sesion} aria-controls={`family-session-${s.id_sesion}`} onClick={() => setOpen(open === s.id_sesion ? null : s.id_sesion)}
        className="w-full text-left rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700">
        <span className="font-bold text-[#1C1135] block">Sesión #{s.id_sesion} · {familyDate(s.cita.fecha_hora_inicio)} · {familyTime(s.cita.fecha_hora_inicio)}</span>
        <span className="text-sm text-[#4B4264] block mt-1 break-words">{s.cita.terapeuta_nombre} · {s.estado_sesion} · {s.asistencia ?? "Asistencia pendiente"}</span>
        <span className="text-sm text-violet-800 block mt-2">{open === s.id_sesion ? "Ocultar detalle" : "Ver sesión y reporte"}</span>
      </button>
      {open === s.id_sesion && <div id={`family-session-${s.id_sesion}`}><SessionActions appointmentId={s.id_reserva} /></div>}
    </Crd>)}
  </section>;
}

export function FamilyTrackingPanel({ mode, go, familyName = "Familia", embedded = false }: { mode: "home" | "journey"; go: (view: View) => void; familyName?: string; embedded?: boolean }) {
  const navigate = useNavigate();
  const data = useFamilyTracking();
  const [tab, setTab] = useState<typeof tabs[number]>("Resumen");
  const { patient, summary } = data;
  const metrics = summary ? [
    { label: "Sesiones realizadas", value: summary.attended.length, icon: CalendarDays, tone: "text-violet-700 bg-violet-100" },
    { label: "Este mes", value: summary.thisMonth, icon: HeartPulse, tone: "text-teal-700 bg-teal-100" },
    { label: "Reportes disponibles", value: summary.reportSessions.length, icon: FileText, tone: "text-orange-700 bg-orange-100" },
    { label: "Progreso clínico", value: "Sin medición", icon: Target, tone: "text-sky-700 bg-sky-100" },
  ] : [];
  return <div style={{ fontFamily: '"Nunito", system-ui, sans-serif' }} className={`family-panel ${mode === "journey" ? "family-journey" : ""} mx-auto max-w-7xl space-y-6 p-4 pb-10 sm:p-6`}>
    {embedded && <div className="flex justify-end"><Btn variant="outline" disabled={data.refreshing} onClick={data.retry}><RefreshCw size={16} aria-hidden="true" className={data.refreshing ? "animate-spin" : ""} /> Actualizar seguimiento</Btn></div>}
    {!embedded && <header className="family-heading flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-700"><Sparkles size={14} aria-hidden="true" /> {mode === "home" ? "Centro familiar" : "Seguimiento familiar"}</p>
        <h1 className="text-3xl font-black tracking-tight text-[#1C1135] sm:text-4xl">{mode === "home" ? "Centro Familiar" : "Mi Camino ASHA"}</h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#615274]">{mode === "home" ? `Hola, ${familyName}. Consulta las citas y el seguimiento de tu familia.` : "Acompaña cada paso del desarrollo de tu hijo con información clara y cercana."}</p>
      </div>
      <Btn variant="outline" className="rounded-2xl border-violet-100 bg-white/80 shadow-sm" disabled={data.refreshing} onClick={data.retry}><RefreshCw size={16} aria-hidden="true" className={data.refreshing ? "animate-spin" : ""} /> Actualizar seguimiento</Btn>
    </header>}
    {!embedded && !!data.children.length && <div className="family-child-picker flex flex-col gap-3 rounded-3xl border border-violet-100 bg-white/80 p-4 shadow-sm shadow-violet-100/40 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-xl" aria-hidden="true">🧒</span><div><p className="text-xs font-black uppercase tracking-wider text-violet-700">Perfil que estás viendo</p><p className="text-sm text-[#615274]">Selecciona un hijo para ver su recorrido.</p></div></div>
      <label className="block text-sm font-extrabold text-[#1C1135] sm:min-w-64">Hijo o hija
        <select aria-label="Hijo o hija" value={patient?.id_paciente ?? ""} onChange={e => data.selectPatient(Number(e.target.value))} className="mt-1.5 block w-full rounded-2xl border border-[#D6CCEB] bg-white px-4 py-3 text-base font-bold text-[#1C1135] shadow-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
          {data.children.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombres_paciente} {p.apellidos_paciente}</option>)}
        </select>
      </label>
    </div>}
    {data.error ? <ReadError error={data.error} retry={data.retry} /> : data.pending ? <p role="status" className="py-6 text-[#4B4264]">Cargando seguimiento…</p> : !patient || !summary ?
      <Crd className="p-6 space-y-3"><Users size={28} className="text-violet-700" aria-hidden="true" /><h2 className="font-extrabold text-lg text-[#1C1135]">Aún no tienes hijos registrados</h2>
        <p className="text-[#4B4264]">Añade un perfil para consultar sus tratamientos, citas y reportes.</p><Btn onClick={() => go("padre/config")}>Gestionar hijos</Btn></Crd> : <>
      {!embedded && <section className="family-summary relative isolate overflow-hidden rounded-[2rem] p-6 text-white shadow-xl shadow-violet-200/40 sm:p-8" style={{ background: `linear-gradient(125deg, ${B.violetDeep} 0%, #4C1D95 58%, ${B.violet} 100%)` }}>
        <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-72 w-72 rounded-full bg-white/10" /><div className="pointer-events-none absolute -bottom-36 left-1/3 -z-10 h-72 w-72 rounded-full bg-orange-300/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-violet-100">Perfil activo</span>{data.treatments.some(t => t.estado_tratamiento === "ACTIVO") && <span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-black text-emerald-100">● Plan en curso</span>}</div>
            <div className="flex items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white/15 text-3xl shadow-inner shadow-white/10">{patient.nombres_paciente.charAt(0)}{patient.apellidos_paciente.charAt(0)}</span><div><h2 className="break-words text-2xl font-black sm:text-3xl">{patient.nombres_paciente} {patient.apellidos_paciente}</h2><p className="mt-1 text-sm font-semibold text-violet-100">Información guardada por tu equipo de ASHAKids.</p></div></div>
            <div className="mt-6 flex flex-wrap gap-3"><Btn variant="outline" className="!border-transparent !bg-white !text-violet-800 hover:!bg-violet-50" onClick={() => mode === "home" ? navigate("/padre?section=journey") : go("padre/agenda")}>{mode === "home" ? "Ver Mi Camino ASHA" : "Ir a agenda"}<ArrowRight size={16} /></Btn><Btn variant="outline" className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20" onClick={() => go("padre/config")}>Gestionar hijos</Btn></div>
          </div><div className="hidden shrink-0 lg:block"><Ashi size={124} mood="happy" /></div>
        </div>
      </section>}
      <IntroductionStatus key={patient.id_paciente} patientId={patient.id_paciente} />
      {mode === 'home' && data.treatments.some(t => t.estado_tratamiento === 'ACTIVO' && t.id_sesion_origen) && <section className="family-plan space-y-3"><h2 className="text-lg font-extrabold">Plan vigente</h2>{data.treatments.filter(t => t.estado_tratamiento === 'ACTIVO' && t.id_sesion_origen).map(t => <div key={t.id_tratamiento} className="text-[#4B4264] space-y-2"><p className="font-bold">{t.nombre_tratamiento} · {t.terapeuta_nombre}</p><p>{t.area && areaLabels[t.area]} · {t.sesiones_recomendadas} sesiones recomendadas · Mes: {t.fecha_inicio}</p><p>Mundos: {t.mundos_asignados?.map(w => areaLabels[w]).join(', ')}</p><Btn variant="outline" onClick={() => go('mundo-asha')}>Practicar en Mundo ASHA</Btn></div>)}</section>}
      {!embedded && <dl aria-label="Registros del hijo seleccionado" className="family-stats grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(s => { const Icon = s.icon; return <div key={s.label} className="group rounded-3xl border border-white/80 bg-white/85 p-4 shadow-sm shadow-violet-100/50 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"><div className="flex items-start justify-between gap-2"><span className={`grid h-10 w-10 place-items-center rounded-2xl ${s.tone}`}><Icon size={18} aria-hidden="true" /></span><span className="text-xs font-black text-[#B0A8C1]">ASHA</span></div><dd className={`mt-4 break-words font-black ${typeof s.value === "number" ? "text-2xl" : "text-base"} text-[#1C1135]`}>{s.value}</dd><dt className="mt-1 text-xs font-bold text-[#615274]">{s.label}</dt></div>; })}
      </dl>}
      {mode === "journey" && <div role="group" aria-label="Secciones del seguimiento" className="flex flex-wrap items-center gap-1.5 rounded-3xl border border-violet-100 bg-white/80 p-2 shadow-sm shadow-violet-100/40"><span className="hidden px-3 text-xs font-black uppercase tracking-wider text-[#9E95B7] lg:block">Explora tu seguimiento</span>{tabs.map(t => <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700 ${tab === t ? "bg-violet-700 text-white shadow-md shadow-violet-200" : "text-[#615274] hover:bg-violet-50 hover:text-violet-800"}`}>{t}</button>)}</div>}
      {(mode === "home" || tab === "Resumen") && <>
        {!embedded && <Milestones summary={summary} />}
        <div className="family-workspace grid lg:grid-cols-2 gap-5 items-start">
          <Crd className="p-5 sm:p-6 space-y-3"><CalendarDays size={22} className="text-violet-700" aria-hidden="true" /><h2 className="text-lg font-extrabold text-[#1C1135]">Próxima cita o sesión en curso</h2>
            {summary.next ? <><p className="font-bold text-[#1C1135] break-words">{summary.next.terapeuta_nombre}</p><p className="text-[#4B4264]">{familyDate(summary.next.fecha_hora_inicio)} · {familyTime(summary.next.fecha_hora_inicio)} · {summary.next.modalidad}</p><p className="text-sm text-[#4B4264]">Estado de cita: {summary.next.estado_reserva}</p></> : <p className="text-[#4B4264]">No hay próximas citas ni sesiones en curso para este hijo.</p>}
            <Btn onClick={() => go("padre/agenda")}>{summary.next ? "Consultar o reprogramar en agenda" : "Ir a agenda para reservar"}</Btn>
          </Crd>
          <Crd className="p-5 sm:p-6"><ReportSummary data={data} /><Btn variant="outline" className="mt-4" onClick={() => go("padre/reportes")}><FileText size={16} aria-hidden="true" /> Ver reportes de la familia</Btn></Crd>
        </div>
      </>}
      {mode === "journey" && tab === "Planes" && <section className="space-y-3"><h2 className="text-lg font-extrabold text-[#1C1135]">Planes de trabajo</h2>
        {!data.treatments.length && <p className="text-[#4B4264]">Todavía no hay un plan publicado para este hijo. Primero completa su introducción.</p>}
        {data.treatments.map(t => <Crd key={t.id_tratamiento} className="p-5 space-y-2"><h3 className="font-bold text-[#1C1135] break-words">{t.nombre_tratamiento}</h3><p className="text-[#4B4264] break-words">{t.terapeuta_nombre} · {t.estado_tratamiento}</p>{t.descripcion && <p className="text-[#4B4264] whitespace-pre-wrap break-words">{t.descripcion}</p>}<p className="text-sm text-[#4B4264]">{t.area ? areaLabels[t.area] : "Plan anterior al nuevo flujo"} · Mes: {t.fecha_inicio ?? "Sin fecha"}{t.id_sesion_origen ? ` · Origen: sesión #${t.id_sesion_origen}` : ""}</p>{!!t.mundos_asignados?.length && <p className="text-sm text-[#4B4264]">Mundos: {t.mundos_asignados.map(w => areaLabels[w]).join(", ")}</p>}{t.sesiones_recomendadas != null && <p className="text-sm text-[#4B4264]">Sesiones recomendadas: {t.sesiones_recomendadas}</p>}</Crd>)}
      </section>}
      {mode === "journey" && (tab === "Sesiones" || tab === "Reportes") && <History key={`${patient.id_paciente}:${tab}`} data={data} reportsOnly={tab === "Reportes"} />}
      <p className="text-sm text-[#4B4264]">El número de sesiones no mide la mejoría clínica. Las recomendaciones para casa aparecen en el reporte del profesional.</p>
      <aside className="border-t border-[#E8E5F4] pt-4 flex flex-wrap items-center gap-3"><p className="text-sm text-[#4B4264]">Mundo ASHA ofrece niveles de demostración en los mundos asignados por el profesional. El avance del juego no mide mejoría clínica.</p><Btn variant="ghost" onClick={() => go("mundo-asha")}>Explorar demostración</Btn></aside>
    </>}
  </div>;
}
