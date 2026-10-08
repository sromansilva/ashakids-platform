import type { useTerapeutaPacientes } from "@/pages/terapeuta/TerapeutaPacientes/useTerapeutaPacientes";
import { ChevronRight, Video, Star } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";

type Props = Pick<ReturnType<typeof useTerapeutaPacientes>, "setExpandedSession" | "expandedSession">;
export function TerapeutaPacientesSesiones({ setExpandedSession, expandedSession }: Props) {
return (<div className="flex flex-col gap-3">
            {[
              { date: "28 Jul 2026", dur: "45 min", type: "Virtual", obj: "Trabalenguas /r/", rating: 5, goals: ["Pronunciación /r/", "Fluidez verbal"] },
              { date: "21 Jul 2026", dur: "45 min", type: "Virtual", obj: "Fonema /l/",       rating: 4, goals: ["Articulación /l/"] },
              { date: "14 Jul 2026", dur: "60 min", type: "Virtual", obj: "Evaluación mes",   rating: 5, goals: ["Evaluación integral"] },
            ].map((s, i) => (
              <Crd key={i} className="overflow-hidden">
                <button onClick={() => setExpandedSession(expandedSession === i ? null : i)} className="w-full text-left p-5">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.tealLight }}>
                        <Video size={16} style={{ color: B.teal }} />
                      </div>
                      <div>
                        <p className="font-extrabold text-[#1C1135] text-sm">{s.date} · {s.dur}</p>
                        <p className="text-xs text-[#7C6F9A] font-medium">{s.type} · {s.obj}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={12} fill={j < s.rating ? "#F59E0B" : "none"} stroke={j < s.rating ? "#F59E0B" : "#D1D5DB"} />
                        ))}
                      </div>
                      <ChevronRight size={14} className="text-[#9E95B7] transition-transform" style={{ transform: expandedSession === i ? "rotate(90deg)" : "rotate(0deg)" }} />
                    </div>
                  </div>
                </button>
                {expandedSession === i && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#F0EDF8] space-y-3">
                    {[
                      { label: "Modalidad", val: s.type },
                      { label: "Asistencia", val: "Presente" },
                      { label: "Objetivos trabajados", val: s.goals?.join(", ") || "No registrado" },
                      { label: "Nivel de ayuda", val: "Apoyo mínimo" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="font-medium text-[#7C6F9A]">{item.label}</span>
                        <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{item.val}</span>
                      </div>
                    ))}
                    <div className="rounded-xl p-3 mt-2" style={{ background: "#F5F0FF" }}>
                      <p className="text-xs font-bold text-violet-700 mb-1">Observaciones iniciales</p>
                      <p className="text-xs text-[#7C6F9A]">El niño llegó motivado. Respondió bien a los materiales lúdicos.</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "#F0FDF4" }}>
                      <p className="text-xs font-bold text-green-700 mb-1">Próximos pasos</p>
                      <p className="text-xs text-[#7C6F9A]">Continuar con automatización del fonema /r/ en palabras bisílabas.</p>
                    </div>
                  </div>
                )}
              </Crd>
            ))}
          </div>);
}
