import { useEffect, useState } from "react";
import { useRemote, useWrite } from "@/hooks/useRemoteData";
import { appointmentsService, sessionsService } from "@/services/clinicalService";
import { useAuth } from "@/hooks/useAuth";
import type { ReportData } from "@/types/clinical";
import { ClinicalReportEditor, reportLabels as labels, emptyReport } from './ClinicalReportEditor';
import { Btn } from "./Btn";
import { RemoteFeedback } from "./RemoteFeedback";
import { ReportDownload } from "./ReportDownload";
import { VirtualMeeting } from "./VirtualMeeting";
import { SessionPlan } from "./SessionPlan";
export function SessionActions({ appointmentId }: { appointmentId: number }) {
  const [closing, setClosing] = useState<'ASISTIO' | 'NO_ASISTIO' | null>(null);
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const { role } = useAuth(); const professional = role === 'ADMIN' || role === 'TERAPEUTA';
  const appointment = useRemote(['appointment', appointmentId], s => appointmentsService.get(appointmentId, s));
  const id = appointment.data?.id_sesion;
  const session = useRemote(['session', id], s => sessionsService.get(id!, s), !!id);
  const report = useRemote(['report', id], s => sessionsService.report(id!, s), !!id && !!session.data?.reporte_disponible);
  const create = useWrite(() => sessionsService.create(appointmentId));
  const start = useWrite(() => sessionsService.start(id!));
  const close = useWrite((asistencia: 'ASISTIO' | 'NO_ASISTIO') => sessionsService.close(id!, asistencia));
  const s = appointment.error || session.error ? undefined : session.data;
  const busy = create.isPending || start.isPending || close.isPending;
  const ownsSession = professional && s?.puede_editar !== false;
  const canEdit = ownsSession && !!s && ['EN_CURSO', 'FINALIZADA'].includes(s.estado_sesion) && s.asistencia !== 'NO_ASISTIO';
  return <section className="mt-4 border-t border-[#E8E5F4] pt-4 space-y-3"><h3 className="font-extrabold text-[#1C1135]">Sesión y reporte clínico</h3>
    <RemoteFeedback pending={appointment.isPending || (!!id && session.isPending)} error={appointment.error || session.error || create.error || start.error || close.error} retry={() => { void appointment.refetch(); if (id) void session.refetch(); }} />
    {appointment.data && !appointment.error && <VirtualMeeting key={appointmentId} appointment={appointment.data} professional={professional}/> }
    {!id && appointment.isSuccess && <><p className="text-sm text-[#7C6F9A]">Sin sesión registrada.</p>{professional && appointment.data.puede_editar !== false && <Btn disabled={busy || appointment.data.estado_reserva !== 'CONFIRMADA'} onClick={() => void create.submit(undefined)}>Registrar sesión</Btn>}</>}
    {s && <><p className="text-sm font-bold">Sesión #{id} · {s.estado_sesion} · {s.asistencia ?? 'Asistencia pendiente'}</p><div className="flex gap-2 flex-wrap">
      {ownsSession && s.estado_sesion === 'PROGRAMADA' && <><Btn disabled={busy || now < Date.parse(s.cita.fecha_hora_inicio)} onClick={() => void start.submit(undefined)}>Iniciar sesión clínica</Btn><Btn variant="outline" disabled={busy || now < Date.parse(s.cita.fecha_hora_fin)} onClick={() => setClosing('NO_ASISTIO')}>Registrar inasistencia</Btn></>}
      {ownsSession && s.estado_sesion === 'EN_CURSO' && <Btn disabled={busy} onClick={() => setClosing('ASISTIO')}>Finalizar sesión</Btn>}
      <Btn variant="ghost" onClick={() => void session.refetch()}>Actualizar estado</Btn>
    </div>{closing && s.estado_sesion !== 'FINALIZADA' && <div className="rounded-xl bg-[#F5F3FF] p-4 space-y-3" role="group" aria-label="Confirmar cierre clínico"><p className="font-bold">{closing === 'ASISTIO' ? '¿Finalizar la sesión y registrar asistencia?' : '¿Registrar inasistencia y cerrar esta sesión?'}</p><div className="flex gap-3 flex-wrap"><Btn disabled={busy} onClick={() => void close.submit(closing)}>Confirmar cierre</Btn><Btn variant="ghost" disabled={busy} onClick={() => setClosing(null)}>Continuar sesión</Btn></div></div>}{s.reporte_disponible && <RemoteFeedback pending={report.isPending} error={report.error} retry={() => void report.refetch()} />}
      {canEdit && (!s.reporte_disponible || (report.isSuccess && !report.error)) && <ClinicalReportEditor key={id} id={id!} initial={report.data ?? emptyReport} />}
      {!canEdit && report.data && !report.error && <dl className="space-y-2">{Object.entries(labels).map(([key, label]) => <div key={key}><dt className="font-bold text-sm">{label}</dt><dd className="text-sm whitespace-pre-wrap">{report.data[key as keyof ReportData] || 'No registrado'}</dd></div>)}</dl>}
      <SessionPlan session={s} />
      {report.isSuccess && !report.isFetching && s.reporte_disponible && <ReportDownload key={`pdf-${id}`} sessionId={id!} />}
    </>}
  </section>;
}
