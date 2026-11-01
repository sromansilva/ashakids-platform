import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { ClinicalReportEditor, emptyReport, reportLabels } from '@/shared/presentation/components/common/ClinicalReportEditor';
import { ReportDownload } from '@/shared/presentation/components/common/ReportDownload';
import { SessionPlan } from '@/shared/presentation/components/common/SessionPlan';
import type { Session } from '@/modules/clinica/domain/clinical';
import type { ReportData } from '@/modules/clinica/domain/clinical';
import { useEffect, useState } from 'react';
import { User, Calendar, FileText } from 'lucide-react';

export function ReportWorkspace({ session, readOnly = false }: { session: Session; readOnly?: boolean }) {
  const report = useRemote(
    ['report', session.id_sesion],
    (signal) => sessionsService.report(session.id_sesion, signal),
    session.reporte_disponible
  );
  const [initialForm, setInitialForm] = useState<ReportData | null>(session.reporte_disponible ? null : emptyReport);
  useEffect(() => {
    if (report.isSuccess && !report.error) setInitialForm((current) => current ?? report.data ?? emptyReport);
  }, [report.data, report.isSuccess, report.error]);
  const canEdit =
    !readOnly &&
    session.puede_editar !== false &&
    ['EN_CURSO', 'FINALIZADA'].includes(session.estado_sesion) &&
    session.asistencia !== 'NO_ASISTIO';

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-2 2xl:grid-cols-4">
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EDE9FE] text-[#6B46FE]"><User size={15} /></span>
          <div className="min-w-0"><p className="text-[10px] font-bold text-[#615274]">Paciente</p><p className="truncate text-xs font-black text-[#1C1135]">{session.cita.paciente_nombre}</p></div>
        </div>
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EDE9FE] text-[#6B46FE]"><Calendar size={15} /></span>
          <div className="min-w-0"><p className="text-[10px] font-bold text-[#615274]">Fecha</p><p className="truncate text-xs font-black text-[#1C1135]">
            {new Date(session.cita.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'short', timeStyle: 'medium' })}
          </p></div>
        </div>
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EDE9FE] text-[#6B46FE]"><User size={15} /></span>
          <div className="min-w-0"><p className="text-[10px] font-bold text-[#615274]">Terapeuta</p><p className="truncate text-xs font-black text-[#1C1135]">{session.cita.terapeuta_nombre}</p></div>
        </div>
        <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#D5F4EE] bg-[#F0FDF9] px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#CCFBF1] text-[#0D9488]"><FileText size={15} /></span>
          <div className="min-w-0"><p className="text-[10px] font-bold text-[#615274]">Estado</p><p className="truncate text-xs font-black text-[#1C1135]">{session.estado_sesion}</p></div>
        </div>
      </div>

      {session.reporte_disponible && (
        <RemoteFeedback pending={report.isPending} error={report.error} retry={() => void report.refetch()} />
      )}

      {canEdit && !report.error && initialForm && (
        <ClinicalReportEditor
          id={session.id_sesion}
          initial={initialForm}
          patientName={session.cita.paciente_nombre}
          patientId={session.cita.id_paciente}
          sessionType={session.cita.tipo_cita}
        />
      )}

      {!canEdit && report.data && !report.error && (
        <dl className="space-y-5">
          {Object.entries(reportLabels).map(([key, label]) => (
            <div key={key}>
              <dt className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B46FE]">{label}</dt>
              <dd className="text-sm whitespace-pre-wrap font-medium leading-relaxed text-[#4A4560]">
                {report.data[key as keyof typeof reportLabels] || 'No registrado'}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {report.isSuccess && !report.error && !!report.data && !report.isFetching && <ReportDownload sessionId={session.id_sesion} />}

      <SessionPlan session={session} readOnly={readOnly} />
    </div>
  );
}
