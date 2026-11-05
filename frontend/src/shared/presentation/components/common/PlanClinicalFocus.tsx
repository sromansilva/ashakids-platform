import type { PhonemeTarget } from '@/modules/clinica/domain/clinical';
import { TreatmentPredictiveCard } from './TreatmentPredictiveCard';
import { clinicaService, type TreatmentPredictionResponse } from '@/modules/clinica/infrastructure/clinicalService';
import { useRemote } from '@/shared/application/hooks/useRemoteData';
import { helpLevels } from './reportFormGuidance';
import { planInputClass as inputClass } from './planForm';

export const phonemeTargets: PhonemeTarget[] = ['/rr/', '/r/', '/s/', '/pl/', '/tr/'];

export function PlanClinicalFocus({ sessionId, patientId, confirmedPhonemes, fonemasPrioritarios, frecuenciaSemanal, codigoDiagnostico, nivelAyuda, prediction, predictionApplied, predictorEnabled, onDiagnosisChange, onPhonemesChange, onFrequencyChange, onPredictionLoaded, onPredictionDismissed, onApplySessions }: {
  sessionId: number;
  patientId: number;
  confirmedPhonemes: PhonemeTarget[];
  fonemasPrioritarios: PhonemeTarget[];
  frecuenciaSemanal: number;
  codigoDiagnostico: number | '';
  nivelAyuda?: string | null;
  prediction: TreatmentPredictionResponse | null;
  predictionApplied: boolean;
  predictorEnabled: boolean;
  onDiagnosisChange: (code: number | '') => void;
  onPhonemesChange: (phonemes: PhonemeTarget[]) => void;
  onFrequencyChange: (frequency: number) => void;
  onPredictionLoaded: (prediction: TreatmentPredictionResponse) => void;
  onPredictionDismissed: () => void;
  onApplySessions: (sessions: number) => void;
}) {
  const helpIndex = helpLevels.findIndex((level) => level.value === nivelAyuda);
  const collaborationScore = helpIndex < 0 ? null : helpLevels.length - helpIndex;
  // El catálogo institucional no depende del modelo: siempre debe poder elegirse un código.
  const diagnoses = useRemote(['preliminary-diagnoses'], (signal) => clinicaService.preliminaryDiagnoses(signal));
  const diagnosisLabel = diagnoses.data?.etiqueta ?? 'Código diagnóstico preliminar asignado por el terapeuta';
  return <>
    <div>
      <label className="block text-sm font-bold text-[#1C1135]">
        {diagnosisLabel}
        <select required disabled={Boolean(prediction)} className={`${inputClass} mt-1.5 disabled:bg-[#F8F7FC]`} value={codigoDiagnostico} onChange={(event) => onDiagnosisChange(event.target.value === '' ? '' : Number(event.target.value))}>
          <option value="">Selecciona un código</option>
          {diagnoses.data?.codigos?.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
        </select>
      </label>
      <p className="mt-1 text-xs text-[#615274]">
        {diagnoses.data?.aviso ?? 'Es una clasificación preliminar elegida por el terapeuta; no sustituye una evaluación diagnóstica.'}
      </p>
      {diagnoses.error && <p role="alert" className="mt-1 text-xs font-semibold text-rose-700">No se pudo cargar el catálogo diagnóstico. Actualiza la pantalla para continuar.</p>}
    </div>
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
          diagnosisCode={codigoDiagnostico}
          diagnosisLabel={diagnoses.data?.codigos?.find((item) => item.code === codigoDiagnostico)?.label ?? null}
          phonemeCount={confirmedPhonemes.length}
          collaborationScore={collaborationScore}
          weeklyFrequency={frecuenciaSemanal || null}
          applied={predictionApplied}
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
