import type { PhoneticSupportIndicators } from '@/modules/clinica/infrastructure/clinicalService';

export const SUPPORT_LABEL = 'Indicador de apoyo · sin validación clínica';

const ERROR_TYPE_LABELS: Record<PhoneticSupportIndicators['tipo_error_sugerido'], string> = {
  SIN_DIFERENCIA: 'Sin diferencia',
  SUSTITUCION: 'Sustitución',
  OMISION: 'Omisión',
  ADICION: 'Adición',
  MIXTO: 'Mixto',
};

/** Solo para el terapeuta: sugerencias calculadas por el servidor desde el texto, sin validación clínica. */
export function PhoneticSupportIndicatorsPanel({ indicators }: { indicators: PhoneticSupportIndicators }) {
  return (
    <div className="space-y-2 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] p-3" data-testid="phonetic-support-indicators">
      <p className="inline-block rounded-full bg-[#EDE9FE] px-2.5 py-1 text-[11px] font-extrabold text-[#5833EA]">{SUPPORT_LABEL}</p>
      <dl className="grid grid-cols-1 gap-2 text-xs text-[#1C1135] sm:grid-cols-3">
        <div>
          <dt className="font-bold text-[#615274]">Similitud de texto</dt>
          <dd className="text-base font-black tabular-nums">{indicators.similitud_texto_porcentaje} %</dd>
        </div>
        <div>
          <dt className="font-bold text-[#615274]">Tipo de error sugerido</dt>
          <dd className="font-extrabold">{ERROR_TYPE_LABELS[indicators.tipo_error_sugerido]}</dd>
        </div>
        <div>
          <dt className="font-bold text-[#615274]">Hipótesis sugerida</dt>
          <dd className="font-extrabold">{indicators.hipotesis_sugerida ?? 'Sin hipótesis'}</dd>
        </div>
      </dl>
      <p className="text-[11px] text-[#615274]">Calculado solo desde el texto; no detecta distorsiones. Confirma o descarta según lo que escuchaste.</p>
    </div>
  );
}

interface AttemptFieldsProps {
  attempts: string;
  note: string;
  onAttempts: (value: string) => void;
  onNote: (value: string) => void;
}

/** Intentos y nota rápida que registra el terapeuta junto a la revisión. */
export function PhoneticAttemptFields({ attempts, note, onAttempts, onNote }: AttemptFieldsProps) {
  const input = 'mt-1 block w-full rounded-lg border border-[#E8E5F4] bg-white p-2 text-sm';
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[8rem_1fr]">
      <label className="block text-xs font-bold text-[#1C1135]">
        Intentos
        <input type="number" min={1} max={20} value={attempts} onChange={(event) => onAttempts(event.target.value)} className={input} />
      </label>
      <label className="block text-xs font-bold text-[#1C1135]">
        Nota rápida
        <input value={note} onChange={(event) => onNote(event.target.value)} maxLength={500} className={input} placeholder="Ej. necesitó modelado, se distrajo" />
      </label>
    </div>
  );
}
