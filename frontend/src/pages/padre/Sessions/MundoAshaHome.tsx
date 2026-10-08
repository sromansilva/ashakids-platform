import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Bdg } from "@/components/common/Bdg";

// ─── MUNDO ASHA ────────────────────────────────────────────────────────────────
import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { AshaHUD } from "@/pages/padre/Sessions/AshaHUD";
import { WorldZone } from "@/pages/padre/Sessions/WorldZone";
import { WORLD_ACTIVITIES } from "@/pages/padre/Sessions/WORLD_ACTIVITIES";
import { ACTIVIDADES_PARA_CASA } from "@/pages/padre/Sessions/ACTIVIDADES_PARA_CASA";
import { SESION_ACTIVITIES } from "@/pages/padre/Sessions/SESION_ACTIVITIES";

export function MundoAshaHome({ go, padrePlan = "familia" }: { go: (v: View) => void; padrePlan?: "exploracion" | "familia" }) {
  const [stars, setStars]  = useState(47);
  const [level]  = useState(3);
  const [streak] = useState(7);
  const [actTabHoy, setActTabHoy] = useState<"casa" | "sesion">("casa");
  const [completedActivities, setCompletedActivities] = useState<Record<string, { stars: number; date: string; plays: number }>>({});
  const [construccionModal, setConstruccionModal] = useState(false);
  const [worldWelcomeActive, setWorldWelcomeActive] = useState<string | null>(null);

  const ASSIGNED_IDS = ["osito", "trabalenguas2"];

  // Worlds now carry their own SVG position (x, y = top-left of the 90-unit node)
  const worlds = [
    { id: "bosque",      emoji: "🌳", name: "Bosque de\nlos Cuentos",    color: "#16A34A", bg: "#DCFCE7", view: "mundo-asha/cuentos"     as View, locked: false, x: 60,  y: 160, construccion: false },
    { id: "musical",     emoji: "🎵", name: "Montaña\nMusical",           color: "#9333EA", bg: "#F3E8FF", view: "mundo-asha/canciones"   as View, locked: false, x: 220, y: 60,  construccion: false },
    { id: "adivinanzas", emoji: "🧩", name: "Valle de\nAdivinanzas",      color: "#B45309", bg: "#FEF3C7", view: "mundo-asha/adivinanzas" as View, locked: false, x: 430, y: 30,  construccion: false },
    { id: "isla",        emoji: "🎨", name: "Isla\nCreativa",              color: "#DB2777", bg: "#FCE7F3", view: "mundo-asha/isla"        as View, locked: false, x: 640, y: 80,  construccion: true  },
    { id: "laboratorio", emoji: "🧪", name: "Laboratorio\nde Juegos",     color: "#0284C7", bg: "#E0F2FE", view: "mundo-asha/juegos"      as View, locked: false, x: 730, y: 260, construccion: false },
    { id: "academia",    emoji: "🚀", name: "Academia\nASHA",              color: "#7C3AED", bg: "#EDE9FE", view: "mundo-asha/academia"    as View, locked: false, x: 450, y: 260, construccion: true  },
    { id: "retos",       emoji: "🏆", name: "Camino de\nlos Retos",       color: "#EA580C", bg: "#FFF1E6", view: "mundo-asha/retos"       as View, locked: false, x: 220, y: 290, construccion: true  },
    { id: "laberinto",   emoji: "🌀", name: "Laberinto de\nTrabalengs",   color: "#7C3AED", bg: "#EDE9FE", view: "mundo-asha/laberinto"   as View, locked: false, x: 75,  y: 30,  construccion: false },
  ];

  const isExploracion = padrePlan === "exploracion";
  const visibleWorlds = isExploracion ? worlds.slice(0, 3) : worlds;

  // Sequential trail M1→M2→…→M7. Each path runs between the edge
  // of two node circles (r=45). Control points are hand-tuned so no
  // segment crosses another or passes through a node icon/label.
  // All segments carry pointerEvents="none" so HTML hit-areas work.
  const trailSegments = [
    // W0 Bosque(105,205) → W1 Montaña(265,105)  — up-right
    "M 143,181 Q 185,132 227,129",
    // W1 Montaña(265,105) → W2 Valle(475,75)     — right, slight rise
    "M 310,99 Q 370,66 431,81",
    // W2 Valle(475,75) → W3 Isla(685,125)         — right, slight drop
    "M 519,85 Q 580,78 641,115",
    // W3 Isla(685,125) → W4 Lab(775,305)          — down-right
    "M 705,165 Q 758,212 755,265",
    // W4 Lab(775,305) → W5 Academia(495,305)      — left, arched up
    "M 730,305 Q 635,278 540,305",
    // W5 Academia(495,305) → W6 Retos(265,335)    — down-left
    "M 450,311 Q 378,306 310,329",
  ];
  const visibleTrail = isExploracion ? trailSegments.slice(0, 2) : trailSegments;

  // ── World welcome screen (shown instead of map when a world is clicked) ──────
  if (worldWelcomeActive && WORLD_ACTIVITIES[worldWelcomeActive]) {
    const wd = WORLD_ACTIVITIES[worldWelcomeActive];
    return (
      <div className="min-h-screen" style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: "#F8F6FF" }}>
        {/* Header */}
        <div className="px-4 pt-6 pb-4" style={{ background: `linear-gradient(135deg, ${wd.color} 0%, ${wd.color}CC 100%)` }}>
          <button onClick={() => setWorldWelcomeActive(null)} className="flex items-center gap-2 text-white/80 text-sm font-bold mb-4 hover:text-white">
            <ChevronLeft size={18} /> Volver al mapa
          </button>
          <div className="text-center pb-4">
            <div className="text-6xl mb-3">{wd.icon}</div>
            <h1 className="text-2xl font-black text-white mb-2">{wd.name}</h1>
            <p className="text-white/80 text-sm">{wd.desc}</p>
          </div>
        </div>
        {/* Activity list */}
        <div className="p-4">
          <p className="text-base font-extrabold text-[#1C1135] mb-3">Elige tu próxima aventura</p>
          <div className="space-y-4">
            {wd.activities.map(act => {
              const comp = completedActivities[act.id];
              const isAssigned = ASSIGNED_IDS.includes(act.id);
              return (
                <div key={act.id} className={`rounded-3xl border-2 bg-white overflow-hidden ${isAssigned ? "border-violet-400" : "border-[#E8E5F4]"}`}>
                  {isAssigned && (
                    <div className="px-4 py-2 text-xs font-extrabold text-violet-700" style={{ background: "#EDE9FE" }}>
                      ⭐ Asignada por tu terapeuta
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: wd.bg }}>
                        {act.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-[#1C1135]">{act.nombre}</p>
                          {comp && <span className="text-green-500">✅</span>}
                        </div>
                        <p className="text-xs text-[#7C6F9A] mt-0.5">{act.desc}</p>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8E5F4] text-[#7C6F9A]">{act.nivel}</span>
                          <span className="text-[10px] font-bold" style={{ color: "#F59E0B" }}>⭐ Máx. {act.maxEstrellas}</span>
                        </div>
                        {comp && (
                          <p className="text-[10px] text-green-600 font-bold mt-1">Ganaste {comp.stars} ⭐ · {comp.date} · {comp.plays} {comp.plays === 1 ? "vez" : "veces"}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => { const w = worlds.find(w => w.id === worldWelcomeActive); setWorldWelcomeActive(null); if (w) go(w.view); }}
                      className="w-full py-3 rounded-2xl font-extrabold text-white text-sm"
                      style={{ background: wd.color }}>
                      {comp ? "Volver a jugar" : "Comenzar aventura"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Disclaimer */}
          <div className="mt-6 rounded-2xl p-3" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
            <p className="text-xs text-orange-700 text-center">Mundo ASHA es un complemento educativo y recreativo. Las estrellas e insignias miden participación, no progreso clínico.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #F0FDF4 50%, #FEF9EE 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 pt-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div style={{ filter: "drop-shadow(0 4px 12px rgba(124,58,237,0.15))" }}>
              <Ashi size={72} mood="wave" />
            </div>
            <div>
              <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-0.5">¡Hola, Mateo! 👋</p>
              <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] leading-tight">
                🌈 Mundo ASHA
              </h1>
              <p className="text-sm text-[#7C6F9A] font-medium mt-0.5">Explora, aprende y diviértete con nuevas aventuras</p>
            </div>
          </div>
          <AshaHUD stars={stars} level={level} streak={streak} go={go} />
        </div>

        {/* Disclaimer below stats row */}
        <div className="mx-4 mt-2 mb-1 rounded-xl px-3 py-2" style={{background:"rgba(124,58,237,0.10)", border:"1px solid rgba(124,58,237,0.15)"}}>
          <p className="text-[10px] text-violet-700 text-center leading-relaxed">
            Mundo ASHA es un complemento educativo y recreativo. Las estrellas e insignias miden participación, no progreso clínico. Los objetivos terapéuticos los interpreta el terapeuta.
          </p>
        </div>

        {/* Participation notice */}
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-start gap-2" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <span className="text-sm flex-shrink-0">ℹ️</span>
          <p className="text-xs font-medium text-[#92400E] leading-snug">
            <span className="font-extrabold">Mundo ASHA es un complemento educativo y recreativo.</span> Estrellas e insignias miden participación, no progreso clínico. Los objetivos terapéuticos los interpreta el terapeuta.
          </p>
        </div>

        {/* Actividades de hoy */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5 mb-7 shadow-sm">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-extrabold text-[#1C1135] flex items-center gap-2">
              <span className="text-xl">🎯</span> Actividades de hoy
            </h2>
            <button onClick={() => go("mundo-asha/retos" as View)} className="text-sm font-bold text-violet-600 hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>

          {/* Segmented tab switcher */}
          <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-xl mb-3 w-fit">
            {([
              { val: "casa", label: "Para casa" },
              { val: "sesion", label: "Realizadas en sesión" },
            ] as const).map(t => (
              <button key={t.val} onClick={() => setActTabHoy(t.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${actTabHoy === t.val ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Para casa tab */}
          {actTabHoy === "casa" && (
            <div className="flex flex-col gap-3">
              {ACTIVIDADES_PARA_CASA.map(act => {
                const comp = completedActivities[act.id];
                return (
                  <div key={act.id} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#F5F0FF" }}>{act.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-[#1C1135] text-sm">{act.nombre}</p>
                          {comp && <span className="text-green-500 text-base">✅</span>}
                        </div>
                        <p className="text-xs text-[#9E95B7]">{act.mundo} · {act.cat}</p>
                        <p className="text-xs text-[#9E95B7]">{act.terapeuta} · {act.asignada}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: "#F59E0B" }}>⭐ Máx. {act.maxEstrellas} estrellas</p>
                        {comp && <p className="text-xs text-green-600 font-bold mt-0.5">Ganaste {comp.stars} ⭐ · {comp.date}</p>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${comp ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {comp ? "Completada" : "Pendiente"}
                      </span>
                      <button
                        onClick={() => setWorldWelcomeActive("bosque")}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-white"
                        style={{ background: comp ? "#6D28D9" : "#7C3AED" }}>
                        {comp ? "Volver a jugar" : "Comenzar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Realizadas en sesión tab */}
          {actTabHoy === "sesion" && (
            <div className="flex flex-col gap-3">
              {SESION_ACTIVITIES.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm font-bold text-[#1C1135]">No tienes actividades pendientes</p>
                  <p className="text-xs text-[#9E95B7] mt-1">¡Disfruta explorando el mapa mientras esperas una nueva aventura!</p>
                </div>
              ) : SESION_ACTIVITIES.map(act => (
                <div key={act.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: "#F0FDF4" }}>✅</div>
                    <div className="flex-1">
                      <p className="font-extrabold text-[#1C1135] text-sm">{act.nombre}</p>
                      <p className="text-xs text-[#9E95B7]">{act.cat} · Sesión {act.sesion}</p>
                      <p className="text-xs text-[#9E95B7]">{act.terapeuta}</p>
                      <p className="text-xs font-bold text-green-700 mt-1">{act.resultado}</p>
                      <p className="text-xs text-[#9E95B7]">Objetivo: {act.objetivo}</p>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">En sesión</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* World Map SVG */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden mb-7">
          <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
            <h2 className="font-extrabold text-[#1C1135] flex items-center gap-2"><span className="text-xl">🗺️</span> Mapa del Mundo</h2>
            <Bdg color="violet">{isExploracion ? "3 mundos" : "8 mundos"}</Bdg>
          </div>
          <div className="overflow-x-auto">
            {/*
              Aspect-ratio container: paddingBottom = 430/900 = 47.78%.
              SVG is position:absolute inside so it fills the space exactly.
              HTML buttons are laid on top (later in DOM = higher stacking order)
              so no overlay div can intercept them.
            */}
            <div style={{ minWidth: 640, position: "relative", paddingBottom: `${(430 / 900) * 100}%` }}>
              {/* Visual SVG — aria-hidden, pointerEvents none; pure decoration */}
              <svg
                viewBox="0 0 900 430"
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
              >
                {/* Background landscape */}
                <defs>
                  <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DBEAFE" />
                    <stop offset="100%" stopColor="#D1FAE5" />
                  </linearGradient>
                  <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#BBF7D0" />
                    <stop offset="100%" stopColor="#A7F3D0" />
                  </linearGradient>
                </defs>
                <rect width="900" height="430" fill="url(#skyGrad)" />
                {/* Ground */}
                <ellipse cx="450" cy="460" rx="520" ry="120" fill="url(#groundGrad)" />
                {/* Mountains */}
                <path d="M0 280 L80 180 L160 280Z" fill="#A7F3D0" opacity="0.5" />
                <path d="M750 240 L840 130 L900 240Z" fill="#C4B5FD" opacity="0.4" />
                <path d="M600 300 L680 200 L760 300Z" fill="#BFDBFE" opacity="0.4" />
                {/* Sequential trail M1→M7 — decorative, non-interactive */}
                {visibleTrail.map((d, i) => (
                  <path key={i} d={d}
                    stroke="#DDD6FE" strokeWidth="5" strokeLinecap="round"
                    strokeDasharray="10 6" fill="none"
                    style={{ pointerEvents: "none" }} />
                ))}
                {/* World zone visuals */}
                {visibleWorlds.map((w) => (
                  <g key={w.name.replace(/\n/, "-")}>
                    <WorldZone
                      emoji={w.emoji}
                      name={w.name.replace("\n", " ")}
                      color={w.color}
                      bg={w.bg}
                      locked={w.locked}
                      x={w.x}
                      y={w.y}
                      size={90}
                    />
                    {w.construccion && (
                      <text x={w.x + 45} y={w.y - 18} textAnchor="middle" fontSize="7" fontWeight="900" fill="#F59E0B">
                        🚧 En construcción
                      </text>
                    )}
                  </g>
                ))}
              </svg>

              {/* HTML button overlay — rendered after SVG, wins any stacking contest.
                  pointerEvents:none on the container so the SVG background stays non-blocking;
                  each button re-enables pointerEvents:auto on itself.
                  Positions are (nodeCenter / viewBoxDimension * 100)% so they track the
                  responsive SVG exactly at any viewport width. */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                {visibleWorlds.map((w, i) => {
                  if (w.locked) return null;
                  const nodeCx = w.x + 45; // center x in SVG coords
                  const nodeCy = w.y + 45; // center y in SVG coords
                  const leftPct = (nodeCx / 900) * 100;
                  const topPct  = (nodeCy / 430) * 100;
                  return (
                    <button
                      key={w.name}
                      onClick={() => {
                        if (w.construccion) { setConstruccionModal(true); }
                        else if (WORLD_ACTIVITIES[w.id]) { setWorldWelcomeActive(w.id); }
                        else { go(w.view); }
                      }}
                      aria-label={`Abrir Mundo ${i + 1}: ${w.name.replace("\n", " ")}`}
                      style={{
                        position: "absolute",
                        left:   `${leftPct}%`,
                        top:    `${topPct}%`,
                        transform: "translate(-50%, -50%)",
                        /* 12% wide × 24% tall → in pixel terms both ≈ 12% of container
                           width because paddingBottom sets height = 430/900 × width,
                           so 24% height = 24% × (430/900) × w ≈ 11.5% × w. Close enough
                           to cover the 90-unit diameter nodes with a small margin. */
                        width:  "12%",
                        height: "24%",
                        background: "transparent",
                        border: "none",
                        borderRadius: "50%",
                        cursor: "pointer",
                        pointerEvents: "auto",
                        WebkitTapHighlightColor: "transparent",
                        outline: "none",
                      }}
                      onFocus={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 3px ${w.color}`;
                      }}
                      onBlur={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = "none";
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Quick access world cards — 7 canonical worlds in order */}
        <h2 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><span className="text-xl">⚡</span> Explorar mundos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {([
            { emoji: "🌳", num: "M1", name: "Cuentos",        sub: "12 historias",    view: "mundo-asha/cuentos"     as View, bg: "#DCFCE7", border: "#86EFAC", color: "#16A34A", assigned: true  },
            { emoji: "🎵", num: "M2", name: "Montaña Musical", sub: "8 canciones",     view: "mundo-asha/canciones"   as View, bg: "#F3E8FF", border: "#C4B5FD", color: "#7C3AED", assigned: true  },
            { emoji: "🧩", num: "M3", name: "Adivinanzas",    sub: "5 nuevas",         view: "mundo-asha/adivinanzas" as View, bg: "#FEF3C7", border: "#FCD34D", color: "#B45309", assigned: false },
            { emoji: "🎨", num: "M4", name: "Isla Creativa",  sub: "Crea tu historia", view: "mundo-asha/isla"        as View, bg: "#FCE7F3", border: "#F9A8D4", color: "#DB2777", assigned: false },
            { emoji: "🧪", num: "M5", name: "Laboratorio",    sub: "3 mini juegos",    view: "mundo-asha/juegos"      as View, bg: "#E0F2FE", border: "#7DD3FC", color: "#0284C7", assigned: false },
            { emoji: "🚀", num: "M6", name: "Academia",       sub: "Próximamente",     view: "mundo-asha/academia"    as View, bg: B.violetLight, border: "#A78BFA", color: B.violet, assigned: false },
            { emoji: "🏆", num: "M7", name: "Retos",          sub: "Próximamente",     view: "mundo-asha/retos"       as View, bg: B.orangeLight, border: "#FCA5A5", color: B.orange, assigned: false },
          ] as const).slice(0, isExploracion ? 3 : undefined).map(w => (
            <button key={w.name} onClick={() => go(w.view)}
              aria-label={`Abrir Mundo ${w.num}: ${w.name}`}
              className="rounded-3xl p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2"
              style={{ backgroundColor: w.bg, borderColor: w.border }}>
              <div className="text-4xl mb-2">{w.emoji}</div>
              <div className="flex items-center gap-1 mb-1 flex-wrap">
                <span className="text-xs font-black px-1.5 py-0.5 rounded-md" style={{ background: "rgba(0,0,0,0.07)", color: w.color }}>{w.num}</span>
                {w.assigned && <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-md" style={{ background: "#0D9488", color: "white" }}>✓ Asignada</span>}
              </div>
              <p className="font-extrabold text-sm" style={{ color: w.color }}>{w.name}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: w.color, opacity: 0.7 }}>{w.sub}</p>
            </button>
          ))}
        </div>
        {/* Auxiliary activities — not numbered worlds */}
        {!isExploracion && (
          <>
            <h3 className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3 flex items-center gap-2"><span>🎲</span> Actividades adicionales</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { emoji: "🗣️", name: "Trabalenguas", sub: "Nivel 3",   view: "mundo-asha/trabalenguas" as View, bg: B.tealLight,  border: "#5EEAD4", color: B.teal   },
                { emoji: "🏅", name: "Insignias",    sub: "5 ganadas", view: "mundo-asha/insignias"    as View, bg: "#FEF3C7",   border: "#FCD34D", color: "#92400E" },
              ].map(w => (
                <button key={w.name} onClick={() => go(w.view)}
                  aria-label={`Abrir actividad: ${w.name}`}
                  className="rounded-3xl p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border-2"
                  style={{ backgroundColor: w.bg, borderColor: w.border }}>
                  <div className="text-3xl mb-1.5">{w.emoji}</div>
                  <p className="font-extrabold text-sm" style={{ color: w.color }}>{w.name}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: w.color, opacity: 0.7 }}>{w.sub}</p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Construction modal */}
      {construccionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConstruccionModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm text-center p-8">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">¡Próximamente!</h3>
            <p className="text-sm text-[#7C6F9A] leading-relaxed mb-6">
              Estamos preparando nuevas aventuras para ti. Muy pronto podrás explorar este mundo.
            </p>
            <button onClick={() => setConstruccionModal(false)}
              className="w-full py-3 rounded-2xl font-extrabold text-white text-sm"
              style={{ background: "#7C3AED" }}>
              Volver al mapa
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
