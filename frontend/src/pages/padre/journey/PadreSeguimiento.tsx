import { Calendar, MessageCircle, ArrowLeft, ChevronRight, TrendingUp } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";

export function PadreSeguimiento({ go }: { go: (v: View) => void }) {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => go("padre")} className="p-2 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF]">
          <ArrowLeft size={16} className="text-[#7C6F9A]" />
        </button>
        <div>
          <h2 className="text-xl font-black text-[#1C1135]">Seguimiento familiar</h2>
          <p className="text-xs text-[#9E95B7] font-medium">Paso 9 de 9 · Datos simulados para demostración</p>
        </div>
      </div>
      {/* Summary shared by therapist */}
      <Crd className="p-5 mb-4" style={{ background: "rgba(186,230,253,0.3)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Av initials="AR" color={B.violet} size="sm" />
          <div>
            <p className="font-extrabold text-sm text-[#1C1135]">Dra. Ana Ruiz</p>
            <p className="text-xs text-[#9E95B7] font-medium">Resumen compartido · Sesión del 30 Jul 2026</p>
          </div>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>Compartido</span>
        </div>
        <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-3">
          La sesión se centró en ejercicios de articulación de sílabas iniciales. Mateo mostró buena concentración y participó activamente. Se trabajaron los sonidos de la R en posición inicial y media.
        </p>
        <p className="text-xs text-[#9E95B7] italic">Este resumen fue preparado por la terapeuta. Las notas clínicas completas son de acceso exclusivo del profesional.</p>
      </Crd>
      {/* Assigned activities */}
      <Crd className="p-5 mb-4">
        <h4 className="font-extrabold text-[#1C1135] mb-3">🎯 Actividades asignadas para casa</h4>
        <div className="flex flex-col gap-2">
          {[
            { title: "Trabalenguas con R",          world: "Bosque de los Cuentos",  time: "5 min",  view: "mundo-asha/trabalenguas" as View },
            { title: "Canción de los sonidos",       world: "Montaña Musical",        time: "3 min",  view: "mundo-asha/canciones"    as View },
            { title: "Adivinanzas de animales",      world: "Valle de Adivinanzas",   time: "4 min",  view: "mundo-asha/adivinanzas"  as View },
          ].map(a => (
            <button key={a.title} onClick={() => go(a.view)}
              className="flex items-center gap-3 p-3 rounded-2xl border border-[#E8E5F4] hover:bg-[#F5F3FF] transition-colors text-left">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0" style={{ background: B.violetLight }}>🎮</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-[#1C1135]">{a.title}</p>
                <p className="text-xs text-[#9E95B7] font-medium">{a.world} · {a.time}</p>
              </div>
              <ChevronRight size={14} className="text-[#9E95B7]" />
            </button>
          ))}
        </div>
        <p className="text-xs text-[#9E95B7] italic mt-3">Las actividades son de apoyo educativo. No reemplazan la intervención del terapeuta.</p>
      </Crd>
      {/* Next step */}
      <Crd className="p-5">
        <h4 className="font-extrabold text-[#1C1135] mb-3">📅 Próxima acción</h4>
        <div className="flex items-center gap-4 p-3 rounded-2xl border border-[#E8E5F4]" style={{ background: B.violetLight }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.violet }}>
            <Calendar size={18} color="white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-sm text-[#1C1135]">Próxima sesión: 6 Ago 2026 · 10:00 AM</p>
            <p className="text-xs text-[#7C6F9A] font-medium">Dra. Ana Ruiz · Virtual · 45 min</p>
          </div>
          <Btn size="sm" variant="primary" onClick={() => go("padre/agenda")}>Ver agenda</Btn>
        </div>
        <div className="flex gap-2 mt-3">
          <Btn variant="outline" className="flex-1 justify-center" size="sm" onClick={() => go("padre/mensajes")}>
            <MessageCircle size={13} /> Escribir al terapeuta
          </Btn>
          <Btn variant="ghost" className="flex-1 justify-center" size="sm" onClick={() => go("padre/camino")}>
            <TrendingUp size={13} /> Ver progreso
          </Btn>
        </div>
      </Crd>
    </div>
  );
}
