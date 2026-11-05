import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { PhonemeTarget, PlanData, Session } from '@/modules/clinica/domain/clinical';
import { clinicaService, type TreatmentPredictionResponse } from '@/modules/clinica/infrastructure/clinicalService';
import { canDocumentClinicalSession } from '@/modules/clinica/domain/clinical';
import { parseArticulationHistory } from '@/shared/application/articulationReportEntries';
import {
  emptyPlanNarrative,
  encodePlanNarrative,
  followUpPlanDraftFromSavedResults,
  introPlanDraftFromReport,
  parsePlanNarrative,
  type PlanNarrativeDraft,
} from '@/shared/application/planDraft';
import { Btn } from './Btn';
import { phonemeTargets } from './PlanClinicalFocus';
import { PlanDataStep } from './PlanDataStep';
import { PlanStepper } from './PlanStepper';
import { SavedPlanSummary } from './SavedPlanSummary';
import { emptyPlanForm, planInputClass, planSteps, type PlanFormState } from './planForm';
import { RemoteFeedback } from './RemoteFeedback';

export function SessionPlan({
  session,
  readOnly = false,
  compact = false,
  modal = false,
  open = false,
  onClose,
}: {
  session: Session;
  readOnly?: boolean;
  compact?: boolean;
  modal?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const { role } = useAuth();
  const query = useRemote(['session-plan', session.id_sesion], (signal) => sessionsService.plan(session.id_sesion, signal));
  const reportQuery = useRemote(
    ['session-report-for-plan', session.id_sesion],
    (signal) => sessionsService.report(session.id_sesion, signal),
    session.reporte_disponible,
  );
  const isIntro = session.cita.tipo_cita === 'INTRODUCTORIA';
  const patientId = session.cita.id_paciente;
  const historyQuery = useRemote(
    ['articulation-history', session.id_sesion],
    (signal) => sessionsService.articulationHistory(session.id_sesion, signal),
    !isIntro && Number.isInteger(patientId) && patientId > 0,
  );
  const phoneticEvaluationsQuery = useRemote(
    ['phonological-evaluations', patientId],
    (signal) => clinicaService.phonologicalEvaluations(patientId, signal),
    Number.isInteger(patientId) && patientId > 0,
  );
  const confirmedSessionPhonemes = Array.from(new Set(
    (phoneticEvaluationsQuery.data ?? [])
      .filter((evaluation) => evaluation.id_sesion === session.id_sesion && evaluation.estado === 'CONFIRMADO_TERAPEUTA')
      .map((evaluation) => evaluation.fonema_objetivo)
      .filter((phoneme): phoneme is PhonemeTarget => phonemeTargets.includes(phoneme as PhonemeTarget)),
  ));
  const savedResults = parseArticulationHistory(historyQuery.data ?? []);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const [form, setForm] = useState<PlanFormState>(emptyPlanForm);
  const [narrative, setNarrative] = useState<PlanNarrativeDraft>(emptyPlanNarrative);
  const [prediction, setPrediction] = useState<TreatmentPredictionResponse | null>(null);
  const [predictionApplied, setPredictionApplied] = useState(false);
  const [predictionNote, setPredictionNote] = useState('');
  const save = useWrite(
    (plan: PlanData) => sessionsService.publishPlan(session.id_sesion, plan),
    () => setEditing(false),
  );

  useEffect(() => {
    if (!modal || !open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal, open, onClose]);

  const report = reportQuery.data;
  const savedNarrative = parsePlanNarrative(query.data?.descripcion);
  const hasSavedReportContent = Boolean(report && (
    report.observaciones_iniciales?.trim() ||
    report.objetivos_trabajados?.trim() ||
    report.proximos_pasos?.trim()
  ));
  const hasIntroSource = Boolean(report && (
    report.observaciones_iniciales?.trim() || report.objetivos_trabajados?.trim()
  ));
  const canPublish = role === 'TERAPEUTA' && !readOnly && session.puede_editar !== false &&
    hasSavedReportContent && canDocumentClinicalSession(session);
  const canStartDraft = canPublish && (isIntro ? hasIntroSource : !historyQuery.isPending);
  const inputClass = planInputClass;
  const textFields: Array<[keyof PlanNarrativeDraft, string]> = [
    ['baseline', 'Línea base confirmada (editable)'],
    ['confirmedObjectives', 'Objetivos trabajados en la introductoria (editable)'],
    ['previousResults', 'Resultados previos revisados (contexto editable)'],
    ['objectives', 'Objetivos del plan'],
    ['activities', 'Actividades propuestas'],
    ['recommendations', 'Recomendaciones para la familia'],
  ];

  const startDraft = () => {
    const source = isIntro && report
      ? introPlanDraftFromReport(report)
      : followUpPlanDraftFromSavedResults(savedResults);
    setForm({
      ...emptyPlanForm(),
      fonemas_priorizados: confirmedSessionPhonemes,
      mundos_asignados: confirmedSessionPhonemes.length > 0 ? ['HABLA', 'LENGUAJE'] : [],
    });
    setNarrative(source);
    setPrediction(null);
    setPredictionApplied(false);
    setPredictionNote('');
    setStep(0);
    setStepError('');
    setEditing(true);
  };

  const predictionDecision = prediction
    ? !predictionApplied
      ? 'DESCARTADO'
      : form.sesiones_recomendadas === Math.round(prediction.sesiones_estimadas)
        ? 'CONFIRMADO_CLINICO'
        : 'MODIFICADO_MANUAL'
    : undefined;
  const requiresPredictionNote = predictionDecision === 'MODIFICADO_MANUAL';
  const readyToPublish = Boolean(
    form.nombre_tratamiento.trim() && form.area && form.codigo_diagnostico !== '' && Number.isInteger(form.sesiones_recomendadas) && form.sesiones_recomendadas >= 1 &&
    form.sesiones_recomendadas <= 31 && Number.isInteger(form.frecuencia_semanal) && form.frecuencia_semanal >= 1 && form.frecuencia_semanal <= 3 &&
    form.mundos_asignados.length > 0 && new Set(form.fonemas_priorizados).size === form.fonemas_priorizados.length &&
    (!['HABLA', 'VOZ'].includes(form.area) || form.fonemas_priorizados.length > 0) &&
    (form.fonemas_priorizados.length === 0 || (form.mundos_asignados.includes('HABLA') && form.mundos_asignados.includes('LENGUAJE'))) &&
    (!requiresPredictionNote || predictionNote.trim()) &&
    narrative.objectives.trim() && narrative.activities.trim() && narrative.recommendations.trim()
  );

  const advanceStep = () => {
    if (step === 0) {
      if (!form.nombre_tratamiento.trim()) return setStepError('Escribe un nombre para el plan.');
      if (!form.area) return setStepError('Selecciona el área principal.');
      if (form.codigo_diagnostico === '') return setStepError('Selecciona el código diagnóstico preliminar.');
      if (!Number.isInteger(form.sesiones_recomendadas) || form.sesiones_recomendadas < 1 || form.sesiones_recomendadas > 31) {
        return setStepError('Indica un número entero entre 1 y 31 sesiones recomendadas.');
      }
      if (!Number.isInteger(form.frecuencia_semanal) || form.frecuencia_semanal < 1 || form.frecuencia_semanal > 3) {
        return setStepError('Indica una frecuencia semanal entre 1 y 3 sesiones.');
      }
      if (form.mundos_asignados.length === 0) return setStepError('Selecciona al menos un mundo para practicar.');
      if (['HABLA', 'VOZ'].includes(form.area) && form.fonemas_priorizados.length === 0) {
        return setStepError('Selecciona los fonemas revisados por el terapeuta para este plan.');
      }
      if (form.fonemas_priorizados.length > 0 && (!form.mundos_asignados.includes('HABLA') || !form.mundos_asignados.includes('LENGUAJE'))) {
        return setStepError('Incluye el Taller de los Sonidos (Isla Mágica) y La Isla de las Palabras para activar la práctica dirigida a los fonemas seleccionados.');
      }
    }
    if (step === 2 && (!narrative.objectives.trim() || !narrative.activities.trim())) {
      return setStepError('Completa los objetivos y las actividades propuestas para continuar.');
    }
    setStepError('');
    setStep((current) => Math.min(current + 1, planSteps.length - 1));
  };

  const renderNarrativeField = (key: keyof PlanNarrativeDraft, label: string, rows = 3, required = false) => (
    <label key={key} className="block min-w-0 text-sm font-bold text-[#1C1135]">
      {label}{required ? ' *' : ''}
      <textarea
        required={required}
        maxLength={5000}
        rows={rows}
        className={`${inputClass} mt-1.5 resize-y leading-relaxed`}
        value={narrative[key]}
        onChange={(event) => setNarrative((current) => ({ ...current, [key]: event.target.value }))}
      />
    </label>
  );

  const planContent = (
    <div className="space-y-4">
      <RemoteFeedback pending={query.isPending} error={query.error || reportQuery.error || save.error} retry={() => void query.refetch()} />

      {query.data && !editing && (
        <SavedPlanSummary plan={query.data} narrative={savedNarrative} showPredictionDetails={role === 'TERAPEUTA' || role === 'ADMIN'} />
      )}

      {query.isSuccess && !editing && !canPublish && !query.data && role !== 'PADRE' && (
        <p className="rounded-xl bg-[#F8F7FC] p-4 text-sm text-[#4B4264]">
          {session.reporte_disponible
            ? 'Un terapeuta puede iniciar un plan después de guardar el reporte de esta sesión.'
            : 'Guarda primero el reporte de esta sesión para preparar un plan.'}
        </p>
      )}

      {query.isSuccess && !editing && canPublish && !hasSavedReportContent && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Guarda observaciones, objetivos trabajados o próximos pasos en el reporte antes de preparar el plan.</p>
      )}
      {query.isSuccess && !editing && canPublish && isIntro && hasSavedReportContent && !hasIntroSource && (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Para iniciar desde la línea base, guarda observaciones iniciales u objetivos trabajados en el reporte.</p>
      )}

      {query.isSuccess && !editing && canStartDraft && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
          <p className="max-w-2xl text-sm leading-relaxed text-[#615274]">
            {isIntro
              ? 'El borrador toma solo observaciones y objetivos guardados. Los objetivos, actividades y recomendaciones quedan a criterio del terapeuta.'
              : savedResults.length
                ? 'El borrador muestra resultados previos revisados. Las conclusiones y los objetivos quedan a criterio del terapeuta.'
                : 'No hay resultados previos revisados; el borrador empieza vacío y no genera conclusiones.'}
          </p>
          <Btn variant="cta" onClick={startDraft}>
            {isIntro ? 'Iniciar borrador desde línea base guardada' : 'Iniciar borrador con resultados previos guardados'}
          </Btn>
        </div>
      )}

      {editing && canPublish && (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (step !== planSteps.length - 1 || !readyToPublish || !form.area || form.codigo_diagnostico === '') return;
            const plan: PlanData = {
              ...form,
              area: form.area,
              codigo_diagnostico: form.codigo_diagnostico,
              descripcion: encodePlanNarrative(narrative),
              ...(prediction ? {
                id_prediccion: prediction.id_prediccion,
                decision_prediccion: predictionDecision,
                ...(requiresPredictionNote ? { observaciones_prediccion: predictionNote.trim() } : {}),
              } : {}),
            };
            void save.submit(plan);
          }}
        >
          <PlanStepper step={step} onBack={(index) => { setStep(index); setStepError(''); }} />

          {step === 0 && (
            <PlanDataStep
              form={form}
              setForm={setForm}
              sessionId={session.id_sesion}
              patientId={patientId}
              confirmedPhonemes={confirmedSessionPhonemes}
              nivelAyuda={report?.nivel_ayuda}
              prediction={prediction}
              predictionApplied={predictionApplied}
              predictorEnabled={isIntro}
              onPredictionLoaded={(value) => { setPrediction(value); setPredictionApplied(false); }}
              onPredictionDismissed={() => { setPrediction(null); setPredictionApplied(false); setPredictionNote(''); }}
              onApplySessions={(sessions) => {
                setForm((current) => ({ ...current, sesiones_recomendadas: sessions }));
                setPredictionApplied(true);
              }}
            />
          )}

          {step === 1 && (
            <section className="space-y-4" aria-labelledby="plan-step-baseline">
              <div>
                <h3 id="plan-step-baseline" className="text-base font-extrabold text-[#1C1135]">Línea base y contexto</h3>
                <p className="mt-1 text-sm text-[#615274]">Revisa los datos de referencia; puedes ajustarlos antes de continuar.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {(isIntro
                  ? textFields.filter(([key]) => key === 'baseline' || key === 'confirmedObjectives')
                  : textFields.filter(([key]) => key === 'previousResults')
                ).map(([key, label]) => renderNarrativeField(key, label, 4))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4" aria-labelledby="plan-step-intervention">
              <div>
                <h3 id="plan-step-intervention" className="text-base font-extrabold text-[#1C1135]">Intervención</h3>
                <p className="mt-1 text-sm text-[#615274]">Completa los objetivos y las actividades que revisarás con la familia.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {renderNarrativeField('objectives', 'Objetivos del plan', 5, true)}
                {renderNarrativeField('activities', 'Actividades propuestas', 5, true)}
              </div>
            </section>
          )}

          {step === 3 && (
            <section className="space-y-4" aria-labelledby="plan-step-recommendations">
              <div>
                <h3 id="plan-step-recommendations" className="text-base font-extrabold text-[#1C1135]">Recomendaciones para la familia</h3>
                <p className="mt-1 text-sm text-[#615274]">Agrega pautas claras que acompañen el trabajo terapéutico.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  {renderNarrativeField('recommendations', 'Recomendaciones', 5)}
                </div>
              </div>
              <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-xs leading-relaxed text-[#615274]">
                El terapeuta revisa y completa cada campo antes de aprobar y publicar. Los resultados y la línea base sirven como contexto, no generan conclusiones clínicas automáticamente.
              </div>
              {!readyToPublish && (
                <p className="text-xs font-semibold text-amber-800">Completa nombre, área, código diagnóstico, sesiones, frecuencia, mundos, objetivos y recomendaciones. En planes de habla o voz, selecciona fonemas revisados y asigna La Isla de las Palabras.</p>
              )}
              {requiresPredictionNote && (
                <label className="block text-sm font-bold text-[#1C1135]">
                  Motivo del ajuste manual de la sugerencia *
                  <textarea required maxLength={2000} rows={3} className={`${inputClass} mt-1.5`} value={predictionNote} onChange={(event) => setPredictionNote(event.target.value)} />
                  <span className="mt-1 block text-xs font-normal text-[#615274]">La decisión y este motivo quedarán vinculados al plan.</span>
                </label>
              )}
            </section>
          )}

          {stepError && <p role="alert" className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800">{stepError}</p>}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E5F4] pt-4">
            <Btn
              variant="ghost"
              aria-label={step === 0 ? 'Cancelar plan' : 'Paso anterior'}
              disabled={save.isPending}
              onClick={() => {
                if (step === 0) setEditing(false);
                else setStep((current) => Math.max(0, current - 1));
                setStepError('');
              }}
            >
              {step === 0 ? 'Cancelar' : <><ChevronLeft size={16} /> Anterior</>}
            </Btn>
            {step < planSteps.length - 1 ? (
              // Las key evitan que React reutilice el nodo: cambiar su type durante el clic enviaría el formulario.
              <Btn key="plan-continuar" type="button" variant="primary" onClick={advanceStep}>
                Continuar <ChevronRight size={16} />
              </Btn>
            ) : (
              <Btn key="plan-publicar" type="submit" disabled={save.isPending || !readyToPublish}>
                {save.isPending ? 'Publicando…' : 'Aprobar y publicar plan'}
              </Btn>
            )}
          </div>
        </form>
      )}
    </div>
  );

  if (modal) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6">
        <button className="absolute inset-0 cursor-pointer bg-[#1C1135]/45 backdrop-blur-sm" onClick={onClose} aria-label="Cerrar plan de continuidad" />
        <section role="dialog" aria-modal="true" aria-labelledby={`session-plan-title-${session.id_sesion}`} className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[#E8E5F4] bg-gradient-to-r from-white to-violet-50/60 px-5 py-4 sm:px-6">
            <div className="min-w-0">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#6B46FE]">Plan terapéutico · Sesión #{session.id_sesion}</p>
              <h2 id={`session-plan-title-${session.id_sesion}`} className="mt-1 truncate text-lg font-black text-[#1C1135] sm:text-xl">
                {isIntro ? 'Plan de continuidad' : 'Plan de trabajo'}
              </h2>
              <p className="mt-0.5 truncate text-xs text-[#615274]">{session.cita.paciente_nombre}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#615274] transition-colors hover:bg-violet-100 hover:text-[#1C1135] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
              <X size={20} />
            </button>
          </header>
          <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
            {planContent}
          </div>
        </section>
      </div>
    );
  }

  if (compact) {
    return (
      <section className="border-t border-[#E8E5F4] pt-3">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#F8F7FC]">
            <span className="font-extrabold text-[#1C1135]">{isIntro ? 'Plan de continuidad propuesto' : 'Plan de trabajo'}</span>
            <span className="text-xs text-[#8C82A8]">Abrir</span>
          </summary>
          <div className="px-3 pb-2 pt-2">{planContent}</div>
        </details>
      </section>
    );
  }

  return (
    <section className="border-t border-[#E8E5F4] pt-4">
      <h3 className="mb-3 font-extrabold text-[#1C1135]">{isIntro ? 'Plan de continuidad propuesto' : 'Plan de trabajo'}</h3>
      {planContent}
    </section>
  );
}
