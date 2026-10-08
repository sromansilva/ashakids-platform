import { useState } from "react";
import { Star, ChevronLeft, Download, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";
import { Ashi } from "@/pages/padre/Sessions/Ashi";

export function AshaSessionSummary({ go }: { go: (v: View) => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div style={{ background: B.bg, minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => go("session")} className="flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:underline mb-6">
          <ChevronLeft size={15} /> Volver a sesiones
        </button>

        <h1 className="text-2xl font-black text-[#1C1135] mb-6">📋 Resumen de sesión</h1>

        {/* Session info */}
        <Crd className="p-6 mb-5">
          <div className="flex items-center gap-4 mb-5">
            <Av initials="AR" color={B.violet} size="lg" />
            <div>
              <p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
              <p className="text-sm text-[#7C6F9A] font-medium">Terapia del Lenguaje</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-[#9E95B7] font-medium">Duración</p>
              <p className="font-black text-[#1C1135] text-xl">45:22</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "📅", label: "Fecha",    val: "29 Jul 2026" },
              { icon: "⏰", label: "Inicio",   val: "10:00 AM"    },
              { icon: "🎯", label: "Objetivos",val: "3/4"          },
              { icon: "💻", label: "Tipo",     val: "Virtual"     },
            ].map(item => (
              <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                <div className="text-xl mb-1">{item.icon}</div>
                <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
              </div>
            ))}
          </div>
        </Crd>

        <div className="grid sm:grid-cols-2 gap-4 mb-5">
          {/* Objectives */}
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">🎯</span> Objetivos</h3>
            <div className="flex flex-col gap-2">
              {[["🗣️","Pronunciación de la R","completado"],["👂","Comprensión verbal","completado"],["🎮","Juego interactivo","completado"]].map(([icon,label,status]) => (
                <div key={label} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: status === "completado" ? "#DCFCE7" : B.violetLight }}>
                  <span>{icon}</span>
                  <span className="text-sm font-bold text-[#1C1135] flex-1">{label}</span>
                  <span className={`text-xs font-extrabold ${status === "completado" ? "text-emerald-600" : "text-[#9E95B7]"}`}>
                    {status === "completado" ? "✓" : "…"}
                  </span>
                </div>
              ))}
            </div>
          </Crd>

          {/* Therapist comments */}
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">💬</span> Nota del terapeuta</h3>
            <div className="rounded-2xl p-4" style={{ background: B.violetLight }}>
              <p className="text-sm text-[#4B4869] leading-relaxed font-medium italic">
                &ldquo;Mateo tuvo un excelente avance en la /r/ vibrante. Practicar trabalenguas en casa 3 veces por día. La sesión fue muy productiva y el niño se mostró muy motivado.&rdquo;
              </p>
            </div>
            <div className="mt-3 pt-3 border-t border-[#F5F3FF] flex items-center gap-2">
              <Av initials="AR" color={B.violet} size="sm" />
              <div>
                <p className="text-xs font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
                <p className="text-xs text-[#9E95B7] font-medium">Terapeuta del Lenguaje</p>
              </div>
            </div>
          </Crd>
        </div>

        {/* Home exercises */}
        <Crd className="p-5 mb-5">
          <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2"><span className="text-lg">📚</span> Ejercicios para casa</span>
            <Btn size="sm" variant="ghost"><Download size={13} /> Descargar PDF</Btn>
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: "🗣️", label: "Trabalenguas", desc: "Practicar 3 veces al día, 10 repeticiones",  pts: "+10 ⭐" },
              { icon: "📖", label: "Cuento",        desc: "Leer el cuento del Bosque de las letras",    pts: "+15 ⭐" },
              { icon: "🎵", label: "Canción",       desc: "Escuchar La canción de las R juntos",         pts: "+12 ⭐" },
              { icon: "✏️", label: "Escritura",     desc: "Escribir 5 palabras con R vibrante",         pts: "+20 ⭐" },
            ].map(ex => (
              <div key={ex.label} className="flex items-start gap-3 rounded-2xl p-4 border border-[#E8E5F4]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: B.violetLight }}>{ex.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{ex.label}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium leading-snug">{ex.desc}</p>
                </div>
                <span className="text-xs font-extrabold text-amber-600 flex-shrink-0">{ex.pts}</span>
              </div>
            ))}
          </div>
        </Crd>

        {/* Next session */}
        <Crd className="p-5 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: "#DCFCE7" }}>📅</div>
            <div className="flex-1">
              <p className="font-extrabold text-[#1C1135]">Próxima sesión</p>
              <p className="text-sm text-[#7C6F9A] font-medium">Miérc. 6 de agosto · 10:00 AM · Dra. Ana Ruiz</p>
            </div>
            <Btn size="sm" variant="primary">Ver detalles</Btn>
          </div>
        </Crd>

        {/* Rating */}
        {!submitted ? (
          <Crd className="p-6 mb-5">
            <h3 className="font-extrabold text-[#1C1135] mb-1 flex items-center gap-2"><span className="text-lg">⭐</span> Calificá esta sesión</h3>
            <p className="text-sm text-[#7C6F9A] font-medium mb-5">Tu opinión ayuda a mejorar la experiencia</p>
            <div className="flex gap-2 justify-center mb-5">
              {[1,2,3,4,5].map(i => (
                <button key={i}
                  onMouseEnter={() => setHoverRating(i)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(i)}
                  className="transition-transform hover:scale-125 active:scale-95">
                  <Star size={36}
                    className={`transition-colors ${i <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="flex flex-col gap-3">
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="¿Querés compartir algo sobre la sesión? (opcional)"
                  className="w-full rounded-2xl p-4 text-sm border border-[#E8E5F4] focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 resize-none font-medium"
                  style={{ background: B.violetLight }} rows={3} />
                <Btn variant="cta" className="w-full justify-center" onClick={() => setSubmitted(true)}>
                  Enviar calificación
                </Btn>
              </div>
            )}
          </Crd>
        ) : (
          <Crd className="p-5 mb-5 text-center">
            <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
            <p className="font-extrabold text-[#1C1135]">¡Gracias por tu calificación! 🙏</p>
          </Crd>
        )}

        {/* Mundo ASHA integration */}
        <div className="rounded-3xl p-6" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 100%)` }}>
          <div className="flex items-center gap-3 mb-4">
            <Ashi size={56} mood="celebrate" />
            <div>
              <p className="font-black text-white text-base">¡Muy bien, Mateo!</p>
              <p className="text-violet-200 text-sm font-medium">Ahora puedes reforzar lo aprendido:</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { emoji: "🌳", title: "Bosque de los Cuentos",   desc: "Lee este cuento para practicar",    view: "mundo-asha/cuentos"      as View, bg: "#DCFCE7", color: "#16A34A" },
              { emoji: "🎵", title: "Montaña Musical",         desc: "Escucha la Canción de las Letras",  view: "mundo-asha/canciones"    as View, bg: "#F3E8FF", color: "#7C3AED" },
              { emoji: "🗣️", title: "Valle de Adivinanzas",    desc: "Resuelve 3 actividades nuevas",     view: "mundo-asha/adivinanzas"  as View, bg: "#FEF3C7", color: "#B45309" },
            ].map(w => (
              <button key={w.title} onClick={() => go(w.view)}
                className="rounded-2xl p-4 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all border-2 border-transparent hover:border-white/20"
                style={{ background: w.bg }}>
                <div className="text-3xl mb-2">{w.emoji}</div>
                <p className="font-extrabold text-sm" style={{ color: w.color }}>{w.title}</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: w.color, opacity: 0.7 }}>{w.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
