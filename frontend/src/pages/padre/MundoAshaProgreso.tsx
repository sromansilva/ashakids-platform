
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";







import { speakForChild } from "@/pages/padre/Sessions/speakForChild";

import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { MundoAshaHome } from "@/pages/padre/Sessions/MundoAshaHome";


export function MundoAshaAcademia({ go }: { go: (v: View) => void }) {
  const modules = [
    { emoji: "🔤", name: "Letras",   desc: "Aprende el abecedario",     progress: 80, color: "#7C3AED", bg: "#EDE9FE",   total: 26, done: 21 },
    { emoji: "🔢", name: "Números",  desc: "Del 1 al 100",               progress: 60, color: "#0284C7", bg: "#E0F2FE",   total: 20, done: 12 },
    { emoji: "🎨", name: "Colores",  desc: "Identifica cada color",     progress: 100, color: "#DB2777", bg: "#FCE7F3",   total: 12, done: 12 },
    { emoji: "🔷", name: "Figuras",  desc: "Formas geométricas básicas", progress: 45, color: "#B45309", bg: "#FEF3C7",   total: 8,  done: 3  },
    { emoji: "📝", name: "Palabras", desc: "Vocabulario cotidiano",      progress: 30, color: "#16A34A", bg: "#DCFCE7",   total: 50, done: 15 },
    { emoji: "🌍", name: "El Mundo", desc: "Animales, frutas y más",     progress: 15, color: "#0D9488", bg: "#CCFBF1",   total: 40, done: 6  },
  ];
  return (
    <div style={{ background: "linear-gradient(180deg, #EDE9FE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #4C1D95 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🚀</span>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Mundo 6</p>
            <h1 className="text-3xl font-black text-white">Academia ASHA</h1>
            <p className="text-violet-200 text-sm font-medium mt-1">Letras, números, colores y más</p>
          </div>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(m => (
            <button key={m.name} onClick={() => speakForChild(`Misión de ${m.name}. ${m.desc}. Di en voz alta una palabra que conozcas.`)} className="bg-white rounded-3xl border border-[#E8E5F4] p-6 text-left hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{ backgroundColor: m.bg }}>{m.emoji}</div>
              <p className="font-extrabold text-[#1C1135] text-lg mb-1">{m.name}</p>
              <p className="text-xs text-[#7C6F9A] font-medium mb-4">{m.desc}</p>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#7C6F9A] font-medium">{m.done} / {m.total} completadas</span>
                <span className="font-extrabold" style={{ color: m.color }}>{m.progress}%</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: m.bg }}>
                <div className="h-2.5 rounded-full transition-all" style={{ width: `${m.progress}%`, background: m.color }} />
              </div>
              {m.progress === 100 && (
                <div className="mt-3 flex items-center gap-1 text-xs font-extrabold text-emerald-600">
                  <CheckCircle size={13} /> ¡Completado!
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Camino de los Retos ────────────────────────────────────────────────────────
export function MundoAshaRetos({ go }: { go: (v: View) => void }) {
  const steps = [
    { n: 1, icon: "📖", label: "Lee un cuento",           pts: 15, done: true,    world: "mundo-asha/cuentos"      as View },
    { n: 2, icon: "🧩", label: "Resuelve 3 adivinanzas",  pts: 30, done: true,    world: "mundo-asha/adivinanzas"  as View },
    { n: 3, icon: "🎵", label: "Escucha 2 canciones",     pts: 24, done: false,   world: "mundo-asha/canciones"    as View },
    { n: 4, icon: "🗣️", label: "Practica un trabalenguas",pts: 20, done: false,   world: "mundo-asha/trabalenguas" as View },
    { n: 5, icon: "🧠", label: "Completa un mini juego",  pts: 25, done: false,   world: "mundo-asha/juegos"       as View },
    { n: 6, icon: "🏆", label: "¡Recompensa final!",      pts: 50, done: false,   world: "mundo-asha/insignias"    as View },
  ];
  const doneCount = steps.filter(s => s.done).length;
  return (
    <div style={{ background: "linear-gradient(180deg, #FFF1E6 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-orange-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🏆</span>
          <div>
            <p className="text-xs font-black text-orange-200 uppercase tracking-widest mb-1">Mundo 7</p>
            <h1 className="text-3xl font-black text-white">Camino de los Retos</h1>
            <p className="text-orange-100 text-sm font-medium mt-1">Completa cada desafío y obtén la recompensa final</p>
          </div>
          <div className="ml-auto bg-white/15 rounded-2xl px-4 py-2 text-white text-center">
            <p className="font-black text-2xl">{doneCount}/{steps.length}</p>
            <p className="text-xs text-orange-200 font-bold">completados</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-7">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs font-bold text-[#7C6F9A] mb-2">
            <span>Progreso del reto</span>
            <span>{Math.round((doneCount / steps.length) * 100)}%</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: "#FDE68A" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${(doneCount / steps.length) * 100}%`, background: B.orange }} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <div key={step.n} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-7 top-full h-4 w-0.5 z-0" style={{ background: step.done ? B.orange : "#FDE68A" }} />
              )}
              <div className={`relative z-10 flex items-center gap-4 rounded-3xl p-5 border-2 transition-all
                ${step.done ? "bg-white border-orange-300 shadow-sm" : i === doneCount ? "bg-white border-orange-400 border-dashed" : "bg-[#FAFAF9] border-[#E8E5F4] opacity-60"}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${step.done ? "bg-orange-100" : "bg-[#F5F3FF]"}`}>
                  {step.done ? "✅" : step.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-extrabold ${step.done ? "text-[#1C1135]" : "text-[#7C6F9A]"}`}>{step.label}</p>
                  <p className="text-xs font-bold text-amber-600">+{step.pts} ⭐</p>
                </div>
                {step.done
                  ? <CheckCircle size={22} className="text-orange-500 flex-shrink-0" />
                  : i === doneCount
                  ? <Btn size="sm" variant="cta" onClick={() => go(step.world)}>Ir ahora</Btn>
                  : <div className="w-6 h-6 rounded-full border-2 border-dashed border-[#D4D0E5] flex-shrink-0" />
                }
              </div>
            </div>
          ))}
        </div>

        {doneCount === steps.length && (
          <div className="mt-7 rounded-3xl p-7 text-center" style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
            <div className="text-5xl mb-3">🎁</div>
            <p className="text-xl font-black text-white mb-1">¡Reto completado!</p>
            <p className="text-orange-100 text-sm font-medium mb-4">Ganaste la recompensa especial</p>
            <Btn size="lg" variant="cta" onClick={() => go("mundo-asha/insignias")}>Ver mis insignias 🏅</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Galería de Insignias ───────────────────────────────────────────────────────
export function MundoAshaInsignias({ go }: { go: (v: View) => void }) {
  const badges = [
    { icon: "📖", name: "Primer Cuento",     desc: "Leíste tu primer cuento",        earned: true,  date: "12 Jul" },
    { icon: "🧩", name: "Detective",         desc: "Resolviste 10 adivinanzas",       earned: true,  date: "18 Jul" },
    { icon: "🎵", name: "Mini Músico",       desc: "Escuchaste 5 canciones",          earned: true,  date: "22 Jul" },
    { icon: "🗣️", name: "Lengua de Plata",  desc: "Completaste 5 trabalenguas",      earned: true,  date: "24 Jul" },
    { icon: "🔢", name: "Matemático",        desc: "Dominaste los números del 1 al 20",earned: false, date: "" },
    { icon: "🌈", name: "Artista de Colores",desc: "Completaste el módulo de colores",earned: true,  date: "26 Jul" },
    { icon: "🧠", name: "Genio del Juego",   desc: "Ganaste 5 mini juegos",           earned: false, date: "" },
    { icon: "🔤", name: "Abecedario",        desc: "Aprendiste todas las letras",     earned: false, date: "" },
    { icon: "🔥", name: "Racha Épica",       desc: "7 días seguidos activo",          earned: true,  date: "29 Jul" },
    { icon: "🏆", name: "Campeón ASHA",      desc: "Completaste el camino de retos",  earned: false, date: "" },
    { icon: "🚀", name: "Explorador",        desc: "Visitaste todos los mundos",      earned: false, date: "" },
    { icon: "⭐", name: "Constelación",      desc: "Acumulaste 100 estrellas",        earned: false, date: "" },
  ];
  const earned = badges.filter(b => b.earned).length;
  return (
    <div style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #92400E 0%, #78350F 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">⭐</span>
          <div>
            <h1 className="text-3xl font-black text-white">Galería de Insignias</h1>
            <p className="text-amber-100 text-sm font-medium mt-1">Tu colección de logros</p>
          </div>
          <div className="ml-auto bg-white/15 rounded-2xl px-4 py-2 text-white text-center">
            <p className="font-black text-2xl">{earned}/{badges.length}</p>
            <p className="text-xs text-amber-200 font-bold">ganadas</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5 mb-7 shadow-sm">
          <div className="flex justify-between text-xs font-bold text-[#7C6F9A] mb-2">
            <span>Colección completada</span>
            <span>{Math.round((earned / badges.length) * 100)}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: "#FEF3C7" }}>
            <div className="h-full rounded-full" style={{ width: `${(earned / badges.length) * 100}%`, background: "#B45309" }} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map(b => (
            <div key={b.name}
              className={`rounded-3xl p-5 border-2 text-center transition-all ${b.earned ? "bg-white border-amber-300 shadow-sm hover:shadow-md hover:-translate-y-0.5" : "bg-[#FAFAF9] border-dashed border-[#E8E5F4] opacity-50"}`}>
              <div className={`text-5xl mb-3 ${!b.earned ? "grayscale" : ""}`}>{b.icon}</div>
              <p className={`text-sm font-extrabold mb-1 ${b.earned ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>{b.name}</p>
              <p className="text-xs font-medium leading-snug" style={{ color: b.earned ? B.textMid : "#B5B0C8" }}>{b.desc}</p>
              {b.earned && b.date && (
                <p className="text-xs font-bold text-amber-600 mt-2">{b.date}</p>
              )}
              {!b.earned && (
                <p className="text-xs font-bold text-[#C4B5FD] mt-2">🔒 Por desbloquear</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Perfil del Niño ────────────────────────────────────────────────────────────
export function MundoAshaPerfil({ go }: { go: (v: View) => void }) {
  const activities = [
    { icon: "📖", name: "El Patito Feo",      type: "Cuento",       pts: 15, time: "hace 2h"  },
    { icon: "🧩", name: "3 Adivinanzas",       type: "Adivinanzas",  pts: 30, time: "ayer"     },
    { icon: "🎵", name: "Abecedario Bailarín", type: "Canción",      pts: 12, time: "ayer"     },
    { icon: "🚀", name: "Academia — Letras",   type: "Academia",     pts: 20, time: "hace 2d"  },
  ];
  const badges = ["📖", "🧩", "🎵", "🗣️", "🌈", "🔥"];
  return (
    <div style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #4C1D95 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mundo ASHA
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <div style={{ filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.2))" }}>
            <Ashi size={80} mood="celebrate" />
          </div>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Perfil del explorador</p>
            <h1 className="text-3xl font-black text-white">Mateo 🦊</h1>
            <p className="text-violet-200 text-sm font-medium">7 años · Explorador Nivel 3</p>
            <div className="flex gap-3 mt-3 flex-wrap">
              <div className="bg-white/15 rounded-2xl px-3 py-1.5 text-white flex items-center gap-1.5">
                <span className="text-base">⭐</span>
                <span className="font-black text-sm">47 estrellas</span>
              </div>
              <div className="bg-white/15 rounded-2xl px-3 py-1.5 text-white flex items-center gap-1.5">
                <span className="text-base">🔥</span>
                <span className="font-black text-sm">7 días seguidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {/* Level progress */}
        <Crd className="p-6 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-extrabold text-[#1C1135]">Nivel 3 — Explorador</p>
              <p className="text-xs text-[#7C6F9A] font-medium">47 / 80 estrellas para Nivel 4</p>
            </div>
            <div className="text-4xl">🚀</div>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: B.violetLight }}>
            <div className="h-full rounded-full" style={{ width: "59%", background: B.violet }} />
          </div>
          <p className="text-xs text-right text-[#9E95B7] font-medium mt-1.5">59% — próximo nivel</p>
        </Crd>

        <div className="grid sm:grid-cols-2 gap-5 mb-5">
          {/* Stats */}
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-4">Estadísticas</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "📖", val: "8",  lbl: "Cuentos leídos",      bg: "#DCFCE7", c: "#16A34A" },
                { icon: "🧩", val: "15", lbl: "Adivinanzas",          bg: "#FEF3C7", c: "#B45309" },
                { icon: "🎵", val: "12", lbl: "Canciones",            bg: "#F3E8FF", c: "#7C3AED" },
                { icon: "🧠", val: "5",  lbl: "Mini juegos",          bg: "#E0F2FE", c: "#0284C7" },
              ].map(s => (
                <div key={s.lbl} className="rounded-2xl p-3 text-center" style={{ backgroundColor: s.bg }}>
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="font-black text-xl" style={{ color: s.c }}>{s.val}</p>
                  <p className="text-xs font-medium text-[#7C6F9A]">{s.lbl}</p>
                </div>
              ))}
            </div>
          </Crd>

          {/* Recent badges */}
          <Crd className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Últimas insignias</h3>
              <button onClick={() => go("mundo-asha/insignias")} className="text-sm font-bold text-violet-600 hover:underline flex items-center gap-1">
                Ver todas <ChevronRight size={13} />
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {badges.map((b, i) => (
                <div key={i} className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: B.violetLight }}>
                  {b}
                </div>
              ))}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 border-dashed border-[#C4B5FD] text-[#C4B5FD]">
                +6
              </div>
            </div>
          </Crd>
        </div>

        {/* Recent activity */}
        <Crd>
          <div className="p-5 border-b border-[#F5F3FF]">
            <h3 className="font-extrabold text-[#1C1135]">Actividades recientes</h3>
          </div>
          <div className="divide-y divide-[#FAFAF9]">
            {activities.map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: B.violetLight }}>{a.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{a.name}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{a.type} · {a.time}</p>
                </div>
                <span className="text-xs font-extrabold text-amber-600">+{a.pts} ⭐</span>
              </div>
            ))}
          </div>
        </Crd>
      </div>
    </div>
  );
}

// Keep old PadreRecompensas as a redirect shim (unused path)
function PadreRecompensas({ go }: { go: (v: View) => void }) {
  return <MundoAshaHome go={go} />;
}


