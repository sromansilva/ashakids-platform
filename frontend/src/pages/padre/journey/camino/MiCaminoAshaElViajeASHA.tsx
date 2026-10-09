import type { useMiCaminoAsha } from "@/pages/padre/journey/camino/useMiCaminoAsha";
import { ChevronRight, Star } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Ashi } from "@/components/illustrations/Ashi";

// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────
// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────
import { OBJETIVOS_DEMO } from "@/pages/padre/journey/camino/OBJETIVOS_DEMO";
import { ACTIVIDADES_PENDIENTES } from "@/pages/padre/journey/camino/ACTIVIDADES_PENDIENTES";
import { ACTIVIDADES_HIST } from "@/pages/padre/journey/camino/ACTIVIDADES_HIST";
import { SESIONES_DEMO } from "@/pages/padre/journey/camino/SESIONES_DEMO";
import { REPORTES_DEMO } from "@/pages/padre/journey/camino/REPORTES_DEMO";
import { NOTAS_COMPARTIDAS } from "@/pages/padre/journey/camino/NOTAS_COMPARTIDAS";

type Props = Pick<ReturnType<typeof useMiCaminoAsha>, "tab" | "milestones" | "child" | "go" | "periodoMode" | "setActSubTab" | "actSubTab" | "setActHistFilter" | "actHistFilter" | "setExpandedSesion" | "expandedSesion" | "badges" | "setReporteAbierto" | "wellness">;
export function MiCaminoAshaElViajeASHA({ tab, milestones, child, go, periodoMode, setActSubTab, actSubTab, setActHistFilter, actHistFilter, setExpandedSesion, expandedSesion, badges, setReporteAbierto, wellness }: Props) {
return (<div className="p-4 sm:p-6">

        {/* ── RESUMEN ── */}
        {tab === "resumen" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { icon: "🎥", label: "Sesiones",    value: "12"      },
                { icon: "⏱️", label: "Horas",       value: "9 h"     },
                { icon: "📚", label: "Actividades", value: "47"      },
                { icon: "🎯", label: "Objetivos",   value: "3 / 5"   },
                { icon: "🔥", label: "Racha",       value: "7 días"  },
                { icon: "📅", label: "Última sesión",value: "30 Jul" },
              ].map(s => (
                <Crd key={s.label} className="p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-lg font-black text-[#1C1135]">{s.value}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{s.label}</p>
                </Crd>
              ))}
            </div>

            {/* El Viaje ASHA — 3×3 matrix */}
            <Crd className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-[#1C1135]">🌱 El Viaje ASHA</h3>
                <Bdg color="violet">{milestones.filter(m => m.done).length}/{milestones.length} etapas</Bdg>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {milestones.map((m) => (
                  <div key={m.title} className={`relative rounded-2xl p-4 flex flex-col items-center text-center gap-2 border-2 transition-all cursor-pointer hover:scale-[1.02] ${m.done ? "border-transparent" : "border-dashed border-[#C8C2DC]"}`}
                    style={{ background: m.done ? B.violetLight : "#F9F8FE" }}>
                    {m.done && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                        <span className="text-white text-[9px] font-black">✓</span>
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl border-2 ${m.done ? "border-transparent" : "border-dashed border-[#C8C2DC]"}`}
                      style={{ background: m.done ? B.violetMid : "#EDEBFA" }}>
                      {m.icon}
                    </div>
                    <p className={`text-xs font-extrabold leading-tight ${m.done ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>{m.title}</p>
                    <p className="text-[10px] text-[#9E95B7] font-medium leading-tight">{m.date}</p>
                    {!m.done && <Bdg color="gray">Próximo</Bdg>}
                  </div>
                ))}
              </div>
            </Crd>

            {/* ASHI recommendation */}
            <div className="rounded-3xl p-5 border border-violet-100 flex items-start gap-4" style={{ background: B.violetLight }}>
              <Ashi size={60} mood="happy" />
              <div>
                <p className="font-extrabold text-[#1C1135] mb-1">Análisis de ASHI</p>
                <p className="text-sm text-[#7C6F9A] font-medium mb-3 max-w-lg">
                  "{child.name} ha mejorado un 18% en pronunciación durante el último mes. Te recomendamos practicar cuentos cortos durante 15 minutos al día para consolidar el avance."
                </p>
                <Btn variant="secondary" size="sm" onClick={() => go("mundo-asha/cuentos")}>
                  <Star size={13} /> Ver actividades recomendadas
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── OBJETIVOS ── */}
        {tab === "objetivos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Objetivos Terapéuticos</h3>
              <Bdg color="violet">{OBJETIVOS_DEMO.filter(o => o.estado === "En progreso").length} en progreso</Bdg>
            </div>
            {periodoMode === "actual" ? (
              OBJETIVOS_DEMO.map((obj) => (
                <div key={obj.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-extrabold text-[#1C1135] text-sm">{obj.nombre}</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${obj.estado === "Completado" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"}`}>{obj.estado}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{obj.prioridad}</span>
                    <span className="text-[10px] text-[#9E95B7]">{obj.terapeuta} · Meta: {obj.meta}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 rounded-full bg-[#E8E5F4]">
                      <div className="h-full rounded-full transition-all" style={{width:`${obj.pct}%`, background: obj.estado === "Completado" ? "#10B981" : "#06B6D4"}} />
                    </div>
                    <span className="text-xs font-extrabold" style={{color: obj.estado === "Completado" ? "#10B981" : "#06B6D4"}}>{obj.pct}%</span>
                  </div>
                  <p className="text-[10px] text-[#9E95B7] mb-2">Desempeño actual</p>
                  <div className="rounded-xl p-2.5" style={{background:"#F5F0FF"}}>
                    <p className="text-xs font-medium text-violet-700">💡 {obj.recomendacion}</p>
                  </div>
                </div>
              ))
            ) : (
              OBJETIVOS_DEMO.map(obj => (
                <div key={obj.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                  <h4 className="font-extrabold text-[#1C1135] text-sm mb-3">{obj.nombre}</h4>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="rounded-xl p-2 bg-[#F5F0FF]">
                      <p className="text-[10px] text-[#9E95B7] font-medium">Inicio</p>
                      <p className="text-lg font-extrabold text-violet-700">{obj.pct - 18}%</p>
                    </div>
                    <div className="rounded-xl p-2" style={{background:"#D1FAE5"}}>
                      <p className="text-[10px] text-green-600 font-medium">Avance</p>
                      <p className="text-lg font-extrabold text-green-700">+18%</p>
                    </div>
                    <div className="rounded-xl p-2 bg-[#F0FDF4]">
                      <p className="text-[10px] text-[#9E95B7] font-medium">Actual</p>
                      <p className="text-lg font-extrabold text-green-600">{obj.pct}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#7C6F9A]">{obj.nombre}: aumentó de {obj.pct-18}% a {obj.pct}% durante el período. Fue trabajado en 4 sesiones.</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ACTIVIDADES ── */}
        {tab === "actividades" && (
          <div>
            {/* Sub-tabs */}
            <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-xl mb-4 w-fit">
              {(["pendientes","historial"] as const).map(st => (
                <button key={st} onClick={() => setActSubTab(st)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${actSubTab === st ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                  {st === "pendientes" ? "Pendientes" : "Historial"}
                </button>
              ))}
            </div>

            {actSubTab === "pendientes" && (
              <div className="space-y-3">
                {ACTIVIDADES_PENDIENTES.map((act) => (
                  <div key={act.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-extrabold text-[#1C1135] text-sm">{act.nombre}</h4>
                        <p className="text-[10px] text-[#9E95B7] mt-0.5">{act.cat} · {act.objetivo}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${act.estado === "Iniciada" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{act.estado}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-[#7C6F9A]">
                      <div><span className="font-bold">Terapeuta:</span> {act.terapeuta}</div>
                      <div><span className="font-bold">Asignada:</span> {act.asignada}</div>
                      <div><span className="font-bold">Frecuencia:</span> {act.freq}</div>
                    </div>
                    {act.mundoAsha && (
                      <button onClick={() => go("mundo-asha")}
                        className="text-xs font-extrabold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                        style={{background:"#7C3AED"}}>
                        Ir a la actividad →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {actSubTab === "historial" && (
              <div>
                {periodoMode === "historial" && (
                  <div className="mb-3 rounded-xl p-2.5 bg-violet-50 border border-violet-200">
                    <p className="text-xs text-violet-700 font-medium">Mostrando actividades del período seleccionado</p>
                  </div>
                )}
                {/* Category filter pills */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {["Todas","Cuentos","Canciones","Adivinanzas","Trabalenguas","Juegos"].map(f => (
                    <button key={f} onClick={() => setActHistFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${actHistFilter === f ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200 bg-white"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                {(() => {
                  const filtered = ACTIVIDADES_HIST.filter(a => actHistFilter === "Todas" || a.cat === actHistFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm font-bold text-[#1C1135]">No encontramos información en este período</p>
                        <p className="text-xs text-[#9E95B7] mt-1">Prueba seleccionando otras fechas</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {filtered.map((a) => (
                        <div key={a.nombre + a.fecha} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-extrabold text-[#1C1135] text-sm">{a.nombre}</h4>
                              <p className="text-[10px] text-[#9E95B7] mt-0.5">{a.fecha} · {a.cat} · {a.origen}</p>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${a.estado === "Completada" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{a.estado}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-[#7C6F9A]">
                            <div><span className="font-bold">Objetivo:</span> {a.objetivo}</div>
                            <div><span className="font-bold">Resultado:</span> {a.resultado}</div>
                          </div>
                          {a.obs && <p className="text-xs text-[#9E95B7] mt-2 italic">"{a.obs}"</p>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── SESIONES ── */}
        {tab === "sesiones" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Historial de Sesiones</h3>
              <Bdg color="violet">{SESIONES_DEMO.length} sesiones</Bdg>
            </div>
            {periodoMode === "historial" && (
              <div className="rounded-xl p-2.5 bg-violet-50 border border-violet-200 mb-2">
                <p className="text-xs text-violet-700 font-medium">Mostrando sesiones del período seleccionado</p>
              </div>
            )}
            {SESIONES_DEMO.map((s, i) => (
              <div key={i} className="rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden">
                <button onClick={() => setExpandedSesion(expandedSesion === i ? null : i)} className="w-full flex items-start justify-between p-4 text-left">
                  <div>
                    <p className="font-extrabold text-[#1C1135] text-sm">{s.fecha} · {s.duracion}</p>
                    <p className="text-xs text-[#7C6F9A] mt-0.5">{s.modalidad} · {s.tema}</p>
                    <p className="text-xs text-[#9E95B7] mt-0.5">{s.estado} · {s.terapeuta}</p>
                  </div>
                  <ChevronRight size={16} className={`text-[#9E95B7] mt-1 transition-transform ${expandedSesion === i ? "rotate-90" : ""}`} />
                </button>
                {expandedSesion === i && (
                  <div className="px-4 pb-4 border-t border-[#F0EDF8] space-y-3 pt-3">
                    <div>
                      <p className="text-xs font-bold text-[#7C6F9A] mb-1">Objetivos trabajados</p>
                      <div className="flex flex-wrap gap-1">{s.objetivos.map(o => <span key={o} className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">{o}</span>)}</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#7C6F9A] mb-1">Actividades realizadas</p>
                      <div className="flex flex-wrap gap-1">{s.actividades.map(a => <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{a}</span>)}</div>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F5F0FF]">
                      <p className="text-xs font-bold text-violet-700 mb-1">Avances observados</p>
                      <p className="text-xs text-[#4B4468]">{s.avances}</p>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F0FDF4]">
                      <p className="text-xs font-bold text-green-700 mb-1">Recomendaciones</p>
                      <p className="text-xs text-[#4B4468]">{s.recomendaciones}</p>
                    </div>
                    <div className="rounded-xl p-3 border border-[#E8E5F4]">
                      <p className="text-xs font-bold text-[#7C6F9A] mb-1">Resumen compartido por el terapeuta</p>
                      <p className="text-xs text-[#4B4468]">{s.resumen}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── LOGROS ── */}
        {tab === "logros" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">Colección de Logros</h3>
                <p className="text-xs text-[#9E95B7] font-medium">{badges.filter(b => b.unlocked).length} de {badges.length} insignias desbloqueadas</p>
              </div>
              <Bdg color="orange">🏅 {badges.filter(b => b.unlocked).length} obtenidas</Bdg>
            </div>
            {/* XP bar */}
            <Crd className="p-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-black text-[#1C1135]">⭐ Nivel 4</p>
                  <p className="text-xs text-[#9E95B7] font-medium">Explorador</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-extrabold text-[#1C1135]">765 XP</span>
                    <span className="text-[#9E95B7] font-medium">1000 XP para Nivel 5</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: B.violetLight }}>
                    <div className="h-full rounded-full" style={{ width: "76.5%", background: `linear-gradient(90deg, ${B.violet}, ${B.orange})` }} />
                  </div>
                </div>
              </div>
            </Crd>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {badges.map((b, i) => (
                <div key={i} className={`rounded-3xl p-4 text-center border-2 transition-all ${b.unlocked ? "border-transparent hover:shadow-md hover:-translate-y-0.5" : "border-dashed border-[#E8E5F4] opacity-50"}`}
                  style={{ background: b.unlocked ? b.color + "12" : B.bg }}>
                  <div className={`text-4xl mb-2 ${b.unlocked ? "" : "grayscale opacity-40"}`}>{b.icon}</div>
                  <p className={`text-xs font-extrabold leading-tight mb-0.5 ${b.unlocked ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>{b.name}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{b.desc}</p>
                  {b.unlocked && b.date && <p className="text-xs font-bold mt-1" style={{ color: b.color }}>{b.date}</p>}
                  {!b.unlocked && <p className="text-xs font-bold mt-1 text-[#C8C2DC]">Bloqueado</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTAS ── */}
        {tab === "notas" && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Notas del Terapeuta</h3>
              <Bdg color="violet">{NOTAS_COMPARTIDAS.length} compartidas</Bdg>
            </div>
            {NOTAS_COMPARTIDAS.map(n => (
              <div key={n.titulo + n.fecha} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-[#1C1135]">{n.titulo}</p>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0 ml-2">Compartida con la familia</span>
                </div>
                <p className="text-xs text-[#9E95B7] mb-2">{n.fecha} · {n.terapeuta} · Sesión del {n.sesion}</p>
                <p className="text-sm text-[#4B4468] leading-relaxed">{n.contenido}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTES ── */}
        {tab === "reportes" && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-[#1C1135] mb-2">Reportes del Terapeuta</h3>
            {/* Último reporte */}
            <div className="rounded-2xl overflow-hidden border-2 border-violet-200 bg-white mb-4">
              <div className="px-4 pt-3 pb-1 text-xs font-extrabold text-violet-600 uppercase tracking-wider">Último reporte</div>
              <div className="px-4 pb-4">
                <h4 className="font-extrabold text-[#1C1135] text-sm mb-1">{REPORTES_DEMO[0].titulo}</h4>
                <p className="text-xs text-[#7C6F9A] mb-2">{REPORTES_DEMO[0].tipo} · {REPORTES_DEMO[0].periodo} · {REPORTES_DEMO[0].terapeuta}</p>
                <p className="text-xs text-[#4B4468] mb-3 leading-relaxed">{REPORTES_DEMO[0].resumen}</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setReporteAbierto(REPORTES_DEMO[0])}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-white" style={{background:"#7C3AED"}}>
                    Ver reporte completo
                  </button>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
            {/* Previous reports */}
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Reportes anteriores</p>
            {REPORTES_DEMO.slice(1).map(r => (
              <div key={r.titulo} className="rounded-xl border border-[#E8E5F4] p-3 flex items-start justify-between bg-white">
                <div>
                  <p className="text-sm font-bold text-[#1C1135]">{r.titulo}</p>
                  <p className="text-xs text-[#9E95B7]">{r.periodo} · {r.publicado} · <span className="text-green-600">Publicado</span></p>
                </div>
                <button onClick={() => setReporteAbierto(r)} className="text-xs font-extrabold px-3 py-1.5 rounded-xl border border-violet-200 text-violet-700 hover:bg-violet-50 flex-shrink-0 ml-2">Ver</button>
              </div>
            ))}
          </div>
        )}

        {/* ── BIENESTAR ── */}
        {tab === "bienestar" && (
          <div>
            <div className="mb-5">
              <h3 className="font-extrabold text-[#1C1135]">Centro de Bienestar para Padres</h3>
              <p className="text-sm text-[#9E95B7] font-medium">Recursos, guías y consejos seleccionados para acompañar el proceso terapéutico de {child.name}.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wellness.map(w => (
                <Crd key={w.title} className="p-5 cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform" style={{ background: w.bg }}>{w.icon}</div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full" style={{ background: w.color + "18", color: w.color }}>{w.tag}</span>
                    <span className="text-xs text-[#9E95B7] font-medium">{w.time} de lectura</span>
                  </div>
                  <p className="font-extrabold text-[#1C1135] text-sm leading-tight mb-2">{w.title}</p>
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: w.color }}>
                    Leer artículo <ChevronRight size={11} />
                  </div>
                </Crd>
              ))}
            </div>
            {/* ASHI tip */}
            <div className="mt-5 rounded-3xl p-5 border border-violet-100 flex items-center gap-4" style={{ background: B.violetLight }}>
              <Ashi size={52} mood="happy" />
              <div>
                <p className="font-extrabold text-[#1C1135] text-sm mb-1">Consejo de ASHI para esta semana</p>
                <p className="text-sm text-[#7C6F9A] font-medium">
                  Leer 15 minutos en voz alta con {child.name} antes de dormir refuerza todo lo trabajado en terapia. Elijan un cuento de Mundo ASHA para hacerlo aún más especial. ✨
                </p>
              </div>
            </div>
          </div>
        )}

        </div>);
}
