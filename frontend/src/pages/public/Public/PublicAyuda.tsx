import { useState } from "react";
import { Search, Sparkles, ChevronDown } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicAyuda({ go }: { go: (v: View) => void }) {
  const [search, setSearch]   = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const faqs = [
    { q: "¿Cómo agendo mi primera sesión?", a: "Ve a 'Encuentra un Especialista', elige al terapeuta que prefieras, selecciona el horario disponible y confirma tu cita. Recibirás un correo de confirmación.",  cat: "Citas" },
    { q: "¿Cómo funciona ASHA Session?",     a: "ASHA Session es nuestra plataforma de videollamada integrada. No necesitas instalar nada. Funciona directamente desde el navegador con alta calidad de video y audio.", cat: "Tecnología" },
    { q: "¿Cómo veo el progreso de mi hijo?",a: "En el Centro Familiar, sección 'Mi Camino ASHA', encontrarás gráficos detallados del progreso, reportes generados por el terapeuta y los próximos objetivos.",    cat: "Seguimiento" },
    { q: "¿Puedo cancelar una cita?",         a: "Sí. Puedes cancelar o reprogramar una cita hasta 24 horas antes sin cargo. Hazlo desde 'Agenda' en tu panel.",                                                       cat: "Citas" },
    { q: "¿Cómo cambio mi método de pago?",  a: "Ve a 'Pagos' en tu panel y actualiza tu tarjeta o método de pago en la sección 'Métodos de pago'.",                                                                cat: "Pagos" },
  ];
  const filtered = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/ayuda" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Centro de Ayuda</h1>
          <p className="text-lg text-[#7C6F9A] font-medium mb-5">Encuentra respuestas rápidas a tus preguntas.</p>
          <div className="flex items-center gap-2 bg-white rounded-2xl border border-[#E8E5F4] px-4 py-3 shadow-sm">
            <Search size={16} className="text-[#9E95B7]" />
            <input className="flex-1 bg-transparent text-sm font-medium focus:outline-none text-[#1C1135] placeholder:text-[#9E95B7]"
              placeholder="Buscar en el centro de ayuda…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-col gap-3 mb-10">
          {filtered.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E8E5F4]">
              <button className="w-full flex items-center justify-between p-4 text-left" onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <div>
                  <span className="text-xs font-bold text-violet-600 mr-2">{faq.cat}</span>
                  <span className="text-sm font-extrabold text-[#1C1135]">{faq.q}</span>
                </div>
                <ChevronDown size={16} className="text-[#9E95B7] flex-shrink-0" style={{ transform: faqOpen === i ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {faqOpen === i && <div className="px-4 pb-4 text-sm text-[#7C6F9A] font-medium leading-relaxed">{faq.a}</div>}
            </div>
          ))}
        </div>
        {/* ASHI CTA */}
        <div className="rounded-3xl p-6 flex items-center gap-4 flex-wrap" style={{ background: `linear-gradient(135deg, #0a7a71, ${B.violetDeep})` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,.15)" }}>
            <Sparkles size={20} color="white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white">¿No encontraste lo que buscabas?</p>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,.7)" }}>ASHI puede resolver tu duda en segundos</p>
          </div>
          <Btn variant="cta" size="sm" onClick={() => go("login")}>Preguntar a ASHI</Btn>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
