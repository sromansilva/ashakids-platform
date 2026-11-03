import { useState } from 'react';
import { Brain, RefreshCw, Sparkles } from 'lucide-react';
import { clinicaService, patientsService, type TreatmentPredictionResponse } from '@/modules/clinica/infrastructure/clinicalService';
import { useRemote } from '@/shared/application/hooks/useRemoteData';

interface TreatmentPredictiveCardProps {
  sessionId: number;
  patientId: number;
  phonemeCount: number;
  collaborationScore: number | null;
  weeklyFrequency: number | null;
  onPredictionLoaded: (prediction: TreatmentPredictionResponse) => void;
  onPredictionDismissed: () => void;
  onApplySessions: (sessions: number, prediction: TreatmentPredictionResponse) => void;
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
  phonemeCount,
  collaborationScore,
  weeklyFrequency,
  onPredictionLoaded,
  onPredictionDismissed,
  onApplySessions,
}: TreatmentPredictiveCardProps) {
  const patient = useRemote(['treatment-prediction-patient', patientId], (signal) => patientsService.get(patientId, signal), patientId > 0);
  const catalog = useRemote(['treatment-predictor-catalog'], (signal) => clinicaService.treatmentPredictionCatalog(signal));
  const [openConfig, setOpenConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [prediction, setPrediction] = useState<TreatmentPredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticCode, setDiagnosticCode] = useState('');
  const ageMonths = ageInMonths(patient.data?.fecha_nacimiento);

  const fetchPrediction = async () => {
    if (prediction) {
      setError('Resuelve o descarta la sugerencia actual antes de solicitar otra.');
      return;
    }
    if (!ageMonths || ageMonths < 24 || ageMonths > 180) {
      setError('Revisa la fecha de nacimiento del perfil; el modelo solo admite edades de 24 a 180 meses.');
      return;
    }
    if (!diagnosticCode || !catalog.data?.diagnosis_codes.some((item) => item.code === Number(diagnosticCode)) || !phonemeCount || !collaborationScore || !weeklyFrequency) {
      setError('Completa el código clínico, los fonemas priorizados, el nivel de ayuda del informe y la frecuencia semanal.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await clinicaService.predictTreatmentPlan({
        id_sesion: sessionId,
        codigo_diagnostico: Number(diagnosticCode),
        frecuencia_semanal: weeklyFrequency,
      });
      setPrediction(result);
      onPredictionLoaded(result);
    } catch {
      setError('El pronóstico está deshabilitado hasta que el servicio disponga de un modelo clínicamente validado. Puedes registrar el plan manualmente.');
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

  const selectClass = 'mt-1 block w-full rounded-lg border border-[#E8E5F4] bg-white p-2 font-bold';
  const labelClass = 'block font-medium text-[#1C1135]';

  return (
    <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50/70 via-white to-purple-50/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-600 text-white"><Brain size={18} /></div>
          <div>
            <h4 className="text-sm font-extrabold text-[#1C1135]">Pronóstico asistido de tratamiento</h4>
            <p className="text-xs text-[#615274]">Solo se activa con un modelo y una validación clínica aprobados.</p>
          </div>
        </div>
        <button type="button" onClick={() => setOpenConfig((open) => !open)} className="text-xs font-bold text-violet-700 hover:underline" aria-expanded={openConfig}>
          {openConfig ? 'Ocultar datos' : 'Revisar datos del pronóstico'}
        </button>
      </div>

      {openConfig && (
        <div className="mt-3 grid gap-3 rounded-xl border border-[#E8E5F4] bg-white p-3 text-xs sm:grid-cols-2 lg:grid-cols-5">
          <label className={labelClass}>Edad del perfil (meses)
            <input readOnly value={ageMonths ?? ''} aria-label="Edad del perfil en meses" className={selectClass} />
          </label>
          <label className={labelClass}>Código diagnóstico preliminar asignado por el terapeuta
            <select disabled={Boolean(prediction)} value={diagnosticCode} onChange={(event) => setDiagnosticCode(event.target.value)} className={selectClass}>
              <option value="">Seleccionar código</option>
              {catalog.data?.diagnosis_codes.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
            </select>
          </label>
          <div className={labelClass}>Fonemas priorizados por el terapeuta
            <p className={`${selectClass} min-h-10`}>{phonemeCount || 'Pendiente de seleccionar'}</p>
          </div>
          <div className={labelClass}>Colaboración desde el informe
            <p className={`${selectClass} min-h-10`}>{collaborationScore ?? 'Completa el nivel de ayuda'}</p>
          </div>
          <div className={labelClass}>Frecuencia semanal del plan
            <p className={`${selectClass} min-h-10`}>{weeklyFrequency ? `${weeklyFrequency} sesión(es)` : 'Pendiente de indicar'}</p>
          </div>
          <p className="sm:col-span-2 lg:col-span-5 text-[#615274]">
            La edad procede del perfil; los fonemas, de evaluaciones de esta sesión confirmadas por el terapeuta; la colaboración, del nivel de ayuda del informe; y la frecuencia, del plan. El catálogo diagnóstico debe estar revisado por la institución.
          </p>
          {catalog.isPending && <p role="status" className="sm:col-span-2 lg:col-span-5 text-xs text-[#615274]">Consultando el catálogo y la disponibilidad del modelo aprobado…</p>}
          {catalog.error && <p role="note" className="sm:col-span-2 lg:col-span-5 text-xs text-amber-800">No hay un modelo aprobado con catálogo diagnóstico disponible. Puedes guardar el plan manualmente.</p>}
          <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
            <button type="button" disabled={loading || discarding || !!prediction || patient.isPending || catalog.isPending || !catalog.data} onClick={() => void fetchPrediction()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              Solicitar pronóstico
            </button>
          </div>
        </div>
      )}

      {prediction && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-100 bg-white p-3">
          <div>
            <p className="font-bold text-violet-800">{Math.round(prediction.sesiones_estimadas)} sesiones (rango {prediction.rango_min}–{prediction.rango_max})</p>
            {prediction.diagnostico_descripcion && <p className="text-xs text-[#615274]">Código: {prediction.diagnostico_descripcion}</p>}
            <p className="text-xs text-[#615274]">Riesgo de abandono estimado: {prediction.riesgo_desercion}</p>
            {prediction.confianza != null && <p className="text-xs text-[#615274]">Confianza del clasificador de riesgo: {Math.round(prediction.confianza * 100)}%.</p>}
            <p className="mt-1 text-xs text-[#615274]">{prediction.advertencia_clinica}</p>
            <p className="mt-1 text-[11px] text-[#8C82A8]">Modelo {prediction.version_modelo} · Sugerencia sin confirmar</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onApplySessions(Math.round(prediction.sesiones_estimadas), prediction)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white">
              <Sparkles size={14} />Usar sugerencia
            </button>
            <button type="button" disabled={discarding} onClick={() => void discardPrediction()} className="rounded-xl border border-[#E8E5F4] px-3 py-2 text-xs font-bold text-[#615274] disabled:opacity-60">
              {discarding ? 'Descartando…' : 'Descartar'}
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-xs font-medium text-rose-700">{error}</p>}
      {!openConfig && !prediction && <p className="mt-3 text-xs text-[#615274]">El plan puede completarse manualmente mientras se valida el modelo predictivo.</p>}
    </section>
  );
}
