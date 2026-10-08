import { useState } from "react";
import { View } from "@/types/navigation";

export function TerapeutaIncidencias({ go }: { go: (v: View) => void }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [type, setType] = useState("Funcional");
  const [sent, setSent] = useState(false);
  const tipos = ["Funcional", "Visual / Diseño", "Carga / Rendimiento", "Error de datos", "Paciente / Agenda", "Otro"];
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h2 className="text-xl font-black text-[#1C1135] mb-1">Reportar incidencia</h2>
      <p className="text-sm text-[#7C6F9A] mb-6">Describe el problema que encontraste para que el equipo pueda revisarlo.</p>
      {sent ? (
        <div className="rounded-2xl p-5 flex items-start gap-3" style={{ background: "#D1FAE5", border: "1.5px solid #6EE7B7" }}>
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-extrabold text-green-800">Reporte enviado</p>
            <p className="text-sm text-green-700 mt-1">Tu incidencia fue enviada a la administración. Gracias por ayudarnos a mejorar.</p>
            <button onClick={() => { setSent(false); setTitle(""); setDesc(""); setType("Funcional"); }} className="mt-3 text-xs font-bold text-green-700 underline">Enviar otro reporte</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Título del problema</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ej: No puedo acceder al historial del paciente" className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Descripción del problema</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe con detalle qué ocurrió, en qué sección, y qué pasos seguiste antes del error..." className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tipo de incidencia</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full px-4 py-3 rounded-2xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400 bg-white">
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button disabled={!title.trim() || !desc.trim()} onClick={() => setSent(true)} className="w-full py-3 rounded-2xl text-sm font-extrabold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: "#0D9488" }}>
            Enviar a administración
          </button>
        </div>
      )}
    </div>
  );
}
