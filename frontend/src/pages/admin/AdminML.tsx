import React, { useState } from "react";
import { Lock, BarChart2, GitBranch, Layers, CheckCircle, X } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Crd } from "@/components/common/Crd";

// ── Placeholder: Machine Learning ──────────────────────────────────────────────
export function AdminML({ go: _go }: { go: (v: View) => void }) {
  const [modal, setModal] = useState<null | "ficha" | "dataset" | "comparar" | "decision">(null);
  const [decisionText, setDecisionText] = useState("");
  const [decisionSaved, setDecisionSaved] = useState(false);

  const versions = [
    { ver: "v0.3-demo", estado: "Validación", fecha: "30 Jul 2026", responsable: "Equipo autorizado",  activa: true  },
    { ver: "v0.2-demo", estado: "Aprobado",   fecha: "15 Jun 2026", responsable: "Equipo autorizado",  activa: false },
    { ver: "v0.1-demo", estado: "Retirado",   fecha: "02 May 2026", responsable: "Equipo autorizado",  activa: false },
  ];

  const estadoColor: Record<string, { bg: string; text: string }> = {
    "Borrador":   { bg: "#F3F4F6", text: "#6B7280" },
    "Validación": { bg: "#EDE9FE", text: "#5B21B6" },
    "Aprobado":   { bg: "#D1FAE5", text: "#059669" },
    "Retirado":   { bg: "#FEE2E2", text: "#DC2626" },
  };

  const metrics = [
    { label: "Sensibilidad",   val: "82 %", note: "Umbral pendiente de aprobación" },
    { label: "Especificidad",  val: "79 %", note: "Umbral pendiente de aprobación" },
    { label: "Falsos negativos", val: "8 %",  note: "Umbral pendiente de aprobación" },
    { label: "Calibración",    val: "0.84",  note: "Umbral pendiente de aprobación" },
  ];

  const perfEdad = [
    { grupo: "3–5 años",  val: 78, idioma: "Español (es-MX)" },
    { grupo: "6–8 años",  val: 84, idioma: "Español (es-AR)" },
    { grupo: "9–12 años", val: 81, idioma: "Español (es-CO)" },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* Page head */}
      <div className="mb-5">
        <p className="text-xs font-black text-[#9E95B7] uppercase tracking-widest mb-0.5">Admin · Machine Learning</p>
        <h1 className="text-2xl font-black text-[#1C1135]">Machine Learning</h1>
        <p className="text-sm text-[#7C6F9A] font-medium">Gobernanza y validación de modelos · Ninguna acción automática</p>
      </div>

      {/* Dual banner */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2.5 rounded-2xl px-4 py-3 border border-violet-300 bg-violet-50 text-sm font-bold text-violet-800">
          <span className="text-lg">⚠️</span>
          <span><strong>Orientación no diagnóstica</strong> · Los modelos apoyan la evaluación inicial; no sustituyen el criterio clínico ni emiten diagnósticos ni tratamientos.</span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700 whitespace-nowrap">
          🔬 Datos simulados
        </div>
      </div>

      {/* Model card */}
      <Crd className="p-5 mb-5">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-[#1C1135] text-lg">Evaluación Inicial ASHA</h3>
            <p className="text-xs text-[#9E95B7] font-medium mt-0.5">Modelo de orientación · v0.3-demo</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full" style={{ background: estadoColor["Validación"].bg, color: estadoColor["Validación"].text }}>En validación</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {[
            { label: "Versión",      val: "v0.3-demo"       },
            { label: "Estado",       val: "En validación"   },
            { label: "Fecha",        val: "30 Jul 2026"     },
            { label: "Responsable",  val: "Equipo autorizado" },
            { label: "Publicado",    val: "No — pendiente"  },
            { label: "Diagnóstico",  val: "No aplica"       },
          ].map(f => (
            <div key={f.label} className="rounded-xl p-3" style={{ background: B.violetLight }}>
              <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{f.label}</p>
              <p className="text-sm font-extrabold text-[#1C1135]">{f.val}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["ficha",    "Ver ficha del modelo",  "📋"],
            ["dataset",  "Revisar dataset",        "🗂️"],
            ["comparar", "Comparar versión",       "⚖️"],
            ["decision", "Registrar decisión",     "✍️"],
          ] as const).map(([key, label, icon]) => (
            <button key={key} onClick={() => setModal(key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700 transition-colors">
              <span>{icon}</span> {label}
            </button>
          ))}
        </div>
      </Crd>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        {/* Gobernanza de datos */}
        <Crd className="p-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><Lock size={15}/> Gobernanza de datos</h3>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: "✅", label: "Consentimiento verificable",        detail: "Registrado por familia antes de cualquier uso de datos." },
              { icon: "🔒", label: "Seudonimización",                   detail: "Ningún dato identificable llega al modelo." },
              { icon: "🏷️", label: "Etiquetado profesional",           detail: "Supervisado por terapeutas certificados." },
              { icon: "🚫", label: "Conversaciones ASHI excluidas",     detail: "Excluidas por defecto · requiere decisión explícita para inclusión." },
            ].map(g => (
              <div key={g.label} className="flex items-start gap-3 rounded-xl p-3 border border-[#F0EEF9]">
                <span className="text-base mt-0.5">{g.icon}</span>
                <div>
                  <p className="text-sm font-bold text-[#1C1135]">{g.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium mt-0.5">{g.detail}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Experimental source */}
          <div className="mt-4 rounded-xl p-4 border-2 border-dashed border-violet-300 bg-violet-50">
            <p className="text-xs font-black text-violet-700 uppercase tracking-wider mb-1">Fuente experimental separada</p>
            <p className="text-sm font-bold text-[#1C1135] mb-1">Señales agregadas de Mundo ASHA</p>
            <p className="text-xs text-[#7C6F9A] font-medium leading-relaxed">Origen: patrones agregados de juegos · Consentimiento explícito requerido · Minimización estricta · Sin resultados individuales · Sin identificación de niños.</p>
          </div>
        </Crd>

        {/* Métricas de validación */}
        <div className="flex flex-col gap-5">
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-1 flex items-center gap-2"><BarChart2 size={15}/> Métricas de validación</h3>
            <p className="text-xs text-[#9E95B7] font-medium mb-4">Datos de demostración · v0.3-demo</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {metrics.map(m => (
                <div key={m.label} className="rounded-xl p-3" style={{ background: B.violetLight }}>
                  <p className="font-black text-xl text-[#1C1135]">{m.val}</p>
                  <p className="text-xs font-bold text-[#7C6F9A]">{m.label}</p>
                  <p className="text-xs text-amber-600 font-medium mt-1">{m.note}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 border border-[#F0EEF9]">
              <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Desempeño por edad e idioma</p>
              {perfEdad.map(p => (
                <div key={p.grupo} className="flex items-center gap-2 mb-2 last:mb-0">
                  <span className="text-xs font-bold text-[#7C6F9A] w-16 flex-shrink-0">{p.grupo}</span>
                  <div className="flex-1 h-2 rounded-full" style={{ background: B.violetLight }}>
                    <div className="h-full rounded-full" style={{ width: `${p.val}%`, background: B.violet }} />
                  </div>
                  <span className="text-xs font-bold text-[#1C1135] w-8 text-right">{p.val}%</span>
                </div>
              ))}
              <p className="text-xs text-amber-600 font-medium mt-2">Umbrales pendientes de aprobación</p>
              <p className="text-xs text-[#9E95B7] font-medium mt-1">Idiomas: {perfEdad.map(p => p.idioma).join(" · ")}</p>
            </div>
          </Crd>

          {/* Sesgo y deriva */}
          <Crd className="p-4">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><GitBranch size={14}/> Sesgo y deriva</h3>
            {[
              { label: "Revisión de sesgo",   estado: "Pendiente",   color: "#D97706", bg: "#FEF3C7" },
              { label: "Monitoreo de deriva", estado: "Activo (demo)", color: "#059669", bg: "#D1FAE5" },
              { label: "Auditoría externa",   estado: "No iniciada", color: "#6B7280", bg: "#F3F4F6" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-[#F5F3FF] last:border-0">
                <p className="text-sm font-bold text-[#1C1135]">{s.label}</p>
                <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.estado}</span>
              </div>
            ))}
          </Crd>
        </div>
      </div>

      {/* Version history */}
      <Crd className="p-5">
        <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><Layers size={15}/> Historial de versiones</h3>
        <p className="text-xs text-[#9E95B7] font-medium mb-4">El rollback solo es posible mediante decisión registrada por responsable autorizado.</p>
        <div className="flex flex-col gap-2">
          {versions.map(v => (
            <div key={v.ver} className="flex items-center gap-3 rounded-xl p-3 border border-[#F0EEF9] flex-wrap min-w-0">
              <code className="text-xs font-black text-[#1C1135] bg-[#F5F3FF] px-2 py-1 rounded-lg">{v.ver}</code>
              <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: estadoColor[v.estado].bg, color: estadoColor[v.estado].text }}>{v.estado}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#7C6F9A] font-medium">{v.fecha} · {v.responsable}</p>
              </div>
              {!v.activa && v.estado !== "Retirado" && (
                <button onClick={() => setModal("decision")}
                  className="text-xs font-bold text-violet-600 hover:underline whitespace-nowrap">Rollback →</button>
              )}
              {v.activa && <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">Activa</span>}
            </div>
          ))}
        </div>
      </Crd>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[#1C1135]">
                {modal === "ficha"    && "Ficha del modelo"}
                {modal === "dataset"  && "Revisión de dataset"}
                {modal === "comparar" && "Comparar versiones"}
                {modal === "decision" && "Registrar decisión"}
              </h2>
              <button onClick={() => { setModal(null); setDecisionSaved(false); setDecisionText(""); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
                <X size={16} className="text-[#7C6F9A]" />
              </button>
            </div>

            {modal === "ficha" && (
              <div className="flex flex-col gap-3 text-sm">
                {[["Nombre", "Evaluación Inicial ASHA"], ["Versión", "v0.3-demo"], ["Tipo", "Clasificación orientativa"], ["Entrenado con", "Datos seudonimizados con consentimiento"], ["Salida", "Recomendación de derivación — no diagnóstico"], ["Publicado", "No · pendiente de aprobación"]].map(([k,v]) => (
                  <div key={k} className="flex gap-3 rounded-xl p-3" style={{ background: B.violetLight }}>
                    <span className="font-bold text-[#7C6F9A] w-28 flex-shrink-0">{k}</span>
                    <span className="font-extrabold text-[#1C1135]">{v}</span>
                  </div>
                ))}
                <p className="text-xs text-amber-600 font-bold mt-1">⚠️ Datos simulados · Valores de demostración</p>
              </div>
            )}

            {modal === "dataset" && (
              <div className="flex flex-col gap-3 text-sm">
                <div className="rounded-xl p-3 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">⚠️ Datos simulados · No corresponden a usuarios reales</div>
                {[["Registros", "4,200 (demo)"], ["Etiquetado", "Profesional supervisado"], ["Idiomas", "es-MX, es-AR, es-CO"], ["Consentimiento", "Verificado en todos los registros"], ["ASHI excluido", "Sí — por defecto"], ["Actualizado", "30 Jul 2026 (demo)"]].map(([k,v]) => (
                  <div key={k} className="flex gap-3 rounded-xl p-3" style={{ background: B.violetLight }}>
                    <span className="font-bold text-[#7C6F9A] w-32 flex-shrink-0">{k}</span>
                    <span className="font-extrabold text-[#1C1135]">{v}</span>
                  </div>
                ))}
              </div>
            )}

            {modal === "comparar" && (
              <div className="flex flex-col gap-3 text-sm">
                <div className="rounded-xl p-3 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">⚠️ Datos simulados de demostración</div>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold text-center min-w-[260px]">
                    {["Métrica", "v0.2", "v0.3"].map(h => <div key={h} className="rounded-lg p-2 bg-[#F5F3FF] text-[#7C6F9A]">{h}</div>)}
                    {[["Sensibilidad", "78%", "82%"], ["Especificidad", "75%", "79%"], ["F. negativos", "10%", "8%"], ["Calibración", "0.80", "0.84"]].map(([m, a, b]) => (
                      <React.Fragment key={m}>
                        <div className="rounded-lg p-2 border border-[#F0EEF9] font-medium text-[#1C1135]">{m}</div>
                        <div className="rounded-lg p-2 border border-[#F0EEF9] text-[#7C6F9A]">{a}</div>
                        <div className="rounded-lg p-2 border border-[#F0EEF9] text-violet-700 font-extrabold">{b}</div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {modal === "decision" && !decisionSaved && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-[#7C6F9A] font-medium">La decisión quedará registrada en el log de auditoría con fecha, responsable y motivo. No activa ningún cambio automático.</p>
                <textarea value={decisionText} onChange={e => setDecisionText(e.target.value)}
                  className="w-full rounded-xl border border-[#E8E5F4] p-3 text-sm font-medium text-[#1C1135] resize-none focus:outline-none focus:border-violet-400"
                  rows={4} placeholder="Describe la decisión, motivo y alcance..." />
                <button onClick={() => { if (decisionText.trim()) setDecisionSaved(true); }}
                  disabled={!decisionText.trim()}
                  className="w-full py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
                  Registrar decisión
                </button>
              </div>
            )}
            {modal === "decision" && decisionSaved && (
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle size={40} className="text-green-500" />
                <p className="font-extrabold text-[#1C1135] text-center">Decisión registrada</p>
                <p className="text-xs text-[#9E95B7] font-medium text-center">Quedó asentada en el log de auditoría · 30 Jul 2026 · Equipo autorizado</p>
                <button onClick={() => { setModal(null); setDecisionSaved(false); setDecisionText(""); }}
                  className="px-6 py-2 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
