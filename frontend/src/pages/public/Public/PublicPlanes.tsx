import { CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicPlanes({ go }: { go: (v: View) => void }) {
  const plans = [
    {
      name: "Exploración",
      color: "#9E95B7",
      desc: "Para familias que quieren conocer la plataforma",
      features: [
        "1 perfil infantil",
        "Bosque de Cuentos, Montaña Musical y Valle de Adivinanzas",
        "Comunicación con terapeuta vinculada a sesión",
        "Reportes básicos",
      ],
      popular: false,
    },
    {
      name: "Familia",
      color: "#7C3AED",
      desc: "Para familias con proceso terapéutico activo",
      features: [
        "Hijos ilimitados",
        "Mundo ASHA completo (7 mundos)",
        "ASHA Session — terapia virtual",
        "Prioridad en agenda",
        "Reportes completos",
        "ASHI Intelligence",
        "Historial completo",
      ],
      popular: true,
    },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/planes" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Planes para cada familia</h1>
          <p className="text-lg text-[#7C6F9A] font-medium mb-3">Elige el nivel de acompañamiento que necesitas.</p>
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>
            ℹ️ Precios y condiciones en definición — se comunicarán antes del lanzamiento
          </span>
        </div>
        <div className="grid md:grid-cols-2 max-w-2xl mx-auto gap-5 mb-12 justify-items-center">
          {plans.map(p => (
            <div key={p.name} className={`bg-white rounded-3xl p-6 border-2 relative ${p.popular ? "shadow-xl" : ""}`}
              style={{ borderColor: p.popular ? p.color : B.border }}>
              {p.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-extrabold px-3 py-1 rounded-full text-white" style={{ background: B.violet }}>Recomendado</span>}
              <p className="font-extrabold text-[#1C1135] mb-1">{p.name}</p>
              <p className="text-xs text-[#7C6F9A] font-medium mb-4">{p.desc}</p>
              <div className="mb-5">
                <span className="text-lg font-bold text-[#9E95B7]">Información de precios próximamente</span>
              </div>
              <div className="flex flex-col gap-2 mb-6">
                {p.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle size={14} style={{ color: p.color }} />
                    <span className="text-sm text-[#7C6F9A] font-medium">{f}</span>
                  </div>
                ))}
              </div>
              <Btn variant={p.popular ? "cta" : "secondary"} onClick={() => go("login")} className="w-full justify-center">
                {p.popular ? "Registrarme" : "Explorar"}
              </Btn>
            </div>
          ))}
        </div>
        {/* Plan comparison table */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h3 className="text-xl font-extrabold text-center mb-8" style={{ color: "#1C1135" }}>
            Comparación de planes
          </h3>
          <div className="rounded-3xl overflow-hidden border border-[#E8E5F4] shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E8E5F4]">
                  <th className="text-left px-6 py-4 text-sm font-bold text-[#7C6F9A]">Característica</th>
                  <th className="text-center px-6 py-4 text-sm font-extrabold" style={{ color: "#9E95B7" }}>Exploración</th>
                  <th className="text-center px-6 py-4 text-sm font-extrabold" style={{ color: "#7C3AED" }}>
                    Familia ✦
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Perfiles infantiles", exp: "1", fam: "Ilimitados" },
                  { feature: "Mundo ASHA", exp: "Básico (3 mundos)", fam: "Completo (7 mundos)" },
                  { feature: "Reportes", exp: "Básicos", fam: "Completos" },
                  { feature: "Comunicación con terapeuta", exp: "✓", fam: "✓" },
                  { feature: "Prioridad en agenda", exp: "—", fam: "✓" },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? "bg-white" : "bg-[#F9F8FF]"}>
                    <td className="px-6 py-4 text-sm font-medium text-[#1C1135]">{row.feature}</td>
                    <td className="px-6 py-4 text-sm text-center font-semibold text-[#9E95B7]">{row.exp}</td>
                    <td className="px-6 py-4 text-sm text-center font-bold" style={{ color: row.fam === "—" ? "#9E95B7" : "#7C3AED" }}>{row.fam}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs font-medium mt-4 text-[#9E95B7]">
            Datos simulados para demostración · Precios: Por definir
          </p>
        </div>
        {/* FAQ */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Preguntas frecuentes</h2>
        {[
          { q: "¿Puedo cambiar de plan en cualquier momento?", a: "Sí, puedes actualizar o bajar de plan en cualquier momento desde tu perfil." },
          { q: "¿Las sesiones incluyen videollamada?", a: "Sí, todos los planes con ASHA Session incluyen videollamada de alta calidad con el especialista." },
          { q: "¿Hay período de prueba gratuito?", a: "El plan Exploración permite conocer la plataforma sin compromiso. Los planes de pago tendrán período de prueba — detalles próximamente." },
        ].map((faq, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-[#E8E5F4] mb-3">
            <p className="font-extrabold text-sm text-[#1C1135] mb-2">{faq.q}</p>
            <p className="text-sm text-[#7C6F9A] font-medium">{faq.a}</p>
          </div>
        ))}
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
