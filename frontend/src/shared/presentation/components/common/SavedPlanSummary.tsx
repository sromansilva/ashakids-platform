import type { Treatment } from '@/modules/clinica/domain/clinical';
import { planNarrativeLabels, type PlanNarrativeDraft } from '@/shared/application/planDraft';
import { areaLabels, predictionDecisionLabels } from './planLabels';

export function SavedPlanSummary({ plan, narrative, showPredictionDetails }: {
  plan: Treatment;
  narrative: PlanNarrativeDraft;
  showPredictionDetails: boolean;
}) {
  return <section className="space-y-3 rounded-2xl border border-[#E8E5F4] bg-[#FBFAFE] p-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="font-extrabold text-[#1C1135]">{plan.nombre_tratamiento} · {plan.estado_tratamiento}</h3>
    </div>
    <div className="grid gap-2 text-sm text-[#4B4264] sm:grid-cols-2">
      <p><strong>Nombre:</strong> {plan.nombre_tratamiento}</p>
      <p><strong>Área:</strong> {plan.area && areaLabels[plan.area]}</p>
      <p><strong>Sesiones:</strong> {plan.sesiones_recomendadas}</p>
      <p><strong>Mundos:</strong> {plan.mundos_asignados?.map((world) => areaLabels[world]).join(', ')}</p>
    </div>
    {showPredictionDetails && plan.sesiones_modelo_estimadas != null && (
      <section className="space-y-1 rounded-xl border border-violet-100 bg-violet-50/60 p-3 text-sm text-[#4B4264]" aria-label="Comparación de pronóstico y sesiones">
        <h4 className="font-extrabold text-[#1C1135]">Pronóstico y avance del plan</h4>
        <p>Modelo: {plan.sesiones_modelo_estimadas} sesiones (rango {plan.modelo_rango_min}–{plan.modelo_rango_max}).</p>
        <p>Plan del terapeuta: {plan.sesiones_recomendadas} · Asistidas: {plan.sesiones_realizadas ?? 0}.</p>
        {plan.riesgo_desercion_modelo && <p>Riesgo estimado de deserción: {plan.riesgo_desercion_modelo}{plan.probabilidad_desercion_modelo != null ? ` (${Math.round(plan.probabilidad_desercion_modelo * 100)}% estimado)` : ''}.</p>}
        {plan.estado_prediccion && <p>Decisión: {predictionDecisionLabels[plan.estado_prediccion]}.</p>}
        {plan.confianza_modelo != null && <p>Confianza calibrada de la clasificación de riesgo: {Math.round(plan.confianza_modelo * 100)}%.</p>}
      </section>
    )}
    <dl className="grid gap-3 border-t border-[#E8E5F4] pt-3 sm:grid-cols-2">
      {Object.entries(planNarrativeLabels).map(([key, label]) => {
        const value = narrative[key as keyof PlanNarrativeDraft];
        return value.trim() ? <div key={key}>
          <dt className="text-xs font-bold text-[#6B46FE]">{label}</dt>
          <dd className="mt-1 whitespace-pre-wrap text-sm text-[#4B4264]">{value}</dd>
        </div> : null;
      })}
    </dl>
    <p className="text-xs text-[#8C82A8]">Autor: {plan.terapeuta_nombre} · Mes: {plan.fecha_inicio} · Sesión #{plan.id_sesion_origen}</p>
  </section>;
}
