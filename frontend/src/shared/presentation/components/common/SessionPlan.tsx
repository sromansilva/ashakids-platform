import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '@/modules/auth/application/useAuth';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { PlanData, Session, WorldArea } from '@/modules/clinica/domain/clinical';
import { parseArticulationHistory } from '@/shared/application/articulationReportEntries';
import {
  emptyPlanNarrative,
  encodePlanNarrative,
  followUpPlanDraftFromSavedResults,
  introPlanDraftFromReport,
  parsePlanNarrative,
  planNarrativeLabels,
  type PlanNarrativeDraft,
} from '@/shared/application/planDraft';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export const areaLabels: Record<WorldArea, string> = {
  FLUIDEZ: 'Fluidez y ritmo',
  HABLA: 'Habla y articulación',
  LENGUAJE: 'Comprensión y expresión',
  VOZ: 'Voz',
  OROFACIAL: 'Motricidad orofacial',
};

type PlanFormState = Omit<PlanData, 'area'> & { area: WorldArea | '' };
const emptyPlanForm = (): PlanFormState => ({
  nombre_tratamiento: '',
  descripcion: null,
  area: '',
  mundos_asignados: [],
  sesiones_recomendadas: 0,
});

const planSteps = ['Datos del plan', 'Línea base', 'Intervención', 'Recomendaciones'];

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
  const savedResults = parseArticulationHistory(historyQuery.data ?? []);
  const [editing, setEditing] = useState(false);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState('');
  const [form, setForm] = useState<PlanFormState>(emptyPlanForm);
  const [narrative, setNarrative] = useState<PlanNarrativeDraft>(emptyPlanNarrative);
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
    hasSavedReportContent && ['EN_CURSO', 'FINALIZADA'].includes(session.estado_sesion) &&
    session.asistencia !== 'NO_ASISTIO';
  const canStartDraft = canPublish && (isIntro ? hasIntroSource : !historyQuery.isPending);
  const inputClass = 'block w-full rounded-xl border border-[#E8E5F4] bg-white px-3 py-2.5 text-sm font-medium text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-500';
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
    setForm(emptyPlanForm());
    setNarrative(source);
    setStep(0);
    setStepError('');
    setEditing(true);
  };

  const readyToPublish = Boolean(
    form.nombre_tratamiento.trim() && form.area && Number.isInteger(form.sesiones_recomendadas) && form.sesiones_recomendadas >= 1 &&
    form.sesiones_recomendadas <= 31 && form.mundos_asignados.length > 0 &&
    narrative.objectives.trim() && narrative.activities.trim()
  );

  const advanceStep = () => {
    if (step === 0) {
      if (!form.nombre_tratamiento.trim()) return setStepError('Escribe un nombre para el plan.');
      if (!form.area) return setStepError('Selecciona el área principal.');
      if (!Number.isInteger(form.sesiones_recomendadas) || form.sesiones_recomendadas < 1 || form.sesiones_recomendadas > 31) {
        return setStepError('Indica un número entero entre 1 y 31 sesiones recomendadas.');
      }
      if (form.mundos_asignados.length === 0) return setStepError('Selecciona al menos un mundo para practicar.');
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
        <section className="space-y-3 rounded-2xl border border-[#E8E5F4] bg-[#FBFAFE] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-extrabold text-[#1C1135]">{query.data.nombre_tratamiento} · {query.data.estado_tratamiento}</h3>
          </div>
          <div className="grid gap-2 text-sm text-[#4B4264] sm:grid-cols-2">
            <p><strong>Nombre:</strong> {query.data.nombre_tratamiento}</p>
            <p><strong>Área:</strong> {query.data.area && areaLabels[query.data.area]}</p>
            <p><strong>Sesiones:</strong> {query.data.sesiones_recomendadas}</p>
            <p><strong>Mundos:</strong> {query.data.mundos_asignados?.map((world) => areaLabels[world]).join(', ')}</p>
          </div>
          <dl className="grid gap-3 border-t border-[#E8E5F4] pt-3 sm:grid-cols-2">
            {Object.entries(planNarrativeLabels).map(([key, label]) => {
              const value = savedNarrative[key as keyof PlanNarrativeDraft];
              return value.trim() ? (
                <div key={key}>
                  <dt className="text-xs font-bold text-[#6B46FE]">{label}</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-[#4B4264]">{value}</dd>
                </div>
              ) : null;
            })}
          </dl>
          <p className="text-xs text-[#8C82A8]">Autor: {query.data.terapeuta_nombre} · Mes: {query.data.fecha_inicio} · Sesión #{query.data.id_sesion_origen}</p>
        </section>
      )}

      {query.isSuccess && !editing && !canPublish && !query.data && (
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
            if (step !== planSteps.length - 1 || !readyToPublish || !form.area) return;
            const plan: PlanData = {
              ...form,
              area: form.area,
              descripcion: encodePlanNarrative(narrative),
            };
            void save.submit(plan);
          }}
        >
          <ol aria-label="Pasos del plan" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {planSteps.map((label, index) => (
              <li key={label}>
                <button
                  type="button"
                  disabled={index > step}
                  aria-current={index === step ? 'step' : undefined}
                  onClick={() => {
                    if (index < step) {
                      setStep(index);
                      setStepError('');
                    }
                  }}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-bold transition-colors disabled:cursor-default ${
                    index === step
                      ? 'border-violet-300 bg-violet-50 text-[#5B35E8]'
                      : index < step
                        ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                        : 'border-[#E8E5F4] bg-white text-[#8C82A8]'
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-[11px]">
                    {index < step ? <Check size={14} /> : index + 1}
                  </span>
                  <span className="leading-tight">{label}</span>
                </button>
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className="space-y-4" aria-labelledby="plan-step-data">
              <div>
                <h3 id="plan-step-data" className="text-base font-extrabold text-[#1C1135]">Datos del plan</h3>
                <p className="mt-1 text-sm text-[#615274]">Define el tratamiento, su área y la frecuencia recomendada.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-bold text-[#1C1135]">
                  Nombre del plan
                  <input required maxLength={100} className={`${inputClass} mt-1.5`} value={form.nombre_tratamiento} onChange={(event) => setForm((current) => ({ ...current, nombre_tratamiento: event.target.value }))} />
                </label>
                <label className="block text-sm font-bold text-[#1C1135]">
                  Área principal definida por el terapeuta
                  <select required className={`${inputClass} mt-1.5`} value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value as WorldArea | '' }))}>
                    <option value="">Selecciona un área</option>
                    {Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-bold text-[#1C1135]">
                  Sesiones recomendadas por el terapeuta
                  <input required type="number" min={1} max={31} step={1} placeholder="1 a 31" className={`${inputClass} mt-1.5`} value={form.sesiones_recomendadas || ''} onChange={(event) => setForm((current) => ({ ...current, sesiones_recomendadas: Number(event.target.value) }))} />
                </label>
              </div>
              <fieldset className="space-y-2 rounded-2xl border border-[#E8E5F4] p-4">
                <legend className="px-1 text-sm font-bold text-[#1C1135]">Mundos para practicar · elige al menos uno *</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(areaLabels).map(([key, label]) => (
                    <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-[#F8F7FC] px-3 py-2.5 text-sm text-[#4B4264]">
                      <input
                        type="checkbox"
                        checked={form.mundos_asignados.includes(key as WorldArea)}
                        onChange={(event) => setForm((current) => ({
                          ...current,
                          mundos_asignados: event.target.checked
                            ? [...current.mundos_asignados, key as WorldArea]
                            : current.mundos_asignados.filter((world) => world !== key),
                        }))}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </section>
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
                <p className="text-xs font-semibold text-amber-800">Completa nombre, área, sesiones, al menos un mundo, objetivos y actividades antes de publicar.</p>
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
              <Btn type="button" variant="primary" onClick={advanceStep}>
                Continuar <ChevronRight size={16} />
              </Btn>
            ) : (
              <Btn type="submit" disabled={save.isPending || !readyToPublish}>
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
