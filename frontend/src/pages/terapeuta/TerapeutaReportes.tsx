import { useState } from 'react';
import { Download, Eye, Send, Edit, Plus, X } from 'lucide-react';
import { B } from '@/theme/brand/B';
import type { View } from '@/types/navigation';
import type { Session } from '@/types/clinical';
import { Btn } from '@/components/common/Btn';
import { Crd } from '@/components/common/Crd';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { useRemote } from '@/hooks/useRemoteData';
import { sessionsService } from '@/services/clinicalService';
import { readAllPages } from '@/services/readAllPages';
import { ReportWorkspace } from './reports/ReportWorkspace';
import { downloadPdf } from './downloadPdf';

const dateLabel = (session: Session) => new Date(session.cita.fecha_hora_inicio).toLocaleString('es-PE', { timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short' });
export function TerapeutaReportes({ go: _go }: { go: (v: View) => void }) {
  const sessions = useRemote(['report-sessions'], signal => readAllPages(offset => sessionsService.list({ limit: 100, offset }, signal), signal));
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [candidate, setCandidate] = useState(0);
  const rows = sessions.error ? [] : sessions.data ?? [];
  const reports = rows.filter(s => s.reporte_disponible);
  const eligible = rows.filter(s => !s.reporte_disponible && ['EN_CURSO', 'FINALIZADA'].includes(s.estado_sesion) && s.asistencia !== 'NO_ASISTIO');
  const selected = rows.find(s => s.id_sesion === selectedId) ?? reports[0];
  const templates = ['Evaluación inicial', 'Seguimiento mensual', 'Alta terapéutica', 'Informe psicológico', 'Informe de lenguaje'];
  return <div className="p-4 sm:p-6 max-w-7xl mx-auto">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="mb-1 text-2xl font-black text-[#1C1135]">Reportes</h2><p className="text-sm font-medium text-[#7C6F9A]">Editor profesional de reportes clínicos</p></div><Btn variant="primary" size="sm" onClick={() => setNewReportOpen(true)} disabled={sessions.isPending || !!sessions.error}><Plus size={13}/> Nuevo reporte</Btn></div>
    <RemoteFeedback pending={sessions.isPending} error={sessions.error} retry={() => void sessions.refetch()}/>
    <div className="grid gap-5 lg:grid-cols-3"><div className="flex flex-col gap-3">
      <p className="px-1 text-xs font-bold uppercase tracking-wider text-[#9E95B7]">Reportes</p>
      {reports.map(s => <button key={s.id_sesion} className="rounded-2xl border p-4 text-left transition-all" style={{ background: selected?.id_sesion === s.id_sesion ? B.violetLight : 'white', borderColor: selected?.id_sesion === s.id_sesion ? B.violet : B.border }} onClick={() => setSelectedId(s.id_sesion)}>
        <p className="mb-1 text-sm font-extrabold leading-snug text-[#1C1135]">Reporte de sesión #{s.id_sesion} — {s.cita.paciente_nombre}</p><div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-[#9E95B7]">{dateLabel(s)}</p><span className="rounded-full px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-700">Guardado</span></div>
      </button>)}
      {sessions.isSuccess && !sessions.error && reports.length === 0 && <p className="text-sm text-[#7C6F9A]">No hay reportes guardados en tus sesiones autorizadas.</p>}
      <div className="mt-2"><p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[#9E95B7]">Plantillas descargables</p><p className="px-1 text-xs text-[#7C6F9A]">Plantillas en blanco, no son reportes clínicos guardados.</p>
        {templates.map(template => <button key={template} onClick={() => downloadPdf(`${template.toLowerCase().replaceAll(' ', '-')}.pdf`, template, ['Plantilla en blanco ASHAKids - no constituye un reporte guardado', '', 'Paciente: _____________________', 'Fecha: ________________________', '', 'Observaciones: _________________', '', 'Objetivos: _____________________', '', 'Nivel de ayuda: _________________', '', 'Proximos pasos: _________________'])} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#7C6F9A] transition-colors hover:bg-[#F5F3FF]"><Download size={12}/> {template}</button>)}
      </div>
    </div><div className="lg:col-span-2"><Crd className="overflow-hidden">
      {selected && !sessions.error ? <><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5" style={{ borderColor: B.border }}><div><p className="mb-0.5 text-xs font-medium text-[#9E95B7]">Sesión clínica · {selected.cita.paciente_nombre}</p><h3 className="font-extrabold text-[#1C1135]">Reporte de sesión #{selected.id_sesion}</h3></div><div className="flex flex-wrap gap-2"><Btn size="sm" variant="ghost" onClick={() => setPreviewOpen(true)} disabled={!selected.reporte_disponible}><Eye size={12}/> Vista previa</Btn><Btn size="sm" variant="ghost" disabled title="No existe API de envío por correo"><Send size={12}/> Enviar</Btn><Btn size="sm" variant="primary" disabled title="No existe API de firma digital"><Edit size={12}/> Firmar</Btn></div></div>
        <ReportWorkspace key={selected.id_sesion} session={selected}/></> : <div className="p-6 text-sm text-[#7C6F9A]">Selecciona un reporte o una sesión para comenzar.</div>}
    </Crd></div></div>
    {newReportOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setNewReportOpen(false)} aria-label="Cerrar"/><div role="dialog" aria-label="Nuevo reporte" className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><h3 className="text-xl font-black text-[#1C1135]">Nuevo reporte</h3><p className="my-3 text-sm text-[#7C6F9A]">Selecciona una sesión iniciada o finalizada. El reporte solo se creará al guardar los cuatro campos.</p>
      <label className="block text-sm font-bold">Sesión<select value={candidate} onChange={e => setCandidate(Number(e.target.value))} className="my-2 w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3"><option value={0}>Selecciona una sesión</option>{eligible.map(s => <option key={s.id_sesion} value={s.id_sesion}>#{s.id_sesion} · {s.cita.paciente_nombre} · {dateLabel(s)}</option>)}</select></label>
      {!eligible.length && <p className="text-sm text-[#7C6F9A]">No hay sesiones elegibles sin reporte. Registra e inicia una sesión desde la agenda.</p>}
      <div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setNewReportOpen(false)}>Cancelar</Btn><Btn variant="cta" disabled={!eligible.some(s => s.id_sesion === candidate)} onClick={() => { setSelectedId(candidate); setNewReportOpen(false); }}><Plus size={14}/> Crear reporte</Btn></div>
    </div></div>}
    {previewOpen && selected && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} aria-label="Cerrar vista previa"/><div role="dialog" aria-label="Vista previa del reporte" className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b border-[#E8E5F4] bg-white px-6 py-5"><h3 className="font-black text-[#1C1135]">Reporte de sesión #{selected.id_sesion}</h3><button aria-label="Cerrar vista previa" onClick={() => setPreviewOpen(false)}><X size={18}/></button></div><ReportWorkspace session={selected} readOnly/></div></div>}
  </div>;
}
