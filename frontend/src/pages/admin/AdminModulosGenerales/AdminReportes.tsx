import { useState } from "react";
import { FileText, Plus, Eye, Download } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

export function AdminReportes() {
  const [dateRange, setDateRange] = useState("julio");
  const reports = [
    { title: "Resumen ejecutivo plataforma",      date: "30 Jul 2026", type: "Ejecutivo",  rows: 142, status: "disponible" },
    { title: "Ingresos y facturación julio",      date: "30 Jul 2026", type: "Financiero", rows: 89,  status: "disponible" },
    { title: "Terapeutas — actividad y sesiones", date: "29 Jul 2026", type: "Terapeutas", rows: 48,  status: "disponible" },
    { title: "Usuarios nuevos por período",       date: "28 Jul 2026", type: "Usuarios",   rows: 42,  status: "disponible" },
    { title: "Sesiones virtuales",date: "27 Jul 2026", type: "Sesiones",   rows: 89,  status: "generando"  },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Centro de Reportes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Exportación y análisis de datos administrativos</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Generar reporte</Btn>
      </div>
      {/* Filter row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <select value={dateRange} onChange={e => setDateRange(e.target.value)}
          className="px-4 py-2 rounded-2xl border text-sm font-bold text-[#1C1135] focus:outline-none focus:border-violet-400"
          style={{ borderColor: B.border }}>
          <option value="julio">Julio 2026</option>
          <option value="junio">Junio 2026</option>
          <option value="q2">Q2 2026</option>
        </select>
        <select className="px-4 py-2 rounded-2xl border text-sm font-bold text-[#7C6F9A] focus:outline-none focus:border-violet-400" style={{ borderColor: B.border }}>
          <option>Todos los terapeutas</option>
          <option>Dra. Ana Ruiz</option>
          <option>Lic. Carlos Mendoza</option>
        </select>
        <select className="px-4 py-2 rounded-2xl border text-sm font-bold text-[#7C6F9A] focus:outline-none focus:border-violet-400" style={{ borderColor: B.border }}>
          <option>Todas las especialidades</option>
          <option>Terapia de lenguaje</option>
          <option>Articulación y Fonología</option>
        </select>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "vs mes anterior", val: "+22%",   color: B.teal,    bg: B.tealLight   },
          { label: "Pagos julio",     val: "—",      color: B.violet,  bg: B.violetLight },
          { label: "Nuevos usuarios", val: "42",     color: "#059669", bg: "#D1FAE5"     },
          { label: "Asistencia",      val: "94%",    color: B.orange,  bg: B.orangeLight },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <Crd>
        <div className="p-5 border-b" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Reportes disponibles</h4>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {reports.map((r, i) => (
            <div key={i} className="p-4 flex items-center gap-4 flex-wrap hover:bg-[#F5F3FF] transition-colors">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: B.violetLight }}>
                <FileText size={18} style={{ color: B.violet }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{r.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{r.date} · {r.rows} registros · {r.type}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: r.status === "disponible" ? "#D1FAE5" : B.orangeLight, color: r.status === "disponible" ? "#059669" : B.orange }}>
                {r.status}
              </span>
              {r.status === "disponible" && (
                <div className="flex gap-1">
                  <Btn size="sm" variant="ghost"><Eye size={12} /> Ver</Btn>
                  <Btn size="sm" variant="ghost"><Download size={12} /> PDF</Btn>
                  <Btn size="sm" variant="ghost"><Download size={12} /> CSV</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}
