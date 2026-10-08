import { ArrowLeft, ChevronRight, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

export function PadreRecorrido({ go }: { go: (v: View) => void }) {
  const steps = [
    { label: "Cuenta familiar",    icon: "👤", status: "completado",  desc: "Cuenta creada y verificada.",                            view: "register/padre"      as View },
    { label: "Verificación",       icon: "✉️", status: "completado",  desc: "Correo electrónico verificado.",                          view: "register/verify"     as View },
    { label: "Consentimiento",     icon: "📋", status: "completado",  desc: "Consentimiento básico aceptado.",                         view: "padre/consentimiento" as View },
    { label: "Perfil del niño",    icon: "🧒", status: "completado",  desc: "Perfil mínimo creado. El niño no es usuario autónomo.",   view: "padre/hijos"         as View },
    { label: "Evaluación Inicial", icon: "📊", status: "pendiente",   desc: "Cuestionario orientativo de comunicación · 8–12 min.",    view: "padre/evaluacion"    as View },
    { label: "Elegir terapeuta",   icon: "👩‍⚕️",status: "completado",  desc: "Terapeuta aprobado seleccionado del catálogo.",           view: "padre/psicologos"    as View },
    { label: "Vinculación",        icon: "🤝", status: "completado",  desc: "Solicitud aceptada · acceso compartido habilitado.",      view: "padre/psicologos"    as View },
    { label: "Primera reserva",    icon: "📅", status: "completado",  desc: "Cita confirmada con fecha, hora y terapeuta.",            view: "padre/agenda"        as View },
    { label: "Sesión",             icon: "🎥", status: "en proceso",  desc: "Sesión virtual en curso con la Dra. Ana Ruiz.",           view: "session"             as View },
    { label: "Seguimiento",        icon: "📊", status: "pendiente",   desc: "Resumen compartido, actividades asignadas y próxima acción.", view: "padre/seguimiento" as View },
  ];
  const colorMap: Record<string, string> = { completado: "#059669", "en proceso": B.teal, pendiente: "#9E95B7" };
  const bgMap: Record<string, string> = { completado: "#D1FAE5", "en proceso": B.tealLight, pendiente: "#F5F3FF" };
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => go("padre")} className="p-2 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF] transition-colors">
          <ArrowLeft size={16} className="text-[#7C6F9A]" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#1C1135]">Mi Camino ASHA</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Recorrido principal · Datos simulados para demostración</p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <button key={step.label} onClick={() => go(step.view)}
            className="flex items-center gap-4 p-4 rounded-2xl border text-left hover:shadow-sm transition-all"
            style={{ background: bgMap[step.status], borderColor: colorMap[step.status] + "40" }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: step.status === "completado" ? "#059669" : step.status === "en proceso" ? B.teal : "#E8E5F4" }}>
              {step.status === "completado" ? <CheckCircle size={18} color="white" /> : step.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="font-extrabold text-sm text-[#1C1135]">
                  {i + 1}. {step.label}
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: colorMap[step.status] + "20", color: colorMap[step.status] }}>
                  {step.status}
                </span>
              </div>
              <p className="text-xs text-[#7C6F9A] font-medium">{step.desc}</p>
            </div>
            <ChevronRight size={16} className="text-[#9E95B7] flex-shrink-0" />
          </button>
        ))}
      </div>
      <div className="mt-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 h-3 rounded-full" style={{ background: B.violetLight }}>
            <div className="h-full rounded-full" style={{ width: "60%", background: `linear-gradient(90deg, ${B.violet}, ${B.teal})` }} />
          </div>
          <span className="text-sm font-extrabold text-[#1C1135] whitespace-nowrap">6/10</span>
        </div>
        <p className="text-xs text-center text-[#9E95B7] font-medium">60% del recorrido completado</p>
      </div>
    </div>
  );
}
