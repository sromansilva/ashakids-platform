import type { useTerapeutaPacientes } from "@/pages/terapeuta/TerapeutaPacientes/useTerapeutaPacientes";
import { Plus } from "lucide-react";
import { Btn } from "@/components/common/Btn";

type Props = Pick<ReturnType<typeof useTerapeutaPacientes>, "setShowAddObj" | "objectives" | "setObjectives" | "showAddObj" | "newObj" | "setNewObj">;
export function TerapeutaPacientesObjetivos({ setShowAddObj, objectives, setObjectives, showAddObj, newObj, setNewObj }: Props) {
return (<div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Objetivos terapéuticos</h3>
              <Btn size="sm" variant="primary" onClick={() => setShowAddObj(true)}>
                <Plus size={13} /> Agregar
              </Btn>
            </div>
            <div className="space-y-3 mb-4">
              {objectives.map(obj => (
                <div key={obj.id} className="rounded-2xl border border-[#E8E5F4] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-bold text-[#1C1135] leading-snug flex-1">{obj.desc}</p>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: obj.priority === "Alta" ? "#FEF3C7" : "#F5F0FF", color: obj.priority === "Alta" ? "#D97706" : "#7C3AED" }}>
                      {obj.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8E5F4] text-[#7C6F9A]">{obj.area}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>{obj.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 rounded-full bg-[#E8E5F4] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${obj.current}%`, background: "#7C3AED" }} />
                    </div>
                    <span className="text-xs font-extrabold" style={{ color: "#7C3AED" }}>{obj.current}%</span>
                  </div>
                  <p className="text-[10px] text-[#9E95B7]">Desempeño actual · {obj.support}</p>
                  <p className="text-[10px] text-[#9E95B7] mt-0.5">Criterio: {obj.criterion}</p>
                  <div className="flex gap-2 mt-3">
                    {["Pausar", "Alcanzado", "Archivar"].map(action => (
                      <button key={action} onClick={() => setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, status: action === "Alcanzado" ? "Alcanzado" : action === "Pausar" ? "Pausado" : "Archivado" } : o))}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50 transition-colors">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {showAddObj && (
              <div className="rounded-2xl border-2 border-violet-200 p-4 bg-[#F5F0FF]">
                <h4 className="font-bold text-[#1C1135] mb-3 text-sm">Nuevo objetivo</h4>
                <textarea value={newObj.desc} onChange={e => setNewObj(d => ({ ...d, desc: e.target.value }))} rows={2}
                  placeholder="Descripción del objetivo..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400 mb-2 resize-none" />
                <div className="flex gap-2 mb-3">
                  <select value={newObj.area} onChange={e => setNewObj(d => ({ ...d, area: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white">
                    {["Fonología","Comprensión","Expresión","Pragmática","Articulación"].map(a => <option key={a}>{a}</option>)}
                  </select>
                  <select value={newObj.priority} onChange={e => setNewObj(d => ({ ...d, priority: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white">
                    {["Alta","Media","Baja"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="primary" onClick={() => { if (newObj.desc.trim()) { setObjectives(prev => [...prev, { id: Date.now(), ...newObj, status: "En progreso", baseline: "0%", criterion: "Por definir", current: 0, support: "Apoyo total" }]); setNewObj({ desc: "", area: "Fonología", priority: "Media" }); setShowAddObj(false); } }}>Guardar</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setShowAddObj(false)}>Cancelar</Btn>
                </div>
              </div>
            )}
          </div>);
}
