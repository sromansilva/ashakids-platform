import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import { RemoteFeedback } from '@/shared/presentation/components/common/RemoteFeedback';
import { ClinicalReportEditor, emptyReport, reportLabels } from '@/shared/presentation/components/common/ClinicalReportEditor';
import { ReportDownload } from '@/shared/presentation/components/common/ReportDownload';
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
    if (report.isSuccess && !report.error) setInitialForm((current) => current ?? report.data);
  }, [report.data, report.isSuccess, report.error]);
  const canEdit =
    !readOnly &&
    session.puede_editar !== false &&
    ['EN_CURSO', 'FINALIZADA'].includes(session.estado_sesion) &&
    session.asistencia !== 'NO_ASISTIO';

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="mb-3 text-xs font-black uppercase tracking-wider text-[#6B46FE]">INFORMACIÓN GENERAL</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#615274]">Paciente</p>
              <p className="text-sm font-black text-[#1C1135] truncate">{session.cita.paciente_nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
            <div className="w-10 h-10 rounded-full bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#615274]">Fecha</p>
              <p className="text-xs font-black text-[#1C1135] truncate">
                {new Date(session.cita.fecha_hora_inicio).toLocaleString('es-PE', {
                  timeZone: 'America/Lima',
                  dateStyle: 'short',
                  timeStyle: 'medium',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4]">
            <div className="w-10 h-10 rounded-full bg-[#CCFBF1] text-[#0D9488] flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#615274]">Estado</p>
              <p className="text-sm font-black text-[#1C1135]">{session.estado_sesion}</p>
            </div>
          </div>
        </div>
      </div>

      {session.reporte_disponible && (
        <RemoteFeedback pending={report.isPending} error={report.error} retry={() => void report.refetch()} />
      )}

      {canEdit && !report.error && initialForm && (
        <ClinicalReportEditor id={session.id_sesion} initial={initialForm} patientName={session.cita.paciente_nombre} />
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

      {report.isSuccess && !report.error && !report.isFetching && <ReportDownload sessionId={session.id_sesion} />}

      <div className="border-t border-[#E8E5F4] pt-5">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#6B46FE]">Profesional de la sesión</p>
        <div className="rounded-2xl p-4 bg-[#F8F7FC] border border-[#E8E5F4] flex items-center justify-between">
          <div>
            <p className="font-extrabold text-sm text-[#1C1135]">{session.cita.terapeuta_nombre}</p>
            <p className="text-xs text-[#615274] mt-0.5">
              La API guarda el reporte, pero no registra firmas digitales ni envíos por correo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
