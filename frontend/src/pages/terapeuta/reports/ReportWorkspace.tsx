import { useRemote } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { ClinicalReportEditor, emptyReport, reportLabels } from '@/components/common/ClinicalReportEditor';
import { ReportDownload } from '@/components/common/ReportDownload';
import type { Session } from '@/types/clinical';
import type { ReportData } from '@/types/clinical';
import { useEffect, useState } from 'react';

export function ReportWorkspace({ session, readOnly = false }: { session: Session; readOnly?: boolean }) {
  const report = useRemote(['report', session.id_sesion], signal => sessionsService.report(session.id_sesion, signal), session.reporte_disponible);
  const [initialForm, setInitialForm] = useState<ReportData | null>(session.reporte_disponible ? null : emptyReport);
  useEffect(() => {
    if (report.isSuccess && !report.error) setInitialForm(current => current ?? report.data);
  }, [report.data, report.isSuccess, report.error]);
  const canEdit = !readOnly && session.puede_editar !== false && ['EN_CURSO', 'FINALIZADA'].includes(session.estado_sesion) && session.asistencia !== 'NO_ASISTIO';
  return <div className="space-y-5 p-6">
    <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">Información general</p><div className="professional-report-meta grid gap-3 sm:grid-cols-3">{[
      ['Paciente', session.cita.paciente_nombre], ['Fecha', new Date(session.cita.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima' })], ['Estado', session.estado_sesion],
    ].map(([label, value]) => <div key={label} className="rounded-xl p-3 bg-[#F5F3FF]"><p className="mb-1 text-xs font-medium text-[#9E95B7]">{label}</p><p className="text-sm font-extrabold text-[#1C1135]">{value}</p></div>)}</div></div>
    {session.reporte_disponible && <RemoteFeedback pending={report.isPending} error={report.error} retry={() => void report.refetch()}/>}
    {canEdit && !report.error && initialForm && <ClinicalReportEditor id={session.id_sesion} initial={initialForm}/>}
    {!canEdit && report.data && !report.error && <dl className="space-y-5">{Object.entries(reportLabels).map(([key, label]) => <div key={key}><dt className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">{label}</dt><dd className="text-sm whitespace-pre-wrap font-medium leading-relaxed text-[#4A4560]">{report.data[key as keyof typeof reportLabels] || 'No registrado'}</dd></div>)}</dl>}
    {report.isSuccess && !report.error && !report.isFetching && <ReportDownload sessionId={session.id_sesion}/>}
    <div className="border-t border-[#E8E5F4] pt-5"><p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-600">Profesional de la sesión</p><div className="rounded-2xl p-4 bg-teal-50"><p className="font-extrabold text-[#1C1135]">{session.cita.terapeuta_nombre}</p><p className="text-xs text-[#7C6F9A]">La API guarda el reporte, pero no registra firmas digitales ni envíos por correo.</p></div></div>
  </div>;
}
