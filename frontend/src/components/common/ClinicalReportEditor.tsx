import { useId, useState } from 'react';
import { useWrite } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import type { ReportData } from '@/types/clinical';
import { Btn } from './Btn';
import { RemoteFeedback } from './RemoteFeedback';

export const reportLabels = {
  observaciones_iniciales: 'Observaciones iniciales', objetivos_trabajados: 'Objetivos trabajados',
  nivel_ayuda: 'Nivel de ayuda', proximos_pasos: 'Próximos pasos',
} as const;
export const emptyReport: ReportData = {
  observaciones_iniciales: '', objetivos_trabajados: '', nivel_ayuda: '', proximos_pasos: '',
};
export function ClinicalReportEditor({ id, initial, onSaved }: {
  id: number; initial: ReportData; onSaved?: () => void;
}) {
  const [form, setForm] = useState<ReportData>(() => ({
    observaciones_iniciales: initial.observaciones_iniciales,
    objetivos_trabajados: initial.objetivos_trabajados,
    nivel_ayuda: initial.nivel_ayuda, proximos_pasos: initial.proximos_pasos,
  }));
  const formId = useId();
  const [dirty, setDirty] = useState(false);
  const save = useWrite(() => sessionsService.saveReport(id, form), () => { setDirty(false); onSaved?.(); });
  return <form className="space-y-3" onSubmit={e => { e.preventDefault(); void save.submit(undefined); }}>
    {Object.entries(reportLabels).map(([key, label]) => <div className="text-sm font-bold text-[#1C1135]" key={key}><label htmlFor={`${formId}-${key}`}>{label}</label>
      <textarea id={`${formId}-${key}`} maxLength={10000} disabled={save.isPending} className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] p-3 min-h-24"
        value={form[key as keyof ReportData] ?? ''} onChange={e => { setDirty(true); setForm({ ...form, [key]: e.target.value }); }}/>
    </div>)}
    <p className="text-xs text-[#7C6F9A]">Reporte compartido con la familia. Las notas privadas no forman parte de estos campos.</p>
    <RemoteFeedback error={save.error}/>
    {save.isSuccess && !dirty && <p role="status">Reporte guardado en el servidor.</p>}
    {dirty && <p role="status" className="text-xs text-[#7C6F9A]">Cambios sin guardar.</p>}
    <Btn type="submit" disabled={save.isPending}>{save.isPending ? 'Guardando reporte…' : 'Guardar reporte'}</Btn>
  </form>;
}
