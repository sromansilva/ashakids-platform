import { useState } from 'react';
import { Brain, RefreshCw, Sparkles } from 'lucide-react';
import { clinicaService, patientsService, type TreatmentPredictionResponse } from '@/modules/clinica/infrastructure/clinicalService';
import { useRemote } from '@/shared/application/hooks/useRemoteData';

interface TreatmentPredictiveCardProps {
  sessionId: number;
  patientId: number;
  diagnosisCode: number | '';
  diagnosisLabel: string | null;
  phonemeCount: number;
  collaborationScore: number | null;
  weeklyFrequency: number | null;
  /** El terapeuta ya aceptó la sugerencia (las sesiones del plan se rellenaron con ella). */
  applied: boolean;
  onPredictionLoaded: (prediction: TreatmentPredictionResponse) => void;
  onPredictionDismissed: () => void;
  onApplySessions: (sessions: number) => void;
}

function ageInMonths(birthDate?: string): number | null {
  if (!birthDate) return null;
  const [year, month, day] = birthDate.slice(0, 10).split('-').map(Number);
  if (![year, month, day].every(Number.isInteger)) return null;
  const now = new Date();
  let months = (now.getFullYear() - year) * 12 + now.getMonth() + 1 - month;
  if (now.getDate() < day) months -= 1;
  return months >= 0 ? months : null;
}

export function TreatmentPredictiveCard({
  sessionId,
  patientId,
  diagnosisCode,
  diagnosisLabel,
  phonemeCount,
  collaborationScore,
  weeklyFrequency,
  applied,
  onPredictionLoaded,
  onPredictionDismissed,
  onApplySessions,
}: TreatmentPredictiveCardProps) {
  // Sin modelo aprobado el estado es `disponible: false` con HTTP 200: es lo esperado, no un error.
  const status = useRemote(['prognosis-status'], (signal) => clinicaService.prognosisStatus(signal));
  const available = status.data?.disponible === true;
  const patient = useRemote(['treatment-prediction-patient', patientId], (signal) => patientsService.get(patientId, signal), patientId > 0 && available);
  const [loading, setLoading] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [prediction, setPrediction] = useState<TreatmentPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ageMonths = ageInMonths(patient.data?.fecha_nacimiento);

  if (status.isPending) {
    return <p role="status" className="rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] p-3 text-xs text-[#615274]">Consultando la disponibilidad del pronóstico…</p>;
  }
  if (!available) {
    return (
      <p role="note" className="rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] p-3 text-xs text-[#615274]">
        Pronóstico no disponible: aún no hay un modelo aprobado. Define las sesiones según tu criterio.
      </p>
    );
  }

  const missing = [
    diagnosisCode === '' ? 'el código diagnóstico preliminar' : null,
    phonemeCount ? null : 'al menos un fonema confirmado en esta sesión',
    collaborationScore ? null : 'el nivel de ayuda del informe',
    weeklyFrequency ? null : 'la frecuencia semanal',
    ageMonths && ageMonths >= 24 && ageMonths <= 180 ? null : 'una edad del perfil entre 24 y 180 meses',
  ].filter((item): item is string => item !== null);

  const fetchPrediction = async () => {
    if (prediction || diagnosisCode === '' || !weeklyFrequency || missing.length) return;
    setLoading(true);
    setError(null);
    try {
      const result = await clinicaService.predictTreatmentPlan({
        id_sesion: sessionId,
        codigo_diagnostico: diagnosisCode,
        frecuencia_semanal: weeklyFrequency,
      });
      setPrediction(result);
      onPredictionLoaded(result);
    } catch {
      setError('No se pudo obtener el pronóstico. Puedes definir las sesiones según tu criterio.');
    } finally {
      setLoading(false);
    }
  };

  const discardPrediction = async () => {
    if (!prediction) return;
    setDiscarding(true);
    setError(null);
    try {
      await clinicaService.discardTreatmentPrediction(prediction.id_prediccion);
      setPrediction(null);
      onPredictionDismissed();
    } catch {
      setError('No se pudo cerrar la sugerencia. Actualiza el estado antes de continuar.');
    } finally {
      setDiscarding(false);
    }
  };

  return (
    <section aria-label="Pronóstico asistido de tratamiento" className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white"><Brain size={18} /></div>
        <div>
          <h4 className="text-sm font-extrabold text-[#1C1135]">Pronóstico asistido de tratamiento</h4>
          <p className="text-xs text-[#615274]">Estimación de apoyo de un modelo aprobado; no es un diagnóstico ni reemplaza tu criterio clínico.</p>
        </div>
      </div>

      {!prediction && (
        <div className="mt-3 space-y-2 text-xs text-[#615274]">
          <p>
            Datos: edad {ageMonths ?? '—'} meses · {diagnosisLabel ?? 'código pendiente'} · {phonemeCount || 0} fonema(s) confirmado(s) · colaboración {collaborationScore ?? '—'}/5 · {weeklyFrequency ?? '—'} sesión(es) por semana.
          </p>
          {missing.length > 0 && <p role="note" className="text-amber-800">Falta: {missing.join(', ')}.</p>}
          <div className="flex justify-end">
            <button type="button" disabled={loading || patient.isPending || missing.length > 0} onClick={() => void fetchPrediction()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Solicitar pronóstico
            </button>
          </div>
        </div>
      )}

      {prediction && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-white p-3">
          <div>
            <p className="font-bold text-violet-800">Sesiones estimadas: {Math.round(prediction.sesiones_estimadas)} (rango {prediction.rango_min}–{prediction.rango_max})</p>
            {prediction.diagnostico_descripcion && <p className="text-xs text-[#615274]">Código: {prediction.diagnostico_descripcion}</p>}
            <p className="text-xs text-[#615274]">Riesgo de abandono estimado: {prediction.riesgo_desercion}</p>
            {prediction.confianza != null && <p className="text-xs text-[#615274]">Confianza del clasificador de riesgo: {Math.round(prediction.confianza * 100)}%.</p>}
            <p className="mt-1 text-xs text-[#615274]">{prediction.advertencia_clinica}</p>
            <p className="mt-1 text-[11px] text-[#8C82A8]">Modelo {prediction.version_modelo} · {applied ? 'Sugerencia aceptada' : 'Sugerencia sin confirmar'}</p>
            <p className="mt-1 text-[11px] text-[#8C82A8]">Puedes ajustar el número de sesiones manualmente; se te pedirá el motivo antes de publicar.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={applied} onClick={() => onApplySessions(Math.round(prediction.sesiones_estimadas))} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
              <Sparkles size={14} />{applied ? 'Sugerencia aceptada' : 'Aceptar sugerencia'}
            </button>
            <button type="button" disabled={discarding} onClick={() => void discardPrediction()} className="rounded-xl border border-[#E8E5F4] px-3 py-2 text-xs font-bold text-[#615274] disabled:opacity-60">
              {discarding ? 'Descartando…' : 'Descartar'}
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-xs font-medium text-rose-700">{error}</p>}
    </section>
  );
}
