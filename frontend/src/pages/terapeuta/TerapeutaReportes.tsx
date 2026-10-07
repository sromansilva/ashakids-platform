import { useState } from "react";
import { CheckCircle, X, Download, Eye, Send, Edit, Plus } from "lucide-react";
import { B, View, Btn, Crd, Inp } from "@/components/shared";
import { downloadPdf } from "./downloadPdf";

export function TerapeutaReportes({ go: _go }: { go: (v: View) => void }) {
  const initialReports = [
    { title: "Evaluación mensual — Mateo Gómez", date: "28 Jul 2026", patient: "Mateo G.", type: "Seguimiento", status: "firmado", objective: "Trabajar pronunciación y reforzar la discriminación auditiva." },
    { title: "Informe de alta — Bruno Ríos", date: "15 Jul 2026", patient: "Bruno R.", type: "Alta", status: "borrador", objective: "Recopilar avances y recomendaciones de cierre." },
    { title: "Evaluación inicial — Fernanda Torres", date: "10 Jul 2026", patient: "Fernanda T.", type: "Inicial", status: "borrador", objective: "Establecer la línea base de comunicación." },
    { title: "Seguimiento julio — Valentina López", date: "05 Jul 2026", patient: "Valentina L.", type: "Seguimiento", status: "firmado", objective: "Acompañar avances de comunicación funcional." },
  ];
  const [reports, setReports] = useState(initialReports);
  const [selectedRep, setSelectedRep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ patient: "", type: "Seguimiento mensual", date: "", objective: "" });
  const templates = ["Evaluación inicial", "Seguimiento mensual", "Alta terapéutica", "Informe psicológico", "Informe de lenguaje"];
  const rep = reports[selectedRep];
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };
  const reportLines = (report = rep) => [
    `Paciente: ${report.patient}`, `Tipo de reporte: ${report.type}`, `Fecha: ${report.date}`, "",
    "Objetivos de la sesión", report.objective || "[Completa aquí el objetivo clínico de la sesión]", "",
    "Observaciones clínicas", "Se observa progreso sostenido y buena disposición durante la sesión.", "",
    "Recomendaciones", "Continuar con las actividades asignadas y la práctica guiada en casa.", "",
    `Estado del documento: ${report.status}`,
  ];
  const downloadReport = (report = rep) => downloadPdf(`${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`, report.title, reportLines(report));
  const createReport = () => {
    const patient = form.patient.trim() || "Paciente por completar";
    const type = form.type;
    const report = { title: `${type} — ${patient}`, patient, type, date: form.date || "Fecha por completar", status: "borrador", objective: form.objective };
    setReports((current) => [report, ...current]);
    setSelectedRep(0);
    setNewReportOpen(false);
    setForm({ patient: "", type: "Seguimiento mensual", date: "", objective: "" });
    showNotice("Reporte creado con datos generales. Ya puedes completar el contenido.");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {notice && <div className="fixed right-4 top-5 z-[70] flex max-w-sm items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xl"><CheckCircle size={18} />{notice}</div>}
      {previewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} aria-label="Cerrar vista previa" />
          <div className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E8E5F4] bg-white/95 px-6 py-5 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Vista previa del PDF</p><h3 className="font-black text-[#1C1135]">{rep.title}</h3></div><button onClick={() => setPreviewOpen(false)} className="rounded-xl p-2 text-[#7C6F9A] hover:bg-[#F5F3FF]"><X size={18} /></button></div>
            <div className="space-y-4 p-6">{reportLines().map((line, index) => line ? <p key={index} className={index === 0 ? "text-sm font-extrabold text-[#1C1135]" : "text-sm font-medium leading-relaxed text-[#51466F]"}>{line}</p> : <div key={index} className="h-1" />)}</div>
            <div className="flex justify-end gap-3 border-t border-[#E8E5F4] px-6 py-4"><Btn variant="outline" onClick={() => setPreviewOpen(false)}>Cerrar</Btn><Btn variant="cta" onClick={() => downloadReport()}><Download size={14} /> Descargar PDF</Btn></div>
          </div>
        </div>
      )}
      {newReportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setNewReportOpen(false)} aria-label="Cerrar" /><div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-xl font-black text-[#1C1135]">Nuevo reporte</h3><p className="mt-1 text-sm font-medium text-[#7C6F9A]">Completa los datos base; el reporte se creará con espacios listos para editar.</p></div><button onClick={() => setNewReportOpen(false)} className="rounded-xl p-2 text-[#7C6F9A] hover:bg-[#F5F3FF]"><X size={18} /></button></div><div className="space-y-4"><Inp label="Paciente" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Nombre del paciente" /><div><label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Tipo de reporte</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium"><option>Seguimiento mensual</option><option>Evaluación inicial</option><option>Informe de alta</option></select></div><Inp label="Fecha" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /><div><label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Objetivo principal</label><textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="Ej.: fortalecer la articulación del fonema /r/" className="min-h-24 w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium outline-none focus:border-violet-400" /></div></div><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setNewReportOpen(false)}>Cancelar</Btn><Btn variant="cta" onClick={createReport}><Plus size={14} /> Crear reporte</Btn></div></div></div>
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="mb-1 text-2xl font-black text-[#1C1135]">Reportes</h2><p className="text-sm font-medium text-[#7C6F9A]">Editor profesional de reportes clínicos</p></div><Btn variant="primary" size="sm" onClick={() => setNewReportOpen(true)}><Plus size={13} /> Nuevo reporte</Btn></div>
      <div className="grid gap-5 lg:grid-cols-3"><div className="flex flex-col gap-3"><p className="px-1 text-xs font-bold uppercase tracking-wider text-[#9E95B7]">Reportes</p>{reports.map((report, i) => <button key={`${report.title}-${i}`} className="rounded-2xl border p-4 text-left transition-all" style={{ background: selectedRep === i ? B.violetLight : "white", borderColor: selectedRep === i ? B.violet : B.border }} onClick={() => setSelectedRep(i)}><p className="mb-1 text-sm font-extrabold leading-snug text-[#1C1135]">{report.title}</p><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#9E95B7]">{report.date}</p><span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: report.status === "firmado" ? "#D1FAE5" : B.orangeLight, color: report.status === "firmado" ? "#059669" : B.orange }}>{report.status}</span></div></button>)}<div className="mt-2"><p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[#9E95B7]">Plantillas descargables</p>{templates.map((template) => <button key={template} onClick={() => downloadPdf(`${template.toLowerCase().replaceAll(" ", "-")}.pdf`, template, ["Plantilla clínica ASHAKids", "", "Paciente: ______________________________", "Fecha: _________________________________", "", "Objetivo clínico: ________________________", "", "Observaciones: __________________________", "", "Recomendaciones: ________________________"])} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#7C6F9A] transition-colors hover:bg-[#F5F3FF]"><Download size={12} /> {template}</button>)}</div></div>
        <div className="lg:col-span-2"><Crd className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5" style={{ borderColor: B.border }}><div><p className="mb-0.5 text-xs font-medium text-[#9E95B7]">{rep.type} · {rep.patient}</p><h3 className="font-extrabold text-[#1C1135]">{rep.title}</h3></div><div className="flex flex-wrap gap-2"><Btn size="sm" variant="ghost" onClick={() => setPreviewOpen(true)}><Eye size={12} /> Vista previa</Btn><Btn size="sm" variant="ghost" onClick={() => downloadReport()}><Download size={12} /> PDF</Btn><Btn size="sm" variant="ghost" onClick={() => showNotice("Reporte enviado correctamente al contacto registrado.")}><Send size={12} /> Enviar</Btn><Btn size="sm" variant="primary" onClick={() => { setReports((current) => current.map((item, i) => i === selectedRep ? { ...item, status: "firmado" } : item)); showNotice("Reporte firmado digitalmente."); }}><Edit size={12} /> Firmar</Btn></div></div><div className="space-y-5 p-6"><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">Información general</p><div className="grid gap-3 sm:grid-cols-3">{[{ label: "Paciente", val: rep.patient }, { label: "Fecha", val: rep.date }, { label: "Estado", val: rep.status }].map((field) => <div key={field.label} className="rounded-xl p-3" style={{ background: B.violetLight }}><p className="mb-1 text-xs font-medium text-[#9E95B7]">{field.label}</p><p className="text-sm font-extrabold capitalize text-[#1C1135]">{field.val}</p></div>)}</div></div>{[["Objetivos de la sesión", "Trabajar pronunciación del fonema /r/ vibrante en posición inicial y media. Reforzar discriminación auditiva de pares mínimos."], ["Observaciones clínicas", "El niño mostró alta motivación durante toda la sesión. Se observa progreso sostenido desde la última evaluación."], ["Conclusiones y recomendaciones", "Continuar con actividades de automatización y practicar 15 minutos diarios con el material asignado."]].map(([heading, body]) => <div key={heading}><p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">{heading}</p><p className="text-sm font-medium leading-relaxed text-[#4A4560]">{body}</p></div>)}<div className="border-t pt-5" style={{ borderColor: B.border }}><p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-600">Firma digital</p><div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: B.tealLight }}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 font-black text-white">AR</div><div><p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p><p className="text-xs font-medium text-[#7C6F9A]">Terapeuta de lenguaje · Cédula 12345678</p></div>{rep.status === "firmado" && <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle size={14} /> Firmado digitalmente</div>}</div></div></div></Crd></div></div>
    </div>
  );
}
