import { Star } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";

export function TerapeutaIngresos() {
  return <div />;
}

export function TerapeutaValoraciones() {
  const reviews = [
    { parent: "Laura Gómez",   child: "Mateo, 7 años",   rating: 5, text: "La doctora Ana es increíble. Mateo ha mejorado muchísimo su pronunciación. Siempre puntual, profesional y muy cálida con los niños.",            date: "28 Jul 2026", av: "LG", color: B.violet  },
    { parent: "Andrés Ríos",   child: "Bruno, 9 años",   rating: 5, text: "Excelente terapeuta. Bruno pasó de no poder leer a hacerlo con fluidez en apenas 20 sesiones. Totalmente recomendada.",                          date: "22 Jul 2026", av: "AR", color: "#22C55E" },
    { parent: "Rosa López",    child: "Valentina, 5 años",rating: 4,text: "Muy buena experiencia. La terapeuta es paciente y sabe cómo motivar a los niños. Esperamos seguir avanzando.",                                   date: "18 Jul 2026", av: "RL", color: B.teal    },
    { parent: "Claudia Torres",child: "Fernanda, 6 años", rating: 5, text: "Apenas empezamos pero ya se nota la diferencia. Fernanda está mucho más comunicativa desde que comenzó el tratamiento.",                         date: "15 Jul 2026", av: "CT", color: B.orange  },
  ];
  const avgRating = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Valoraciones</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Opiniones de padres de familia</p>
      </div>
      {/* Rating summary */}
      <div className="rounded-3xl p-6 mb-6 flex items-center gap-8 flex-wrap"
        style={{ background: `linear-gradient(135deg, ${B.violetLight} 0%, ${B.tealLight} 100%)` }}>
        <div className="text-center">
          <p className="font-black text-6xl text-[#1C1135] leading-none">{avgRating}</p>
          <div className="flex justify-center gap-1 my-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} fill="#F59E0B" stroke="#F59E0B" />
            ))}
          </div>
          <p className="text-sm text-[#7C6F9A] font-medium">{reviews.length} valoraciones</p>
        </div>
        <div className="flex-1 min-w-48">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = reviews.filter(r => r.rating === stars).length;
            const pct = Math.round((count / reviews.length) * 100);
            return (
              <div key={stars} className="flex items-center gap-3 mb-2">
                <span className="text-xs font-bold text-[#7C6F9A] w-3">{stars}</span>
                <Star size={10} fill="#F59E0B" stroke="#F59E0B" />
                <div className="flex-1 h-2 rounded-full" style={{ background: "#E8E5F4" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#F59E0B" }} />
                </div>
                <span className="text-xs font-bold text-[#7C6F9A] w-4">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: "Satisfacción",  val: "98%" },
            { label: "Recomendarían",  val: "100%"},
            { label: "Puntualidad",   val: "4.8" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl px-4 py-2 bg-white/60 text-center">
              <p className="font-black text-lg text-[#1C1135]">{s.val}</p>
              <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews */}
      <div className="grid sm:grid-cols-2 gap-4">
        {reviews.map((r, i) => (
          <Crd key={i} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Av initials={r.av} color={r.color} size="md" />
              <div>
                <p className="font-extrabold text-sm text-[#1C1135]">{r.parent}</p>
                <p className="text-xs text-[#9E95B7] font-medium">{r.child}</p>
              </div>
              <div className="ml-auto flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} size={12} fill={j < r.rating ? "#F59E0B" : "none"} stroke={j < r.rating ? "#F59E0B" : "#D1D5DB"} />
                ))}
              </div>
            </div>
            <p className="text-sm text-[#4A4560] leading-relaxed font-medium mb-3">{r.text}</p>
            <p className="text-xs text-[#9E95B7] font-medium">{r.date}</p>
          </Crd>
        ))}
      </div>
    </div>
  );
}

