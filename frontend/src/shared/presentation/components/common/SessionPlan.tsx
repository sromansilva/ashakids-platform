import { useState } from 'react';
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

export function SessionPlan({ session, readOnly = false }: { session: Session; readOnly?: boolean }) {
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
  const [form, setForm] = useState<PlanFormState>(emptyPlanForm);
  const [narrative, setNarrative] = useState<PlanNarrativeDraft>(emptyPlanNarrative);
  const save = useWrite(
    (plan: PlanData) => sessionsService.publishPlan(session.id_sesion, plan),
    () => setEditing(false),
  );

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
  const inputClass = 'block w-full rounded-xl border border-[#E8E5F4] p-3 bg-white mt-1';
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
    setEditing(true);
  };

  const readyToPublish = Boolean(
    form.nombre_tratamiento.trim() && form.area && form.sesiones_recomendadas >= 1 &&
    form.sesiones_recomendadas <= 31 && form.mundos_asignados.length > 0 &&
    narrative.objectives.trim() && narrative.activities.trim()
  );

  return (
    <section className="border-t pt-4 space-y-3 border-[#E8E5F4]">
      <h3 className="font-extrabold text-[#1C1135]">
        {isIntro ? 'Plan de continuidad propuesto' : 'Plan de trabajo'}
      </h3>
      <RemoteFeedback pending={query.isPending} error={query.error || reportQuery.error || save.error} retry={() => void query.refetch()} />

      {query.data && !editing && (
        <div className="space-y-2 text-sm text-[#4B4264]">
          <p className="font-bold">{query.data.nombre_tratamiento} · {query.data.estado_tratamiento}</p>
          <p>{query.data.area && areaLabels[query.data.area]} · {query.data.sesiones_recomendadas} sesiones recomendadas</p>
          <p>Mundos: {query.data.mundos_asignados?.map((world) => areaLabels[world]).join(', ')}</p>
          <dl className="space-y-2">
            {Object.entries(planNarrativeLabels).map(([key, label]) => {
              const value = savedNarrative[key as keyof PlanNarrativeDraft];
              return value.trim() ? (
                <div key={key}>
                  <dt className="font-bold">{label}</dt>
                  <dd className="whitespace-pre-wrap">{value}</dd>
                </div>
              ) : null;
            })}
          </dl>
          <p>Autor: {query.data.terapeuta_nombre}. Mes: {query.data.fecha_inicio}. Origen: sesión #{query.data.id_sesion_origen}.</p>
          <p>Esta versión se conserva en el historial. El terapeuta puede preparar una nueva versión desde el reporte guardado.</p>
        </div>
      )}

      {query.isSuccess && !editing && !canPublish && !query.data && (
        <p className="text-sm text-[#4B4264]">
          {session.reporte_disponible
            ? 'Un terapeuta puede iniciar un plan después de guardar el reporte de esta sesión.'
            : 'Guarda primero el reporte de esta sesión para preparar un plan.'}
        </p>
      )}

      {query.isSuccess && !editing && canPublish && !hasSavedReportContent && (
        <p className="text-sm text-amber-800">Guarda observaciones, objetivos trabajados o próximos pasos en el reporte antes de preparar el plan.</p>
      )}
      {query.isSuccess && !editing && canPublish && isIntro && hasSavedReportContent && !hasIntroSource && (
        <p className="text-sm text-amber-800">Para iniciar desde la línea base, guarda observaciones iniciales u objetivos trabajados en el reporte.</p>
      )}

      {query.isSuccess && !editing && canStartDraft && (
        <div className="space-y-2">
          <p className="text-xs text-[#615274]">
            {isIntro
              ? 'El borrador toma solo observaciones y objetivos guardados. El área, objetivos del plan, actividades, sesiones y recomendaciones requieren decisión del terapeuta.'
              : savedResults.length
                ? 'El borrador muestra resultados previos revisados que ya aparecen en el reporte. No genera conclusiones ni objetivos automáticamente.'
                : 'No hay resultados previos revisados disponibles. El borrador empieza vacío y no genera conclusiones.'}
          </p>
          <Btn variant="outline" onClick={startDraft}>
            {isIntro
              ? 'Iniciar borrador desde línea base guardada'
              : savedResults.length
                ? 'Iniciar borrador con resultados previos guardados'
                : 'Iniciar borrador vacío'}
          </Btn>
        </div>
      )}

      {editing && canPublish && (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!form.area || !readyToPublish) return;
            const plan: PlanData = {
              ...form,
              area: form.area,
              descripcion: encodePlanNarrative(narrative),
            };
            void save.submit(plan);
          }}
        >
          <label className="block text-sm font-bold">
            Nombre del plan
            <input required maxLength={100} className={inputClass} value={form.nombre_tratamiento} onChange={(event) => setForm({ ...form, nombre_tratamiento: event.target.value })} />
          </label>

          <label className="block text-sm font-bold">
            Área principal definida por el terapeuta
            <select required className={inputClass} value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value as WorldArea | '' })}>
              <option value="">Selecciona un área</option>
              {Object.entries(areaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>

          {textFields.map(([key, label]) => (
            <label key={key} className="block text-sm font-bold">
              {label}{key === 'objectives' || key === 'activities' ? ' *' : ''}
              <textarea
                required={key === 'objectives' || key === 'activities'}
                maxLength={5000}
                rows={key === 'previousResults' ? 5 : 3}
                className={inputClass}
                value={narrative[key]}
                onChange={(event) => setNarrative({ ...narrative, [key]: event.target.value })}
              />
            </label>
          ))}

          <label className="block text-sm font-bold">
            Sesiones recomendadas por el terapeuta
            <input required type="number" min={1} max={31} placeholder="Completar según criterio profesional" className={inputClass} value={form.sesiones_recomendadas || ''} onChange={(event) => setForm({ ...form, sesiones_recomendadas: Number(event.target.value) })} />
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm font-bold mb-2">Mundos para practicar · elige al menos uno</legend>
            {Object.entries(areaLabels).map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  checked={form.mundos_asignados.includes(key as WorldArea)}
                  onChange={(event) => setForm({
                    ...form,
                    mundos_asignados: event.target.checked
                      ? [...form.mundos_asignados, key as WorldArea]
                      : form.mundos_asignados.filter((world) => world !== key),
                  })}
                />
                {label}
              </label>
            ))}
          </fieldset>

          <p className="text-sm text-[#4B4264]">
            El terapeuta revisa y completa cada campo antes de aprobar y publicar. Los resultados y la línea base son contexto; no producen conclusiones clínicas automáticamente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Btn type="submit" disabled={save.isPending || !readyToPublish}>Aprobar y publicar plan</Btn>
            <Btn variant="ghost" disabled={save.isPending} onClick={() => setEditing(false)}>Cancelar</Btn>
          </div>
        </form>
      )}
    </section>
  );
}
