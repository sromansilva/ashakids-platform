import { useEffect, useRef, useState } from "react";
import { useRemote, useWrite } from "@/shared/application/hooks/useRemoteData";
import { appointmentsService, sessionsService } from "@/modules/clinica/infrastructure/clinicalService";
import { useAuth } from "@/modules/auth/application/useAuth";
import type { ReportData } from "@/modules/clinica/domain/clinical";
import { ClinicalReportEditor, reportLabels as labels, emptyReport } from './ClinicalReportEditor';
import { Btn } from "./Btn";
import { RemoteFeedback } from "./RemoteFeedback";
import { ReportDownload } from "./ReportDownload";
import { VirtualMeeting } from "./VirtualMeeting";
import { SessionPlan } from "./SessionPlan";
import { SessionReview } from './SessionReview';
import { FamilyPhoneticCaptureWidget } from './FamilyPhoneticCaptureWidget';
import { FamilyConsentPrompt } from './FamilyConsentPrompt';
import { ActiveSessionOverview } from './ActiveSessionOverview';
import { SessionLaunchControls } from './SessionLaunchControls';
import { FileText, ArrowRight } from "lucide-react";
import { attendanceLabel, sessionStatusLabel } from '@/shared/domain/statusLabels';
import { canDocumentClinicalSession } from '@/modules/clinica/domain/clinical';
import { ApiError } from "@/core/api/client";


export function SessionActions({
  appointmentId,
  compact = false,
  onGoToReports,
  activeSessionPanel = false,
  showMeeting = true,
}: {
  appointmentId: number;
  compact?: boolean;
  onGoToReports?: () => void;
  activeSessionPanel?: boolean;
  /** La vista familiar pinta la reunión por separado, arriba del todo. */
  showMeeting?: boolean;
}) {
  const [closing, setClosing] = useState<'ASISTIO' | 'NO_ASISTIO' | null>(null);
  const [showInPlaceEditor, setShowInPlaceEditor] = useState(false);
  const [now, setNow] = useState(Date.now);
  const [justClosed, setJustClosed] = useState(false);
  const autoStartAttempted = useRef(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const { role } = useAuth();
  const professional = role === 'ADMIN' || role === 'TERAPEUTA';
  const appointment = useRemote(['appointment', appointmentId], (s) => appointmentsService.get(appointmentId, s));
  const id = appointment.data?.id_sesion;
  const session = useRemote(['session', id], (s) => sessionsService.get(id!, s), !!id);
  const report = useRemote(['report', id], (s) => sessionsService.report(id!, s), !!id && !!session.data?.reporte_disponible);
  const create = useWrite(() => sessionsService.create(appointmentId));
  const start = useWrite(() => sessionsService.start(id!));
  const close = useWrite((asistencia: 'ASISTIO' | 'NO_ASISTIO') => sessionsService.close(id!, asistencia), () => {
    setClosing(null);
    setJustClosed(true);
    setShowInPlaceEditor(true);
  });

  const s = appointment.error || session.error ? undefined : session.data;
  const busy = create.isPending || start.isPending || close.isPending;
  const refetchAppointment = appointment.refetch;
  const refetchSession = session.refetch;
  const ownsSession = professional && s?.puede_editar !== false;
  const canEdit = ownsSession && !!s && canDocumentClinicalSession(s);
  const isReport404 = report.error instanceof ApiError && (report.error.status === 404 || report.error.message.includes('404'));

  const startMs = Date.parse(s?.cita.fecha_hora_inicio ?? appointment.data?.fecha_hora_inicio ?? '');

  useEffect(() => {
    if (!activeSessionPanel || !professional || !s || s.estado_sesion !== 'PROGRAMADA' ||
        now < startMs || busy || start.isSuccess || autoStartAttempted.current) return;
    autoStartAttempted.current = true;
    void start.submit(undefined);
  }, [activeSessionPanel, professional, s, now, startMs, busy, start.isSuccess]);

  // Al volver a la pestaña (p. ej. tras iniciar la reunión en otra) se refresca el estado.
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'hidden') return;
      void refetchAppointment();
      if (id) void refetchSession();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [id, refetchAppointment, refetchSession]);

  // En el panel clínico la sesión se inicia desde otra pestaña: se consulta hasta verla en curso.
  const waitingForStart = activeSessionPanel && professional && s?.estado_sesion === 'PROGRAMADA';
  useEffect(() => {
    if (!waitingForStart) return;
    const timer = window.setInterval(() => void refetchSession(), 3000);
    return () => window.clearInterval(timer);
  }, [waitingForStart, refetchSession]);

  // Tras finalizar, lleva al editor del reporte.
  const finalized = justClosed && s?.estado_sesion === 'FINALIZADA';
  const signed = report.data?.estado_reporte === 'FIRMADO';
  useEffect(() => {
    if (!finalized) return;
    const node = reportRef.current;
    node?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    node?.focus({ preventScroll: true });
  }, [finalized]);

  return (
    <section className={`${professional || s ? 'mt-4 border-t border-[#E8E5F4] pt-4' : 'mt-1'} ${compact ? 'session-actions--agenda' : 'space-y-3'}`}>
      {!compact && professional && <h3 className="font-extrabold text-[#1C1135]">Sesión y reporte clínico</h3>}

      <div className={compact ? 'session-actions__feedback' : undefined}>
        <RemoteFeedback
          pending={appointment.isPending || (!!id && session.isPending)}
          error={appointment.error || session.error || create.error || start.error || close.error}
          retry={() => {
            void appointment.refetch();
            if (id) void session.refetch();
          }}
        />
      </div>

      <div className={compact ? `session-actions__workflow${s ? '' : ' session-actions__workflow--solo'}` : 'space-y-4'}>
        {activeSessionPanel && appointment.data && (
          <ActiveSessionOverview appointment={appointment.data} session={s} now={now} />
        )}
        {showMeeting && appointment.data && !appointment.error && (
          <VirtualMeeting
            key={appointmentId}
            appointment={appointment.data}
            professional={professional}
            onRefresh={() => { void refetchAppointment(); if (id) void refetchSession(); }}
          />
        )}
        {role === 'PADRE' && appointment.data && (
          <FamilyConsentPrompt patientId={appointment.data.id_paciente} patientName={appointment.data.paciente_nombre} />
        )}

        {professional && !s && appointment.data && appointment.isSuccess && appointment.data.puede_editar !== false && (
          <>
            <p className="text-sm text-[#7C6F9A]">Sin sesión registrada.</p>
            <SessionLaunchControls appointment={appointment.data} now={now} disabled={busy} panelMode={activeSessionPanel} />
          </>
        )}

      {s && (
        <>
          <p className="text-sm font-bold">
            Sesión #{id} · {sessionStatusLabel(s.estado_sesion)} · {attendanceLabel(s.asistencia)}
          </p>
          {role === 'PADRE' && s.estado_sesion === 'EN_CURSO' && (
            <FamilyPhoneticCaptureWidget
              sessionId={s.id_sesion}
              patientName={s.cita.paciente_nombre}
            />
          )}
          <div className="flex gap-2.5 flex-wrap">
            {ownsSession && s.estado_sesion === 'PROGRAMADA' && (
              <>
                {activeSessionPanel && now < startMs && (
                  <p role="status" className="w-full rounded-xl border border-violet-200 bg-violet-50 p-2.5 text-xs font-bold text-violet-900">
                    El panel está listo. La sesión se activará automáticamente a la hora de inicio.
                  </p>
                )}
                {activeSessionPanel ? (
                  <Btn disabled={busy || now < startMs} onClick={() => void start.submit(undefined)}>
                    {now < startMs ? 'Esperando hora de inicio' : start.error ? 'Reintentar inicio de sesión' : 'Iniciando sesión…'}
                  </Btn>
                ) : (
                  appointment.data && <SessionLaunchControls appointment={appointment.data} session={s} now={now} disabled={busy} />
                )}
                {activeSessionPanel && appointment.data && (
                  <SessionLaunchControls appointment={appointment.data} session={s} now={now} disabled={busy} panelMode />
                )}
                <Btn
                  variant="outline"
                  disabled={busy || now < Date.parse(s.cita.fecha_hora_fin)}
                  onClick={() => setClosing('NO_ASISTIO')}
                >
                  Registrar inasistencia
                </Btn>
              </>
            )}
            {ownsSession && s.estado_sesion === 'EN_CURSO' && (
              <Btn disabled={busy} onClick={() => setClosing('ASISTIO')}>
                Finalizar sesión
              </Btn>
            )}
            <Btn variant="ghost" onClick={() => void session.refetch()}>
              Actualizar estado
            </Btn>
          </div>

          {closing && s.estado_sesion !== 'FINALIZADA' && (
            <div className="rounded-xl bg-[#F5F3FF] p-4 space-y-3" role="group" aria-label="Confirmar cierre clínico">
              <p className="font-bold">
                {closing === 'ASISTIO'
                  ? '¿Finalizar la sesión y registrar asistencia?'
                  : '¿Registrar inasistencia y cerrar esta sesión?'}
              </p>
              <div className="flex gap-3 flex-wrap">
                <Btn disabled={busy} onClick={() => void close.submit(closing)}>
                  Confirmar cierre
                </Btn>
                <Btn variant="ghost" disabled={busy} onClick={() => setClosing(null)}>
                  Continuar sesión
                </Btn>
              </div>
            </div>
          )}
        </>
      )}
      </div>

      {finalized && ownsSession && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-900">
          {signed ? 'Sesión finalizada. El reporte ya está firmado; puedes preparar el plan.' : 'Sesión finalizada. Completa y firma el reporte.'}
        </p>
      )}

      {s && (
        <div ref={reportRef} tabIndex={-1} className={`${compact ? 'session-actions__clinical ' : ''}outline-none`}>
          {s.reporte_disponible && (
            <RemoteFeedback pending={report.isPending} error={!canEdit && isReport404 ? null : report.error} retry={() => void report.refetch()} />
          )}

          {/* En modo compacto (Modal de Agenda) se muestra enlace rápido para no sobrecargar el popup */}
          {compact ? (
            canEdit && (
              <div className="p-4 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4] space-y-2 mt-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-black text-[#1C1135]">Informe clínico de sesión</span>
                  <button
                    type="button"
                    onClick={() => setShowInPlaceEditor((prev) => !prev)}
                    className="text-[11px] font-bold text-[#6B46FE] hover:underline cursor-pointer"
                  >
                    {showInPlaceEditor ? 'Ocultar editor aquí' : 'Abrir editor aquí'}
                  </button>
                </div>
                <p className="text-xs text-[#615274] font-medium">
                  Permite obtener una transcripción tentativa con consentimiento vigente; el terapeuta la revisa antes de incorporarla al informe. Los indicadores de apoyo que acompañan al texto no tienen validación clínica ni diagnostican.
                </p>
                {onGoToReports && (
                  <button
                    type="button"
                    onClick={onGoToReports}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <FileText size={14} /> Ir al editor completo de reportes <ArrowRight size={14} />
                  </button>
                )}
                {showInPlaceEditor && (!s.reporte_disponible || (report.isSuccess && !report.error)) && (
                  <div className="pt-3 border-t border-[#E8E5F4]">
                    <ClinicalReportEditor
                      key={id}
                      id={id!}
                      initial={report.data ?? emptyReport}
                      patientName={s.cita.paciente_nombre}
                      patientId={s.cita.id_paciente}
                      sessionType={s.cita.tipo_cita}
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            canEdit &&
            (!s.reporte_disponible || (report.isSuccess && !report.error)) && (
              <ClinicalReportEditor
                key={id}
                id={id!}
                initial={report.data ?? emptyReport}
                patientName={s.cita.paciente_nombre}
                patientId={s.cita.id_paciente}
                sessionType={s.cita.tipo_cita}
              />
            )
          )}

          {role === 'PADRE' && s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO' &&
            (!s.reporte_disponible || report.isSuccess) && !report.data && !report.error && (
            <p role="status" className="rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-4 text-sm font-semibold text-[#615274]">
              Tu terapeuta aún está preparando el reporte.
            </p>
          )}

          {!canEdit && (
            report.data && !report.error ? (
              <dl className="space-y-2">
                {Object.entries(labels).map(([key, label]) => (
                  <div key={key}>
                    <dt className="font-bold text-sm">{label}</dt>
                    <dd className="text-sm whitespace-pre-wrap">
                      {report.data[key as keyof ReportData] || 'No registrado'}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (!s.reporte_disponible || isReport404) && !report.isPending ? (
              <p className="text-sm text-[#4B4264] py-1">Todavía no hay un reporte guardado para esta sesión.</p>
            ) : null
          )}

          <SessionPlan session={s} />

          {role === 'PADRE' && s.estado_sesion === 'FINALIZADA' && s.asistencia === 'ASISTIO' && (
            <SessionReview key={s.id_sesion} id={s.id_sesion} therapist={s.cita.terapeuta_nombre} />
          )}

          {report.isSuccess && !report.isFetching && !!report.data && s.reporte_disponible && (
            <ReportDownload key={`pdf-${id}`} sessionId={id!} />
          )}
        </div>
      )}
    </section>
  );
}
