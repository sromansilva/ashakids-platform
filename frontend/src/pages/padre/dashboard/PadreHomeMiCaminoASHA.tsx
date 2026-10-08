import type { usePadreHome } from "@/pages/padre/dashboard/usePadreHome";
import { Video, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

type Props = Pick<ReturnType<typeof usePadreHome>, "go">;
export function PadreHomeMiCaminoASHA({ go }: Props) {
return (<div className="mb-5">
          <Crd className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">Mi Camino ASHA</h3>
                <p className="text-xs text-[#9E95B7] font-medium">Recorrido principal · Paso 7 de 10</p>
              </div>
              <button onClick={() => go("padre/recorrido")} className="text-xs font-bold text-violet-600 hover:underline">Ver detalle →</button>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { label: "Cuenta",       icon: "👤", status: "completado",  view: "register/padre"     as View },
                { label: "Verificación", icon: "✉️", status: "completado",  view: "register/verify"    as View },
                { label: "Consentimiento",icon:"📋", status: "completado",  view: "padre/consentimiento" as View },
                { label: "Perfil niño",  icon: "🧒", status: "completado",  view: "padre/hijos"        as View },
                { label: "Evaluación",   icon: "📊", status: "pendiente",   view: "padre/evaluacion"   as View },
                { label: "Terapeuta",    icon: "👩‍⚕️",status: "completado",  view: "padre/psicologos"   as View },
                { label: "Vinculación",  icon: "🤝", status: "completado",  view: "padre/psicologos"   as View },
                { label: "Reserva",      icon: "📅", status: "completado",  view: "padre/agenda"       as View },
                { label: "Sesión",       icon: "🎥", status: "en proceso",  view: "session"            as View },
                { label: "Seguimiento",  icon: "📊", status: "pendiente",   view: "padre/seguimiento"  as View },
              ].map((step, i, arr) => {
                const done = step.status === "completado";
                const active = step.status === "en proceso";
                return (
                  <div key={step.label} className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => go(step.view)}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all"
                        style={{
                          background: done ? B.violet : active ? B.teal : "#E8E5F4",
                          boxShadow: active ? `0 0 0 3px ${B.tealLight}` : "none",
                        }}>
                        {done ? <CheckCircle size={16} color="white" /> : <span>{step.icon}</span>}
                      </div>
                      <span className="text-xs font-bold leading-tight text-center whitespace-nowrap"
                        style={{ color: done ? B.violet : active ? B.teal : "#9E95B7" }}>
                        {step.label}
                      </span>
                    </button>
                    {i < arr.length - 1 && (
                      <div className="w-5 h-0.5 flex-shrink-0 rounded-full mb-4"
                        style={{ background: done ? B.violet : "#E8E5F4" }} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex-1 h-2 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full transition-all" style={{ width: "60%", background: B.violet }} />
              </div>
              <span className="text-xs font-extrabold text-[#7C6F9A] whitespace-nowrap">6/10 completados</span>
              <Btn size="sm" variant="primary" onClick={() => go("session")}>
                <Video size={12} /> Ir a sesión
              </Btn>
            </div>
          </Crd>
        </div>);
}
