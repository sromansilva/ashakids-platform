import { useId, useRef, useState } from 'react';
import { ChevronDown, Mic, Save } from 'lucide-react';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { ReportData } from '@/modules/clinica/domain/clinical';
import { RemoteFeedback } from './RemoteFeedback';
import { ReportHelpLevel } from './ReportHelpLevel';
import { TherapistVoiceAIWidget } from './TherapistVoiceAIWidget';
import { incompleteTemplateFields, reportTemplates, type NarrativeField } from './reportFormGuidance';
import { parseArticulationHistory } from '@/shared/application/articulationReportEntries';

export const reportLabels = {
  observaciones_iniciales: 'Observaciones iniciales',
  objetivos_trabajados: 'Objetivos trabajados',
  nivel_ayuda: 'Nivel de ayuda',
  proximos_pasos: 'Próximos pasos',
} as const;

export const emptyReport: ReportData = {
  observaciones_iniciales: '',
  objetivos_trabajados: '',
  nivel_ayuda: '',
  proximos_pasos: '',
};

export function ClinicalReportEditor({
  id,
  initial,
  patientName,
  patientId,
  sessionType = 'INTRODUCTORIA',
  onSaved,
}: {
  id: number;
  initial: ReportData;
  patientName?: string;
  patientId?: number;
  sessionType?: 'INTRODUCTORIA' | 'TERAPIA';
  onSaved?: () => void;
}) {
  const [form, setForm] = useState<ReportData>(() => ({
    observaciones_iniciales: initial.observaciones_iniciales,
    objetivos_trabajados: initial.objetivos_trabajados,
    nivel_ayuda: initial.nivel_ayuda,
    proximos_pasos: initial.proximos_pasos,
  }));
  const formId = useId();
  const textareas = useRef<Partial<Record<NarrativeField, HTMLTextAreaElement>>>({});
  const templates = reportTemplates(patientName);
  const [dirty, setDirty] = useState(false);
  const [validation, setValidation] = useState(false);
  const incomplete = incompleteTemplateFields(form);
  const history = useRemote(
    ['articulation-history', id],
    (signal) => sessionsService.articulationHistory(id, signal),
    typeof patientId === 'number' && Number.isInteger(patientId) && patientId > 0,
  );
  const priorResults = parseArticulationHistory(history.data ?? []);

  const update = (key: keyof ReportData, value: string) => {
    setDirty(true);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const useTemplate = (key: NarrativeField) => {
    if (form[key]?.trim()) return;
    update(key, templates[key]);
    requestAnimationFrame(() => {
      const textarea = textareas.current[key];
      textarea?.focus();
      const first = templates[key].indexOf('[');
      const last = templates[key].indexOf(']', first);
      if (first >= 0) textarea?.setSelectionRange(first, last + 1);
    });
  };

  const save = useWrite(
    () => sessionsService.saveReport(id, form),
    () => {
      setDirty(false);
      onSaved?.();
    }
  );

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setValidation(true);
        if (incomplete.length) {
          textareas.current[incomplete[0]]?.focus();
          return;
        }
        void save.submit(undefined);
      }}
    >
      <div className="flex flex-col gap-x-3 gap-y-1 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm text-[#4B4264] sm:flex-row sm:items-start">
        <p className="shrink-0 font-extrabold text-[#1C1135]">
          {sessionType === 'INTRODUCTORIA' ? 'Línea base de la sesión introductoria' : 'Seguimiento de objetivos'}
        </p>
        <p className="text-xs leading-relaxed">
          {sessionType === 'INTRODUCTORIA'
            ? 'Registra lo que se observó realmente en esta sesión. El reporte no crea resultados previos ni completa datos clínicos automáticamente.'
            : 'Consulta resultados revisados que ya fueron guardados en reportes anteriores del mismo paciente. La comparación y las conclusiones quedan a cargo del terapeuta.'}
        </p>
      </div>

      {sessionType === 'TERAPIA' && (
        <section className="space-y-2 rounded-2xl border border-[#E8E5F4] bg-white p-4" aria-labelledby="articulation-history-title">
          <h3 id="articulation-history-title" className="text-sm font-extrabold text-[#1C1135]">Resultados anteriores guardados</h3>
          <p className="text-xs text-[#615274]">Este historial se consulta solo desde reportes clínicos guardados. Los intentos y medallas de los juegos educativos se muestran por separado y no se usan como progreso por objetivo.</p>
          <RemoteFeedback pending={history.isPending} error={history.error} retry={() => void history.refetch()} />
          {history.isSuccess && !history.error && priorResults.length === 0 && (
            <p className="text-xs text-[#615274]">No hay resultados revisados de articulación guardados en reportes anteriores para este paciente.</p>
          )}
          {history.isSuccess && priorResults.length > 0 && (
            <ul className="space-y-2">
              {priorResults.map((entry, index) => (
                <li key={`${entry.id_sesion}-${index}`} className="rounded-xl bg-[#F8F7FC] p-3 text-xs text-[#4B4264]">
                  <p className="font-bold text-[#1C1135]">
                    Sesión #{entry.id_sesion} · {new Date(entry.fecha_hora_inicio).toLocaleDateString('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium' })}
                  </p>
                  <p className="mt-1">Objetivo: {entry.objetivo_articulacion} · Palabra: {entry.palabra_esperada}</p>
                  <p>Resultado revisado: {entry.resultado_revisado}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/35 px-4 py-3 transition-colors hover:bg-violet-50">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#6B46FE] shadow-sm"><Mic size={17} /></span>
          <span>
            <span className="block text-sm font-extrabold text-[#1C1135]">Evaluación fonológica opcional</span>
            <span className="block text-xs text-[#615274]">Audio en vivo y prueba rápida con IA</span>
          </span>
          <ChevronDown size={17} className="ml-auto shrink-0 text-[#6B46FE] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-3">
          <TherapistVoiceAIWidget
            sessionId={id}
            patientName={patientName}
            onApplyObservation={(obs) => {
              const currentObs = form.observaciones_iniciales?.trim();
              update('observaciones_iniciales', currentObs ? `${currentObs}\n\n${obs}` : obs);
            }}
            onConfirmResult={(result) => {
              const summary = result.resultado_revisado;
              const currentObs = form.observaciones_iniciales?.trim();
              update('observaciones_iniciales', currentObs ? `${currentObs}\n\n${summary}` : summary);
            }}
          />
        </div>
      </details>

      {Object.entries(reportLabels).map(([key, label]) => {
        if (key === 'nivel_ayuda') {
          return (
            <ReportHelpLevel
              key={key}
              id={`${formId}-help`}
              value={form.nivel_ayuda}
              disabled={save.isPending}
              onChange={(value) => update(key, value)}
            />
          );
        }
        const narrative = key as NarrativeField;
        const invalid = validation && incomplete.includes(narrative);
        return (
          <div className="space-y-2 text-sm text-[#1C1135]" key={key}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-extrabold text-sm text-[#1C1135]" htmlFor={`${formId}-${key}`}>
                {label}
              </label>
              {!form[narrative]?.trim() && (
                <button
                  type="button"
                  disabled={save.isPending}
                  aria-label={`Usar plantilla de ${label.toLowerCase()}`}
                  className="rounded-xl px-3 py-1 text-xs font-bold text-[#6B46FE] hover:bg-violet-50 transition-colors"
                  onClick={() => useTemplate(narrative)}
                >
                  Usar plantilla
                </button>
              )}
            </div>
            <textarea
              ref={(node) => {
                if (node) textareas.current[narrative] = node;
              }}
              id={`${formId}-${key}`}
              rows={4}
              maxLength={10000}
              disabled={save.isPending}
              placeholder={templates[narrative]}
              aria-invalid={invalid}
              aria-describedby={invalid ? `${formId}-${key}-error` : undefined}
              className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-4 text-xs font-medium leading-relaxed text-[#1C1135] placeholder:text-[#9E95B7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B46FE] transition-all min-h-[90px]"
              value={form[narrative] ?? ''}
              onChange={(e) => update(narrative, e.target.value)}
            />
            {invalid && (
              <p id={`${formId}-${key}-error`} className="text-xs font-bold text-red-600">
                Completa o elimina los espacios entre corchetes de esta plantilla.
              </p>
            )}
          </div>
        );
      })}

      {validation && incomplete.length > 0 && (
        <p role="alert" className="text-xs font-bold text-red-600">
          Completa la plantilla antes de guardar: {incomplete.map((key) => reportLabels[key]).join(', ')}.
        </p>
      )}

      <p className="text-xs text-[#9E95B7]">
        Reporte compartido con la familia. Las notas privadas no forman parte de estos campos.
      </p>

      <RemoteFeedback error={save.error} />
      {save.isSuccess && !dirty && <p role="status" className="text-xs font-bold text-[#16A34A]">Reporte guardado en el servidor.</p>}
      {dirty && <p role="status" className="text-xs font-bold text-[#D97706]">● Cambios sin guardar.</p>}

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6B46FE] hover:bg-[#5833EA] text-white font-extrabold text-sm shadow-md transition-all active:scale-[.98] disabled:opacity-50 cursor-pointer"
        >
          <Save size={16} />
          {save.isPending ? 'Guardando reporte…' : 'Guardar reporte'}
        </button>
      </div>
    </form>
  );
}
