import type { Dispatch, SetStateAction } from 'react';
import type { PhonemeTarget, WorldArea } from '@/modules/clinica/domain/clinical';
import type { TreatmentPredictionResponse } from '@/modules/clinica/infrastructure/clinicalService';
import { PlanClinicalFocus } from './PlanClinicalFocus';
import { areaLabels } from './planLabels';
import { planInputClass as inputClass, type PlanFormState } from './planForm';

export function PlanDataStep({ form, setForm, sessionId, patientId, confirmedPhonemes, nivelAyuda, prediction, predictionApplied, predictorEnabled, onPredictionLoaded, onPredictionDismissed, onApplySessions }: {
  form: PlanFormState;
  setForm: Dispatch<SetStateAction<PlanFormState>>;
  sessionId: number;
  patientId: number;
  confirmedPhonemes: PhonemeTarget[];
  nivelAyuda?: string | null;
  prediction: TreatmentPredictionResponse | null;
  predictionApplied: boolean;
  predictorEnabled: boolean;
  onPredictionLoaded: (prediction: TreatmentPredictionResponse) => void;
  onPredictionDismissed: () => void;
  onApplySessions: (sessions: number) => void;
}) {
  return (
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
        <PlanClinicalFocus
          sessionId={sessionId}
          patientId={patientId}
          confirmedPhonemes={confirmedPhonemes}
          fonemasPrioritarios={form.fonemas_priorizados}
          frecuenciaSemanal={form.frecuencia_semanal}
          codigoDiagnostico={form.codigo_diagnostico}
          nivelAyuda={nivelAyuda}
          prediction={prediction}
          predictionApplied={predictionApplied}
          predictorEnabled={predictorEnabled}
          onDiagnosisChange={(code) => setForm((current) => ({ ...current, codigo_diagnostico: code }))}
          onPhonemesChange={(phonemes) => setForm((current) => ({
            ...current,
            fonemas_priorizados: phonemes,
            mundos_asignados: phonemes.length > 0
              ? Array.from(new Set([...current.mundos_asignados, 'HABLA', 'LENGUAJE']))
              : current.mundos_asignados,
          }))}
          onFrequencyChange={(frequency) => setForm((current) => ({ ...current, frecuencia_semanal: frequency }))}
          onPredictionLoaded={onPredictionLoaded}
          onPredictionDismissed={onPredictionDismissed}
          onApplySessions={onApplySessions}
        />
      </div>
      <fieldset className="space-y-2 rounded-2xl border border-[#E8E5F4] p-4">
        <legend className="px-1 text-sm font-bold text-[#1C1135]">Mundos para practicar · elige al menos uno *</legend>
        <p className="text-xs text-[#615274]">Al priorizar fonemas, se asignan el Taller de los Sonidos (Isla Mágica) y La Isla de las Palabras para destacar prácticas relacionadas. Puedes mantener otros mundos del plan.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(areaLabels).map(([key, label]) => (
            <label key={key} className={`flex items-center gap-2.5 rounded-xl bg-[#F8F7FC] px-3 py-2.5 text-sm text-[#4B4264] ${form.fonemas_priorizados.length > 0 && ['HABLA', 'LENGUAJE'].includes(key) ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}>
              <input
                type="checkbox"
                checked={form.mundos_asignados.includes(key as WorldArea)}
                disabled={form.fonemas_priorizados.length > 0 && ['HABLA', 'LENGUAJE'].includes(key)}
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
  );
}
