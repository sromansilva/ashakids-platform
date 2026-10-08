
import { ChevronRight, Plus } from "lucide-react";

import { Btn } from "@/components/common/Btn";





import type { useTerapeutaPacientes } from "@/pages/terapeuta/TerapeutaPacientes/useTerapeutaPacientes";
type Props = Pick<ReturnType<typeof useTerapeutaPacientes>, "resFilterMundo" | "resFilterTipo" | "resFilterBuscar" | "setActSubTab" | "actSubTab" | "setResSubTab" | "resSubTab" | "resRapido" | "setResRapido" | "resFilterDesde" | "setResFilterDesde" | "resFilterHasta" | "setResFilterHasta" | "setResFilterBuscar" | "setResFilterMundo" | "setResFilterTipo" | "expandedRes" | "setExpandedRes" | "expandedSesAct" | "setExpandedSesAct">;
export function PatientActivities({ resFilterMundo, resFilterTipo, resFilterBuscar, setActSubTab, actSubTab, setResSubTab, resSubTab, resRapido, setResRapido, resFilterDesde, setResFilterDesde, resFilterHasta, setResFilterHasta, setResFilterBuscar, setResFilterMundo, setResFilterTipo, expandedRes, setExpandedRes, expandedSesAct, setExpandedSesAct }: Props) {
          // ── Demo data ────────────────────────────────────────────────
          const ASIGNADAS_DEMO = [
            { name: "El osito viajero",       goal: "Pronunciación de la R", lugar: "Mundo ASHA",              assigned: "28 Jul 2026", freq: "3 veces/semana", status: "Completada", mundo: "Bosque de los Cuentos",      terapeuta: "Dra. Ana Ruiz" },
            { name: "Trabalenguas nivel 2",   goal: "Pronunciación de la R", lugar: "Mundo ASHA",              assigned: "30 Jul 2026", freq: "Diario",         status: "Iniciada",   mundo: "Laberinto de Trabalenguas",  terapeuta: "Dra. Ana Ruiz" },
            { name: "¿Qué animal soy?",       goal: "Comprensión verbal",    lugar: "Casa/Mundo ASHA",         assigned: "25 Jul 2026", freq: "2 veces/semana", status: "Pendiente",  mundo: "Valle de Adivinanzas",       terapeuta: "Dra. Ana Ruiz" },
          ];
          const SESION_ACTS_DEMO = [
            { name: "Trabalenguas nivel 2", cat: "Trabalenguas", sesion: "28 Jul 2026", durSesion: "45 min", goal: "Pronunciación de la R", resultado: "80 % · Apoyo mínimo", estado: "Completada", terapeuta: "Dra. Ana Ruiz",
              detail: { intentos: 10, correctas: 8, errores: 2, pct: 80, ayuda: "Apoyo mínimo", obs: "Buena articulación en posición media de la palabra. Dificultad en posición inicial.", rec: "Practicar diariamente 5 minutos con espejo.", goalPost: "En progreso", modalidad: "Virtual" } },
            { name: "El osito viajero", cat: "Cuentos", sesion: "20 Jul 2026", durSesion: "45 min", goal: "Comprensión verbal", resultado: "90 % · Independiente", estado: "Completada", terapeuta: "Dra. Ana Ruiz",
              detail: { intentos: 10, correctas: 9, errores: 1, pct: 90, ayuda: "Independiente", obs: "Excelente comprensión de secuencias narrativas.", rec: "Continuar con cuentos de mayor longitud.", goalPost: "En progreso", modalidad: "Virtual" } },
          ];
          const CASA_RESULTS_DEMO = [
            { id: 0, name: "El osito viajero", mundo: "Bosque de los Cuentos", cat: "Cuentos", fecha: "30 Jul 2026", hora: "18:20", correctas: 3, total: 3, errores: 0, durSeg: 92, intento: 1, tipo: "primera", estrellas: 15, acumuladas: 62, pct: 100, goal: "Pronunciación de la R", asignada: "28 Jul 2026", terapeuta: "Dra. Ana Ruiz", modo: "selección", escenas: 3, mejorPct: 100, msg: "¡Excelente explorador! Comprendiste muy bien la historia y encontraste las respuestas correctas." },
            { id: 1, name: "El osito viajero", mundo: "Bosque de los Cuentos", cat: "Cuentos", fecha: "31 Jul 2026", hora: "17:45", correctas: 2, total: 3, errores: 1, durSeg: 105, intento: 2, tipo: "repeticion", estrellas: 0, acumuladas: 62, pct: 67, goal: "Pronunciación de la R", asignada: "28 Jul 2026", terapeuta: "Dra. Ana Ruiz", modo: "selección", escenas: 3, mejorPct: 100, msg: "¡Muy buen recorrido por el bosque! Recuerda algunos detalles de la historia y vuelve a intentarlo cuando quieras." },
            { id: 2, name: "Trabalenguas nivel 2", mundo: "Laberinto de Trabalenguas", cat: "Trabalenguas", fecha: "01 Ago 2026", hora: "16:10", correctas: 4, total: 5, errores: 1, durSeg: 138, intento: 1, tipo: "primera", estrellas: 15, acumuladas: 77, pct: 80, goal: "Pronunciación de la R", asignada: "30 Jul 2026", terapeuta: "Dra. Ana Ruiz", modo: "micrófono", escenas: 5, mejorPct: 80, msg: "¡Encontraste la salida del laberinto! Completaste el trabalenguas con gran esfuerzo." },
          ];
          const fmtDur = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")} min`;

          // Filter logic for casa results
          const filteredCasa = CASA_RESULTS_DEMO.filter(r => {
            if (resFilterMundo !== "todos" && r.mundo !== resFilterMundo) return false;
            if (resFilterTipo === "primera" && r.tipo !== "primera") return false;
            if (resFilterTipo === "repeticion" && r.tipo !== "repeticion") return false;
            if (resFilterBuscar && !r.name.toLowerCase().includes(resFilterBuscar.toLowerCase())) return false;
            return true;
          });

          return (
          <div>
            {/* Primary tab switcher */}
            <div className="flex gap-1 p-1 bg-[#F0EDF8] rounded-xl mb-4 w-fit">
              {([{val:"asignadas",label:"Asignadas"},{val:"resultados",label:"Resultados"}] as const).map(t => (
                <button key={t.val} onClick={() => setActSubTab(t.val)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${actSubTab === t.val ? "bg-white text-[#1C1135] shadow-sm" : "text-[#7C6F9A]"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── ASIGNADAS ── */}
            {actSubTab === "asignadas" && (
              <div>
                <div className="space-y-3 mb-4">
                  {ASIGNADAS_DEMO.map(act => (
                    <div key={act.name + act.assigned} className="rounded-2xl border border-[#E8E5F4] p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-[#1C1135]">{act.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.status === "Completada" ? "bg-green-100 text-green-700" : act.status === "Iniciada" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{act.status}</span>
                      </div>
                      <p className="text-xs text-[#7C6F9A]">Objetivo: {act.goal}</p>
                      <p className="text-xs text-[#9E95B7] mt-0.5">{act.mundo} · {act.lugar} · {act.freq}</p>
                      <p className="text-xs text-[#9E95B7]">Asignada: {act.assigned} · {act.terapeuta}</p>
                    </div>
                  ))}
                </div>
                <Btn size="sm" variant="primary"><Plus size={13} /> Asignar actividad</Btn>
              </div>
            )}

            {/* ── RESULTADOS ── */}
            {actSubTab === "resultados" && (
              <div>
                {/* Secondary tab: sesión / casa */}
                <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-xl mb-4 w-fit">
                  {([{val:"casa",label:"Actividades de casa"},{val:"sesion",label:"Actividades de sesión"}] as const).map(t => (
                    <button key={t.val} onClick={() => setResSubTab(t.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${resSubTab === t.val ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ── ACTIVIDADES DE CASA (Mundo ASHA) ── */}
                {resSubTab === "casa" && (
                  <div>
                    {/* Info banners */}
                    <div className="rounded-xl p-3 bg-[#F5F0FF] mb-3">
                      <p className="text-xs text-violet-700 font-medium leading-relaxed">Estos resultados se registran automáticamente cuando el niño realiza actividades en Mundo ASHA. Sirven como información complementaria para el seguimiento terapéutico.</p>
                    </div>
                    <div className="rounded-xl p-2.5 border border-amber-200 bg-amber-50 mb-4">
                      <p className="text-[10px] text-amber-700 font-medium text-center">Las estrellas, los aciertos y la duración reflejan participación dentro de Mundo ASHA. No actualizan automáticamente el progreso clínico del paciente.</p>
                    </div>

                    {/* Summary KPI cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {[
                        { icon: "✅", label: "Completadas", val: resRapido === "hoy" ? "1" : "4" },
                        { icon: "⏱️", label: "Práctica",    val: resRapido === "hoy" ? "2 min" : "18 min" },
                        { icon: "🔁", label: "Intentos",    val: resRapido === "hoy" ? "1" : "7" },
                        { icon: "⭐", label: "Estrellas",   val: resRapido === "hoy" ? "+15" : "+42" },
                      ].map(k => (
                        <div key={k.label} className="rounded-xl border border-[#E8E5F4] bg-white p-3 text-center">
                          <p className="text-xl mb-0.5">{k.icon}</p>
                          <p className="text-base font-extrabold text-[#1C1135]">{k.val}</p>
                          <p className="text-[10px] text-[#9E95B7] font-medium">{k.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Filter card */}
                    <div className="rounded-2xl border border-[#E8E5F4] bg-white p-4 mb-4">
                      <p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-3">Filtros</p>
                      {/* Quick date shortcuts */}
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {([{val:"hoy",label:"Hoy"},{val:"7d",label:"7 días"},{val:"30d",label:"30 días"},{val:"custom",label:"Rango"}] as const).map(opt => (
                          <button key={opt.val} onClick={() => setResRapido(opt.val)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${resRapido === opt.val ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {resRapido === "custom" && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-bold text-[#7C6F9A]">Desde</label>
                            <input type="date" value={resFilterDesde} onChange={e => setResFilterDesde(e.target.value)} className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-bold text-[#7C6F9A]">Hasta</label>
                            <input type="date" value={resFilterHasta} onChange={e => setResFilterHasta(e.target.value)} className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                          </div>
                          <button className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white" style={{background:"#7C3AED"}}>Aplicar</button>
                          <button onClick={() => { setResFilterDesde(""); setResFilterHasta(""); }} className="text-xs font-bold text-[#9E95B7] hover:text-red-400">Limpiar</button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input value={resFilterBuscar} onChange={e => setResFilterBuscar(e.target.value)} placeholder="Buscar actividad..." className="px-3 py-2 rounded-xl border border-[#E8E5F4] text-xs focus:outline-none focus:border-violet-400" />
                        <select value={resFilterMundo} onChange={e => setResFilterMundo(e.target.value)} className="px-3 py-2 rounded-xl border border-[#E8E5F4] text-xs bg-white focus:outline-none focus:border-violet-400">
                          <option value="todos">Todos los mundos</option>
                          <option value="Bosque de los Cuentos">Bosque de los Cuentos</option>
                          <option value="Montaña Musical">Montaña Musical</option>
                          <option value="Valle de Adivinanzas">Valle de Adivinanzas</option>
                          <option value="Laberinto de Trabalenguas">Laberinto de Trabalenguas</option>
                          <option value="Laboratorio de Juegos">Laboratorio de Juegos</option>
                        </select>
                        <select value={resFilterTipo} onChange={e => setResFilterTipo(e.target.value)} className="px-3 py-2 rounded-xl border border-[#E8E5F4] text-xs bg-white focus:outline-none focus:border-violet-400">
                          <option value="todos">Todos los intentos</option>
                          <option value="primera">Primera finalización</option>
                          <option value="repeticion">Repeticiones</option>
                        </select>
                      </div>
                    </div>

                    {/* Period label */}
                    <p className="text-xs text-[#9E95B7] mb-3">
                      {resRapido === "hoy" ? "Mostrando resultados del 31 de julio de 2026" : resRapido === "7d" ? "Mostrando resultados del 25 de julio al 31 de julio de 2026" : "Mostrando resultados del 28 de julio al 31 de agosto de 2026"}
                    </p>

                    {/* Result cards */}
                    {filteredCasa.length === 0 ? (
                      <div className="text-center py-10 rounded-2xl border border-dashed border-[#E8E5F4]">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm font-bold text-[#1C1135]">No hay actividades completadas en este período</p>
                        <p className="text-xs text-[#9E95B7] mt-1 mb-4">Prueba seleccionando otras fechas o revisa las actividades asignadas.</p>
                        <Btn size="sm" variant="ghost" onClick={() => setActSubTab("asignadas")}>Ver actividades asignadas</Btn>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCasa.map((r, idx) => {
                          const open = expandedRes.includes(r.id);
                          return (
                            <div key={r.id} className={`rounded-2xl border-2 overflow-hidden ${r.tipo === "primera" ? "border-green-200" : "border-violet-200"}`}>
                              {/* Compact header */}
                              <button onClick={() => setExpandedRes(prev => open ? prev.filter(x => x !== r.id) : [...prev, r.id])}
                                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{background: r.tipo === "primera" ? "#D1FAE5" : "#EDE9FE"}}>
                                  {r.cat === "Cuentos" ? "📖" : r.cat === "Trabalenguas" ? "🌀" : r.cat === "Canciones" ? "🎵" : r.cat === "Adivinanzas" ? "❓" : "🎮"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-extrabold text-[#1C1135]">{r.name}</p>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${r.tipo === "primera" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"}`}>
                                      {r.tipo === "primera" ? "Primera finalización" : "Repetición"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#9E95B7]">{r.mundo}</p>
                                  <p className="text-xs text-[#7C6F9A] mt-0.5">{r.fecha} · {r.hora} · {r.correctas}/{r.total} correctas · {fmtDur(r.durSeg)}</p>
                                  <p className="text-xs font-bold mt-0.5" style={{color: r.estrellas > 0 ? "#D97706" : "#9E95B7"}}>
                                    {r.estrellas > 0 ? `+${r.estrellas} ⭐` : "+0 ⭐ · Recompensa anterior"}
                                  </p>
                                </div>
                                <ChevronRight size={15} className={`text-[#9E95B7] flex-shrink-0 mt-1 transition-transform ${open ? "rotate-90" : ""}`} />
                              </button>

                              {/* Expanded detail */}
                              {open && (
                                <div className="border-t border-[#F0EDF8] px-4 pb-4 pt-3 space-y-4">
                                  {/* Info general */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Información general</p>
                                    <div className="space-y-1.5">
                                      {[
                                        ["Actividad", r.name],
                                        ["Categoría", r.cat],
                                        ["Mundo", r.mundo],
                                        ["Objetivo relacionado", r.goal],
                                        ["Fecha de asignación", r.asignada],
                                        ["Realizada", `${r.fecha} · ${r.hora}`],
                                        ["Lugar", "Casa / Mundo ASHA"],
                                        ["Terapeuta", r.terapeuta],
                                        ["Estado", "Completada"],
                                      ].map(([k,v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                          <span className="text-[#7C6F9A] font-medium">{k}</span>
                                          <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{v}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Participación */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Participación</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { icon: "📝", label: "Escenas", val: `${r.escenas} de ${r.escenas}` },
                                        { icon: "✅", label: "Correctas", val: String(r.correctas) },
                                        { icon: "❌", label: "Errores", val: String(r.errores) },
                                        { icon: "⏱️", label: "Duración", val: fmtDur(r.durSeg) },
                                        { icon: "🔁", label: "N.º intento", val: `Intento ${r.intento}` },
                                        { icon: "🎯", label: "Resultado", val: `${r.pct} %` },
                                      ].map(s => (
                                        <div key={s.label} className="rounded-xl border border-[#E8E5F4] p-2.5 text-center bg-white">
                                          <p className="text-base mb-0.5">{s.icon}</p>
                                          <p className="text-sm font-extrabold text-[#1C1135]">{s.val}</p>
                                          <p className="text-[10px] text-[#9E95B7]">{s.label}</p>
                                        </div>
                                      ))}
                                    </div>
                                    {r.cat !== "Cuentos" && r.cat !== "Adivinanzas" && (
                                      <p className="text-xs text-[#9E95B7] mt-2">Modo de entrada: {r.modo}</p>
                                    )}
                                    <div className="flex justify-between text-xs mt-2">
                                      <span className="text-[#7C6F9A]">Mejor resultado</span>
                                      <span className="font-extrabold text-green-600">{r.mejorPct} %</span>
                                    </div>
                                  </div>

                                  {/* Recompensa */}
                                  <div className={`rounded-xl p-3 text-center ${r.tipo === "primera" ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"}`}>
                                    <p className="text-[10px] font-extrabold uppercase tracking-wide mb-1" style={{color: r.tipo === "primera" ? "#D97706" : "#9E95B7"}}>Recompensa</p>
                                    <p className="text-xl font-extrabold" style={{color: r.tipo === "primera" ? "#D97706" : "#9E95B7"}}>{r.tipo === "primera" ? `+${r.estrellas} estrellas` : "+0 estrellas"}</p>
                                    <p className="text-[10px] mt-0.5" style={{color: r.tipo === "primera" ? "#92400E" : "#9E95B7"}}>{r.tipo === "primera" ? "Primera recompensa obtenida" : "Recompensa obtenida anteriormente"}</p>
                                    <p className="text-[10px] text-[#9E95B7] mt-0.5">Total acumulado: {r.acumuladas} ⭐ · Máx. disponible: {r.tipo === "primera" ? r.estrellas : 15}</p>
                                  </div>

                                  {/* Retroalimentación */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Mensaje mostrado al niño</p>
                                    <div className="rounded-xl p-3 bg-[#F5F0FF] border border-violet-100">
                                      <p className="text-xs text-violet-800 font-medium leading-relaxed">"{r.msg}"</p>
                                    </div>
                                  </div>

                                  {/* Seguimiento */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Datos de seguimiento</p>
                                    <div className="space-y-1.5">
                                      {[
                                        ["Primera vez completada", r.tipo === "primera" ? r.fecha : "30 Jul 2026"],
                                        ["Último intento", r.fecha],
                                        ["Total de intentos", `${r.intento} de esta asignación`],
                                        ["Mejor resultado", `${r.mejorPct} %`],
                                        ["Último resultado", `${r.pct} %`],
                                        ["Diferencia vs. intento anterior", r.tipo === "primera" ? "— (primer intento)" : `−${r.mejorPct - r.pct} %`],
                                      ].map(([k,v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                          <span className="text-[#7C6F9A] font-medium">{k}</span>
                                          <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{v}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[9px] text-[#9E95B7] mt-2 italic">Datos informativos. El progreso clínico lo evalúa el terapeuta.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── ACTIVIDADES DE SESIÓN ── */}
                {resSubTab === "sesion" && (
                  <div>
                    {SESION_ACTS_DEMO.length === 0 ? (
                      <div className="text-center py-10 rounded-2xl border border-dashed border-[#E8E5F4]">
                        <p className="text-2xl mb-2">📋</p>
                        <p className="text-sm font-bold text-[#1C1135]">No se registraron actividades durante las sesiones de este período</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {SESION_ACTS_DEMO.map((act, idx) => {
                          const open = expandedSesAct.includes(idx);
                          return (
                            <div key={idx} className="rounded-2xl border-2 border-[#E8E5F4] overflow-hidden">
                              <button onClick={() => setExpandedSesAct(prev => open ? prev.filter(x => x !== idx) : [...prev, idx])}
                                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[#F5F0FF]">
                                  {act.cat === "Cuentos" ? "📖" : act.cat === "Trabalenguas" ? "🌀" : "🎵"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-extrabold text-[#1C1135]">{act.name}</p>
                                  <p className="text-xs text-[#9E95B7]">{act.cat} · Sesión {act.sesion}</p>
                                  <p className="text-xs text-[#7C6F9A] mt-0.5">Objetivo: {act.goal}</p>
                                  <p className="text-xs font-bold text-violet-700 mt-0.5">{act.resultado}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 block mb-1">{act.estado}</span>
                                  <ChevronRight size={14} className={`text-[#9E95B7] transition-transform inline-block ${open ? "rotate-90" : ""}`} />
                                </div>
                              </button>
                              {open && (
                                <div className="border-t border-[#F0EDF8] px-4 pb-4 pt-3">
                                  <div className="space-y-1.5 mb-3">
                                    {[
                                      ["Sesión relacionada", act.sesion],
                                      ["Modalidad", act.detail.modalidad],
                                      ["Intentos", String(act.detail.intentos)],
                                      ["Correctas", String(act.detail.correctas)],
                                      ["Errores", String(act.detail.errores)],
                                      ["Desempeño", `${act.detail.pct} %`],
                                      ["Nivel de ayuda", act.detail.ayuda],
                                      ["Estado del objetivo", act.detail.goalPost],
                                    ].map(([k,v]) => (
                                      <div key={k} className="flex justify-between text-xs">
                                        <span className="text-[#7C6F9A] font-medium">{k}</span>
                                        <span className="font-bold text-[#1C1135]">{v}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="rounded-xl p-2.5 bg-[#F5F0FF] mb-2">
                                    <p className="text-[10px] font-bold text-violet-700 mb-0.5">Observación</p>
                                    <p className="text-xs text-[#4B4468]">{act.detail.obs}</p>
                                  </div>
                                  <div className="rounded-xl p-2.5 bg-[#F0FDF4] mb-3">
                                    <p className="text-[10px] font-bold text-green-700 mb-0.5">Recomendación</p>
                                    <p className="text-xs text-[#4B4468]">{act.detail.rec}</p>
                                  </div>
                                  <button className="text-xs font-extrabold underline" style={{color:"#7C3AED"}}>Ver sesión relacionada</button>
                                  <p className="text-[9px] text-[#9E95B7] mt-2 italic">Solo lectura. Para editar, abre el registro de la sesión correspondiente.</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          );
        }
