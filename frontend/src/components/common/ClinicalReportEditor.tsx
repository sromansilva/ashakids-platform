import { useId, useRef, useState } from 'react';
import { useWrite } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import type { ReportData } from '@/types/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';
import { ReportHelpLevel } from './ReportHelpLevel';
import { incompleteTemplateFields, reportTemplates, type NarrativeField } from './reportFormGuidance';

export const reportLabels = {
  observaciones_iniciales: 'Observaciones iniciales', objetivos_trabajados: 'Objetivos trabajados',
  nivel_ayuda: 'Nivel de ayuda', proximos_pasos: 'Próximos pasos',
} as const;
export const emptyReport: ReportData = {
  observaciones_iniciales: '', objetivos_trabajados: '', nivel_ayuda: '', proximos_pasos: '',
};
export function ClinicalReportEditor({ id, initial, patientName, onSaved }: {
  id: number; initial: ReportData; patientName?: string; onSaved?: () => void;
}) {
  const [form, setForm] = useState<ReportData>(() => ({
    observaciones_iniciales: initial.observaciones_iniciales,
    objetivos_trabajados: initial.objetivos_trabajados,
    nivel_ayuda: initial.nivel_ayuda, proximos_pasos: initial.proximos_pasos,
  }));
  const formId = useId();
  const textareas = useRef<Partial<Record<NarrativeField, HTMLTextAreaElement>>>({});
  const templates = reportTemplates(patientName);
  const [dirty, setDirty] = useState(false);
  const [validation, setValidation] = useState(false);
  const incomplete = incompleteTemplateFields(form);
  const update = (key: keyof ReportData, value: string) => { setDirty(true); setForm(current => ({ ...current, [key]: value })); };
  const useTemplate = (key: NarrativeField) => {
    if (form[key]?.trim()) return;
    update(key, templates[key]);
    requestAnimationFrame(() => {
      const textarea = textareas.current[key];
      textarea?.focus();
      const first = templates[key].indexOf('['), last = templates[key].indexOf(']', first);
      if (first >= 0) textarea?.setSelectionRange(first, last + 1);
    });
  };
  const save = useWrite(() => sessionsService.saveReport(id, form), () => { setDirty(false); onSaved?.(); });
  return <form className="space-y-5" onSubmit={e => {
    e.preventDefault(); setValidation(true);
    if (incomplete.length) { textareas.current[incomplete[0]]?.focus(); return; }
    void save.submit(undefined);
  }}>
    <p className="text-sm text-[#615274]">Puedes usar las plantillas y completar los espacios entre corchetes con los datos de esta sesión.</p>
    {Object.entries(reportLabels).map(([key, label]) => {
      if (key === 'nivel_ayuda') return <ReportHelpLevel key={key} id={`${formId}-help`} value={form.nivel_ayuda} disabled={save.isPending} onChange={value => update(key, value)}/>;
      const narrative = key as NarrativeField;
      const invalid = validation && incomplete.includes(narrative);
      return <div className="space-y-2 text-sm text-[#1C1135]" key={key}>
        <div className="flex flex-wrap items-center justify-between gap-2"><label className="font-bold" htmlFor={`${formId}-${key}`}>{label}</label>
          {!form[narrative]?.trim() && <button type="button" disabled={save.isPending} aria-label={`Usar plantilla de ${label.toLowerCase()}`} className="min-h-11 rounded-lg px-3 text-sm font-bold text-violet-700 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-violet-700" onClick={() => useTemplate(narrative)}>Usar plantilla</button>}
        </div>
        <textarea ref={node => { if (node) textareas.current[narrative] = node; }} id={`${formId}-${key}`} rows={4} maxLength={10000} disabled={save.isPending}
          placeholder={templates[narrative]} aria-invalid={invalid} aria-describedby={invalid ? `${formId}-${key}-error` : undefined}
          className="w-full rounded-2xl border border-[#C8C2DC] bg-white p-3 min-h-32 leading-relaxed placeholder:text-[#615274]"
          value={form[narrative] ?? ''} onChange={e => update(narrative, e.target.value)}/>
        {invalid && <p id={`${formId}-${key}-error`} className="text-sm text-red-700">Completa o elimina los espacios entre corchetes de esta plantilla.</p>}
      </div>;
    })}
    {validation && incomplete.length > 0 && <p role="alert" className="text-sm text-red-700">Completa la plantilla antes de guardar: {incomplete.map(key => reportLabels[key]).join(', ')}.</p>}
    <p className="text-xs text-[#7C6F9A]">Reporte compartido con la familia. Las notas privadas no forman parte de estos campos.</p>
    <RemoteFeedback error={save.error}/>
    {save.isSuccess && !dirty && <p role="status">Reporte guardado en el servidor.</p>}
    {dirty && <p role="status" className="text-xs text-[#7C6F9A]">Cambios sin guardar.</p>}
    <Btn type="submit" disabled={save.isPending}>{save.isPending ? 'Guardando reporte…' : 'Guardar reporte'}</Btn>
  </form>;
}
