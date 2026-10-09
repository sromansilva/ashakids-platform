import type { useAshaSessionEnd } from "@/pages/padre/SessionsMeeting/useAshaSessionEnd";
import { Check, X } from "lucide-react";
import { OBJETIVOS_CATALOGO } from "@/pages/padre/SessionsMeeting/OBJETIVOS_CATALOGO";
import { ACTIVIDADES_CATALOGO } from "@/pages/padre/SessionsMeeting/ACTIVIDADES_CATALOGO";

type Props = Pick<ReturnType<typeof useAshaSessionEnd>, "setShowForm" | "formStep" | "formData" | "setFormData" | "setFormSaved" | "setFormStep">;
export function AshaSessionEndFormularioDeSesion({ setShowForm, formStep, formData, setFormData, setFormSaved, setFormStep }: Props) {
return (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-[#E8E5F4] px-6 py-4 rounded-t-3xl z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-extrabold text-[#1C1135]">Formulario de sesión</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-xl hover:bg-gray-100 text-[#9E95B7]"><X size={16} /></button>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-1 h-1.5 rounded-full transition-all" style={{ background: i <= formStep ? "#7C3AED" : "#E8E5F4" }} />
                ))}
              </div>
              <p className="text-xs text-[#9E95B7] mt-2">Paso {formStep + 1} de 6</p>
            </div>

            {/* Step content */}
            <div className="p-6 flex-1">

              {/* Step 0: Datos generales */}
              {formStep === 0 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Datos de la sesión</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Fecha</label>
                      <input type="date" value={formData.fecha} onChange={e => setFormData(d => ({ ...d, fecha: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Hora</label>
                      <input type="time" value={formData.hora} onChange={e => setFormData(d => ({ ...d, hora: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Duración (minutos)</label>
                    <input type="number" min="15" max="120" value={formData.duracion} onChange={e => setFormData(d => ({ ...d, duracion: e.target.value }))}
                      className="w-32 px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-2">Estado de asistencia</label>
                    <div className="space-y-2">
                      {[
                        { val: "asistio", label: "Asistió", icon: "✅" },
                        { val: "ausencia-justificada", label: "Ausencia justificada", icon: "📋" },
                        { val: "ausencia-no-justificada", label: "Ausencia no justificada", icon: "❌" },
                      ].map(opt => (
                        <button key={opt.val} onClick={() => setFormData(d => ({ ...d, asistencia: opt.val as any }))}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 text-left transition-all ${formData.asistencia === opt.val ? "border-violet-500 bg-violet-50" : "border-[#E8E5F4] hover:border-violet-200"}`}>
                          <span>{opt.icon}</span>
                          <span className="text-sm font-medium text-[#1C1135]">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tema principal trabajado</label>
                    <input value={formData.tema} onChange={e => setFormData(d => ({ ...d, tema: e.target.value }))}
                      placeholder="Ej: Fonema /r/ vibrante, comprensión de instrucciones..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm font-medium text-[#1C1135] focus:outline-none focus:border-violet-400" />
                  </div>
                </div>
              )}

              {/* Step 1: Objetivos trabajados */}
              {formStep === 1 && (
                <div className="space-y-3">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Objetivos trabajados</h3>
                  <p className="text-sm text-[#7C6F9A]">Selecciona los objetivos abordados en esta sesión.</p>
                  {OBJETIVOS_CATALOGO.map(obj => {
                    const active = formData.objetivos.includes(obj);
                    return (
                      <button key={obj} onClick={() => setFormData(d => ({ ...d, objetivos: active ? d.objetivos.filter(o => o !== obj) : [...d.objetivos, obj] }))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all ${active ? "border-violet-500 bg-violet-50" : "border-[#E8E5F4] hover:border-violet-200"}`}>
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${active ? "bg-violet-600 border-violet-600" : "border-[#C4BAE0]"}`}>
                          {active && <Check size={11} className="text-white" />}
                        </div>
                        <span className="text-sm font-medium text-[#1C1135]">{obj}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Desempeño por objetivo */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Desempeño por objetivo</h3>
                  {formData.objetivos.length === 0 && (
                    <p className="text-sm text-[#9E95B7] italic">No seleccionaste objetivos en el paso anterior.</p>
                  )}
                  {formData.objetivos.map(obj => {
                    const d = formData.desempeno[obj] || { intentos: "", correctas: "", nivel: "", obs: "", estado: "en-progreso" };
                    const pct = d.intentos && d.correctas ? Math.round((+d.correctas / +d.intentos) * 100) : 0;
                    return (
                      <div key={obj} className="rounded-2xl border border-[#E8E5F4] p-4 space-y-3">
                        <p className="text-sm font-bold text-[#1C1135]">{obj}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Intentos</label>
                            <input type="number" min="0" value={d.intentos}
                              onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, intentos: e.target.value } } }))}
                              className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Correctas</label>
                            <input type="number" min="0" value={d.correctas}
                              onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, correctas: e.target.value } } }))}
                              className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                          </div>
                        </div>
                        {d.intentos && d.correctas && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-[#E8E5F4]">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#7C3AED" }} />
                            </div>
                            <span className="text-xs font-extrabold" style={{ color: "#7C3AED" }}>{pct}%</span>
                          </div>
                        )}
                        <div>
                          <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Nivel de ayuda</label>
                          <select value={d.nivel}
                            onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, nivel: e.target.value } } }))}
                            className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white focus:outline-none focus:border-violet-400">
                            <option value="">Seleccionar...</option>
                            <option value="independiente">Independiente</option>
                            <option value="ayuda-minima">Ayuda mínima</option>
                            <option value="ayuda-moderada">Ayuda moderada</option>
                            <option value="ayuda-total">Ayuda total</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Observación</label>
                          <input value={d.obs}
                            onChange={e => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, obs: e.target.value } } }))}
                            placeholder="Observación breve..."
                            className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-[#7C6F9A] block mb-2">Estado del objetivo</label>
                          <div className="flex gap-2 flex-wrap">
                            {[{ val: "en-progreso", label: "En progreso" }, { val: "pausado", label: "Pausar" }, { val: "alcanzado", label: "Alcanzado" }].map(opt => (
                              <button key={opt.val} onClick={() => setFormData(fd => ({ ...fd, desempeno: { ...fd.desempeno, [obj]: { ...d, estado: opt.val } } }))}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${d.estado === opt.val ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200"}`}>
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Step 3: Actividades realizadas */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Actividades trabajadas</h3>
                  {ACTIVIDADES_CATALOGO.map(grupo => (
                    <div key={grupo.cat}>
                      <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">{grupo.icon} {grupo.cat}</p>
                      <div className="space-y-2">
                        {grupo.items.map(act => {
                          const sel = formData.actividadesSeleccionadas.includes(act);
                          const det = formData.actividadesDetalle[act] || { estado: "completada", contexto: "sesion", objetivo: "", intentos: "", resultado: "", nivel: "", obs: "" };
                          return (
                            <div key={act} className={`rounded-2xl border-2 transition-all ${sel ? "border-violet-400 bg-violet-50" : "border-[#E8E5F4]"}`}>
                              <button onClick={() => setFormData(d => ({
                                ...d,
                                actividadesSeleccionadas: sel ? d.actividadesSeleccionadas.filter(a => a !== act) : [...d.actividadesSeleccionadas, act]
                              }))} className="w-full flex items-center gap-3 p-3 text-left">
                                <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${sel ? "bg-violet-600 border-violet-600" : "border-[#C4BAE0]"}`}>
                                  {sel && <Check size={11} className="text-white" />}
                                </div>
                                <span className="text-sm font-medium text-[#1C1135]">{act}</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: "#E8E5F4", color: "#7C6F9A" }}>{grupo.cat}</span>
                              </button>
                              {sel && (
                                <div className="px-4 pb-4 space-y-2 border-t border-violet-200">
                                  <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Estado</label>
                                      <select value={det.estado} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, estado: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs bg-white">
                                        <option value="completada">Completada</option>
                                        <option value="parcial">Parcialmente completada</option>
                                        <option value="asignada">Asignada</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Contexto</label>
                                      <select value={det.contexto} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, contexto: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs bg-white">
                                        <option value="sesion">Durante la sesión</option>
                                        <option value="casa">Asignada para casa</option>
                                        <option value="mundo-asha">Asignada Mundo ASHA</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Intentos</label>
                                      <input type="number" value={det.intentos} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, intentos: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs" />
                                    </div>
                                    <div>
                                      <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Nivel de ayuda</label>
                                      <select value={det.nivel} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, nivel: e.target.value } } }))}
                                        className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs bg-white">
                                        <option value="">--</option>
                                        <option value="independiente">Independiente</option>
                                        <option value="minima">Mínima</option>
                                        <option value="moderada">Moderada</option>
                                        <option value="total">Total</option>
                                      </select>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Resultado / Observación</label>
                                    <input value={det.obs} onChange={e => setFormData(fd => ({ ...fd, actividadesDetalle: { ...fd.actividadesDetalle, [act]: { ...det, obs: e.target.value } } }))}
                                      placeholder="Observación opcional..."
                                      className="w-full px-2 py-1.5 rounded-xl border border-[#E8E5F4] text-xs" />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Nota de sesión */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-[#1C1135] text-lg">Nota de sesión</h3>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Resumen de lo trabajado</label>
                    <textarea value={formData.resumen} onChange={e => setFormData(d => ({ ...d, resumen: e.target.value }))} rows={2}
                      placeholder="¿Qué se trabajó en la sesión?" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Avances observados</label>
                    <textarea value={formData.avances} onChange={e => setFormData(d => ({ ...d, avances: e.target.value }))} rows={2}
                      placeholder="Logros y progresos de la sesión..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Dificultades encontradas</label>
                    <textarea value={formData.dificultades} onChange={e => setFormData(d => ({ ...d, dificultades: e.target.value }))} rows={2}
                      placeholder="Aspectos a trabajar con más atención..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Recomendaciones para la familia</label>
                    <textarea value={formData.recomendaciones} onChange={e => setFormData(d => ({ ...d, recomendaciones: e.target.value }))} rows={2}
                      placeholder="Indicaciones para practicar en casa..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Próximos pasos</label>
                    <input value={formData.proximosPasos} onChange={e => setFormData(d => ({ ...d, proximosPasos: e.target.value }))}
                      placeholder="Ej: Continuar con automatización del /r/" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400" />
                  </div>
                  <div className="rounded-2xl border-2 border-dashed border-[#C4BAE0] p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-extrabold text-violet-700">🔒 Nota privada del terapeuta</span>
                    </div>
                    <textarea value={formData.notaPrivada} onChange={e => setFormData(d => ({ ...d, notaPrivada: e.target.value }))} rows={2}
                      placeholder="Solo visible para ti. No se comparte con el representante." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none focus:outline-none focus:border-violet-400 bg-[#FAF8FF]" />
                  </div>
                  <button onClick={() => setFormData(d => ({ ...d, compartirResumen: !d.compartirResumen }))}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${formData.compartirResumen ? "border-green-400 bg-green-50" : "border-[#E8E5F4] hover:border-green-200"}`}>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 ${formData.compartirResumen ? "bg-green-500 border-green-500" : "border-[#C4BAE0]"}`}>
                      {formData.compartirResumen && <Check size={11} className="text-white" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-[#1C1135]">Compartir resumen con el representante</p>
                      <p className="text-xs text-[#9E95B7]">El resumen y las recomendaciones serán visibles en Mi camino ASHA</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Step 5: Revisión y confirmación */}
              {formStep === 5 && (
                <div>
                  <div className="rounded-2xl p-4 mb-5" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
                    <p className="text-sm font-bold text-orange-800 mb-1">Esta acción actualizará el expediente</p>
                    <p className="text-xs text-orange-700 leading-relaxed">Al finalizar, se agregarán los datos a Sesiones, Objetivos, Actividades, Notas y el Historial del paciente. El representante podrá ver la información marcada como compartida.</p>
                  </div>
                  <div className="rounded-2xl border border-[#E8E5F4] p-4 space-y-2 mb-5">
                    {[
                      ["Fecha", formData.fecha],
                      ["Duración", `${formData.duracion} min`],
                      ["Asistencia", formData.asistencia === "asistio" ? "Asistió" : formData.asistencia === "ausencia-justificada" ? "Ausencia justificada" : "Ausencia no justificada"],
                      ["Tema", formData.tema || "—"],
                      ["Objetivos", formData.objetivos.length > 0 ? `${formData.objetivos.length} seleccionados` : "Ninguno"],
                      ["Actividades", formData.actividadesSeleccionadas.length > 0 ? `${formData.actividadesSeleccionadas.length} seleccionadas` : "Ninguna"],
                      ["Nota de sesión", formData.resumen ? "Redactada" : "—"],
                      ["Compartir con familia", formData.compartirResumen ? "Sí" : "No"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="font-medium text-[#7C6F9A]">{k}</span>
                        <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => { setFormSaved(true); setShowForm(false); }}
                      className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm shadow-lg"
                      style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
                      Finalizar registro de sesión
                    </button>
                    <button onClick={() => { setFormSaved(true); setShowForm(false); }}
                      className="w-full py-3 rounded-2xl font-bold text-sm border-2 border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
                      Guardar como borrador
                    </button>
                    <button onClick={() => setShowForm(false)}
                      className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#9E95B7] hover:text-red-500 transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky footer nav */}
            {formStep < 5 && (
              <div className="sticky bottom-0 bg-white border-t border-[#E8E5F4] px-6 py-4 flex gap-3 rounded-b-3xl">
                {formStep > 0 && (
                  <button onClick={() => setFormStep(s => s - 1)}
                    className="px-5 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-gray-50">
                    Atrás
                  </button>
                )}
                <button onClick={() => setFormStep(s => s + 1)}
                  className="flex-1 py-2.5 rounded-2xl font-extrabold text-white text-sm" style={{ background: "#7C3AED" }}>
                  Continuar
                </button>
              </div>
            )}
          </div>
        </div>);
}
