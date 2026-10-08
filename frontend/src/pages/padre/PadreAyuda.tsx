import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";

export function PadreAyuda({ go }: { go: (v: View) => void }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    ["¿Cómo funcionan las terapias virtuales?", "El padre agenda y acompaña al paciente; el terapeuta conduce la sesión virtual y comparte el seguimiento desde AshaKids."],
    ["¿Dónde veo mis próximas sesiones?", "En Agenda y sesiones encontrarás horarios, enlaces de acceso y opciones para revisar cada cita."],
    ["¿Cómo reviso el progreso de mi hijo?", "Mi Camino ASHA reúne los reportes y avances que el terapeuta comparte con tu familia."],
  ];
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <section className="rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${B.violetDeep}, #5B21B6)` }}>
        <div className="relative z-10 max-w-2xl"><p className="text-violet-200 text-xs font-extrabold uppercase tracking-[.16em] mb-2">Centro Familiar</p><h1 className="text-2xl sm:text-3xl font-black mb-3">¿Cómo podemos ayudarte?</h1><p className="text-sm sm:text-base font-medium text-violet-100 leading-relaxed">Encuentra orientación para usar tu dashboard sin salir de tu espacio familiar.</p></div>
        <HelpCircle className="absolute -right-5 -bottom-6 text-white/10" size={150} />
      </section>
      <div className="grid lg:grid-cols-[1.35fr_.65fr] gap-5 mt-6">
        <section className="bg-white rounded-3xl border border-[#E8E5F4] p-5 sm:p-6"><h2 className="font-black text-xl text-[#1C1135] mb-4">Preguntas frecuentes</h2><div className="divide-y divide-[#E8E5F4]">{items.map(([question, answer], index) => <div key={question}><button onClick={() => setOpen(open === index ? null : index)} className="w-full flex justify-between items-center text-left py-4 gap-4 font-extrabold text-sm text-[#1C1135]">{question}<ChevronDown size={17} className={`shrink-0 text-violet-600 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>{open === index && <p className="pb-4 text-sm font-medium leading-relaxed text-[#7C6F9A]">{answer}</p>}</div>)}</div></section>
        <aside className="bg-[#F5F3FF] rounded-3xl border border-[#E8E5F4] p-5 sm:p-6"><span className="text-3xl">💬</span><h2 className="font-black text-lg text-[#1C1135] mt-3 mb-2">Accesos rápidos</h2><p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-5">Ve directamente a la sección que necesitas.</p><div className="flex flex-col gap-2"><Btn variant="primary" onClick={() => go("padre/agenda")} className="justify-center">Ver agenda</Btn><Btn variant="outline" onClick={() => go("padre/mensajes")} className="justify-center">Abrir mensajes</Btn></div></aside>
      </div>
    </div>
  );
}
