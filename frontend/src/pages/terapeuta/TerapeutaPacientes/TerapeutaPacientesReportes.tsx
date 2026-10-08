import type { useTerapeutaPacientes } from "@/pages/terapeuta/TerapeutaPacientes/useTerapeutaPacientes";
import { Plus } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof useTerapeutaPacientes>, "setShowGenReport" | "showGenReport" | "reportType" | "setReportType" | "reportPeriod" | "setReportPeriod" | "reportNotes" | "setReportNotes">;
export function TerapeutaPacientesReportes({ setShowGenReport, showGenReport, reportType, setReportType, reportPeriod, setReportPeriod, reportNotes, setReportNotes }: Props) {
return (<div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Reportes</h3>
              <Btn size="sm" variant="primary" onClick={() => setShowGenReport(true)}><Plus size={13} /> Generar reporte</Btn>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { title: "Reporte julio 2026", type: "Progreso", date: "25 Jul 2026", status: "Publicado" },
                { title: "Reporte junio 2026", type: "Progreso", date: "28 Jun 2026", status: "Publicado" },
              ].map((r, i) => (
                <div key={i} className="rounded-2xl border border-[#E8E5F4] p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: B.violetLight }}>📄</div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1135]">{r.title}</p>
                      <p className="text-xs text-[#7C6F9A]">{r.type} · {r.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r.status}</span>
                </div>
              ))}
            </div>
            {showGenReport && (
              <div className="rounded-2xl border-2 border-violet-200 p-4 mt-4 bg-[#F5F0FF]">
                <h4 className="font-bold text-[#1C1135] mb-3 text-sm">Nuevo reporte</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tipo de reporte</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white">
                      {["Progreso","Cierre","Personalizado"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Periodo</label>
                    <input value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} placeholder="Ej: Julio 2026" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Valoración profesional</label>
                    <textarea value={reportNotes} onChange={e => setReportNotes(e.target.value)} rows={3} placeholder="Logros, dificultades, recomendaciones..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <Btn size="sm" variant="primary" onClick={() => { setShowGenReport(false); }}>Publicar para representante</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setShowGenReport(false)}>Guardar borrador</Btn>
                  </div>
                </div>
              </div>
            )}
          </div>);
}
