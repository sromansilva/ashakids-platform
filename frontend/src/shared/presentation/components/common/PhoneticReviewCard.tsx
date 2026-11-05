import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { clinicaService, type PhoneticSupportIndicators } from '@/modules/clinica/infrastructure/clinicalService';
import type { ReviewedArticulationResult } from '@/shared/application/articulationReportEntries';
import { PHONETIC_TARGETS } from '@/shared/application/audio/phoneticCaptureConstants';
import { PhoneticAttemptFields, PhoneticSupportIndicatorsPanel } from '@/shared/presentation/components/common/PhoneticSupportIndicatorsPanel';

/** Evaluación pendiente de revisión (PENDIENTE_REVISION) de la sesión actual. */
export interface PendingPhoneticReview {
  id_evaluacion: number;
  palabra_esperada: string;
  transcripcion_tentativa: string;
  duracion_segundos: number | null;
  /** Calculados por el servidor desde el texto; sin validación clínica. Nunca llegan a la familia. */
  indicadores_apoyo?: PhoneticSupportIndicators;
  origen: string;
}

const field = 'mt-1 block w-full rounded-lg border border-[#E8E5F4] bg-white p-2 text-sm';

/**
 * Revisión de una muestra: el terapeuta corrige la transcripción tentativa y confirma (con
 * observación y resultado) o la descarta. Cada tarjeta es independiente, así sobreviven varias.
 */
export function PhoneticReviewCard({ item, onDone, onConfirmResult }: {
  item: PendingPhoneticReview;
  onDone: () => void;
  onConfirmResult?: (result: ReviewedArticulationResult) => void;
}) {
  const [transcript, setTranscript] = useState(item.transcripcion_tentativa);
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState('');
  const [attempts, setAttempts] = useState('1');
  const [quickNote, setQuickNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const review = async (discard: boolean) => {
    if (!discard && (!transcript.trim() || !note.trim() || !outcome)) {
      setError('Corrige la transcripción, registra una observación y selecciona el resultado observado antes de confirmar.');
      return;
    }
    const attemptCount = Number(attempts);
    if (!discard && (!Number.isInteger(attemptCount) || attemptCount < 1 || attemptCount > 20)) {
      setError('Indica un número de intentos entre 1 y 20.');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await clinicaService.reviewPhoneticEvaluation(item.id_evaluacion, {
        estado: discard ? 'DESCARTADO' : 'CONFIRMADO_TERAPEUTA',
        transcripcion_revisada: discard ? undefined : transcript.trim(),
        observacion_terapeuta: discard ? 'Descartada por el terapeuta.' : note.trim(),
        resultado_clinico: discard ? undefined : outcome as 'ALCANZADO' | 'EN_PROCESO' | 'REQUIERE_APOYO',
        intentos: discard ? undefined : attemptCount,
        nota_rapida: discard || !quickNote.trim() ? undefined : quickNote.trim(),
      });
      if (!discard) {
        const target = PHONETIC_TARGETS.find((entry) => entry.word === item.palabra_esperada);
        onConfirmResult?.({
          objetivo_articulacion: target ? 'Observación del objetivo ' + target.phoneme : 'Observación de pronunciación',
          palabra_esperada: item.palabra_esperada,
          transcripcion_tentativa: item.transcripcion_tentativa,
          resultado_revisado: note.trim() + ' Transcripción revisada: "' + transcript.trim() + '". Resultado del objetivo en esta muestra: ' + outcome.replaceAll('_', ' ').toLocaleLowerCase('es') + '.',
          archivo_origen: item.origen,
          inicio_segundo: 0,
          fin_segundo: Math.max(0.5, item.duracion_segundos ?? 3),
          // Solo se pega tras la confirmación del terapeuta; la hipótesis sugerida nunca se incluye.
          ...(item.indicadores_apoyo ? { similitud_apoyo: item.indicadores_apoyo.similitud_texto_porcentaje } : {}),
        });
      }
      onDone();
    } catch {
      setError('No se pudo guardar la revisión. La sesión o la evaluación pueden haber cambiado.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="space-y-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3" data-testid="pending-phonetic-review">
      <p className="text-xs font-black text-[#1C1135]">Palabra: {item.palabra_esperada} · pendiente de revisión</p>
      <p className="text-xs font-semibold text-[#615274]">
        Transcripción automática preliminar. Los indicadores de apoyo se calculan solo desde el texto, no miden acústica ni establecen un diagnóstico; requieren revisión y confirmación del terapeuta.
      </p>
      {item.indicadores_apoyo && <PhoneticSupportIndicatorsPanel indicators={item.indicadores_apoyo} />}
      <PhoneticAttemptFields attempts={attempts} note={quickNote} onAttempts={setAttempts} onNote={setQuickNote} />
      <label className="block text-xs font-bold text-[#1C1135]">
        Transcripción tentativa (edítala según lo escuchado)
        <input value={transcript} onChange={(event) => setTranscript(event.target.value)} maxLength={500} className={field} />
      </label>
      <label className="block text-xs font-bold text-[#1C1135]">
        Observación del terapeuta
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={2000}
          rows={3}
          className={field}
          placeholder="Describe lo observado, sin convertir la transcripción automática en diagnóstico."
        />
      </label>
      <label className="block text-xs font-bold text-[#1C1135]">
        Resultado del objetivo observado por el terapeuta
        <select value={outcome} onChange={(event) => setOutcome(event.target.value)} className={field}>
          <option value="">Seleccionar resultado</option>
          <option value="ALCANZADO">Alcanzado en esta muestra</option>
          <option value="EN_PROCESO">En proceso</option>
          <option value="REQUIERE_APOYO">Requiere apoyo</option>
        </select>
        <span className="mt-1 block font-normal text-[#615274]">Describe esta muestra revisada; no es una conclusión automática ni un diagnóstico.</span>
      </label>
      {error && <p role="alert" className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800"><AlertCircle size={15} />{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => void review(false)} className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
          Confirmar y pegar en el informe
        </button>
        <button type="button" disabled={busy} onClick={() => void review(true)} className="rounded-xl border border-[#E8E5F4] px-3 py-2 text-xs font-bold text-[#615274] disabled:opacity-50">
          Descartar transcripción
        </button>
      </div>
    </li>
  );
}
