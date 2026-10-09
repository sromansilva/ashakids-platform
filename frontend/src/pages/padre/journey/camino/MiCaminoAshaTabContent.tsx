import type { useMiCaminoAsha } from "@/pages/padre/journey/camino/useMiCaminoAsha";


type Props = Pick<ReturnType<typeof useMiCaminoAsha>, "setPeriodoMode" | "periodoMode" | "setHistorialRango" | "historialRango" | "periodoDesde" | "setPeriodoDesde" | "periodoHasta" | "setPeriodoHasta">;
export function MiCaminoAshaTabContent({ setPeriodoMode, periodoMode, setHistorialRango, historialRango, periodoDesde, setPeriodoDesde, periodoHasta, setPeriodoHasta }: Props) {
return (<div className="mx-4 mt-4 mb-4 rounded-2xl border border-[#E8E5F4] bg-white p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-extrabold text-[#1C1135]">Período de consulta</p>
            <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-lg">
              {(["actual","historial"] as const).map(m => (
                <button key={m} onClick={() => setPeriodoMode(m)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${periodoMode === m ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                  {m === "actual" ? "Estado actual" : "Ver historial"}
                </button>
              ))}
            </div>
          </div>
          {periodoMode === "historial" && (
            <div className="space-y-2 pt-2 border-t border-[#F0EDF8]">
              <div className="flex gap-2 flex-wrap">
                {[{val:"30d",label:"Últimos 30 días"},{val:"3m",label:"Últimos 3 meses"},{val:"custom",label:"Rango personalizado"}].map(opt => (
                  <button key={opt.val} onClick={() => setHistorialRango(opt.val as "30d"|"3m"|"custom")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${historialRango === opt.val ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {historialRango === "custom" && (
                <div className="flex gap-2 flex-wrap items-center">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-[#7C6F9A]">Desde</label>
                    <input type="date" value={periodoDesde} onChange={e => setPeriodoDesde(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-[#7C6F9A]">Hasta</label>
                    <input type="date" value={periodoHasta} onChange={e => setPeriodoHasta(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                  </div>
                  <button className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white" style={{background:"#7C3AED"}}>Aplicar</button>
                  <button onClick={() => { setPeriodoDesde(""); setPeriodoHasta(""); }} className="text-xs font-bold text-[#9E95B7] hover:text-red-400">Limpiar</button>
                </div>
              )}
              <p className="text-xs text-[#9E95B7]">
                {historialRango === "30d" ? "Mostrando información del 11 de agosto al 10 de septiembre de 2026" :
                 historialRango === "3m" ? "Mostrando información del 10 de junio al 10 de septiembre de 2026" :
                 periodoDesde && periodoHasta ? `Mostrando información del ${periodoDesde} al ${periodoHasta}` :
                 "Selecciona un rango de fechas"}
              </p>
            </div>
          )}
        </div>);
}
