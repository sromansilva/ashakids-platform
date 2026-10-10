import { areaLabels } from "./SessionPlan";
import { IntroductionStatus } from "./IntroductionStatus";
import { useState } from "react";
import { CalendarDays, CheckCircle2, Circle, FileText, RefreshCw, Users } from "lucide-react";
import { useFamilyTracking } from "@/hooks/useFamilyTracking";
import { ApiError } from "@/api/client";
import { familyDate, familyTime } from "@/services/familyTracking";
import { Ashi } from "@/components/illustrations/Ashi";
import { B } from "@/theme/brand/B";
import type { View } from "@/types/navigation";
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
  return <section aria-label="Recorrido registrado" className="space-y-3">
    <h2 className="text-lg font-extrabold text-[#1C1135]">Tu recorrido en ASHAKids</h2>
    <p className="text-sm text-[#4B4264]">Estos estados corresponden a registros guardados, no a una medición de mejoría clínica.</p>
    <ol className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {summary.milestones.map(m => <li key={m.title} className="rounded-2xl border border-[#E8E5F4] p-4 bg-white">
        {m.done ? <CheckCircle2 size={20} className="text-emerald-700 mb-2" aria-hidden="true" /> : <Circle size={20} className="text-[#7C6F9A] mb-2" aria-hidden="true" />}
        <p className="font-bold text-[#1C1135]">{m.title}</p>
        <p className="text-sm text-[#4B4264] mt-1">{m.done ? m.detail : "Sin registro"}</p>
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

export function FamilyTrackingPanel({ mode, go, familyName = "Familia" }: { mode: "home" | "journey"; go: (view: View) => void; familyName?: string }) {
  const data = useFamilyTracking();
  const [tab, setTab] = useState<typeof tabs[number]>("Resumen");
  const { patient, summary } = data;
  return <div style={{ fontFamily: '"Nunito", system-ui, sans-serif' }} className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><h1 className="text-2xl sm:text-3xl font-black text-[#1C1135]">{mode === "home" ? "Centro Familiar" : "Mi Camino ASHA"}</h1>
        <p className="mt-2 text-[#4B4264] break-words">{mode === "home" ? `Hola, ${familyName}. Consulta las citas y el seguimiento de tu familia.` : "Sesiones, tratamientos y recomendaciones guardados por tu profesional."}</p></div>
      <Btn variant="outline" disabled={data.refreshing} onClick={data.retry}><RefreshCw size={16} aria-hidden="true" /> Actualizar seguimiento</Btn>
    </header>
    {!!data.children.length && <label className="block max-w-lg text-sm font-bold text-[#1C1135]">Hijo o hija
      <select value={patient?.id_paciente ?? ""} onChange={e => data.selectPatient(Number(e.target.value))} className="mt-2 block w-full rounded-2xl border border-[#C8C2DC] bg-white px-4 py-3 text-base focus:outline-violet-700">
        {data.children.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombres_paciente} {p.apellidos_paciente}</option>)}
      </select>
    </label>}
    {data.error ? <ReadError error={data.error} retry={data.retry} /> : data.pending ? <p role="status" className="py-6 text-[#4B4264]">Cargando seguimiento…</p> : !patient || !summary ?
      <Crd className="p-6 space-y-3"><Users size={28} className="text-violet-700" aria-hidden="true" /><h2 className="font-extrabold text-lg text-[#1C1135]">Aún no tienes hijos registrados</h2>
        <p className="text-[#4B4264]">Añade un perfil para consultar sus tratamientos, citas y reportes.</p><Btn onClick={() => go("padre/config")}>Gestionar hijos</Btn></Crd> : <>
      <section className="rounded-3xl p-5 sm:p-6 text-white flex items-center justify-between gap-4" style={{ background: `linear-gradient(135deg, ${B.violetDeep}, ${B.violet})` }}>
        <div className="min-w-0"><h2 className="font-black text-xl sm:text-2xl break-words">Seguimiento de {patient.nombres_paciente} {patient.apellidos_paciente}</h2>
          <p className="mt-2 text-violet-100">Información de sus registros en ASHAKids.</p>
          <div className="flex flex-wrap gap-3 mt-4"><Btn variant="outline" onClick={() => go(mode === "home" ? "padre/camino" : "padre/agenda")}>{mode === "home" ? "Ver Mi Camino ASHA" : "Ir a agenda"}</Btn><Btn variant="outline" onClick={() => go("padre/config")}>Gestionar hijos</Btn></div>
        </div><div className="hidden sm:block shrink-0"><Ashi size={88} mood="happy" /></div>
      </section>
      <IntroductionStatus key={patient.id_paciente} patientId={patient.id_paciente} />
      {mode === 'home' && data.treatments.some(t => t.estado_tratamiento === 'ACTIVO' && t.id_sesion_origen) && <section className="space-y-3"><h2 className="text-lg font-extrabold">Plan vigente</h2>{data.treatments.filter(t => t.estado_tratamiento === 'ACTIVO' && t.id_sesion_origen).map(t => <div key={t.id_tratamiento} className="text-[#4B4264] space-y-2"><p className="font-bold">{t.nombre_tratamiento} · {t.terapeuta_nombre}</p><p>{t.area && areaLabels[t.area]} · {t.sesiones_recomendadas} sesiones recomendadas · Mes: {t.fecha_inicio}</p><p>Mundos: {t.mundos_asignados?.map(w => areaLabels[w]).join(', ')}</p><Btn variant="outline" onClick={() => go('mundo-asha')}>Practicar en Mundo ASHA</Btn></div>)}</section>}
      <dl aria-label="Registros del hijo seleccionado" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{ label: "Sesiones realizadas", value: summary.attended.length }, { label: "Realizadas este mes", value: summary.thisMonth }, { label: "Reportes disponibles", value: summary.reportSessions.length }, { label: "Progreso clínico", value: "Sin medición" }].map(s =>
          <div key={s.label} className="rounded-2xl border border-[#E8E5F4] bg-white p-4"><dt className="text-sm text-[#4B4264]">{s.label}</dt><dd className={`font-black ${typeof s.value === "number" ? "text-xl" : "text-base"} text-[#1C1135] mt-2 break-words`}>{s.value}</dd></div>)}
      </dl>
      {mode === "journey" && <div role="group" aria-label="Secciones del seguimiento" className="flex flex-wrap gap-2">{tabs.map(t => <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={`rounded-2xl px-4 py-2 font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-700 ${tab === t ? "bg-violet-700 text-white" : "bg-white border border-[#E8E5F4] text-[#4B4264] hover:bg-violet-50"}`}>{t}</button>)}</div>}
      {(mode === "home" || tab === "Resumen") && <>
        <Milestones summary={summary} />
        <div className="grid lg:grid-cols-2 gap-5 items-start">
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
