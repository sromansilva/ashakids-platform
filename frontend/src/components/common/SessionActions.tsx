import { useState } from "react";
import { useRemote, useWrite } from "@/hooks/useRemoteData";
import { appointmentsService, sessionsService } from "@/services/clinicalService";
import { useAuth } from "@/hooks/useAuth";
import type { ReportData } from "@/types/clinical";
import { Btn } from "./Btn";
import { RemoteFeedback } from "./RemoteFeedback";
import { ReportDownload } from "./ReportDownload";
const labels = { observaciones_iniciales: 'Observaciones iniciales', objetivos_trabajados: 'Objetivos trabajados', nivel_ayuda: 'Nivel de ayuda', proximos_pasos: 'Próximos pasos' } as const;
function ReportEditor({ id, initial }: { id: number; initial: ReportData }) {
  const [form, setForm] = useState(initial);
  const save = useWrite(() => sessionsService.saveReport(id, form));
  return <form className="space-y-3" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
    {Object.entries(labels).map(([key, label]) => <label className="block text-sm font-bold text-[#1C1135]" key={key}>{label}<textarea maxLength={10000} className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] p-3 min-h-24" value={form[key as keyof ReportData] ?? ''} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
    <p className="text-xs text-[#7C6F9A]">Reporte compartido con la familia. Las notas privadas no forman parte de estos campos.</p>
    <RemoteFeedback error={save.error} />{save.isSuccess && <p role="status">Reporte guardado en el servidor.</p>}<Btn type="submit" disabled={save.isPending}>Guardar reporte</Btn>
  </form>;
}
export function SessionActions({ appointmentId }: { appointmentId: number }) {
  const { role } = useAuth(); const professional = role === 'ADMIN' || role === 'TERAPEUTA';
  const appointment = useRemote(['appointment', appointmentId], s => appointmentsService.get(appointmentId, s));
  const id = appointment.data?.id_sesion;
  const session = useRemote(['session', id], s => sessionsService.get(id!, s), !!id);
  const report = useRemote(['report', id], s => sessionsService.report(id!, s), !!id && !!session.data?.reporte_disponible);
  const create = useWrite(() => sessionsService.create(appointmentId));
  const start = useWrite(() => sessionsService.start(id!));
  const close = useWrite((asistencia: 'ASISTIO' | 'NO_ASISTIO') => sessionsService.close(id!, asistencia));
  const s = session.data; const busy = create.isPending || start.isPending || close.isPending;
  const canEdit = professional && !!s && ['EN_CURSO', 'FINALIZADA'].includes(s.estado_sesion);
  return <section className="mt-4 border-t border-[#E8E5F4] pt-4 space-y-3"><h3 className="font-extrabold text-[#1C1135]">Sesión y reporte clínico</h3>
    <RemoteFeedback pending={appointment.isPending || (!!id && session.isPending)} error={appointment.error || session.error || create.error || start.error || close.error} retry={() => { void appointment.refetch(); if (id) void session.refetch(); }} />
    {!id && appointment.isSuccess && <><p className="text-sm text-[#7C6F9A]">Sin sesión registrada.</p>{professional && <Btn disabled={busy || appointment.data.estado_reserva !== 'CONFIRMADA'} onClick={() => void create.submit(undefined)}>Registrar sesión</Btn>}</>}
    {s && <><p className="text-sm font-bold">Sesión #{id} · {s.estado_sesion} · {s.asistencia ?? 'Asistencia pendiente'}</p><div className="flex gap-2 flex-wrap">
      {professional && s.estado_sesion === 'PROGRAMADA' && <><Btn disabled={busy || Date.now() < Date.parse(s.cita.fecha_hora_inicio)} onClick={() => void start.submit(undefined)}>Iniciar sesión clínica</Btn><Btn variant="outline" disabled={busy || Date.now() < Date.parse(s.cita.fecha_hora_fin)} onClick={() => { if (window.confirm('¿Registrar inasistencia?')) void close.submit('NO_ASISTIO'); }}>Registrar inasistencia</Btn></>}
      {professional && s.estado_sesion === 'EN_CURSO' && <Btn disabled={busy} onClick={() => { if (window.confirm('¿Finalizar la sesión?')) void close.submit('ASISTIO'); }}>Finalizar sesión</Btn>}
      <Btn variant="ghost" onClick={() => void session.refetch()}>Actualizar estado</Btn>
    </div>{s.reporte_disponible && <RemoteFeedback pending={report.isPending} error={report.error} retry={() => void report.refetch()} />}
      {canEdit && (!s.reporte_disponible || report.isSuccess) && <ReportEditor key={id} id={id!} initial={report.data ?? { observaciones_iniciales: '', objetivos_trabajados: '', nivel_ayuda: '', proximos_pasos: '' }} />}
      {!canEdit && report.data && <dl className="space-y-2">{Object.entries(labels).map(([key, label]) => <div key={key}><dt className="font-bold text-sm">{label}</dt><dd className="text-sm whitespace-pre-wrap">{report.data[key as keyof ReportData] || 'No registrado'}</dd></div>)}</dl>}
      {report.isSuccess && !report.isFetching && s.reporte_disponible && <ReportDownload key={`pdf-${id}`} sessionId={id!} />}
    </>}
  </section>;
}
