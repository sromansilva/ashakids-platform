import type { PhonemeTarget } from '@/modules/clinica/domain/clinical';
import { TreatmentPredictiveCard } from './TreatmentPredictiveCard';
import type { TreatmentPredictionResponse } from '@/modules/clinica/infrastructure/clinicalService';
import { helpLevels } from './reportFormGuidance';

export const phonemeTargets: PhonemeTarget[] = ['/rr/', '/r/', '/s/', '/pl/', '/tr/'];

export function PlanClinicalFocus({ sessionId, patientId, confirmedPhonemes, fonemasPrioritarios, frecuenciaSemanal, nivelAyuda, prediction, predictorEnabled, onPhonemesChange, onFrequencyChange, onPredictionLoaded, onPredictionDismissed, onApplySessions }: {
  sessionId: number;
  patientId: number;
  confirmedPhonemes: PhonemeTarget[];
  fonemasPrioritarios: PhonemeTarget[];
  frecuenciaSemanal: number;
  nivelAyuda?: string | null;
  prediction: TreatmentPredictionResponse | null;
  predictorEnabled: boolean;
  onPhonemesChange: (phonemes: PhonemeTarget[]) => void;
  onFrequencyChange: (frequency: number) => void;
  onPredictionLoaded: (prediction: TreatmentPredictionResponse) => void;
  onPredictionDismissed: () => void;
  onApplySessions: (sessions: number, prediction: TreatmentPredictionResponse) => void;
}) {
  const helpIndex = helpLevels.findIndex((level) => level.value === nivelAyuda);
  const collaborationScore = helpIndex < 0 ? null : helpLevels.length - helpIndex;
  const inputClass = 'block w-full rounded-xl border border-[#E8E5F4] bg-white px-3 py-2.5 text-sm font-medium text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-violet-500';
  return <>
    <label className="block text-sm font-bold text-[#1C1135]">
      Frecuencia semanal
      <select required disabled={Boolean(prediction)} className={`${inputClass} mt-1.5 disabled:bg-[#F8F7FC]`} value={frecuenciaSemanal || ''} onChange={(event) => onFrequencyChange(Number(event.target.value))}>
        <option value="">Selecciona la frecuencia</option>
        {[1, 2, 3].map((frequency) => <option key={frequency} value={frequency}>{frequency} {frequency === 1 ? 'sesión por semana' : 'sesiones por semana'}</option>)}
      </select>
    </label>
    <fieldset className="space-y-2 rounded-2xl border border-[#E8E5F4] p-4 sm:col-span-2">
      <legend className="px-1 text-sm font-bold text-[#1C1135]">Fonemas priorizados por el terapeuta</legend>
      <p className="text-xs text-[#615274]">Los valores iniciales proceden de evaluaciones fonológicas confirmadas en esta sesión. Revísalos con el criterio clínico.</p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {phonemeTargets.map((phoneme) => (
          <label key={phoneme} className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#F8F7FC] px-3 py-2.5 text-sm text-[#4B4264]">
            <input type="checkbox" disabled={Boolean(prediction)} checked={fonemasPrioritarios.includes(phoneme)} onChange={(event) => onPhonemesChange(event.target.checked ? [...fonemasPrioritarios, phoneme] : fonemasPrioritarios.filter((target) => target !== phoneme))}/>
            {phoneme}
          </label>
        ))}
      </div>
    </fieldset>
    {predictorEnabled ? (
      <div className="sm:col-span-2">
        <TreatmentPredictiveCard
          sessionId={sessionId}
          patientId={patientId}
          phonemeCount={confirmedPhonemes.length}
          collaborationScore={collaborationScore}
          weeklyFrequency={frecuenciaSemanal || null}
          onPredictionLoaded={onPredictionLoaded}
          onPredictionDismissed={onPredictionDismissed}
          onApplySessions={onApplySessions}
        />
      </div>
    ) : (
      <p className="sm:col-span-2 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] p-3 text-xs text-[#615274]">
        El pronóstico predictivo se ofrece durante la consulta introductoria. Para este seguimiento, define las sesiones con criterio clínico.
      </p>
    )}
  </>;
}
