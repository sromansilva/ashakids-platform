import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { ChevronDown, Mic, Save } from 'lucide-react';
import { useRemote, useWrite } from '@/shared/application/hooks/useRemoteData';
import { sessionsService } from '@/modules/clinica/infrastructure/clinicalService';
import type { Report, ReportData } from '@/modules/clinica/domain/clinical';
import { RemoteFeedback } from './RemoteFeedback';
import { ReportHelpLevel } from './ReportHelpLevel';
import { TherapistVoiceAIWidget } from './TherapistVoiceAIWidget';
import { helpLevels, incompleteTemplateFields, reportTemplates, type NarrativeField } from './reportFormGuidance';
import { encodeArticulationResult, parseArticulationHistory } from '@/shared/application/articulationReportEntries';

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
  twoColumns = false,
  downloadAction,
  planAction,
  onSaved,
}: {
  id: number;
  initial: ReportData & Partial<Pick<Report, 'estado_reporte' | 'fecha_firma'>>;
  patientName?: string;
  patientId?: number;
  sessionType?: 'INTRODUCTORIA' | 'TERAPIA';
  twoColumns?: boolean;
  downloadAction?: ReactNode;
  planAction?: ReactNode;
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
  const [reportStatus, setReportStatus] = useState<'BORRADOR' | 'FIRMADO'>(initial.estado_reporte ?? 'BORRADOR');
  const [signedAt, setSignedAt] = useState(initial.fecha_firma ?? null);
  const [validation, setValidation] = useState(false);
  const editRevision = useRef(0);
  const submittedRevision = useRef(0);
  const lastAutoSaveAttempt = useRef(0);
  const incomplete = incompleteTemplateFields(form);
  const history = useRemote(
    ['articulation-history', id],
    (signal) => sessionsService.articulationHistory(id, signal),
    typeof patientId === 'number' && Number.isInteger(patientId) && patientId > 0,
  );
  const priorResults = parseArticulationHistory(history.data ?? []);
  const hasStandardHelpLevel = helpLevels.some((level) => level.value === form.nivel_ayuda);

  const update = (key: keyof ReportData, value: string) => {
    editRevision.current += 1;
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
    (draft: ReportData) => sessionsService.saveReport(id, draft),
    () => {
      setDirty(editRevision.current !== submittedRevision.current);
      onSaved?.();
    }
  );
  const saveSubmitRef = useRef(save.submit);
  saveSubmitRef.current = save.submit;
  useEffect(() => {
    if (!dirty || reportStatus === 'FIRMADO' || save.isPending || editRevision.current <= lastAutoSaveAttempt.current) return;
    const revision = editRevision.current;
    const draft = { ...form };
    const timeout = window.setTimeout(() => {
      if (editRevision.current !== revision || revision <= lastAutoSaveAttempt.current) return;
      lastAutoSaveAttempt.current = revision;
      submittedRevision.current = revision;
      void saveSubmitRef.current(draft);
    }, 900);
    return () => window.clearTimeout(timeout);
  }, [dirty, form, reportStatus, save.isPending]);
  const sign = useWrite<void>(
    () => sessionsService.signReport(id),
    () => {
      setReportStatus('FIRMADO');
      setSignedAt(new Date().toISOString());
      onSaved?.();
    },
  );
  const reportComplete = [
    form.observaciones_iniciales,
    form.objetivos_trabajados,
    form.nivel_ayuda,
    form.proximos_pasos,
  ].every((value) => Boolean(value?.trim()));

  return (
    <form
      className={twoColumns ? 'space-y-3' : 'space-y-4'}
      onSubmit={(e) => {
        e.preventDefault();
        setValidation(true);
        if (incomplete.length) {
          textareas.current[incomplete[0]]?.focus();
          return;
        }
        submittedRevision.current = editRevision.current;
        void save.submit({ ...form });
      }}
    >
      {!twoColumns && (
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
      )}

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

      {reportStatus !== 'FIRMADO' && <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-3 rounded-xl border border-violet-100 bg-violet-50/35 px-4 py-3 transition-colors hover:bg-violet-50">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-[#6B46FE] shadow-sm"><Mic size={17} /></span>
          <span>
            <span className="block text-sm font-extrabold text-[#1C1135]">Evaluación fonológica opcional</span>
            <span className="block text-xs text-[#615274]">Transcripción tentativa con consentimiento y revisión del terapeuta</span>
          </span>
          <ChevronDown size={17} className="ml-auto shrink-0 text-[#6B46FE] transition-transform group-open:rotate-180" />
        </summary>
        <div className="pt-3">
          <TherapistVoiceAIWidget
            sessionId={id}
            patientId={patientId}
            patientName={patientName}
            onConfirmResult={(result) => {
              const entry = encodeArticulationResult(result);
              const currentObjectives = form.objetivos_trabajados?.trim() ?? '';
              if (currentObjectives.includes(entry)) return;
              update('objetivos_trabajados', currentObjectives ? currentObjectives + '\n\n' + entry : entry);
            }}
          />
        </div>
      </details>}

      <div className={twoColumns ? 'grid min-w-0 grid-cols-1 gap-x-4 gap-y-3 xl:grid-cols-2' : 'space-y-4'}>
        {Object.entries(reportLabels).map(([key, label]) => {
          if (key === 'nivel_ayuda') {
            return (
              <div key={key} className="min-w-0">
                <ReportHelpLevel
                  id={`${formId}-help`}
                  value={form.nivel_ayuda}
                  disabled={save.isPending || reportStatus === 'FIRMADO'}
                  onChange={(value) => update(key, value)}
                />
              </div>
            );
          }
          const narrative = key as NarrativeField;
          const invalid = validation && incomplete.includes(narrative);
          return (
            <div className="min-w-0 space-y-2 text-sm text-[#1C1135]" key={key}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="font-extrabold text-sm text-[#1C1135]" htmlFor={`${formId}-${key}`}>
                  {label}
                </label>
                {!form[narrative]?.trim() && (
                  <button
                    type="button"
                    disabled={save.isPending || reportStatus === 'FIRMADO'}
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
                rows={twoColumns ? 3 : 4}
                maxLength={10000}
                disabled={save.isPending || reportStatus === 'FIRMADO'}
                placeholder={templates[narrative]}
                aria-invalid={invalid}
                aria-describedby={invalid ? `${formId}-${key}-error` : undefined}
                className={`w-full rounded-2xl border border-[#E8E5F4] bg-[#F8F7FC] p-3.5 text-xs font-medium leading-relaxed text-[#1C1135] placeholder:text-[#9E95B7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#6B46FE] transition-all ${twoColumns ? 'min-h-[76px]' : 'min-h-[90px]'}`}
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
      </div>

      {validation && incomplete.length > 0 && (
        <p role="alert" className="text-xs font-bold text-red-600">
          Completa la plantilla antes de guardar: {incomplete.map((key) => reportLabels[key]).join(', ')}.
        </p>
      )}

      <RemoteFeedback error={save.error} />
      <RemoteFeedback error={sign.error} />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {planAction}
        <div className="flex flex-wrap items-center justify-end gap-3">
          {reportStatus === 'FIRMADO' ? (
            <p role="status" className="text-xs font-bold text-emerald-700">
              Reporte firmado{signedAt ? ' · ' + new Date(signedAt).toLocaleString('es-PE') : ''}.
            </p>
          ) : (
            <button
              type="button"
              disabled={sign.isPending || dirty || !reportComplete || !hasStandardHelpLevel}
              onClick={() => void sign.submit(undefined)}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-800 disabled:opacity-50"
            >
              {sign.isPending ? 'Firmando…' : 'Firmar y publicar reporte'}
            </button>
          )}
          {reportStatus !== 'FIRMADO' && reportComplete && !hasStandardHelpLevel && (
            <p role="note" className="w-full text-right text-xs text-[#615274]">
              Conserva el nivel histórico al guardar; selecciona una de las cinco opciones para firmar el reporte.
            </p>
          )}
          {save.isPending && <p role="status" className="text-xs font-bold text-[#6B46FE]">Guardando borrador automáticamente…</p>}
          {save.isSuccess && !dirty && <p role="status" className="text-xs font-bold text-[#16A34A]">Reporte guardado en el servidor.</p>}
          {dirty && !save.isPending && <p role="status" className="text-xs font-bold text-[#D97706]">● Cambios sin guardar. Se guardarán automáticamente en unos segundos.</p>}
          {downloadAction}
          <button
            type="submit"
            disabled={save.isPending || reportStatus === 'FIRMADO'}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#6B46FE] px-5 py-2.5 text-sm font-extrabold text-white shadow-md transition-all hover:bg-[#5833EA] active:scale-[.98] disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {save.isPending ? 'Guardando reporte…' : 'Guardar reporte'}
          </button>
        </div>
      </div>
    </form>
  );
}
