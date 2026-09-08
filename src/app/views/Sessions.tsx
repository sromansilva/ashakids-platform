import { useEffect, useRef, useState } from "react";
import {
  Star, ChevronRight, ChevronLeft, ArrowRight, Check, X, Plus, Search, Download,
  Video, Clock, Mic, MicOff, VideoOff, PhoneOff, MessageCircle, Sparkles,
  Users, PlayCircle, BookOpen, Activity, Globe, Phone, CheckCircle, Calendar, Volume2,
  Pause, Play, RotateCcw, HelpCircle, Flag, FileText, BarChart2, Shield, Database,
} from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, StatCard, Skeleton, EmptyState, AshiMsg, Isotipo } from "../shared";

// ─── MUNDO ASHA ────────────────────────────────────────────────────────────────

function speakForChild(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.82;
  utterance.pitch = 1.15;
  window.speechSynthesis.speak(utterance);
}

type VoiceRecognition = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null; };

function normalizeVoiceText(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zñ ]/g, " ").trim();
}

// ASHI bear mascot SVG
function Ashi({ size = 100, mood = "happy" }: { size?: number; mood?: "happy" | "wave" | "celebrate" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shadow */}
      <ellipse cx="60" cy="112" rx="28" ry="5" fill="#1C1135" opacity="0.08" />
      {/* Backpack */}
      <rect x="44" y="76" width="32" height="26" rx="8" fill="#A78BFA" />
      <rect x="50" y="80" width="20" height="12" rx="4" fill="#7C3AED" />
      <rect x="58" y="76" width="4" height="6" rx="2" fill="#DDD6FE" />
      {/* Body */}
      <ellipse cx="60" cy="84" rx="22" ry="24" fill="#F5C58A" />
      {/* Tummy */}
      <ellipse cx="60" cy="88" rx="13" ry="14" fill="#FDEAC6" />
      {/* Star on chest */}
      <path d="M60 78 L61.5 83 L67 83 L62.5 86 L64 91 L60 88 L56 91 L57.5 86 L53 83 L58.5 83 Z" fill="#F97316" />
      {/* Head */}
      <circle cx="60" cy="54" r="26" fill="#F5C58A" />
      {/* Ears */}
      <circle cx="37" cy="34" r="10" fill="#F5C58A" />
      <circle cx="83" cy="34" r="10" fill="#F5C58A" />
      <circle cx="37" cy="34" r="6"  fill="#F9A8D4" opacity="0.6" />
      <circle cx="83" cy="34" r="6"  fill="#F9A8D4" opacity="0.6" />
      {/* Face */}
      <circle cx="52" cy="50" r="4.5" fill="#1C1135" />
      <circle cx="68" cy="50" r="4.5" fill="#1C1135" />
      <circle cx="53.5" cy="48.5" r="1.5" fill="white" />
      <circle cx="69.5" cy="48.5" r="1.5" fill="white" />
      {/* Nose */}
      <ellipse cx="60" cy="57" rx="4" ry="2.5" fill="#E8A87C" />
      {/* Smile */}
      {mood === "happy" && <path d="M53 62 Q60 68 67 62" stroke="#C4703A" strokeWidth="2" strokeLinecap="round" fill="none" />}
      {mood === "wave"  && <path d="M52 63 Q60 70 68 63" stroke="#C4703A" strokeWidth="2.5" strokeLinecap="round" fill="none" />}
      {mood === "celebrate" && <>
        <path d="M52 62 Q60 70 68 62" stroke="#C4703A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <text x="20" y="30" fontSize="14">✨</text>
        <text x="88" y="30" fontSize="14">🌟</text>
      </>}
      {/* Cheek blush */}
      <circle cx="45" cy="58" r="5" fill="#F9A8D4" opacity="0.45" />
      <circle cx="75" cy="58" r="5" fill="#F9A8D4" opacity="0.45" />
      {/* Wave arm */}
      {mood === "wave" && <path d="M82 72 Q95 60 98 50 Q100 44 96 42 Q92 40 90 46 Q88 52 82 58" stroke="#F5C58A" strokeWidth="10" strokeLinecap="round" fill="none" />}
    </svg>
  );
}

// Gamification HUD bar
function AshaHUD({ stars, level, streak, go }: { stars: number; level: number; streak: number; go: (v: View) => void }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button onClick={() => go("mundo-asha/perfil")}
        className="flex items-center gap-2 rounded-2xl px-3 py-1.5 border border-amber-200 hover:border-amber-400 transition-all"
        style={{ background: "#FEF3C7" }}>
        <span className="text-base">⭐</span>
        <span className="font-black text-amber-700 text-sm">{stars}</span>
      </button>
      <button onClick={() => go("mundo-asha/perfil")}
        className="flex items-center gap-2 rounded-2xl px-3 py-1.5 border border-violet-200 hover:border-violet-400 transition-all"
        style={{ background: B.violetLight }}>
        <span className="text-base">📈</span>
        <span className="font-black text-violet-700 text-sm">Nv.{level}</span>
      </button>
      <div className="flex items-center gap-2 rounded-2xl px-3 py-1.5 border border-orange-200"
        style={{ background: B.orangeLight }}>
        <span className="text-base">🔥</span>
        <span className="font-black text-orange-700 text-sm">{streak} días</span>
      </div>
    </div>
  );
}

// World map zone node — purely visual; click handling is done by the HTML button overlay
function WorldZone({ emoji, name, color, bg, locked, x, y, size = 110 }: {
  emoji: string; name: string; color: string; bg: string;
  locked?: boolean; x: number; y: number; size?: number;
}) {
  return (
    <g transform={`translate(${x},${y})`} style={{ pointerEvents: "none" }}>
      {/* Glow ring */}
      {!locked && <circle cx={size / 2} cy={size / 2} r={size / 2 + 6} fill={bg} opacity="0.4" />}
      {/* Main circle */}
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={locked ? "#E5E7EB" : bg} />
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill={locked ? "#F9FAFB" : "white"} opacity="0.6" />
      {/* Emoji */}
      <text x={size / 2} y={size / 2 + (locked ? 8 : 10)} fontSize={locked ? 28 : 34} textAnchor="middle" dominantBaseline="middle">
        {locked ? "🔒" : emoji}
      </text>
      {/* Label */}
      <text x={size / 2} y={size + 18} fontSize="12" textAnchor="middle" fontWeight="800" fill={locked ? "#9CA3AF" : color} fontFamily="Nunito, sans-serif">
        {name}
      </text>
      {/* Stars below (progress) */}
      {!locked && (
        <g transform={`translate(${size / 2 - 24}, ${size + 26})`}>
          {["⭐", "⭐", "☆"].map((s, i) => (
            <text key={i} x={i * 16} y={0} fontSize="12">{s}</text>
          ))}
        </g>
      )}
    </g>
  );
}

// Main Mundo ASHA home — the interactive world map
export function MundoAshaHome({ go, padrePlan = "familia" }: { go: (v: View) => void; padrePlan?: "exploracion" | "familia" }) {
  const [stars]  = useState(47);
  const [level]  = useState(3);
  const [streak] = useState(7);

  const worlds = [
    { emoji: "🌳", name: "Bosque de\nlos Cuentos",  color: "#16A34A", bg: "#DCFCE7", view: "mundo-asha/cuentos"     as View, locked: false },
    { emoji: "🎵", name: "Montaña\nMusical",         color: "#9333EA", bg: "#F3E8FF", view: "mundo-asha/canciones"   as View, locked: false },
    { emoji: "🧩", name: "Valle de\nAdivinanzas",    color: "#B45309", bg: "#FEF3C7", view: "mundo-asha/adivinanzas" as View, locked: false },
    { emoji: "🎨", name: "Isla\nCreativa",            color: "#DB2777", bg: "#FCE7F3", view: "mundo-asha/isla"        as View, locked: false },
    { emoji: "🧪", name: "Laboratorio\nde Juegos",   color: "#0284C7", bg: "#E0F2FE", view: "mundo-asha/juegos"      as View, locked: false },
    { emoji: "🚀", name: "Academia\nASHA",            color: "#7C3AED", bg: "#EDE9FE", view: "mundo-asha/academia"    as View, locked: false },
    { emoji: "🏆", name: "Camino de\nlos Retos",     color: "#EA580C", bg: "#FFF1E6", view: "mundo-asha/retos"       as View, locked: false },
  ];

  // Map positions for each world zone [x, y] within a 900×520 SVG
  const positions: [number, number][] = [
    [60,  160], // Bosque Cuentos — far left
    [220, 60],  // Montaña Musical — top center-left
    [430, 30],  // Valle Adivinanzas — top center
    [640, 80],  // Isla Creativa — top right
    [730, 260], // Laboratorio — right
    [450, 260], // Academia — center
    [220, 290], // Camino Retos — left center
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

        {/* Participation notice */}
        <div className="rounded-2xl px-4 py-3 mb-5 flex items-start gap-2" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <span className="text-sm flex-shrink-0">ℹ️</span>
          <p className="text-xs font-medium text-[#92400E] leading-snug">
            <span className="font-extrabold">Mundo ASHA es un complemento educativo y recreativo.</span> Estrellas e insignias miden participación, no progreso clínico. Los objetivos terapéuticos los interpreta el terapeuta.
          </p>
        </div>

        {/* Misiones del día */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5 mb-7 shadow-sm">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-extrabold text-[#1C1135] flex items-center gap-2">
              <span className="text-xl">🎯</span> Misiones de hoy
            </h2>
            <button onClick={() => go("mundo-asha/retos")} className="text-sm font-bold text-violet-600 hover:underline flex items-center gap-1">
              Ver retos <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {[
              { icon: "📖", label: "Lee un cuento",       pts: 15, done: true  },
              { icon: "🧩", label: "Resuelve 3 adivinanzas", pts: 10, done: true  },
              { icon: "🎵", label: "Escucha una canción", pts: 12, done: false },
              { icon: "🗣️", label: "Practica un trabalenguas", pts: 20, done: false },
            ].map(m => (
              <div key={m.label}
                className={`flex-1 flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all ${m.done ? "border-emerald-200 bg-emerald-50" : "border-[#E8E5F4] bg-[#FAFAF9]"}`}>
                <span className="text-2xl">{m.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-extrabold truncate ${m.done ? "text-emerald-700 line-through opacity-60" : "text-[#1C1135]"}`}>{m.label}</p>
                  <p className="text-xs text-amber-600 font-bold">+{m.pts} ⭐</p>
                </div>
                {m.done && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* World Map SVG */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden mb-7">
          <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
            <h2 className="font-extrabold text-[#1C1135] flex items-center gap-2"><span className="text-xl">🗺️</span> Mapa del Mundo</h2>
            <Bdg color="violet">{isExploracion ? "3 mundos" : "7 mundos"}</Bdg>
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
                {visibleWorlds.map((w, i) => (
                  <WorldZone
                    key={w.name.replace(/\n/, "-")}
                    emoji={w.emoji}
                    name={w.name.replace("\n", " ")}
                    color={w.color}
                    bg={w.bg}
                    locked={w.locked}
                    x={positions[i][0]}
                    y={positions[i][1]}
                    size={90}
                  />
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
                  const nodeCx = positions[i][0] + 45; // center x in SVG coords
                  const nodeCy = positions[i][1] + 45; // center y in SVG coords
                  const leftPct = (nodeCx / 900) * 100;
                  const topPct  = (nodeCy / 430) * 100;
                  return (
                    <button
                      key={w.name}
                      onClick={() => go(w.view)}
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
    </div>
  );
}

// ── Shared: SimulatedDataLog ───────────────────────────────────────────────────
function SimulatedDataLog({ log }: { log: object }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-2xl border border-[#E8E5F4] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3 text-xs font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">
        <span className="flex items-center gap-2"><Database size={13} /> 🔬 Prototipo de instrumentación · Datos simulados</span>
        <ChevronRight size={13} className={`transition-transform ${open ? "rotate-90" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-2 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#FFFBEB", color: "#D97706" }}>Datos simulados · No datos reales</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#EDE9FE", color: "#7C3AED" }}>Esquema v0.3-demo</span>
          </div>
          <pre className="text-xs text-[#4B4869] bg-[#F5F3FF] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(log, null, 2)}
          </pre>
          <p className="text-xs text-[#9E95B7] font-medium mt-2 italic">
            En producción estos datos se pseudonimizan antes de almacenarse. El consentimiento para entrenamiento de ML es opcional y separado.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Shared: ExitConfirmModal ───────────────────────────────────────────────────
function ExitConfirmModal({ onStay, onExit }: { onStay: () => void; onExit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onStay} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-3">🚪</div>
        <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">¿Salir de la actividad?</h3>
        <p className="text-sm text-[#7C6F9A] font-medium mb-5 leading-relaxed">
          Perderás el progreso de esta ronda. Podrás volver a intentarlo cuando quieras.
        </p>
        <div className="flex gap-3">
          <button onClick={onStay} aria-label="Continuar actividad" className="flex-1 py-2.5 rounded-xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-colors">
            Continuar actividad
          </button>
          <button onClick={onExit} aria-label="Salir sin completar" className="flex-1 py-2.5 rounded-xl font-extrabold text-sm text-white transition-colors" style={{ background: "#DC2626" }}>
            Salir sin completar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bosque de los Cuentos ──────────────────────────────────────────────────────
export function MundoAshaCuentos({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [inputMode, setInputMode] = useState<"manual" | "mic">("manual");
  const [scene, setScene] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [micSim, setMicSim] = useState<"idle" | "listening" | "done">("idle");
  const [events, setEvents] = useState<object[]>([]);

  const scenes = [
    {
      art: "🌳🌙", title: "El Bosque Mágico",
      text: "Asha llegó al gran Bosque Mágico al atardecer. Estaba oscureciendo y necesitaba un lugar para descansar. ¿Qué eligió para protegerse?",
      options: [
        { label: "🌳 Árbol hueco", key: "arbol" },
        { label: "💧 Orilla del charco", key: "charco" },
        { label: "🌿 Pastizal abierto", key: "pastizal" },
      ],
      therapistSuggested: 0,
      keyword: "árbol",
    },
    {
      art: "🦔✨", title: "El Encuentro",
      text: "Dentro del árbol hueco, Asha escuchó un ruidito suave. Era un animal amistoso que quería ayudar a encontrar el camino. ¿Quién era?",
      options: [
        { label: "🐦 Un pájaro cantor", key: "pajaro" },
        { label: "🦔 Un erizito", key: "erizo" },
        { label: "🐸 Una ranita", key: "rana" },
      ],
      therapistSuggested: 1,
      keyword: "erizito",
    },
    {
      art: "⭐🏠", title: "La Solución",
      text: "El erizito conocía el bosque muy bien. Juntos decidieron encontrar el camino de vuelta a casa. ¿Cómo lo lograron?",
      options: [
        { label: "⭐ Siguiendo las estrellas", key: "estrellas" },
        { label: "🍃 Comiendo hojas del camino", key: "hojas" },
        { label: "💤 Esperando hasta el amanecer", key: "esperar" },
      ],
      therapistSuggested: 0,
      keyword: "estrellas",
    },
  ];

  const current = scenes[scene];
  const isAssigned = true;

  const startGame = (mode: "manual" | "mic") => {
    setInputMode(mode);
    setPhase("playing");
    setStartTime(Date.now());
    setScene(0);
    setChoices([]);
    setAttempts(0);
    setHintsUsed(0);
    setPauseCount(0);
    setEvents([]);
    speakForChild(scenes[0].text);
  };

  const choose = (optKey: string, optLabel: string) => {
    const isTherapistPick = current.options.findIndex(o => o.key === optKey) === current.therapistSuggested;
    const sceneTime = Math.round((Date.now() - startTime) / 1000);
    setAttempts(a => a + 1);
    setEvents(prev => [...prev, { scene: scene + 1, choice: optKey, therapistSuggested: isTherapistPick, timeSeconds: sceneTime }]);
    setChoices(prev => [...prev, optLabel]);
    if (scene < scenes.length - 1) {
      setScene(s => s + 1);
      setTimeout(() => speakForChild(scenes[scene + 1].text), 300);
    } else {
      setPhase("done");
    }
  };

  const simulateMic = () => {
    setMicSim("listening");
    setTimeout(() => {
      setMicSim("done");
      setTimeout(() => {
        setMicSim("idle");
        choose(current.options[current.therapistSuggested].key, current.options[current.therapistSuggested].label);
      }, 800);
    }, 2000);
  };

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const dataLog = {
    sessionId: `ASHA-SIM-${Date.now().toString(36).toUpperCase()}`,
    profileId: "P-0421 (pseudonimizado)",
    activityType: "bosque-cuentos",
    version: "v1.0-demo",
    assigned: isAssigned,
    timestamp: new Date().toISOString(),
    durationSeconds: phase === "done" ? elapsedSec : null,
    attempts,
    hintsUsed,
    pauseCount,
    inputMode,
    levelCompleted: phase === "done" ? scenes.length : scene,
    events,
    note: "Datos simulados · No datos reales",
  };

  // PRE-GAME
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" }}>
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-green-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🌳</span>
          <div>
            <p className="text-xs font-black text-green-300 uppercase tracking-widest mb-1">Mundo 1</p>
            <h1 className="text-3xl font-black text-white">Bosque de los Cuentos</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#0D9488", color: "white" }}>✓ Asignada por terapeuta</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>⏱ ~5 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Crd className="p-5">
          <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Objetivo informado por el terapeuta</h2>
          <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-4">
            Practicar secuencias narrativas y vocabulario en contexto de historia. El niño elige opciones para completar una historia de 3 escenas.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🎭", label: "3 escenas · elegir imágenes o palabras" },
              { icon: "⏱", label: "Duración estimada: 5 minutos" },
              { icon: "🎤", label: "Disponible con micrófono o con botones" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              🔒 Privacidad: En esta demo no se graba audio real. La simulación de voz no almacena grabaciones reproducibles. El consentimiento para procesamiento de voz es opcional y separado del consentimiento de uso de la plataforma.
            </p>
          </div>
        </Crd>
        <div className="flex gap-3">
          <button onClick={() => startGame("mic")} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #16A34A, #0D9488)" }}>
            <Mic size={16} /> Iniciar con micrófono
          </button>
          <button onClick={() => startGame("manual")} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-all bg-white">
            <Flag size={16} /> Continuar sin micrófono
          </button>
        </div>
      </div>
    </div>
  );

  // EXIT CONFIRM
  if (phase === "exit-confirm") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />
    </div>
  );

  // DONE
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">¡Actividad completada!</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Bosque de los Cuentos · 3 escenas</p>
        </div>
        <Crd className="p-5 mb-4">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Tu participación</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Escenas completadas", value: "3 / 3" },
              { label: "Tiempo total", value: `${Math.max(1, elapsedSec)} seg` },
              { label: "Total de intentos", value: attempts > 0 ? String(attempts) : String(scenes.length) },
              { label: "Modo de entrada", value: inputMode === "mic" ? "Con micrófono" : "Sin micrófono" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#F5F3FF" }}>
                <p className="font-extrabold text-[#1C1135] text-lg">{s.value}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3 mb-3" style={{ background: "#D1FAE5", border: "1px solid #6EE7B7" }}>
            <p className="text-xs font-bold text-[#065F46] leading-snug">
              ✅ Este resumen refleja tu participación, no un resultado clínico. El análisis del avance corresponde únicamente al terapeuta.
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-1">Historia construida</p>
            {choices.map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium text-[#4B4869]">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: B.violet }}>{i + 1}</span>
                {c}
              </div>
            ))}
          </div>
        </Crd>
        <SimulatedDataLog log={dataLog} />
        <div className="flex gap-3 mt-5">
          <button onClick={() => { setPhase("pre"); setScene(0); setChoices([]); }} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-all bg-white">
            <RotateCcw size={15} /> Repetir
          </button>
          <button onClick={() => go("mundo-asha")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #16A34A, #0D9488)" }}>
            Volver al mapa <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  // PLAYING / PAUSED
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {phase === "exit-confirm" && <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />}
      {/* Header */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
            aria-label="Salir de la actividad" title="Salir de la actividad"
            className="flex items-center gap-1.5 text-sm font-bold text-green-200 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Salir
          </button>
          <div className="flex items-center gap-2">
            {scenes.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < scene ? "white" : i === scene ? "#86EFAC" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-green-200 ml-1">Escena {scene + 1}/{scenes.length}</span>
          </div>
          <button
            onClick={() => { if (phase === "playing") { setPauseCount(p => p + 1); setPhase("paused"); } else setPhase("playing"); }}
            aria-label={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            title={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            className="p-2 rounded-xl text-green-200 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {phase === "paused" && (
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Cuando estés listo, continúa desde donde lo dejaste.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("playing")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#16A34A" }}>
              <Play size={15} /> Continuar
            </button>
            <button onClick={() => go("mundo-asha")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF]">
              Salir
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <Crd className="p-5 mb-4">
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{current.art}</div>
              <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">{current.title}</h3>
              <p className="text-sm text-[#4B4869] font-medium leading-relaxed">{current.text}</p>
            </div>
            <button onClick={() => speakForChild(current.text)}
              aria-label="Escuchar consigna en voz alta" title="Escuchar consigna en voz alta"
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold mb-4 hover:bg-green-50 transition-colors" style={{ color: "#16A34A", border: "1px solid #BBF7D0" }}>
              <Volume2 size={14} /> Escuchar consigna
            </button>
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Elige una opción:</p>
            <div className="flex flex-col gap-2">
              {current.options.map((opt) => (
                <button key={opt.key} onClick={() => choose(opt.key, opt.label)}
                  className="w-full py-3 px-4 rounded-2xl font-extrabold text-sm text-left border-2 border-transparent hover:border-green-300 hover:bg-green-50 transition-all bg-[#F5F3FF] text-[#1C1135]">
                  {opt.label}
                </button>
              ))}
            </div>
            {inputMode === "mic" && (
              <div className="mt-4">
                <p className="text-xs text-[#9E95B7] font-medium text-center mb-2">— o responde con voz —</p>
                <button onClick={simulateMic} disabled={micSim !== "idle"}
                  aria-label={micSim === "listening" ? "Escuchando respuesta de voz…" : "Responder con voz (simulado)"}
                  title="Simulación de voz · No se graba audio real"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl font-extrabold text-sm text-white transition-all disabled:opacity-60"
                  style={{ background: micSim === "listening" ? "#DC2626" : "#16A34A" }}>
                  <Mic size={15} className={micSim === "listening" ? "animate-pulse" : ""} />
                  {micSim === "idle" ? "Responder con voz (simulado)" : micSim === "listening" ? "Escuchando…" : "Voz detectada ✓"}
                </button>
                {micSim === "listening" && (
                  <p className="text-xs text-center font-medium text-[#9E95B7] mt-1">En esta demo no se graba audio real.</p>
                )}
              </div>
            )}
          </Crd>
          <button onClick={() => { setHintsUsed(h => h + 1); speakForChild(`Pista: la palabra clave es ${current.keyword}.`); }}
            aria-label={`Pedir pista. ${hintsUsed} pistas usadas hasta ahora`}
            title="Pedir pista de la escena actual"
            className="flex items-center gap-1.5 text-xs font-bold text-[#9E95B7] hover:text-[#1C1135] transition-colors">
            <HelpCircle size={13} /> Pedir pista ({hintsUsed} usadas)
          </button>
        </div>
      )}
    </div>
  );
}

// ── [unused legacy story catalog removed] ──────────────────────────────────────
function _UnusedStoryCatalog({ go }: { go: (v: View) => void }) {
  const stories = [
    { id: 1, title: "El León y el Ratón", age: "4+", dur: "5 min", color: "#DCFCE7", emoji: "🦁", genre: "Fábula", popular: true, rating: 4.9, subtitle: "Un pequeño amigo puede hacer una gran diferencia.", scenes: ["🦁", "🪢", "🐭"], words: ["león", "ratón", "amigo"], activity: "Di en voz alta: león, ratón y amigo. Después cuenta quién ayudó al león." },
    { id: 2, title: "Caperucita Roja", age: "3+", dur: "7 min", color: "#FEF3C7", emoji: "🐺", genre: "Clásico", popular: true, rating: 4.8, subtitle: "Una aventura por el bosque para visitar a la abuelita.", scenes: ["👧", "🧺", "🌲"], words: ["capa", "canasta", "bosque"], activity: "Señala y repite: capa roja, canasta y bosque. ¿A quién visita Caperucita?" },
    { id: 3, title: "Los Tres Cerditos", age: "4+", dur: "6 min", color: "#FEE2E2", emoji: "🐷", genre: "Clásico", popular: false, rating: 4.7, subtitle: "Tres hermanos construyen casas muy diferentes.", scenes: ["🐷", "🧱", "🏠"], words: ["cerdito", "casa", "ladrillo"], activity: "Repite: casa de ladrillo. ¿Cuál casa fue la más fuerte?" },
    { id: 4, title: "La Tortuga y la Liebre", age: "5+", dur: "5 min", color: "#E0F2FE", emoji: "🐢", genre: "Fábula", popular: false, rating: 4.6, subtitle: "Ir despacio y constante también puede llevarte a la meta.", scenes: ["🐢", "🐇", "🏁"], words: ["tortuga", "liebre", "correr"], activity: "Di tortuga muy despacio y liebre muy rápido. ¿Quién llegó primero?" },
    { id: 5, title: "El Patito Feo", age: "4+", dur: "8 min", color: "#F3E8FF", emoji: "🦆", genre: "Clásico", popular: true, rating: 4.9, subtitle: "Una historia sobre crecer, conocerse y sentirse especial.", scenes: ["🥚", "🦆", "🦢"], words: ["patito", "plumas", "cisne"], activity: "Repite: patito, plumas y cisne. ¿En qué se convirtió el patito?" },
    { id: 6, title: "Hansel y Gretel", age: "6+", dur: "10 min", color: "#FCE7F3", emoji: "🍬", genre: "Clásico", popular: false, rating: 4.5, subtitle: "Dos hermanos siguen un camino de migas y encuentran una casa dulce.", scenes: ["👫", "🍞", "🍬"], words: ["hermanos", "migas", "dulce"], activity: "Di: migas de pan. ¿Qué dejaron Hansel y Gretel en el camino?" },
  ];
  const storyDetails: Record<number, { pages: { art: string; title: string; text: string }[]; phrases: string[]; warmup: string; plan: string[] }> = {
    1: { pages: [{ art: "🦁🌳", title: "El león atrapado", text: "Un león grande caminaba por la selva. Un ratoncito pequeño pasó corriendo sobre su pata. El león lo atrapó, pero decidió dejarlo libre." }, { art: "🐭🪢", title: "Un amigo pequeño", text: "Días después, el león quedó atrapado en una red. El ratón escuchó su rugido y mordió las cuerdas hasta liberarlo." }, { art: "🤝⭐", title: "La enseñanza", text: "El león agradeció al ratón. Comprendió que un amigo pequeño también puede ayudar mucho." }], phrases: ["El león ruge", "El ratón ayuda"], warmup: "Abre la boca como un león: a, a, a. Luego haz un rugido suave: rrr.", plan: ["1 min · Calentamiento", "2 min · Leer y escuchar", "2 min · Palabras y frases"] },
    2: { pages: [{ art: "👧🧺", title: "Una visita especial", text: "Caperucita se puso su capa roja y preparó una canasta con comida. Iba a visitar a su abuelita que vivía al otro lado del bosque." }, { art: "🌲🐺", title: "En el bosque", text: "En el camino encontró a un lobo. Caperucita habló con él, pero siguió caminando sin alejarse del sendero." }, { art: "🏡👵", title: "Llegó a casa", text: "Caperucita llegó a la casa de la abuelita. Al final, todos aprendieron a caminar con cuidado y escuchar los consejos." }], phrases: ["Capa roja", "Canasta grande", "Voy al bosque"], warmup: "Di despacio: ca, co, cu. Después repite: capa roja.", plan: ["1 min · Vocales ca-co-cu", "3 min · Cuento por páginas", "3 min · Frases y comprensión"] },
    3: { pages: [{ art: "🐷🌾", title: "Tres hermanos", text: "Tres cerditos querían construir sus casas. El primero usó paja, el segundo usó palitos y el tercero eligió ladrillos." }, { art: "🌬️🏠", title: "Sopla el lobo", text: "El lobo llegó y sopló muy fuerte. La casa de paja y la casa de palitos se cayeron." }, { art: "🧱🐷", title: "La casa fuerte", text: "Los tres cerditos se refugiaron en la casa de ladrillos. Era fuerte y segura." }], phrases: ["Casa de paja", "Ladrillo fuerte"], warmup: "Junta los labios y sopla suave: p, p, p. Repite: paja y palitos.", plan: ["1 min · Soplo y sonido P", "3 min · Leer el cuento", "2 min · Palabras y frases"] },
    4: { pages: [{ art: "🐇🏁", title: "Una carrera", text: "La liebre se burlaba de la tortuga porque caminaba despacio. La tortuga propuso hacer una carrera hasta la meta." }, { art: "😴🐇", title: "Una siesta", text: "La liebre corrió muy rápido y decidió descansar. Pensó que tendría tiempo para ganar después." }, { art: "🐢🏆", title: "Paso a paso", text: "La tortuga siguió caminando sin detenerse. Llegó a la meta antes que la liebre." }], phrases: ["La tortuga camina", "La liebre corre"], warmup: "Di lento: toor-tu-ga. Ahora rápido: lie-bre. Cambia la velocidad de tu voz.", plan: ["1 min · Voz lenta y rápida", "2 min · Leer la carrera", "2 min · Frases y respuesta"] },
    5: { pages: [{ art: "🥚🦆", title: "Un patito diferente", text: "En una granja nacieron varios patitos. Uno era más grande y tenía plumas grises. Los demás no sabían que era especial." }, { art: "🌧️🦆", title: "Busca su lugar", text: "El patito caminó y nadó por muchos lugares. A veces se sintió triste, pero siguió creciendo." }, { art: "🦢✨", title: "Un hermoso cisne", text: "Cuando llegó la primavera, el patito vio su reflejo en el agua. Ya no era un patito feo: era un cisne hermoso." }], phrases: ["El patito nada", "Un cisne blanco", "Tengo plumas"], warmup: "Sonríe y di: i, i, i. Después redondea los labios: u, u, u. Repite: patito y cisne.", plan: ["2 min · Vocales I-U", "3 min · Cuento por páginas", "3 min · Vocabulario y frases"] },
    6: { pages: [{ art: "👫🌲", title: "El camino", text: "Hansel y Gretel caminaron con cuidado por el bosque. Hansel dejó migas de pan para recordar el camino de vuelta." }, { art: "🍬🏠", title: "La casa dulce", text: "Los hermanos encontraron una pequeña casa hecha de dulces. Olía a galletas y caramelos." }, { art: "⭐🏡", title: "Juntos son valientes", text: "Hansel y Gretel usaron su ingenio y trabajaron juntos. Finalmente encontraron el camino seguro a casa." }], phrases: ["Migas de pan", "Casa de dulces", "Vamos juntos"], warmup: "Di ma-me-mi-mo-mu. Después repite: migas de pan.", plan: ["2 min · Sílabas M", "4 min · Lectura guiada", "4 min · Frases y narración"] },
  };
  const [search, setSearch] = useState("");
  const [activeStory, setActiveStory] = useState<number | null>(null);
  const [spokenWords, setSpokenWords] = useState<string[]>([]);
  const [listeningWord, setListeningWord] = useState<string | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const currentStory = stories.find(story => story.id === activeStory) ?? null;
  const currentDetail = currentStory ? storyDetails[currentStory.id] : null;
  const practiceItems = currentStory && currentDetail ? [...currentStory.words, ...currentDetail.phrases] : [];
  const filtered = stories.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  const practiceWord = (word: string) => {
    const VoiceAPI = (window as unknown as { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition }).SpeechRecognition
      ?? (window as unknown as { webkitSpeechRecognition?: new () => VoiceRecognition }).webkitSpeechRecognition;
    if (!VoiceAPI) {
      setVoiceFeedback("Tu navegador no tiene reconocimiento de voz. Prueba en Chrome o Edge.");
      return;
    }
    setListeningWord(word);
    setVoiceFeedback(`Te escucho… di: ${word}`);
    const recognition = new VoiceAPI();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = event => {
      const heard = normalizeVoiceText(event.results[0][0].transcript);
      const expected = normalizeVoiceText(word);
      if (heard.includes(expected)) {
        setSpokenWords(words => words.includes(word) ? words : [...words, word]);
        setVoiceFeedback(`¡Muy bien! Dijiste “${word}”.`);
      } else {
        setVoiceFeedback(`Escuché “${event.results[0][0].transcript}”. Inténtalo otra vez: ${word}.`);
      }
    };
    recognition.onerror = () => setVoiceFeedback("No pudimos escucharte. Revisa el permiso del micrófono e inténtalo otra vez.");
    recognition.onend = () => setListeningWord(null);
    recognition.start();
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #F0FDF4 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Hero */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-green-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🌳</span>
          <div>
            <p className="text-xs font-black text-green-300 uppercase tracking-widest mb-1">Mundo 1</p>
            <h1 className="text-3xl font-black text-white">Bosque de los Cuentos</h1>
            <p className="text-green-200 text-sm font-medium mt-1">Descubrí historias mágicas, fábulas y aventuras</p>
            <div className="flex gap-3 mt-3">
              <Bdg color="green">12 cuentos</Bdg>
              <Bdg color="green">+45 ⭐ disponibles</Bdg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
          <input placeholder="Buscar cuentos…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E8E5F4] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300/30 focus:border-green-400 font-medium" />
        </div>

        {/* Continue reading */}
        <div className="rounded-3xl p-5 mb-7 border-2 border-green-200" style={{ background: "#F0FDF4" }}>
          <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-2">📖 Continuar leyendo</p>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: "#DCFCE7" }}>🦆</div>
            <div className="flex-1">
              <p className="font-extrabold text-[#1C1135]">El Patito Feo</p>
              <div className="h-2 rounded-full mt-1.5 mb-1" style={{ background: "#BBF7D0" }}>
                <div className="h-2 rounded-full" style={{ width: "60%", background: "#16A34A" }} />
              </div>
              <p className="text-xs text-[#7C6F9A] font-medium">60% completado</p>
            </div>
            <Btn size="sm" onClick={() => { setActiveStory(5); setPageIndex(0); setSpokenWords([]); setVoiceFeedback(""); speakForChild("Continuamos con El Patito Feo. Escucha con atención y repite las palabras nuevas."); }} className="!bg-green-600 !text-white">Continuar</Btn>
          </div>
        </div>

        {currentStory && (
          <section className="mb-7 overflow-hidden rounded-[2rem] border-2 border-green-200 bg-white shadow-lg">
            <div className="relative overflow-hidden bg-green-700 p-6 text-white sm:p-8">
              <div className="absolute -right-8 -top-9 text-[11rem] opacity-15">{currentStory.emoji}</div>
              <div className="relative flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-green-200">Cuento seleccionado · lectura guiada</p><h2 className="mt-2 text-3xl font-black">{currentStory.title}</h2><p className="mt-2 max-w-xl text-sm font-bold text-green-100">{currentStory.subtitle}</p></div><button onClick={() => setActiveStory(null)} className="rounded-xl bg-white/15 p-2 text-white hover:bg-white/25" aria-label="Cerrar cuento"><X size={18} /></button></div>
              <div className="relative mt-5 flex gap-3">{currentStory.scenes.map((scene, index) => <div key={index} className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-4xl">{scene}</div>)}</div>
            </div>
            {currentDetail && <div className="grid gap-5 p-6 lg:grid-cols-[1.12fr_.88fr]">
              <article className="self-start overflow-hidden rounded-3xl border-2 border-green-100 bg-[#F8FFFA]">
                <div className="flex items-center justify-between border-b border-green-100 bg-white px-5 py-3"><span className="text-xs font-black uppercase tracking-wider text-green-700">Página {pageIndex + 1} de {currentDetail.pages.length}</span><div className="flex gap-1">{currentDetail.pages.map((_, i) => <span key={i} className={`h-2 w-2 rounded-full ${i === pageIndex ? "bg-green-600" : "bg-green-200"}`} />)}</div></div>
                <div className="p-6 text-center"><div className="mx-auto flex h-32 max-w-sm items-center justify-center rounded-3xl bg-white text-7xl shadow-sm">{currentDetail.pages[pageIndex].art}</div><h3 className="mt-5 text-xl font-black text-[#1C1135]">{currentDetail.pages[pageIndex].title}</h3><p className="mx-auto mt-3 max-w-lg text-left text-base font-semibold leading-7 text-[#4A4560]">{currentDetail.pages[pageIndex].text}</p><button onClick={() => speakForChild(currentDetail.pages[pageIndex].text)} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-black text-white"><Volume2 size={17} /> Leer esta página</button></div>
                <div className="flex items-center justify-between border-t border-green-100 bg-white p-4"><Btn variant="outline" size="sm" disabled={pageIndex === 0} onClick={() => setPageIndex(page => Math.max(0, page - 1))}><ChevronLeft size={15} /> Anterior</Btn><Btn size="sm" onClick={() => setPageIndex(page => Math.min(currentDetail.pages.length - 1, page + 1))} disabled={pageIndex === currentDetail.pages.length - 1} className="!bg-green-600 !text-white">Siguiente <ChevronRight size={15} /></Btn></div>
              </article>
              <aside className="rounded-[2rem] border-2 border-violet-100 bg-violet-50 p-5 sm:p-6">
                <div className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm"><Ashi size={52} mood="wave" /></div><p className="mt-3 text-xs font-black uppercase tracking-wider text-violet-600">Di con ASHI</p><h3 className="mt-1 text-xl font-black text-[#1C1135]">¡Tu voz hace magia!</h3><p className="mt-2 text-sm font-medium text-[#7C6F9A]">Toca una tarjeta, escucha y repite. Se pintará cuando ASHI te entienda.</p></div>
                <div className="mt-5 flex flex-col gap-2">{practiceItems.map(item => { const completed = spokenWords.includes(item); const listening = listeningWord === item; return <button key={item} onClick={() => practiceWord(item)} disabled={listeningWord !== null} className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${completed ? "border-green-400 bg-green-100 text-green-800" : "border-white bg-white text-[#4A4560] hover:border-violet-300"}`}><span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${completed ? "bg-green-500 text-white" : "bg-violet-100 text-violet-600"}`}>{listening ? <Mic size={17} className="animate-pulse" /> : completed ? <Check size={17} /> : <Mic size={17} />}</span><span className="flex-1 text-base font-black">{item}</span>{completed && <span className="text-lg">⭐</span>}</button>; })}</div>
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-center"><p className="text-sm font-black text-violet-700">{spokenWords.filter(item => practiceItems.includes(item)).length} de {practiceItems.length} ¡muy bien!</p>{voiceFeedback && <p className="mt-1 text-xs font-bold text-[#7C6F9A]">{voiceFeedback}</p>}</div>
              </aside>
            </div>}
          </section>
        )}
        <h2 className="font-extrabold text-[#1C1135] mb-4">⭐ Más populares</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(story => (
            <button key={story.id} onClick={() => { setActiveStory(story.id); setPageIndex(0); setSpokenWords([]); setVoiceFeedback(""); speakForChild(`Vamos a leer ${story.title}. Escucha y repite las palabras importantes.`); }}
              className="rounded-3xl border-2 border-transparent hover:border-green-300 hover:shadow-md p-5 text-left transition-all duration-200"
              style={{ backgroundColor: story.color }}>
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{story.emoji}</div>
                {story.popular && <Bdg color="green">Popular</Bdg>}
              </div>
              <p className="font-extrabold text-[#1C1135] mb-1">{story.title}</p>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Bdg color="gray">{story.age}</Bdg>
                <Bdg color="gray">⏱ {story.dur}</Bdg>
                <Bdg color="gray">{story.genre}</Bdg>
              </div>
              <div className="flex items-center gap-0.5 mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} size={12} className={i <= Math.floor(story.rating) ? "text-amber-400 fill-amber-400" : "text-slate-300"} />)}
                <span className="text-xs text-[#7C6F9A] ml-1 font-bold">{story.rating}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-xs font-bold text-green-700 bg-green-100 rounded-xl px-3 py-1">📖 Leer</span>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 rounded-xl px-3 py-1">🔊 Escuchar</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Montaña Musical ────────────────────────────────────────────────────────────
export function MundoAshaCanciones({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [selected, setSelected] = useState<string | null>(null);
  const [simPlaying, setSimPlaying] = useState(false);
  const [events, setEvents] = useState<object[]>([]);
  const isAssigned = true;

  const rounds = [
    {
      art: "🎵🐘", title: "¿Cuál sonido es diferente?",
      instruction: "Escucha tres sonidos de animales. Uno es diferente. ¿Cuál es el intruso?",
      sounds: [
        { label: "🐘 Elefante", key: "elefante", sim: "bajo y profundo" },
        { label: "🐘 Elefante", key: "elefante2", sim: "bajo y profundo" },
        { label: "🐦 Pájaro", key: "pajaro", sim: "agudo y suave" },
      ],
      answer: "pajaro",
      hint: "Los elefantes hacen sonidos graves. Los pájaros hacen sonidos agudos.",
    },
    {
      art: "🎶🥁", title: "¿Cuál ritmo es diferente?",
      instruction: "Hay tres ritmos. Dos son iguales y uno es distinto. ¿Cuál es el diferente?",
      sounds: [
        { label: "🥁 Rápido-rápido-lento", key: "rrls", sim: "tam-tam-pam" },
        { label: "🥁 Rápido-lento-rápido", key: "rlr", sim: "tam-pam-tam" },
        { label: "🥁 Rápido-rápido-lento", key: "rrls2", sim: "tam-tam-pam" },
      ],
      answer: "rlr",
      hint: "Escucha cuándo cae el golpe lento. En dos de ellos el lento va al final.",
    },
    {
      art: "🎤🔤", title: "Escucha: /mi/ · ¿Qué vocal escuchas al final?",
      instruction: "Escucha la sílaba simulada: /mi/. ¿Qué vocal suena al final?",
      sounds: [
        { label: "🔊 Escuchar sílaba /mi/ (síntesis simulada)", key: "play-mi", sim: "/mi/" },
      ],
      answer: "i",
      hint: "La sílaba es /mi/. Mi-mi-mi… ¿qué vocal suena al final? Empieza por la M y termina en…",
    },
  ];

  const current = rounds[round];

  const start = () => {
    setPhase("playing");
    setStartTime(Date.now());
    setRound(0);
    setScore(0);
    setAttempts(0);
    setHintsUsed(0);
    setPauseCount(0);
    setSelected(null);
    setEvents([]);
  };

  const simulateSound = (key: string, label: string) => {
    setSimPlaying(true);
    speakForChild(`Simulando: ${label}`);
    setTimeout(() => setSimPlaying(false), 1500);
  };

  const choose = (key: string) => {
    setSelected(key);
    const isCorrect = key === current.answer || key === current.answer + "2";
    setAttempts(a => a + 1);
    setEvents(prev => [...prev, { round: round + 1, choice: key, correct: isCorrect, timeSeconds: Math.round((Date.now() - startTime) / 1000) }]);
    if (isCorrect) setScore(s => s + 10);
    setTimeout(() => {
      setSelected(null);
      if (round < rounds.length - 1) {
        setRound(r => r + 1);
      } else {
        setPhase("done");
      }
    }, 1200);
  };

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const dataLog = {
    sessionId: `ASHA-SIM-${Date.now().toString(36).toUpperCase()}`,
    profileId: "P-0421 (pseudonimizado)",
    activityType: "montana-musical",
    version: "v1.0-demo",
    assigned: isAssigned,
    timestamp: new Date().toISOString(),
    durationSeconds: phase === "done" ? elapsedSec : null,
    totalAttempts: attempts,
    hintsUsed,
    pauseCount,
    roundsCompleted: phase === "done" ? rounds.length : round,
    participationScore: score,
    events,
    note: "Datos simulados · No datos reales · No se captura audio real",
  };

  // PRE
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🎵</span>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Mundo 2</p>
            <h1 className="text-3xl font-black text-white">Montaña Musical</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "#0D9488", color: "white" }}>✓ Asignada por terapeuta</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>⏱ ~5 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Crd className="p-5">
          <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Objetivo informado por el terapeuta</h2>
          <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-4">
            Practicar discriminación auditiva: identificar sonidos, ritmos y vocales diferentes. Actividad de 3 rondas sin grabación de audio real.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🎧", label: "3 rondas · discriminación auditiva simulada" },
              { icon: "⏱", label: "Duración estimada: 5 minutos" },
              { icon: "🔇", label: "No se graba audio · solo interacción con botones" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              🔒 Privacidad: La simulación de sonidos utiliza síntesis de voz del sistema, no se almacena audio. Esta actividad no requiere micrófono.
            </p>
          </div>
        </Crd>
        <button onClick={start} className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
          <Play size={16} /> Iniciar actividad
        </button>
      </div>
    </div>
  );

  // EXIT CONFIRM
  if (phase === "exit-confirm") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />
    </div>
  );

  // DONE
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">¡Actividad completada!</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Montaña Musical · 3 rondas</p>
        </div>
        <Crd className="p-5 mb-4">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Tu participación</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Rondas completadas", value: "3 / 3" },
              { label: "Participación", value: `${score} pts` },
              { label: "Tiempo", value: `${Math.max(1, elapsedSec)} seg` },
              { label: "Intentos", value: String(attempts) },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#F5F3FF" }}>
                <p className="font-extrabold text-[#1C1135] text-lg">{s.value}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
            <p className="text-xs font-bold text-[#5B21B6] leading-snug">
              ✅ Participación registrada. El análisis de progreso corresponde al terapeuta.
            </p>
          </div>
        </Crd>
        <SimulatedDataLog log={dataLog} />
        <div className="flex gap-3 mt-5">
          <button onClick={start} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-all bg-white">
            <RotateCcw size={15} /> Repetir
          </button>
          <button onClick={() => go("mundo-asha")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #7C3AED, #6D28D9)" }}>
            Volver al mapa <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  // PLAYING / PAUSED
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
            aria-label="Salir de la actividad" title="Salir de la actividad"
            className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white transition-colors">
            <ChevronLeft size={16} /> Salir
          </button>
          <div className="flex items-center gap-2">
            {rounds.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < round ? "white" : i === round ? "#C4B5FD" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-violet-300 ml-1">Ronda {round + 1}/{rounds.length}</span>
          </div>
          <button
            onClick={() => { if (phase === "playing") { setPauseCount(p => p + 1); setPhase("paused"); } else setPhase("playing"); }}
            aria-label={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            title={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            className="p-2 rounded-xl text-violet-300 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} /> : <Pause size={18} />}
          </button>
        </div>
      </div>

      {phase === "paused" && (
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Continúa cuando estés listo.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setPhase("playing")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#7C3AED" }}>
              <Play size={15} /> Continuar
            </button>
            <button onClick={() => go("mundo-asha")} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF]">
              Salir
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <Crd className="p-5 mb-4">
            <div className="text-center mb-5">
              <div className="text-6xl mb-3">{current.art}</div>
              <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">{current.title}</h3>
              <p className="text-sm text-[#4B4869] font-medium leading-relaxed">{current.instruction}</p>
            </div>

            {/* Listen / repeat-sound buttons */}
            <div className="flex flex-col gap-3 mb-4">
              {current.sounds.map((sound) => (
                <button key={sound.key}
                  onClick={() => { simulateSound(sound.key, sound.label); speakForChild(sound.sim); }}
                  aria-label={`Escuchar: ${sound.label}. Síntesis simulada, no se graba audio.`}
                  title="Síntesis de voz simulada · No se graba audio"
                  className="flex items-center gap-3 py-3 px-4 rounded-2xl text-sm font-bold border-2 border-[#E8E5F4] hover:border-violet-300 hover:bg-violet-50 transition-all bg-white text-[#4B4869]">
                  <Volume2 size={15} className="text-violet-500 flex-shrink-0" aria-hidden="true" />
                  {sound.label}
                  <span className="ml-auto text-xs text-[#9E95B7] italic">{sound.sim}</span>
                </button>
              ))}
            </div>

            {/* Choice options — for round 3 (vocal ID) show /a/ /e/ /i/ instead of sound list */}
            {round === 2 ? (
              <>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Elige la vocal que escuchas</p>
                <div className="flex gap-3">
                  {[
                    { key: "a", label: "/a/" },
                    { key: "e", label: "/e/" },
                    { key: "i", label: "/i/" },
                  ].map((opt) => {
                    const isCorrect = opt.key === current.answer;
                    const isChosen = selected === opt.key;
                    const showFeedback = selected !== null;
                    return (
                      <button key={opt.key}
                        onClick={() => !selected && choose(opt.key)}
                        disabled={!!selected}
                        aria-label={`Elegir vocal ${opt.label}`}
                        className={`flex-1 py-4 rounded-2xl font-black text-2xl border-2 transition-all ${
                          showFeedback
                            ? isCorrect ? "border-green-400 bg-green-50 text-green-700" : isChosen ? "border-red-300 bg-red-50 text-red-600" : "border-transparent bg-[#F5F3FF] text-[#9E95B7] opacity-50"
                            : "border-[#E8E5F4] bg-[#F5F3FF] text-[#1C1135] hover:border-violet-400 hover:bg-violet-50"
                        }`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-[#9E95B7] font-medium mt-2 text-center italic">
                  Síntesis de voz simulada · No se graba audio real
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">¿Cuál es diferente?</p>
                <div className="flex flex-col gap-2">
                  {current.sounds.map((sound) => {
                    const isCorrect = sound.key === current.answer || sound.key === current.answer + "2";
                    const isSelected = selected === sound.key;
                    const showFeedback = selected !== null;
                    return (
                      <button key={`choice-${sound.key}`}
                        onClick={() => !selected && choose(sound.key)}
                        disabled={!!selected}
                        aria-label={`Elegir: ${sound.label}`}
                        className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm border-2 transition-all text-left ${
                          showFeedback
                            ? isCorrect ? "border-green-400 bg-green-50 text-green-800" : isSelected ? "border-red-300 bg-red-50 text-red-700" : "border-transparent bg-[#F5F3FF] text-[#9E95B7]"
                            : "border-transparent bg-[#F5F3FF] text-[#1C1135] hover:border-violet-300 hover:bg-violet-50"
                        }`}>
                        {showFeedback && isCorrect ? "✅ " : showFeedback && isSelected ? "❌ " : ""}{sound.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button onClick={() => { setHintsUsed(h => h + 1); speakForChild(current.hint); }}
              aria-label={`Pedir pista. ${hintsUsed} pistas usadas`}
              title="Escuchar pista en voz alta"
              className="flex items-center gap-1.5 text-xs font-bold text-[#9E95B7] hover:text-[#1C1135] transition-colors mt-4">
              <HelpCircle size={13} aria-hidden="true" /> Pedir pista ({hintsUsed} usadas)
            </button>
          </Crd>
        </div>
      )}
    </div>
  );
}

// ── Trabalenguas ───────────────────────────────────────────────────────────────
export function MundoAshaTrabalenguas({ go }: { go: (v: View) => void }) {
  const [active,    setActive]    = useState<number | null>(null);
  const [practicing, setPracticing] = useState(false);

  const items = [
    { id: 1, text: "Tres tristes tigres comen trigo en un trigal.", level: "Fácil",  pts: 10, color: "#DCFCE7", emoji: "🐯" },
    { id: 2, text: "Pepe Pecas pica papas con un pico.",             level: "Fácil",  pts: 10, color: "#FEF3C7", emoji: "🥔" },
    { id: 3, text: "El cielo está enladrillado, ¿quién lo desenladrillará? El desenladrillador que lo desenladrille, buen desenladrillador será.", level: "Difícil", pts: 25, color: "#FEE2E2", emoji: "🧱" },
    { id: 4, text: "Pablito clavó un clavito. ¿Qué clavito clavó Pablito?", level: "Medio", pts: 15, color: "#E0F2FE", emoji: "🔨" },
  ];

  const startTimer = () => { setPracticing(true); const item = items.find(i => i.id === active); if (item) speakForChild(`Escucha y repite despacio: ${item.text}`); };
  const stopTimer  = () => setPracticing(false);

  return (
    <div style={{ background: "linear-gradient(180deg, #CCFBF1 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.teal} 0%, #0F766E 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-teal-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🗣️</span>
          <div>
            <p className="text-xs font-black text-teal-300 uppercase tracking-widest mb-1">Actividad adicional</p>
            <h1 className="text-3xl font-black text-white">Trabalenguas</h1>
            <p className="text-teal-100 text-sm font-medium mt-1">Entrena tu pronunciación jugando</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {active !== null ? (() => {
          const item = items.find(i => i.id === active)!;
          return (
            <div>
              <button onClick={() => { setActive(null); setPracticing(false); }} className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:underline mb-5">
                <ChevronLeft size={14} /> Volver a la lista
              </button>
              <Crd className="p-7 text-center mb-5">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <Bdg color={item.level === "Fácil" ? "green" : item.level === "Medio" ? "orange" : "red"}>{item.level}</Bdg>
                <p className="text-2xl font-extrabold text-[#1C1135] leading-relaxed mt-5 mb-5">{item.text}</p>
                <div className="flex gap-3 justify-center flex-wrap mb-2">
                  {!practicing
                    ? <Btn size="lg" onClick={startTimer} className="!bg-teal-600 !text-white">🎤 Practicar</Btn>
                    : <>
                        <div className="flex items-center gap-2 text-teal-600 font-extrabold text-lg">
                          <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse inline-block" /> Practicando…
                        </div>
                        <Btn size="lg" variant="outline" onClick={stopTimer}>⏹ Parar</Btn>
                      </>
                  }
                </div>
              </Crd>
              <Crd className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#1C1135]">Recompensa por completar</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">Practica 3 veces seguidas</p>
                </div>
                <div className="text-2xl font-black text-amber-600">+{item.pts} ⭐</div>
              </Crd>
            </div>
          );
        })() : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map(item => (
              <button key={item.id} onClick={() => { setActive(item.id); speakForChild(`Preparados para practicar. ${item.text}`); }}
                className="rounded-3xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-teal-300"
                style={{ backgroundColor: item.color }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <Bdg color={item.level === "Fácil" ? "green" : item.level === "Medio" ? "orange" : "red"}>{item.level}</Bdg>
                </div>
                <p className="font-extrabold text-[#1C1135] mb-2 line-clamp-2">{item.text}</p>
                <p className="text-xs font-extrabold text-amber-600">+{item.pts} ⭐ al completar</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Adivinanzas ────────────────────────────────────────────────────────────────
export function MundoAshaAdivinanzas({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  const [phase, setPhase] = useState<Phase>("pre");
  const [riddle, setRiddle] = useState(0);
  // lastChoice: key of the last tap; wrongThisRiddle: wrongs before Next is available
  const [lastChoice, setLastChoice] = useState<string | null>(null);
  const [wrongThisRiddle, setWrongThisRiddle] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [completed, setCompleted] = useState(0);   // riddles answered (correct or after 2 wrong)
  const [attempts, setAttempts] = useState(0);     // total taps across all riddles
  const [hintsUsed, setHintsUsed] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [events, setEvents] = useState<object[]>([]);
  const isAssigned = false;

  const riddles = [
    {
      q: "Tengo hojas pero no soy árbol, tengo lomo pero no soy animal. ¿Qué soy?",
      art: "📚", answer: "Un libro",
      hints: ["Sirve para aprender y leer.", "Lo encuentras en la biblioteca.", "Tiene páginas y palabras."],
      options: [
        { key: "arbol", label: "🌳 Un árbol" },
        { key: "libro", label: "📖 Un libro" },
        { key: "animal", label: "🐻 Un animal" },
        { key: "cuaderno", label: "📓 Un cuaderno" },
      ],
      correct: "libro",
    },
    {
      q: "Cuanto más me secas, más mojado me pongo. ¿Qué soy?",
      art: "🛁", answer: "Una toalla",
      hints: ["La usas después de bañarte.", "Es suave y absorbente.", "Cuelga en el baño."],
      options: [
        { key: "esponja", label: "🧽 Una esponja" },
        { key: "jabon", label: "🧼 El jabón" },
        { key: "toalla", label: "🏖️ Una toalla" },
        { key: "agua", label: "💧 El agua" },
      ],
      correct: "toalla",
    },
    {
      q: "Soy redonda, vivo en el cielo y me ven mejor de noche. ¿Qué soy?",
      art: "🌙", answer: "La luna",
      hints: ["No es el sol.", "Aparece cuando oscurece.", "Los poetas le escriben canciones."],
      options: [
        { key: "sol", label: "☀️ El sol" },
        { key: "estrella", label: "⭐ Una estrella" },
        { key: "nube", label: "☁️ Una nube" },
        { key: "luna", label: "🌙 La luna" },
      ],
      correct: "luna",
    },
  ];

  const current = riddles[riddle];
  const isCorrect = lastChoice === current.correct;
  // Show the "Next / reveal" controls when: correct, OR second wrong attempt, OR manually revealed
  const showNextControls = isCorrect || wrongThisRiddle >= 2 || revealed;

  const resetRiddleState = () => {
    setLastChoice(null);
    setWrongThisRiddle(0);
    setRevealed(false);
    setHintLevel(0);
  };

  const start = () => {
    setPhase("playing");
    setStartTime(Date.now());
    setRiddle(0);
    setCompleted(0);
    setAttempts(0);
    setHintsUsed(0);
    setPauseCount(0);
    setEvents([]);
    resetRiddleState();
  };

  const choose = (key: string) => {
    if (showNextControls) return; // locked after correct or 2 wrongs
    const correct = key === current.correct;
    setAttempts(a => a + 1);
    setLastChoice(key);
    setEvents(prev => [...prev, {
      riddle: riddle + 1, choice: key, correct,
      attempt: wrongThisRiddle + 1, hintsUsed: hintLevel,
      timeSeconds: Math.round((Date.now() - startTime) / 1000),
    }]);
    if (!correct) setWrongThisRiddle(w => w + 1);
    if (correct) setCompleted(c => c + 1);
  };

  const next = () => {
    if (!isCorrect && !revealed) setCompleted(c => c + 1); // count even if revealed after 2 wrongs
    if (riddle < riddles.length - 1) {
      setRiddle(r => r + 1);
      resetRiddleState();
    } else {
      setPhase("done");
    }
  };

  const addHint = () => {
    if (hintLevel < current.hints.length) {
      const h = hintLevel;
      setHintLevel(h + 1);
      setHintsUsed(n => n + 1);
      speakForChild(current.hints[h]);
    }
  };

  const elapsedSec = Math.round((Date.now() - startTime) / 1000);
  const dataLog = {
    sessionId: `ASHA-SIM-${Date.now().toString(36).toUpperCase()}`,
    profileId: "P-0421 (pseudonimizado)",
    activityType: "valle-adivinanzas",
    version: "v1.0-demo",
    assigned: isAssigned,
    timestamp: new Date().toISOString(),
    durationSeconds: phase === "done" ? elapsedSec : null,
    totalAttempts: attempts,
    hintsUsedAsSupport: hintsUsed,
    pauseCount,
    riddlesParticipated: phase === "done" ? riddles.length : riddle,
    events,
    note: "Datos simulados · No datos reales · Pistas registradas como apoyo, no penalización",
  };

  // PRE
  if (phase === "pre") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)" }}>
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-2xl mx-auto">
          <span className="text-7xl">🧩</span>
          <div>
            <p className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">Mundo 3</p>
            <h1 className="text-3xl font-black text-white">Valle de Adivinanzas</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.2)", color: "white" }}>🔭 Exploración libre</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)", color: "white" }}>⏱ ~5 min</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
        <Crd className="p-5">
          <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Actividad de exploración</h2>
          <p className="text-sm text-[#4B4869] font-medium leading-relaxed mb-4">
            3 adivinanzas con 4 opciones ilustradas. Tienes dos intentos por adivinanza y pistas de apoyo cuando las necesites.
          </p>
          <div className="flex flex-col gap-2 mb-4">
            {[
              { icon: "🧩", label: "3 adivinanzas · 4 opciones ilustradas" },
              { icon: "🔁", label: "Dos intentos antes de ver la respuesta" },
              { icon: "💡", label: "Pistas de apoyo · hasta 3 por adivinanza" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-[#4B4869] font-medium">
                <span>{item.icon}</span><span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              ℹ️ Actividad de exploración libre. El número de intentos y pistas se registra como apoyo, sin penalización. La exploración no equivale a progreso clínico.
            </p>
          </div>
        </Crd>
        <button onClick={start} aria-label="Comenzar adivinanzas" className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #B45309, #92400E)" }}>
          <Play size={16} aria-hidden="true" /> Comenzar adivinanzas
        </button>
      </div>
    </div>
  );

  // EXIT CONFIRM
  if (phase === "exit-confirm") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <ExitConfirmModal onStay={() => setPhase("playing")} onExit={() => go("mundo-asha")} />
    </div>
  );

  // DONE
  if (phase === "done") return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">🏆</div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">¡Actividad completada!</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Valle de Adivinanzas · 3 adivinanzas</p>
        </div>
        <Crd className="p-5 mb-4">
          <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Tu participación</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Adivinanzas completadas", value: `${riddles.length} / ${riddles.length}` },
              { label: "Total de intentos", value: String(attempts) },
              { label: "Pistas utilizadas", value: String(hintsUsed) },
              { label: "Tiempo total", value: `${Math.max(1, elapsedSec)} seg` },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3 text-center" style={{ background: "#FFFBEB" }}>
                <p className="font-extrabold text-[#1C1135] text-lg">{s.value}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-3" style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
            <p className="text-xs font-bold text-[#92400E] leading-snug">
              ✅ Exploración registrada. Las pistas e intentos son apoyos, no penalizaciones. La exploración no equivale a progreso clínico.
            </p>
          </div>
        </Crd>
        <SimulatedDataLog log={dataLog} />
        <div className="flex gap-3 mt-5">
          <button onClick={start} aria-label="Repetir actividad" className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-amber-50 transition-all bg-white">
            <RotateCcw size={15} aria-hidden="true" /> Repetir
          </button>
          <button onClick={() => go("mundo-asha")} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-extrabold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg, #B45309, #92400E)" }}>
            Volver al mapa <ChevronRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  // PLAYING / PAUSED
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-5 pb-4" style={{ background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)" }}>
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
            aria-label="Salir de la actividad" title="Salir de la actividad"
            className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white transition-colors">
            <ChevronLeft size={16} aria-hidden="true" /> Salir
          </button>
          <div className="flex items-center gap-2">
            {riddles.map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full" style={{ background: i < riddle ? "white" : i === riddle ? "#FDE68A" : "rgba(255,255,255,0.3)" }} />
            ))}
            <span className="text-xs font-bold text-amber-300 ml-1">{riddle + 1}/{riddles.length}</span>
          </div>
          <button
            onClick={() => { if (phase === "playing") { setPauseCount(p => p + 1); setPhase("paused"); } else setPhase("playing"); }}
            aria-label={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            title={phase === "playing" ? "Pausar actividad" : "Reanudar actividad"}
            className="p-2 rounded-xl text-amber-300 hover:text-white transition-colors">
            {phase === "paused" ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {phase === "paused" && (
        <div className="max-w-xl mx-auto px-4 py-8 text-center">
          <div className="text-5xl mb-4">⏸</div>
          <h3 className="font-extrabold text-[#1C1135] text-xl mb-2">Actividad pausada</h3>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Continúa cuando estés listo.</p>
          <div className="flex gap-3 justify-center mt-4">
            <button onClick={() => setPhase("playing")} aria-label="Reanudar actividad"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white" style={{ background: "#B45309" }}>
              <Play size={15} aria-hidden="true" /> Reanudar actividad
            </button>
            <button onClick={() => { setPauseCount(p => p + 1); setPhase("exit-confirm"); }}
              aria-label="Salir sin completar"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-amber-50">
              Salir
            </button>
          </div>
        </div>
      )}

      {phase === "playing" && (
        <div className="max-w-xl mx-auto px-4 py-6">
          <Crd className="p-5">
            {/* Riddle text — tap to listen */}
            <div className="text-center mb-5">
              <div className="text-6xl mb-3" aria-hidden="true">{current.art}</div>
              <button
                onClick={() => speakForChild(current.q)}
                aria-label={`Escuchar adivinanza en voz alta: ${current.q}`}
                title="Toca para escuchar la adivinanza"
                className="w-full text-left p-4 rounded-2xl text-base font-extrabold text-[#1C1135] leading-relaxed hover:bg-amber-50 transition-colors"
                style={{ background: "#FFFBEB" }}>
                &ldquo;{current.q}&rdquo;
                <span className="flex items-center gap-1 text-xs font-bold text-amber-700 mt-1">
                  <Volume2 size={11} aria-hidden="true" /> Toca para escuchar
                </span>
              </button>
            </div>

            {/* Progressive hints */}
            {hintLevel > 0 && (
              <div className="mb-4 flex flex-col gap-1">
                {current.hints.slice(0, hintLevel).map((h, i) => (
                  <div key={i} className="rounded-xl px-3 py-2 text-xs font-bold text-amber-800" style={{ background: "#FEF3C7" }}>
                    💡 Pista {i + 1}: {h}
                  </div>
                ))}
              </div>
            )}

            {/* First-wrong gentle feedback (before second attempt) */}
            {lastChoice && !isCorrect && wrongThisRiddle === 1 && (
              <div className="rounded-xl p-3 mb-4 text-sm font-bold text-center" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                😊 No es esa, ¡inténtalo una vez más! Puedes pedir una pista si la necesitas.
              </div>
            )}

            {/* Revealed answer after 2 wrongs */}
            {showNextControls && (
              <div className={`rounded-xl p-3 mb-4 text-sm font-bold text-center border ${isCorrect ? "bg-green-50 text-green-700 border-green-300" : "bg-amber-50 text-amber-800 border-amber-200"}`}>
                {isCorrect ? `🎉 ¡Muy bien! La respuesta es: ${current.answer}` : `💛 La respuesta es: ${current.answer}. ¡Seguimos!`}
              </div>
            )}

            {/* Choice grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {current.options.map((opt) => {
                const optCorrect = opt.key === current.correct;
                const isChosen = lastChoice === opt.key;
                const locked = showNextControls;
                return (
                  <button key={opt.key}
                    onClick={() => choose(opt.key)}
                    disabled={locked || (isChosen && !isCorrect && wrongThisRiddle === 1)}
                    aria-label={`Elegir: ${opt.label}`}
                    aria-pressed={isChosen}
                    className={`py-3 px-3 rounded-2xl font-extrabold text-sm text-center border-2 transition-all ${
                      locked
                        ? optCorrect ? "border-green-400 bg-green-50 text-green-800"
                          : isChosen && !isCorrect ? "border-amber-300 bg-amber-50 text-amber-700 opacity-70"
                          : "border-transparent bg-[#F5F3FF] text-[#9E95B7] opacity-40"
                        : isChosen && !isCorrect && wrongThisRiddle === 1
                          ? "border-amber-300 bg-amber-50 text-amber-700 opacity-60 cursor-not-allowed"
                          : "border-[#E8E5F4] bg-[#F5F3FF] text-[#1C1135] hover:border-amber-400 hover:bg-amber-50"
                    }`}>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom controls: hint | next */}
            <div className="flex items-center justify-between gap-3">
              {!showNextControls && hintLevel < current.hints.length ? (
                <button onClick={addHint}
                  aria-label={`Pedir pista. ${hintLevel} de ${current.hints.length} usadas`}
                  title="Escuchar pista de apoyo"
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-900 transition-colors">
                  <HelpCircle size={13} aria-hidden="true" /> Pedir pista ({hintLevel}/{current.hints.length})
                </button>
              ) : <div />}
              {showNextControls && (
                <button onClick={next}
                  aria-label={riddle < riddles.length - 1 ? "Ir a la siguiente adivinanza" : "Ver resumen de participación"}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-extrabold text-sm text-white ml-auto transition-all" style={{ background: "#B45309" }}>
                  {riddle < riddles.length - 1 ? "Siguiente" : "Ver resultado"} <ChevronRight size={14} aria-hidden="true" />
                </button>
              )}
            </div>
          </Crd>

          {/* Status footer — no score */}
          <div className="flex justify-between mt-3 px-1 text-xs font-bold text-[#9E95B7]">
            <span>Intentos: {attempts}</span>
            <span>Pistas usadas: {hintsUsed}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Laboratorio de Juegos ──────────────────────────────────────────────────────
export function MundoAshaJuegos({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "playing" | "paused" | "exit-confirm" | "done";
  type GameId = 1 | 2 | 3;
  type Diff = "basic" | "medium";
  type GMode = "single" | "circuit";

  const sessionId = useRef("LAB-" + Math.random().toString(36).slice(2, 6).toUpperCase());

  const [phase, setPhase]           = useState<Phase>("pre");
  const [savedPhase, setSavedPhase] = useState<Phase>("playing");
  const [difficulty, setDifficulty] = useState<Diff>("basic");
  const [gameMode, setGameMode]     = useState<GMode>("circuit");
  const [selectedGame, setSelectedGame] = useState<GameId>(1);
  const [circuitStep, setCircuitStep]   = useState(0);
  const [round, setRound]               = useState(0);
  const [wrongThisRound, setWrongThisRound] = useState(0);
  const [revealedThis, setRevealedThis]     = useState(false);
  const [lastChoice, setLastChoice]         = useState<string | null>(null);
  const [g3Phase, setG3Phase] = useState<"showing" | "recalling">("showing");
  const [showIdx, setShowIdx] = useState(0);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [hintShown, setHintShown] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [helps, setHelps]           = useState(0);
  const [pauses, setPauses]         = useState(0);
  const [attempts, setAttempts]     = useState(0);
  const [gamesCompleted, setGamesCompleted] = useState(0);

  const C = { blue: "#0284C7", blueBg: "#E0F2FE", blueBorder: "#7DD3FC" };

  type G1Round = { word: string; options: string[]; answer: string };
  type G2Round = { item: string; emoji: string; answer: string; cats: string[] };

  const G1: Record<Diff, G1Round[]> = {
    basic: [
      { word: "PERRO",   options: ["🐶","🐱","🐟","🐸"],  answer: "🐶" },
      { word: "MANZANA", options: ["🍊","🍎","🍇","🍌"],  answer: "🍎" },
      { word: "CASA",    options: ["🏠","🚗","⛵","✈️"], answer: "🏠" },
    ],
    medium: [
      { word: "MARIPOSA",   options: ["🦋","🐝","🐛","🐞"], answer: "🦋" },
      { word: "TELESCOPIO", options: ["🔭","🔬","📡","🎯"], answer: "🔭" },
      { word: "GUITARRA",   options: ["🎸","🎹","🎺","🥁"], answer: "🎸" },
    ],
  };

  const G2: Record<Diff, G2Round[]> = {
    basic: [
      { item: "Perro",   emoji: "🐶", answer: "Animales", cats: ["Animales","Frutas","Objetos"] },
      { item: "Manzana", emoji: "🍎", answer: "Frutas",   cats: ["Animales","Frutas","Objetos"] },
      { item: "Silla",   emoji: "🪑", answer: "Objetos",  cats: ["Animales","Frutas","Objetos"] },
    ],
    medium: [
      { item: "Mariposa", emoji: "🦋", answer: "Animales",  cats: ["Animales","Plantas","Vehículos"] },
      { item: "Girasol",  emoji: "🌻", answer: "Plantas",   cats: ["Animales","Plantas","Vehículos"] },
      { item: "Tren",     emoji: "🚂", answer: "Vehículos", cats: ["Animales","Plantas","Vehículos"] },
    ],
  };

  const G3: Record<Diff, string[][]> = {
    basic:  [["🐶","🍎","🏠"], ["🚂","🌸","🎈"], ["🦁","🍌","⭐"]],
    medium: [["🦋","🎸","🌊"], ["🔭","🐬","🎃"], ["🌻","🚂","🎯"]],
  };
  const G3_SCRAMBLES = [[2,0,1],[1,2,0],[0,2,1]];

  const activeGame: GameId = gameMode === "circuit" ? ([1,2,3][circuitStep] as GameId) : selectedGame;

  useEffect(() => {
    if (phase !== "playing") return;
    const iv = window.setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => window.clearInterval(iv);
  }, [phase]);

  const fmtTime = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  const resetRound = () => {
    setWrongThisRound(0); setRevealedThis(false); setLastChoice(null);
    setG3Phase("showing"); setShowIdx(0); setUserSeq([]); setHintShown(false);
  };

  const advanceRound = () => {
    const next = round + 1;
    if (next >= 3) {
      setGamesCompleted(n => n + 1);
      if (gameMode === "circuit" && circuitStep < 2) { setCircuitStep(s => s + 1); setRound(0); }
      else { setPhase("done"); }
    } else { setRound(next); }
    resetRound();
  };

  const doPause = () => { setSavedPhase(phase); setPhase("paused"); setPauses(p => p + 1); };
  const doHelp  = (text: string) => { speakForChild(text); setHelps(h => h + 1); };

  const buildLog = (completed: boolean) => ({
    schema: "v0.3-demo", sessionId: sessionId.current,
    game: "Laboratorio de Juegos", version: "v85",
    mode: "exploracion", difficulty, gameMode,
    timestamp: new Date().toISOString(),
    n1: { totalElapsedSec: elapsedSec, pauses, abandoned: !completed },
    n2: { gamesCompleted, totalAttempts: attempts, helps, completed },
    n3Eligible: false, mlNote: "Machine learning futuro · No activo en esta demo",
  });

  const catIcon = (cat: string) =>
    cat === "Animales" ? "🐾" : cat === "Frutas" ? "🍏" : cat === "Objetos" ? "🪑" :
    cat === "Plantas" ? "🌿" : cat === "Vehículos" ? "🚗" : "📦";

  const nextLabel = round < 2 ? "Siguiente ronda →"
    : (gameMode === "circuit" && circuitStep < 2) ? "Siguiente juego →" : "Ver resumen 🎉";

  // Inline control bar (stateless, defined before conditional returns)
  const CtrlBar = ({ helpText }: { helpText: string }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {gameMode === "circuit" && (
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <div key={i} className="w-6 h-2 rounded-full transition-all" style={{ background: i < circuitStep ? "#0284C7" : i === circuitStep ? "#0EA5E9" : "#BFDBFE" }} />
            ))}
          </div>
        )}
        <span className="text-xs font-extrabold" style={{ color: C.blue }}>Ronda {round+1}/3</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => doHelp(helpText)} className="rounded-xl p-2 border bg-white hover:bg-blue-50 transition-colors" style={{ borderColor: C.blueBorder }} aria-label="Escuchar las instrucciones" title="Escuchar instrucciones"><Volume2 size={15} style={{ color: C.blue }} /></button>
        <button onClick={doPause} className="rounded-xl p-2 border bg-white hover:bg-blue-50 transition-colors" style={{ borderColor: C.blueBorder }} aria-label="Pausar la actividad" title="Pausar"><Pause size={15} style={{ color: C.blue }} /></button>
        <button onClick={() => { setSavedPhase(phase); setPhase("exit-confirm"); }} className="rounded-xl p-2 border bg-white hover:bg-blue-50 transition-colors" style={{ borderColor: C.blueBorder }} aria-label="Salir de la actividad" title="Salir"><X size={15} style={{ color: C.blue }} /></button>
      </div>
    </div>
  );

  const wrapStyle = { background: "linear-gradient(180deg, #EFF6FF 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' };

  // ── PRE ─────────────────────────────────────────────────────────────────────
  if (phase === "pre") {
    const opts: { id: GameId | "circuit"; label: string; emoji: string; desc: string }[] = [
      { id: 1,         label: "Asociación",    emoji: "🔤", desc: "Palabra ↔ imagen" },
      { id: 2,         label: "Clasificación", emoji: "🏷️",  desc: "Categorías semánticas" },
      { id: 3,         label: "Memoria",       emoji: "🧠", desc: "Secuencia visual" },
      { id: "circuit", label: "Circuito",      emoji: "⚡", desc: "Los tres juegos en orden" },
    ];
    return (
      <div className="min-h-screen" style={wrapStyle}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          <button onClick={() => go("mundo-asha")} className="self-start flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80" style={{ color: C.blue }} aria-label="Volver al mapa del mundo">
            <ChevronLeft size={16} /> Mapa del Mundo
          </button>
          <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #0369A1 100%)` }}>
            <Ashi size={80} mood="happy" />
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mt-2">Mundo 5 · Laboratorio de Juegos</p>
            <h1 className="text-2xl font-black text-white mt-1">¡A explorar con las palabras!</h1>
          </div>
          <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <span>🔬</span>
            <div>
              <p className="text-xs font-extrabold text-[#92400E]">Machine learning futuro · No activo en esta demo</p>
              <p className="text-xs font-medium text-[#B45309] mt-0.5">Datos simulados · Prototipo de instrumentación · v0.3-demo</p>
            </div>
          </div>
          {/* Difficulty */}
          <div>
            <p className="text-sm font-extrabold text-[#1C1135] mb-2">Dificultad demo</p>
            <p className="text-xs font-medium text-[#9E95B7] mb-2">Elegida manualmente · sin adaptación automática</p>
            <div className="flex gap-2">
              {(["basic","medium"] as Diff[]).map(d => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="flex-1 rounded-2xl py-3 text-sm font-extrabold border-2 transition-all"
                  style={{ background: difficulty === d ? C.blue : "white", borderColor: difficulty === d ? C.blue : C.blueBorder, color: difficulty === d ? "white" : "#1C1135" }}
                  aria-pressed={difficulty === d} aria-label={`Dificultad ${d === "basic" ? "básica" : "media"}`}>
                  {d === "basic" ? "🌱 Básica" : "🚀 Media"}
                </button>
              ))}
            </div>
          </div>
          {/* Game selection */}
          <div>
            <p className="text-sm font-extrabold text-[#1C1135] mb-2">Elige la actividad</p>
            <div className="grid grid-cols-2 gap-3">
              {opts.map(opt => {
                const isCircuit = opt.id === "circuit";
                const isSel = isCircuit ? gameMode === "circuit" : (gameMode === "single" && selectedGame === opt.id);
                return (
                  <button key={String(opt.id)}
                    onClick={() => { if (isCircuit) setGameMode("circuit"); else { setGameMode("single"); setSelectedGame(opt.id as GameId); } }}
                    className="rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-0.5"
                    style={{ background: isSel ? C.blueBg : "white", borderColor: isSel ? C.blue : C.blueBorder }}
                    aria-pressed={isSel} aria-label={`Elegir actividad: ${opt.label}`}>
                    <span className="text-3xl">{opt.emoji}</span>
                    <p className="font-extrabold text-[#1C1135] mt-1 text-sm">{opt.label}</p>
                    <p className="text-xs font-medium text-[#7C6F9A]">{opt.desc}</p>
                    {isCircuit && <span className="text-xs font-bold px-1.5 py-0.5 rounded-md mt-1.5 inline-block text-white" style={{ background: C.blue }}>Recomendado</span>}
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => { setRound(0); setCircuitStep(0); setGamesCompleted(0); setAttempts(0); setHelps(0); setPauses(0); setElapsedSec(0); resetRound(); setPhase("playing"); speakForChild("¡Comenzamos el laboratorio! Vamos a jugar."); }}
            className="w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:-translate-y-0.5"
            style={{ background: C.blue }} aria-label="Comenzar el laboratorio de juegos">
            ¡Comenzar! 🧪
          </button>
          <SimulatedDataLog log={buildLog(false)} />
        </div>
      </div>
    );
  }

  // ── EXIT CONFIRM ─────────────────────────────────────────────────────────────
  if (phase === "exit-confirm") {
    return <ExitConfirmModal onStay={() => setPhase(savedPhase)} onExit={() => go("mundo-asha")} />;
  }

  // ── PAUSED ───────────────────────────────────────────────────────────────────
  if (phase === "paused") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={wrapStyle}>
        <Ashi size={90} mood="wave" />
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: C.blue }}>Laboratorio en pausa</p>
          <h2 className="text-2xl font-black text-[#1C1135]">¡El juego te espera!</h2>
          <p className="text-sm font-medium text-[#7C6F9A] mt-1">Pulsa Reanudar cuando quieras continuar.</p>
        </div>
        <button onClick={() => setPhase(savedPhase)} className="rounded-2xl px-8 py-3 text-base font-black text-white flex items-center gap-2" style={{ background: C.blue }} aria-label="Reanudar la actividad">
          <Play size={16} /> Reanudar
        </button>
        <button onClick={() => setPhase("exit-confirm")} className="text-sm font-bold text-[#9E95B7] hover:text-[#0284C7] transition-colors" aria-label="Salir sin completar">
          Salir sin completar
        </button>
      </div>
    );
  }

  // ── PLAYING ──────────────────────────────────────────────────────────────────
  if (phase === "playing") {

    // ── G1: Asociación palabra–imagen ─────────────────────────────────────────
    if (activeGame === 1) {
      const r = G1[difficulty][round];
      const isCorrect = lastChoice === r.answer;
      const showNext  = isCorrect || wrongThisRound >= 2 || revealedThis;
      return (
        <div className="min-h-screen" style={wrapStyle}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <CtrlBar helpText={`Busca la imagen que corresponde a la palabra: ${r.word.toLowerCase()}`} />
            <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🔤 Asociación · Ronda {round+1}/3</p>
              <p className="text-5xl font-black text-[#1C1135] mb-1 tracking-wide">{r.word}</p>
              <p className="text-sm font-medium text-[#7C6F9A]">Elige la imagen que corresponde a esta palabra.</p>
              <button onClick={() => doHelp(`La palabra es ${r.word.toLowerCase()}`)} className="mt-2 text-xs font-bold hover:underline" style={{ color: C.blue }} aria-label="Escuchar la palabra" title="Escuchar">🔊 Escuchar</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {r.options.map(opt => {
                const chosen = lastChoice === opt;
                const correct = opt === r.answer;
                const highlight = (chosen && isCorrect) || (revealedThis && correct);
                return (
                  <button key={opt}
                    onClick={() => {
                      if (showNext) return;
                      setAttempts(a => a + 1);
                      setLastChoice(opt);
                      if (opt !== r.answer) { setWrongThisRound(w => w + 1); speakForChild("No es esa. Inténtalo una vez más."); }
                      else speakForChild("¡Muy bien! Correcto.");
                    }}
                    className="rounded-3xl py-8 text-6xl text-center border-2 transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: highlight ? "#DCFCE7" : (chosen && !isCorrect ? "#FEF3C7" : "white"), borderColor: highlight ? "#16A34A" : (chosen && !isCorrect ? "#FCD34D" : C.blueBorder) }}
                    aria-label={`Elegir imagen: ${opt}`}>
                    {opt}
                    {highlight && <span className="block text-xs font-black text-green-700 mt-1">✓</span>}
                  </button>
                );
              })}
            </div>
            {lastChoice && isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#DCFCE7" }}>
                <p className="text-sm font-extrabold text-green-700">🌟 ¡Muy bien!</p>
              </div>
            )}
            {lastChoice && !isCorrect && wrongThisRound === 1 && !revealedThis && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FEF3C7" }}>
                <p className="text-sm font-extrabold text-[#B45309]">😊 No es esa. ¡Inténtalo una vez más!</p>
                <button onClick={() => { setRevealedThis(true); setHelps(h => h + 1); speakForChild("La respuesta es " + r.word.toLowerCase()); }} className="text-xs font-bold underline mt-1" style={{ color: "#B45309" }} aria-label="Ver la respuesta correcta">Ver respuesta</button>
              </div>
            )}
            {!isCorrect && (wrongThisRound >= 2 || revealedThis) && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#F0FDF4" }}>
                <p className="text-sm font-bold text-green-700">La respuesta era: {r.answer} ({r.word.toLowerCase()})</p>
              </div>
            )}
            {showNext && (
              <button onClick={advanceRound} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label={nextLabel}>
                {nextLabel}
              </button>
            )}
            <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
          </div>
        </div>
      );
    }

    // ── G2: Clasificación semántica ───────────────────────────────────────────
    if (activeGame === 2) {
      const r = G2[difficulty][round];
      const isCorrect = lastChoice === r.answer;
      const showNext  = isCorrect || wrongThisRound >= 2 || revealedThis;
      return (
        <div className="min-h-screen" style={wrapStyle}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <CtrlBar helpText={`¿En qué categoría va ${r.item}? Elige la categoría correcta.`} />
            <div className="rounded-3xl p-6 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🏷️ Clasificación · Ronda {round+1}/3</p>
              <span className="text-8xl">{r.emoji}</span>
              <h2 className="text-2xl font-black text-[#1C1135] mt-2">{r.item}</h2>
              <p className="text-sm font-medium text-[#7C6F9A] mt-1">¿A qué categoría pertenece?</p>
            </div>
            <div className="flex flex-col gap-3 mb-4">
              {r.cats.map(cat => {
                const chosen = lastChoice === cat;
                const correct = cat === r.answer;
                const highlight = (chosen && isCorrect) || (revealedThis && correct);
                return (
                  <button key={cat}
                    onClick={() => {
                      if (showNext) return;
                      setAttempts(a => a + 1);
                      setLastChoice(cat);
                      if (cat !== r.answer) { setWrongThisRound(w => w + 1); speakForChild("No es esa categoría. Inténtalo una vez más."); }
                      else speakForChild("¡Correcto! " + r.item + " es " + r.answer + ".");
                    }}
                    className="rounded-2xl py-4 px-5 text-base font-extrabold border-2 text-left flex items-center gap-3 transition-all hover:-translate-y-0.5"
                    style={{ background: highlight ? "#DCFCE7" : (chosen && !isCorrect ? "#FEF3C7" : "white"), borderColor: highlight ? "#16A34A" : (chosen && !isCorrect ? "#FCD34D" : C.blueBorder), color: "#1C1135" }}
                    aria-label={`Clasificar como: ${cat}`}>
                    <span className="text-2xl">{catIcon(cat)}</span>
                    {cat}{highlight ? " ✓" : ""}
                  </button>
                );
              })}
            </div>
            {lastChoice && isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#DCFCE7" }}>
                <p className="text-sm font-extrabold text-green-700">🌟 ¡Muy bien! {r.item} es {r.answer}.</p>
              </div>
            )}
            {lastChoice && !isCorrect && wrongThisRound === 1 && !revealedThis && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FEF3C7" }}>
                <p className="text-sm font-extrabold text-[#B45309]">😊 No es esa categoría. ¡Inténtalo una vez más!</p>
                <button onClick={() => { setRevealedThis(true); setHelps(h => h + 1); speakForChild(r.item + " pertenece a " + r.answer); }} className="text-xs font-bold underline mt-1" style={{ color: "#B45309" }} aria-label="Ver la respuesta correcta">Ver respuesta</button>
              </div>
            )}
            {!isCorrect && (wrongThisRound >= 2 || revealedThis) && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#F0FDF4" }}>
                <p className="text-sm font-bold text-green-700">{r.item} pertenece a: {r.answer}</p>
              </div>
            )}
            {showNext && (
              <button onClick={advanceRound} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label={nextLabel}>
                {nextLabel}
              </button>
            )}
            <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
          </div>
        </div>
      );
    }

    // ── G3: Secuencia de memoria ──────────────────────────────────────────────
    if (activeGame === 3) {
      const seq      = G3[difficulty][round];
      const scramble = G3_SCRAMBLES[round];
      const isComplete = userSeq.length === seq.length;
      const isCorrect  = isComplete && userSeq.every((v, i) => v === i);

      // Showing phase
      if (g3Phase === "showing") {
        return (
          <div className="min-h-screen" style={wrapStyle}>
            <div className="max-w-2xl mx-auto px-4 py-6">
              <CtrlBar helpText="Memoriza los elementos que aparecen en pantalla, uno a uno." />
              <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🧠 Memoria · Ronda {round+1}/3</p>
                <h2 className="text-xl font-black text-[#1C1135] mb-1">¡Memoriza la secuencia!</h2>
                <p className="text-sm font-medium text-[#7C6F9A]">Mira cada elemento con calma.</p>
              </div>
              <div className="rounded-3xl bg-white border-2 p-10 mb-5 text-center" style={{ borderColor: C.blueBorder }}>
                <p className="text-xs font-black uppercase tracking-widest text-[#9E95B7] mb-3">Elemento {showIdx+1} de {seq.length}</p>
                <span className="text-9xl">{seq[showIdx]}</span>
                <div className="flex gap-2 justify-center mt-5">
                  {seq.map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full transition-all" style={{ background: i <= showIdx ? C.blue : "#BFDBFE" }} />
                  ))}
                </div>
              </div>
              {showIdx < seq.length - 1 ? (
                <button onClick={() => setShowIdx(i => i + 1)} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label="Ver el siguiente elemento de la secuencia">
                  Ver siguiente →
                </button>
              ) : (
                <button onClick={() => { setG3Phase("recalling"); speakForChild("Ahora reproduce la secuencia en el mismo orden."); }} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label="Pasar a reproducir la secuencia">
                  ¡Ahora a recordar! →
                </button>
              )}
              <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
            </div>
          </div>
        );
      }

      // Recalling phase
      return (
        <div className="min-h-screen" style={wrapStyle}>
          <div className="max-w-2xl mx-auto px-4 py-6">
            <CtrlBar helpText="Toca los elementos en el mismo orden en que aparecieron." />
            <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.blueBg, border: `2px solid ${C.blueBorder}` }}>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.blue }}>🧠 Memoria · Ronda {round+1}/3</p>
              <h2 className="text-xl font-black text-[#1C1135] mb-1">¿En qué orden aparecieron?</h2>
              <p className="text-sm font-medium text-[#7C6F9A]">Toca los elementos en el orden correcto.</p>
            </div>
            {/* Progress slots */}
            <div className="flex gap-2 justify-center mb-4">
              {seq.map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl transition-all"
                  style={{ background: i < userSeq.length ? "#DBEAFE" : "#F0F9FF", borderColor: i < userSeq.length ? C.blue : "#BFDBFE" }}>
                  {i < userSeq.length ? seq[userSeq[i]] : "?"}
                </div>
              ))}
            </div>
            {/* Scrambled options */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {scramble.map(realIdx => {
                const already = userSeq.includes(realIdx);
                return (
                  <button key={realIdx}
                    onClick={() => {
                      if (already || isComplete) return;
                      setAttempts(a => a + 1);
                      setUserSeq(s => [...s, realIdx]);
                    }}
                    disabled={already}
                    className="rounded-2xl py-8 text-5xl text-center border-2 transition-all disabled:opacity-40 hover:enabled:-translate-y-0.5"
                    style={{ background: already ? "#F0F9FF" : "white", borderColor: already ? "#BFDBFE" : C.blueBorder }}
                    aria-label={`Elegir elemento: ${seq[realIdx]}`}>
                    {seq[realIdx]}
                  </button>
                );
              })}
            </div>
            {!isComplete && (
              <div className="flex gap-2 mb-3">
                <button onClick={() => { doHelp("La secuencia era: " + seq.join(", ")); setHintShown(true); }}
                  className="flex-1 rounded-2xl py-2.5 text-sm font-bold border-2 transition-colors"
                  style={{ borderColor: C.blueBorder, color: C.blue }} aria-label="Pedir pista con la secuencia correcta">💡 Pista</button>
                {userSeq.length > 0 && (
                  <button onClick={() => setUserSeq([])}
                    className="flex-1 rounded-2xl py-2.5 text-sm font-bold border-2 transition-colors flex items-center justify-center gap-1"
                    style={{ borderColor: "#FCA5A5", color: "#DC2626" }} aria-label="Reiniciar esta ronda">
                    <RotateCcw size={13} /> Reintentar
                  </button>
                )}
              </div>
            )}
            {hintShown && !isComplete && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FFFBEB" }}>
                <p className="text-sm font-bold text-[#B45309]">Secuencia: {seq.join(" → ")}</p>
              </div>
            )}
            {isComplete && isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#DCFCE7" }}>
                <p className="text-sm font-extrabold text-green-700">🌟 ¡Perfecto! Recordaste toda la secuencia.</p>
              </div>
            )}
            {isComplete && !isCorrect && (
              <div className="rounded-2xl p-3 text-center mb-3" style={{ background: "#FEF3C7" }}>
                <p className="text-sm font-bold text-[#B45309]">La secuencia correcta era: {seq.join(" → ")}</p>
              </div>
            )}
            {isComplete && (
              <button onClick={advanceRound} className="w-full rounded-2xl py-4 text-base font-black text-white" style={{ background: C.blue }} aria-label={nextLabel}>
                {nextLabel}
              </button>
            )}
            <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
          </div>
        </div>
      );
    }
  }

  // ── DONE ─────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const modeName = gameMode === "circuit" ? "Circuito" : activeGame === 1 ? "Asociación" : activeGame === 2 ? "Clasificación" : "Memoria";
    return (
      <div className="min-h-screen" style={wrapStyle}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.blue} 0%, #0369A1 100%)` }}>
            <Ashi size={80} mood="celebrate" />
            <p className="text-xs font-black uppercase tracking-widest text-blue-200 mt-2">¡Laboratorio completado!</p>
            <h1 className="text-2xl font-black text-white mt-1">{modeName} · ¡Terminado! 🎉</h1>
          </div>
          <div className="rounded-3xl bg-white border border-[#E8E5F4] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[#9E95B7] mb-3">Resumen de participación</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Juegos completados", value: String(gamesCompleted) },
                { label: "Intentos totales",   value: String(attempts) },
                { label: "Ayudas usadas",      value: String(helps) },
                { label: "Pausas",             value: String(pauses) },
                { label: "Tiempo total",       value: fmtTime(elapsedSec) },
                { label: "Dificultad",         value: difficulty === "basic" ? "Básica" : "Media" },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-3" style={{ background: C.blueBg }}>
                  <p className="text-xs font-medium text-[#9E95B7]">{item.label}</p>
                  <p className="font-extrabold text-sm text-[#1C1135] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-[#9E95B7] mt-3">Este resumen registra la participación. No evalúa habilidades clínicas ni hace recomendaciones.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPhase("pre"); setGamesCompleted(0); setAttempts(0); setHelps(0); setPauses(0); setElapsedSec(0); setRound(0); setCircuitStep(0); resetRound(); }}
              className="w-full rounded-2xl py-3 text-base font-black border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ borderColor: C.blue, color: C.blue, background: "white" }} aria-label="Repetir el laboratorio">
              <RotateCcw size={16} /> Repetir
            </button>
            <button onClick={() => go("mundo-asha")} className="w-full rounded-2xl py-3 text-base font-black text-white transition-all hover:-translate-y-0.5" style={{ background: C.blue }} aria-label="Volver al mapa del mundo">
              Volver al mapa 🗺️
            </button>
          </div>
          <SimulatedDataLog log={buildLog(true)} />
        </div>
      </div>
    );
  }

  return null;
}

// ── Academia ASHA ──────────────────────────────────────────────────────────────
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

// ─── ASHA Session ───────────────────────────────────────────────────────────────

const SESSION_THERAPIST = {
  name: "Dra. Ana Ruiz", specialty: "Terapia del Lenguaje",
  av: "AR", color: B.violet, date: "30 Jul 2026", time: "10:00 AM",
  duration: "45 min", type: "Virtual", status: "Confirmada",
};

// Confetti burst (CSS-only)
function Confetti() {
  const colors = ["#7C3AED", "#F97316", "#0D9488", "#EC4899", "#FCD34D", "#34D399", "#60A5FA"];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 56 }).map((_, i) => (
        <div key={i}
          className="absolute rounded-sm animate-bounce"
          style={{
            width:  Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            left:   `${Math.random() * 100}%`,
            top:    `-${Math.random() * 20}%`,
            background: colors[i % colors.length],
            opacity: 0.85,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Isla Creativa · Construye tu historia ─────────────────────────────────────
export function MundoAshaIsla({ go }: { go: (v: View) => void }) {
  type Phase = "pre" | "stage1" | "stage2" | "stage3" | "word" | "done" | "paused" | "exit-confirm";

  const sessionId = useRef("ISLA-" + Math.random().toString(36).slice(2, 6).toUpperCase());
  const stageStartRef = useRef(0);

  const [phase, setPhase] = useState<Phase>("pre");
  const [savedPhase, setSavedPhase] = useState<Phase>("stage1");
  const [protagonist, setProtagonist] = useState<{ label: string; emoji: string } | null>(null);
  const [setting, setSetting] = useState<{ label: string; emoji: string } | null>(null);
  const [action, setAction] = useState<{ label: string; emoji: string } | null>(null);
  const [sceneAssigned, setSceneAssigned] = useState<(number | null)[]>([null, null, null]);
  const [nextPos, setNextPos] = useState(1);
  const [descriptor, setDescriptor] = useState<string | null>(null);
  const [helps, setHelps] = useState(0);
  const [pauses, setPauses] = useState(0);
  const [changes, setChanges] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [stageTimes, setStageTimes] = useState<Record<string, number>>({});

  const SHUFFLE = [2, 0, 1];
  const posLabel = ["INICIO", "DESARROLLO", "FINAL"];
  const posColors = ["#0D9488", "#7C3AED", "#F97316"];
  const posEmoji = ["🌅", "⚡", "🌟"];
  const posBg = ["#CCFBF1", "#EDE9FE", "#FFF1E6"];
  const C = { pink: "#DB2777", pinkBg: "#FCE7F3", pinkBorder: "#F9A8D4" };

  const protagonists = [
    { label: "Asha", emoji: "👧" },
    { label: "Leo el León", emoji: "🦁" },
    { label: "Luna la Conejita", emoji: "🐰" },
  ];
  const settings = [
    { label: "el bosque encantado", emoji: "🌳" },
    { label: "la playa mágica", emoji: "🏖️" },
    { label: "la montaña de las nubes", emoji: "🏔️" },
  ];
  const actions = [
    { label: "encontró algo muy especial", emoji: "🔍" },
    { label: "ayudó a un amigo en apuros", emoji: "🤝" },
    { label: "descubrió su superpoder", emoji: "🌟" },
  ];
  const descriptors = ["Valiente", "Divertida", "Sorprendente", "Amistosa", "Mágica"];

  useEffect(() => {
    const active = phase === "stage1" || phase === "stage2" || phase === "stage3" || phase === "word";
    if (!active) return;
    const iv = window.setInterval(() => setElapsedSec(s => s + 1), 1000);
    return () => window.clearInterval(iv);
  }, [phase]);

  const recordStage = (key: string) => {
    const elapsed = Math.round((Date.now() - stageStartRef.current) / 1000);
    setStageTimes(t => ({ ...t, [key]: elapsed }));
    stageStartRef.current = Date.now();
  };

  const getSceneText = (realIdx: number): string => {
    const p = protagonist?.label ?? "El protagonista";
    const s = setting?.label ?? "un lugar mágico";
    const a = action?.label ?? "vivió una aventura";
    const scenes = [
      `${p} estaba en ${s} cuando todo era tranquilo y hermoso.`,
      `De repente, ${p} ${a} y algo increíble ocurrió.`,
      `Al final, ${p} sonrió feliz y regresó a casa con un gran secreto.`,
    ];
    return scenes[realIdx];
  };

  const buildStory = (): string[] => {
    const lines: string[] = ["", "", ""];
    SHUFFLE.forEach((realIdx, si) => {
      const pos = sceneAssigned[si];
      if (pos !== null) lines[pos - 1] = getSceneText(realIdx);
    });
    return lines;
  };

  const buildLog = (completed: boolean) => ({
    schema: "v0.3-demo",
    sessionId: sessionId.current,
    game: "Isla Creativa · Construye tu historia",
    version: "v84",
    mode: "exploracion",
    timestamp: new Date().toISOString(),
    n1: { totalElapsedSec: elapsedSec, pauses, abandoned: !completed, stageTimes },
    n2: {
      protagonist: protagonist?.label ?? null,
      setting: setting?.label ?? null,
      action: action?.label ?? null,
      sceneOrder: sceneAssigned,
      descriptor,
      helps,
      changes,
      completed,
    },
    n3Eligible: false,
    mlNote: "Machine learning futuro · No activo en esta demo",
  });

  const doPause = () => { setSavedPhase(phase); setPhase("paused"); setPauses(p => p + 1); };
  const doExit = () => go("mundo-asha");
  const doHelp = (text: string) => { speakForChild(text); setHelps(h => h + 1); };

  const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  const ControlBar = ({ step, helpText }: { step: string; helpText: string }) => (
    <div className="flex items-center justify-between mb-4">
      <span className="text-sm font-extrabold" style={{ color: C.pink }}>{step}</span>
      <div className="flex gap-2">
        <button onClick={() => doHelp(helpText)} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }} aria-label="Escuchar las instrucciones" title="Escuchar instrucciones"><Volume2 size={15} style={{ color: C.pink }} /></button>
        <button onClick={doPause} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }} aria-label="Pausar la actividad" title="Pausar"><Pause size={15} style={{ color: C.pink }} /></button>
        <button onClick={() => { setSavedPhase(phase); setPhase("exit-confirm"); }} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }} aria-label="Salir de la actividad" title="Salir"><X size={15} style={{ color: C.pink }} /></button>
      </div>
    </div>
  );

  const ProgressBar = ({ pct }: { pct: number }) => (
    <div className="h-2.5 rounded-full mb-6" style={{ background: "#FCE7F3" }}>
      <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: C.pink }} />
    </div>
  );

  const StageHeader = ({ label, title, subtitle }: { label: string; title: string; subtitle: string }) => (
    <div className="rounded-3xl p-5 mb-5 text-center" style={{ background: C.pinkBg, border: `2px solid ${C.pinkBorder}` }}>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: C.pink }}>{label}</p>
      <h2 className="text-xl font-black text-[#1C1135] mb-1">{title}</h2>
      <p className="text-sm font-medium text-[#7C6F9A]">{subtitle}</p>
    </div>
  );

  // ── PRE ──────────────────────────────────────────────────────────────────────
  if (phase === "pre") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col items-center gap-6 text-center">
          <button onClick={() => go("mundo-asha")} className="self-start flex items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-80" style={{ color: C.pink }} aria-label="Volver al mapa del mundo">
            <ChevronLeft size={16} /> Mapa del Mundo
          </button>
          <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] text-5xl" style={{ background: C.pinkBg, border: `2px solid ${C.pinkBorder}` }}>🎨</div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: C.pink }}>Mundo 4 · Isla Creativa</p>
            <h1 className="text-3xl font-black text-[#1C1135] mb-2">Construye tu historia</h1>
            <p className="text-base font-medium text-[#7C6F9A] leading-relaxed max-w-md">Elige un personaje, un escenario y una acción, ordena las escenas y elige una palabra para tu cuento.</p>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full max-w-sm">
            {[{ emoji: "🧩", label: "Personaje" }, { emoji: "🌍", label: "Escenario" }, { emoji: "🎬", label: "Escenas" }, { emoji: "✨", label: "Descriptor" }].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1 rounded-2xl py-3 px-2" style={{ background: C.pinkBg }}>
                <span className="text-xl">{s.emoji}</span>
                <span className="text-xs font-bold" style={{ color: C.pink }}>{s.label}</span>
              </div>
            ))}
          </div>
          <div className="w-full rounded-2xl p-4 flex items-start gap-3 text-left" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <span className="text-base">🔬</span>
            <div>
              <p className="text-xs font-extrabold text-[#92400E]">Machine learning futuro · No activo en esta demo</p>
              <p className="text-xs font-medium text-[#B45309] mt-0.5">Datos simulados · Prototipo de instrumentación · Esquema v0.3-demo</p>
            </div>
          </div>
          <button
            onClick={() => { stageStartRef.current = Date.now(); setPhase("stage1"); speakForChild("¡Bienvenida a la Isla Creativa! Vamos a construir una historia. Primero, elige al protagonista."); }}
            className="rounded-2xl px-8 py-4 text-lg font-black text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            style={{ background: C.pink }} aria-label="Comenzar la actividad Construye tu historia">
            ¡Comenzar! 🎨
          </button>
          <SimulatedDataLog log={buildLog(false)} />
        </div>
      </div>
    );
  }

  // ── EXIT CONFIRM ──────────────────────────────────────────────────────────────
  if (phase === "exit-confirm") {
    return <ExitConfirmModal onStay={() => setPhase(savedPhase)} onExit={doExit} />;
  }

  // ── PAUSED ────────────────────────────────────────────────────────────────────
  if (phase === "paused") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <Ashi size={90} mood="wave" />
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: C.pink }}>Historia en pausa</p>
          <h2 className="text-2xl font-black text-[#1C1135]">¡Tu historia te espera!</h2>
          <p className="text-sm font-medium text-[#7C6F9A] mt-1">Cuando quieras continuar, pulsa Reanudar.</p>
        </div>
        <button onClick={() => setPhase(savedPhase)} className="rounded-2xl px-8 py-3 text-base font-black text-white flex items-center gap-2" style={{ background: C.pink }} aria-label="Reanudar la actividad">
          <Play size={16} /> Reanudar
        </button>
        <button onClick={() => setPhase("exit-confirm")} className="text-sm font-bold text-[#9E95B7] hover:text-[#DB2777] transition-colors" aria-label="Salir sin completar">
          Salir sin completar
        </button>
      </div>
    );
  }

  // ── STAGE 1: Protagonist ──────────────────────────────────────────────────────
  if (phase === "stage1") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ControlBar step="Paso 1 de 4" helpText="¿Quién es el protagonista de tu historia? Elige uno de los tres personajes." />
          <ProgressBar pct={25} />
          <StageHeader label="Paso 1 · Protagonista" title="¿Quién protagoniza tu historia?" subtitle="Elige uno de los tres personajes para comenzar." />
          <div className="grid grid-cols-3 gap-4">
            {protagonists.map(p => (
              <button key={p.label}
                onClick={() => {
                  if (protagonist && protagonist.label !== p.label) setChanges(c => c + 1);
                  setProtagonist(p);
                  speakForChild(p.label + ". ¡Buena elección!");
                  recordStage("stage1");
                  setPhase("stage2");
                }}
                className="flex flex-col items-center gap-2 rounded-3xl py-6 px-3 border-2 transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: protagonist?.label === p.label ? C.pinkBg : "white", borderColor: protagonist?.label === p.label ? C.pink : C.pinkBorder }}
                aria-label={`Elegir protagonista: ${p.label}`}>
                <span className="text-5xl">{p.emoji}</span>
                <span className="text-sm font-extrabold text-[#1C1135] text-center leading-tight">{p.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── STAGE 2: Setting → Action ─────────────────────────────────────────────────
  if (phase === "stage2") {
    const pickingSetting = !setting;
    const items = pickingSetting ? settings : actions;
    const subTitle = pickingSetting
      ? "Elige el lugar donde vivirá la aventura."
      : `${protagonist?.emoji} ${protagonist?.label} está en ${setting?.emoji} ${setting?.label}. ¿Qué hace?`;

    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ControlBar
            step={`Paso 2 de 4 · ${pickingSetting ? "Escenario" : "Acción"}`}
            helpText={pickingSetting ? "Elige el escenario donde ocurre la historia." : "¿Qué hace el protagonista en su aventura?"}
          />
          <ProgressBar pct={50} />
          <StageHeader
            label={`Paso 2 · ${pickingSetting ? "Escenario" : "Acción"}`}
            title={pickingSetting ? "¿Dónde ocurre la historia?" : "¿Qué hace el protagonista?"}
            subtitle={subTitle}
          />
          <div className="flex flex-col gap-3">
            {items.map(item => (
              <button key={item.label}
                onClick={() => {
                  speakForChild(item.label);
                  if (pickingSetting) {
                    if (setting && setting.label !== item.label) setChanges(c => c + 1);
                    setSetting(item);
                  } else {
                    if (action && action.label !== item.label) setChanges(c => c + 1);
                    setAction(item);
                    recordStage("stage2");
                    setPhase("stage3");
                  }
                }}
                className="flex items-center gap-4 rounded-2xl p-4 border-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md bg-white"
                style={{ borderColor: C.pinkBorder }}
                aria-label={`Elegir: ${item.label}`}>
                <span className="text-4xl w-12 text-center flex-shrink-0">{item.emoji}</span>
                <span className="text-base font-extrabold text-[#1C1135]">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── STAGE 3: Scene ordering ───────────────────────────────────────────────────
  if (phase === "stage3") {
    const allAssigned = sceneAssigned.every(v => v !== null);
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-extrabold" style={{ color: C.pink }}>Paso 3 de 4</span>
            <div className="flex gap-2">
              <button onClick={() => doHelp("Ordena las escenas de tu historia. Toca primero la escena de Inicio, luego el Desarrollo y por último el Final.")}
                className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Escuchar las instrucciones" title="Escuchar instrucciones"><Volume2 size={15} style={{ color: C.pink }} /></button>
              <button onClick={() => { setSceneAssigned([null, null, null]); setNextPos(1); setChanges(c => c + 1); }}
                className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Reiniciar el orden de escenas" title="Reiniciar orden"><RotateCcw size={15} style={{ color: C.pink }} /></button>
              <button onClick={doPause} className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Pausar la actividad" title="Pausar"><Pause size={15} style={{ color: C.pink }} /></button>
              <button onClick={() => { setSavedPhase(phase); setPhase("exit-confirm"); }}
                className="rounded-xl p-2 border bg-white hover:bg-pink-50 transition-colors" style={{ borderColor: C.pinkBorder }}
                aria-label="Salir de la actividad" title="Salir"><X size={15} style={{ color: C.pink }} /></button>
            </div>
          </div>
          <ProgressBar pct={75} />
          <StageHeader label="Paso 3 · Orden de escenas" title="¿En qué orden ocurre tu historia?" subtitle="Toca las escenas en orden: primero el Inicio, luego el Desarrollo, por último el Final." />
          {/* Position guide */}
          <div className="flex gap-2 mb-4 justify-center flex-wrap">
            {posLabel.map((lbl, i) => (
              <div key={i} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-white transition-opacity" style={{ background: posColors[i], opacity: nextPos > i + 1 ? 1 : nextPos === i + 1 ? 1 : 0.35 }}>
                {posEmoji[i]} {lbl} {nextPos === i + 1 && <span className="ml-1 animate-pulse">← siguiente</span>}
              </div>
            ))}
          </div>
          {/* Scene cards */}
          <div className="flex flex-col gap-3 mb-5">
            {SHUFFLE.map((realIdx, si) => {
              const assigned = sceneAssigned[si];
              const isAssigned = assigned !== null;
              return (
                <button key={si}
                  onClick={() => {
                    if (isAssigned || nextPos > 3) return;
                    const newAssigned = [...sceneAssigned];
                    newAssigned[si] = nextPos;
                    setSceneAssigned(newAssigned);
                    setNextPos(p => p + 1);
                    if (assigned !== null) speakForChild(posLabel[assigned - 1] + ". " + getSceneText(realIdx));
                    else speakForChild(posLabel[nextPos - 1] + ". " + getSceneText(realIdx));
                  }}
                  disabled={isAssigned}
                  className="rounded-3xl p-5 border-2 text-left transition-all disabled:cursor-default hover:enabled:shadow-md hover:enabled:-translate-y-0.5"
                  style={{
                    background: isAssigned && assigned !== null ? posBg[assigned - 1] : "white",
                    borderColor: isAssigned && assigned !== null ? posColors[assigned - 1] : C.pinkBorder,
                  }}
                  aria-label={isAssigned && assigned !== null ? `Escena asignada como ${posLabel[assigned - 1]}` : `Toca para asignar como ${posLabel[(nextPos - 1) % 3]}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-extrabold text-[#1C1135] leading-relaxed">{getSceneText(realIdx)}</p>
                    {isAssigned && assigned !== null ? (
                      <span className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-black text-white" style={{ background: posColors[assigned - 1] }}>
                        {posEmoji[assigned - 1]} {posLabel[assigned - 1]}
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full border" style={{ borderColor: C.pinkBorder, color: C.pink }}>
                        Toca aquí
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          {allAssigned && (
            <button onClick={() => { recordStage("stage3"); setPhase("word"); speakForChild("¡Genial! Ahora elige una palabra que describa tu historia."); }}
              className="w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:-translate-y-0.5"
              style={{ background: C.pink }} aria-label="Continuar al paso 4: elegir descriptor">
              Continuar →
            </button>
          )}
          <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── WORD PICKER ───────────────────────────────────────────────────────────────
  if (phase === "word") {
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <ControlBar step="Paso 4 de 4" helpText="¿Con qué palabra describirías tu historia? Elige la que más te guste." />
          <ProgressBar pct={100} />
          <StageHeader label="Paso 4 · Descriptor" title="¿Cómo es tu historia?" subtitle="Elige la palabra que mejor describe tu cuento." />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {descriptors.map(d => (
              <button key={d}
                onClick={() => {
                  if (descriptor && descriptor !== d) setChanges(c => c + 1);
                  setDescriptor(d);
                  speakForChild(d);
                }}
                className="rounded-2xl py-4 px-5 text-base font-extrabold border-2 transition-all hover:-translate-y-0.5"
                style={{
                  background: descriptor === d ? C.pink : "white",
                  borderColor: descriptor === d ? C.pink : C.pinkBorder,
                  color: descriptor === d ? "white" : "#1C1135",
                }}
                aria-pressed={descriptor === d}
                aria-label={`Elegir descriptor: ${d}`}>
                {d}
              </button>
            ))}
          </div>
          {descriptor && (
            <button onClick={() => { recordStage("word"); setPhase("done"); speakForChild("¡Bravo! Tu historia está lista. Vamos a escucharla."); }}
              className="w-full rounded-2xl py-4 text-base font-black text-white transition-all hover:-translate-y-0.5"
              style={{ background: C.pink }} aria-label="Ver la historia completa">
              Ver mi historia completa 🎉
            </button>
          )}
          <p className="mt-3 text-center text-xs font-medium text-[#9E95B7]">⏱ {fmtTime(elapsedSec)}</p>
        </div>
      </div>
    );
  }

  // ── DONE ──────────────────────────────────────────────────────────────────────
  if (phase === "done") {
    const story = buildStory();
    return (
      <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FDF2F8 0%, #FAFAF9 100%)", fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">
          {/* Celebration header */}
          <div className="rounded-3xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${C.pink} 0%, #BE185D 100%)` }}>
            <Ashi size={80} mood="celebrate" />
            <p className="text-xs font-black uppercase tracking-widest text-pink-200 mt-2">¡Historia completada!</p>
            <h1 className="text-2xl font-black text-white mt-1">Tu cuento está listo 🎉</h1>
          </div>
          {/* Story card */}
          <div className="rounded-3xl border-2 overflow-hidden" style={{ borderColor: C.pinkBorder }}>
            <div className="px-5 py-4" style={{ background: C.pinkBg }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: C.pink }}>Tu historia</p>
              <h2 className="font-extrabold text-[#1C1135] mt-0.5">Una historia {descriptor}</h2>
            </div>
            <div className="bg-white px-5 py-4 flex flex-col gap-4">
              {story.map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ background: posColors[i] }}>
                    {posEmoji[i]}
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: posColors[i] }}>{posLabel[i]}</p>
                    <p className="text-sm font-medium text-[#1C1135] leading-relaxed">{line}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 flex justify-between items-center" style={{ background: C.pinkBg }}>
              <p className="text-xs font-bold text-[#7C6F9A]">Una historia <span style={{ color: C.pink }}>{descriptor}</span></p>
              <button onClick={() => speakForChild(story.join(" "))} className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold text-white" style={{ background: C.pink }} aria-label="Escuchar la historia completa" title="Escuchar la historia">
                <Volume2 size={14} /> Escuchar
              </button>
            </div>
          </div>
          {/* Participation summary */}
          <div className="rounded-3xl bg-white border border-[#E8E5F4] p-5">
            <p className="text-xs font-black uppercase tracking-widest text-[#9E95B7] mb-3">Resumen de participación</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tiempo total", value: fmtTime(elapsedSec) },
                { label: "Cambios de selección", value: String(changes) },
                { label: "Ayudas usadas", value: String(helps) },
                { label: "Pausas", value: String(pauses) },
                { label: "Finalización", value: "Completada ✓" },
                { label: "Sesión ID", value: sessionId.current },
              ].map((item, i) => (
                <div key={i} className="rounded-2xl p-3" style={{ background: C.pinkBg }}>
                  <p className="text-xs font-medium text-[#9E95B7]">{item.label}</p>
                  <p className="font-extrabold text-sm text-[#1C1135] mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs font-medium text-[#9E95B7] mt-3 leading-relaxed">Este resumen registra la participación. No evalúa la creatividad ni el lenguaje.</p>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setPhase("pre"); setProtagonist(null); setSetting(null); setAction(null); setSceneAssigned([null, null, null]); setNextPos(1); setDescriptor(null); setHelps(0); setPauses(0); setChanges(0); setElapsedSec(0); setStageTimes({}); }}
              className="w-full rounded-2xl py-3 text-base font-black border-2 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              style={{ borderColor: C.pink, color: C.pink, background: "white" }}
              aria-label="Crear otra historia">
              <RotateCcw size={16} /> Crear otra historia
            </button>
            <button onClick={() => go("mundo-asha")} className="w-full rounded-2xl py-3 text-base font-black text-white transition-all hover:-translate-y-0.5" style={{ background: C.pink }} aria-label="Volver al mapa del mundo">
              Volver al mapa 🗺️
            </button>
          </div>
          <SimulatedDataLog log={buildLog(true)} />
        </div>
      </div>
    );
  }

  return null;
}

// ── Reschedule Modal
function RescheduleModal({ onClose, onConfirm }: { onClose: () => void; onConfirm: (date: string, time: string) => void }) {
  const dates = ["Lun 27 Jul 2026", "Mié 29 Jul 2026", "Vie 31 Jul 2026", "Lun 03 Ago 2026", "Mié 05 Ago 2026"];
  const times = ["08:00", "09:00", "10:00", "11:00", "15:00", "16:00", "17:00"];
  const [selDate, setSelDate] = useState(dates[0]);
  const [selTime, setSelTime] = useState(times[2]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-[#1C1135] flex items-center gap-2"><span>📅</span> Cambiar horario</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
            <X size={18} className="text-[#7C6F9A]" />
          </button>
        </div>
        <p className="text-sm text-[#7C6F9A] font-medium mb-5">Selecciona una nueva fecha y hora disponibles para tu sesión.</p>
        <div className="mb-4">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Fecha</p>
          <div className="flex flex-wrap gap-2">
            {dates.map(d => (
              <button key={d} onClick={() => setSelDate(d)}
                className={`px-3 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${selDate === d ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-300"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Hora</p>
          <div className="flex flex-wrap gap-2">
            {times.map(t => (
              <button key={t} onClick={() => setSelTime(t)}
                className={`px-4 py-2 rounded-2xl text-sm font-bold border-2 transition-all ${selTime === t ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-300"}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-2xl p-4 mb-5 border border-violet-200" style={{ background: "#F5F3FF" }}>
          <p className="text-sm font-extrabold text-[#1C1135]">Nuevo horario: <span className="text-violet-700">{selDate} · {selTime}</span></p>
          <p className="text-xs text-[#9E95B7] font-medium mt-0.5">El terapeuta recibirá una notificación de confirmación.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">Cancelar</button>
          <button onClick={() => onConfirm(selDate, selTime)}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all hover:brightness-105"
            style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            Confirmar cambio
          </button>
        </div>
      </div>
    </div>
  );
}

// 1 ── Session Home
export function AshaSessionHome({ go }: { go: (v: View) => void }) {
  const t = SESSION_THERAPIST;
  const [showReschedule, setShowReschedule] = useState(false);
  const [sessionDate, setSessionDate] = useState(t.date);
  const [sessionTime, setSessionTime] = useState(t.time);
  const [rescheduled, setRescheduled] = useState(false);

  function handleRescheduleConfirm(date: string, time: string) {
    setSessionDate(date);
    setSessionTime(time);
    setRescheduled(true);
    setShowReschedule(false);
  }

  const actions = [
    { icon: "📅", label: "Cambiar horario", onClick: () => setShowReschedule(true) },
    { icon: "💬", label: "Enviar mensaje",  onClick: () => go("padre/mensajes") },
    { icon: "📄", label: "Ver materiales",  onClick: () => go("session/prep") },
  ];

  return (
    <div style={{ background: "linear-gradient(180deg, #F5F3FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: B.violet }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full opacity-10" style={{ background: B.teal }} />
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full opacity-10" style={{ background: B.orange }} />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero greeting */}
        <div className="rounded-3xl overflow-hidden mb-6 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, #5B21B6 100%)` }}>
          <div className="flex flex-col lg:flex-row items-center gap-6 p-8 sm:p-10">
            <div className="flex-1">
              <Bdg color="violet">ASHA Session</Bdg>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-3 mb-2 leading-tight">
                Tu próxima sesión<br />está casi lista ✨
              </h1>
              <p className="text-violet-200 font-medium leading-relaxed max-w-sm">
                Prepara el espacio, verifica tu conexión y comienza cuando estés listo.
              </p>
            </div>
            <div className="flex-shrink-0 opacity-90">
              <Ashi size={130} mood="wave" />
            </div>
          </div>
        </div>

        {/* Session card */}
        <Crd className="p-6 mb-5 shadow-md">
          <div className="flex items-start gap-5 flex-wrap">
            <div className="relative">
              <Av initials={t.av} color={t.color} size="xl" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="text-xl font-black text-[#1C1135]">{t.name}</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">{t.specialty}</p>
                </div>
                <Bdg color="green">{t.status}</Bdg>
              </div>
              {rescheduled && (
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-3 py-2">
                  <CheckCircle size={13} /> Horario actualizado correctamente
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "📅", label: "Fecha",    val: sessionDate },
                  { icon: "⏰", label: "Hora",     val: sessionTime },
                  { icon: "⏱️", label: "Duración", val: t.duration },
                  { icon: "💻", label: "Tipo",     val: t.type },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                    <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button onClick={() => go("session/prep")}
              className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-white font-black text-lg shadow-md shadow-violet-200 hover:shadow-lg hover:brightness-105 transition-all"
              style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
              <span className="text-2xl">▶</span> Entrar a la sesión
            </button>
            <div className="flex gap-2 sm:flex-col">
              {actions.map(a => (
                <button key={a.label} onClick={a.onClick}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E8E5F4] bg-white hover:bg-violet-50 transition-colors text-sm font-bold text-[#7C6F9A] hover:text-violet-700 whitespace-nowrap">
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>
        </Crd>

        {/* Upcoming sessions */}
        <Crd className="p-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4">Próximas sesiones</h3>
          <div className="flex flex-col gap-3">
            {[
              { date: "02 Ago 2026", time: "15:30", therapist: "Lic. Carlos Mendoza", child: "Sofía", type: "Presencial" },
              { date: "06 Ago 2026", time: "10:00", therapist: "Dra. Ana Ruiz",       child: "Mateo", type: "Virtual"    },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl p-3 border border-[#F5F3FF] hover:bg-[#F5F3FF] transition-colors">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: B.violetLight }}>
                  <Calendar size={16} style={{ color: B.violet }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-extrabold text-[#1C1135]">{s.therapist} · {s.child}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{s.date} · {s.time}</p>
                </div>
                <Bdg color={s.type === "Virtual" ? "violet" : "gray"}>{s.type}</Bdg>
              </div>
            ))}
          </div>
        </Crd>
      </div>
      {showReschedule && <RescheduleModal onClose={() => setShowReschedule(false)} onConfirm={handleRescheduleConfirm} />}
    </div>
  );
}

// ── Device Test Panel
function DeviceTestPanel({ onClose }: { onClose: () => void }) {
  type TestState = "idle" | "testing" | "ok" | "fail";
  const [cam, setCam] = useState<TestState>("idle");
  const [mic, setMic] = useState<TestState>("idle");
  const [net, setNet] = useState<TestState>("idle");

  function runTest(set: (s: TestState) => void) {
    set("testing");
    setTimeout(() => set("ok"), 1800 + Math.random() * 600);
  }

  function runAll() {
    setCam("idle"); setMic("idle"); setNet("idle");
    setTimeout(() => runTest(setCam), 100);
    setTimeout(() => runTest(setMic), 600);
    setTimeout(() => runTest(setNet), 1100);
  }

  const allOk = cam === "ok" && mic === "ok" && net === "ok";
  const anyTesting = cam === "testing" || mic === "testing" || net === "testing";

  function stateIcon(s: TestState) {
    if (s === "idle") return <span className="w-5 h-5 rounded-full bg-[#E8E5F4] inline-block" />;
    if (s === "testing") return <span className="w-5 h-5 rounded-full border-2 border-violet-400 border-t-transparent animate-spin inline-block" />;
    if (s === "ok") return <CheckCircle size={20} className="text-emerald-500" />;
    return <X size={20} className="text-red-400" />;
  }

  const devices = [
    { key: "cam", label: "Cámara", icon: "📷", state: cam },
    { key: "mic", label: "Micrófono", icon: "🎤", state: mic },
    { key: "net", label: "Conexión", icon: "📶", state: net },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(28,17,53,0.55)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-[#1C1135] flex items-center gap-2"><span>🎛️</span> Probar dispositivos</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-2xl flex items-center justify-center hover:bg-[#F5F3FF] transition-colors" aria-label="Cerrar">
            <X size={18} className="text-[#7C6F9A]" />
          </button>
        </div>
        <div className="flex flex-col gap-3 mb-5">
          {devices.map(d => (
            <div key={d.key} className={`flex items-center gap-4 rounded-2xl p-4 border-2 transition-all ${d.state === "ok" ? "border-emerald-200 bg-emerald-50" : d.state === "testing" ? "border-violet-300 bg-violet-50" : "border-[#E8E5F4] bg-white"}`}>
              <span className="text-2xl">{d.icon}</span>
              <div className="flex-1">
                <p className={`font-extrabold text-sm ${d.state === "ok" ? "text-emerald-700" : "text-[#1C1135]"}`}>{d.label}</p>
                <p className="text-xs text-[#9E95B7] font-medium">
                  {d.state === "idle" ? "Sin probar" : d.state === "testing" ? "Probando…" : d.state === "ok" ? "Funcionando correctamente" : "Error detectado"}
                </p>
              </div>
              {stateIcon(d.state)}
            </div>
          ))}
        </div>
        {allOk && (
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
            <CheckCircle size={16} /> ¡Todos los dispositivos están listos!
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-2xl border-2 border-[#E8E5F4] text-sm font-bold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors">Cerrar</button>
          <button onClick={runAll} disabled={anyTesting}
            className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            {anyTesting ? "Probando…" : "Probar todo"}
          </button>
        </div>
      </div>
    </div>
  );
}

// 2 ── Preparation Center
export function AshaSessionPrep({ go }: { go: (v: View) => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [showDeviceTest, setShowDeviceTest] = useState(false);
  const checklist = [
    { id: "cam",   icon: "📷", label: "Cámara",            hint: "Activá el permiso de cámara en el navegador" },
    { id: "mic",   icon: "🎤", label: "Micrófono",         hint: "Verificá que el micrófono funcione correctamente" },
    { id: "net",   icon: "📶", label: "Internet",           hint: "Recomendamos al menos 5 Mbps de velocidad" },
    { id: "spk",   icon: "🔊", label: "Altavoces",          hint: "Subí el volumen y probá que se escuche bien" },
    { id: "perm",  icon: "🔐", label: "Permisos",           hint: "Concedé permisos de audio y video al navegador" },
    { id: "light", icon: "💡", label: "Iluminación",        hint: "Sentate frente a una ventana o luz natural" },
    { id: "noise", icon: "🔇", label: "Ambiente silencioso", hint: "Busca un lugar tranquilo sin ruido de fondo" },
  ];
  const allDone = checklist.every(c => checked[c.id]);

  return (
    <div style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => go("session")} className="flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:underline mb-6">
          <ChevronLeft size={15} /> Volver
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <Ashi size={80} mood={allDone ? "celebrate" : "happy"} />
          <h1 className="text-2xl font-black text-[#1C1135] mt-3">Centro de Preparación</h1>
          <p className="text-sm text-[#7C6F9A] font-medium mt-1">Verificá todo antes de ingresar a la sesión</p>
          {allDone && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold text-emerald-700" style={{ background: "#DCFCE7" }}>
              <CheckCircle size={16} /> ¡Todo listo para comenzar!
            </div>
          )}
        </div>

        {/* Checklist */}
        <Crd className="p-5 mb-5">
          <h3 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><span className="text-xl">✅</span> Lista de verificación</h3>
          <div className="flex flex-col gap-2">
            {checklist.map(item => (
              <button key={item.id}
                onClick={() => setChecked(p => ({ ...p, [item.id]: !p[item.id] }))}
                className={`flex items-center gap-4 rounded-2xl p-4 border-2 text-left transition-all duration-200 ${checked[item.id] ? "border-emerald-300 bg-emerald-50" : "border-[#E8E5F4] bg-white hover:border-violet-300 hover:bg-violet-50"}`}>
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 transition-all ${checked[item.id] ? "bg-emerald-100" : "bg-[#F5F3FF]"}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-extrabold ${checked[item.id] ? "text-emerald-700 line-through opacity-70" : "text-[#1C1135]"}`}>{item.label}</p>
                  <p className="text-xs text-[#9E95B7] font-medium mt-0.5">{item.hint}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked[item.id] ? "bg-emerald-500 border-emerald-500" : "border-[#C4B5FD]"}`}>
                  {checked[item.id] && <Check size={13} className="text-white" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => setShowDeviceTest(true)} className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-violet-300 text-sm font-bold text-violet-600 hover:bg-violet-50 transition-colors">
            🎛️ Probar dispositivos
          </button>
        </Crd>

        {/* Materials + Objectives grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">🎒</span> Hoy necesitarás</h3>
            <div className="flex flex-col gap-2">
              {[["📒","Cuaderno"],["✏️","Lápices de colores"],["🧸","Juguete favorito"],["🧩","Tarjetas de práctica"]].map(([icon,label]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl p-3" style={{ background: B.violetLight }}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm font-bold text-[#1C1135]">{label}</span>
                </div>
              ))}
            </div>
          </Crd>
          <Crd className="p-5">
            <h3 className="font-extrabold text-[#1C1135] mb-3 flex items-center gap-2"><span className="text-lg">🎯</span> Objetivo de hoy</h3>
            <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider mb-3">Hoy trabajaremos:</p>
            <div className="flex flex-col gap-2">
              {[["🗣️","Pronunciación de la R"],["👂","Comprensión verbal"],["🎮","Juego interactivo"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl p-2.5 border border-[#E8E5F4]">
                  <span className="text-base">{icon}</span>
                  <span className="text-sm font-bold text-[#1C1135]">{label}</span>
                </div>
              ))}
            </div>
          </Crd>
        </div>

        {/* Countdown + enter */}
        <div className="rounded-3xl p-7 text-center border-2 border-violet-200 mb-6"
          style={{ background: `linear-gradient(135deg, ${B.violetLight} 0%, #DDD6FE 100%)` }}>
          <p className="text-xs font-black text-violet-500 uppercase tracking-widest mb-2">La sesión comienza en</p>
          <div className="text-6xl font-black text-violet-800 tabular-nums tracking-tight mb-2">08:12</div>
          <p className="text-sm text-violet-600 font-bold mb-5">¡Ya casi comenzamos! — ASHI</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => go("session/waiting")}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-white font-black text-base shadow-md hover:shadow-lg hover:brightness-105 transition-all"
              style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
              <span className="text-xl">▶</span> Ingresar ahora
            </button>
          </div>
        </div>
      </div>
      {showDeviceTest && <DeviceTestPanel onClose={() => setShowDeviceTest(false)} />}
    </div>
  );
}

// 3 ── Waiting Room
export function AshaSessionWaiting({ go }: { go: (v: View) => void }) {
  const t = SESSION_THERAPIST;
  const tips = [
    "Respirá profundo. La sesión comenzará enseguida.",
    "Asegurate de estar en un lugar tranquilo y bien iluminado.",
    "Podés tener a mano el cuaderno y los materiales.",
    "El terapeuta revisará los objetivos al iniciar.",
  ];
  const [tipIdx] = useState(0);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #1E1148 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-pulse"
            style={{ width: 4 + (i % 5) * 2, height: 4 + (i % 5) * 2, background: "white", opacity: 0.06 + (i % 4) * 0.03, top: `${(i * 17) % 100}%`, left: `${(i * 13 + 7) % 100}%`, animationDelay: `${i * 0.3}s` }} />
        ))}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4 text-center">
        {/* Therapist avatar with pulse ring */}
        <div className="relative inline-block mb-7">
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${B.violet}30`, scale: "1.4" }} />
          <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${B.violet}20`, scale: "1.2" }} />
          <div className="relative">
            <Av initials={t.av} color={t.color} size="xl" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#1E1148] flex items-center justify-center" style={{ background: B.teal }}>
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>

        <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-2">Sala de espera</p>
        <h1 className="text-2xl font-black text-white mb-1">Conectando con {t.name}</h1>
        <p className="text-violet-300 text-sm font-medium mb-6">{t.specialty}</p>

        {/* Connection status */}
        <div className="rounded-2xl px-5 py-3 mb-7 inline-flex items-center gap-3" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="flex gap-1">
            {[1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />)}
          </div>
          <span className="text-sm font-bold text-teal-300">Conectándose…</span>
        </div>

        {/* ASHI tip */}
        <div className="rounded-3xl p-5 mb-6 text-left" style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Ashi size={48} mood="happy" />
            </div>
            <div>
              <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-1">ASHI te dice:</p>
              <p className="text-sm text-white font-medium leading-relaxed">{tips[tipIdx]}</p>
            </div>
          </div>
        </div>

        {/* Breathing exercise */}
        <div className="rounded-3xl p-5 mb-7" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">🌬️ Ejercicio de respiración</p>
          <div className="flex items-center justify-center mb-3">
            <div className="w-20 h-20 rounded-full border-4 border-violet-400/30 flex items-center justify-center animate-pulse" style={{ background: "rgba(124,58,237,0.2)" }}>
              <div className="w-12 h-12 rounded-full animate-ping" style={{ background: `${B.violet}40` }} />
            </div>
          </div>
          <p className="text-xs text-violet-300 font-medium">Inhala 4s · Sostén 4s · Exhala 4s</p>
        </div>

        <button onClick={() => go("session/active")}
          className="w-full py-4 rounded-2xl text-white font-black text-base shadow-lg shadow-violet-900/40 hover:brightness-110 transition-all"
          style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
          ▶ Entrar a la sesión
        </button>
        <button onClick={() => go("session")} className="mt-3 text-sm text-violet-400 hover:text-white font-bold transition-colors">
          Cancelar y volver
        </button>
      </div>
    </div>
  );
}

// 4 ── Active Session (video call UI)
export function AshaSessionActive({ go }: { go: (v: View) => void }) {
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);
  const [panel,    setPanel]    = useState<"chat"|"notes"|"materials"|"objectives"|null>(null);
  const [chatMsg,  setChatMsg]  = useState("");
  const [tools,    setTools]    = useState(false);
  const t = SESSION_THERAPIST;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0D0820", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Main video area */}
      <div className="flex-1 relative flex">
        {/* Therapist main video */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1C0F45 0%, #2D1B69 100%)" }}>
          {/* Simulated video — therapist avatar centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${B.violet}20`, scale: "1.3" }} />
              <Av initials={t.av} color={t.color} size="xl" />
            </div>
            <div className="text-center">
              <p className="text-white font-extrabold text-lg">{t.name}</p>
              <p className="text-violet-300 text-sm font-medium">{t.specialty}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-bold">En vivo</span>
              </div>
            </div>
          </div>

          {/* Objective card — top left */}
          <div className="absolute top-4 left-4 rounded-2xl px-4 py-2.5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-0.5">🎯 Objetivo actual</p>
            <p className="text-sm font-extrabold text-white">Pronunciación de la R</p>
          </div>

          {/* Timer + connection — top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="rounded-2xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white font-bold">HD</span>
            </div>
            <div className="rounded-2xl px-3 py-1.5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-sm font-black text-white tabular-nums">00:32:14</span>
            </div>
          </div>

          {/* Child PiP — bottom right */}
          <div className="absolute bottom-20 right-4 w-36 h-28 rounded-2xl overflow-hidden border-2 border-violet-400/30 shadow-2xl"
            style={{ background: camOff ? "#1C0F45" : "linear-gradient(135deg, #2D1B69 0%, #4C1D95 100%)" }}>
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              {camOff
                ? <><div className="text-2xl">📷</div><p className="text-xs text-violet-300 font-bold">Cámara off</p></>
                : <><Av initials="MG" color={B.orange} size="sm" /><p className="text-xs text-white font-bold mt-1">Mateo</p></>
              }
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {panel && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l" style={{ background: "#120A2E", borderColor: "rgba(255,255,255,0.08)" }}>
            {/* Panel tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {(["chat","notes","materials","objectives"] as const).map(tab => (
                <button key={tab}
                  className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-colors capitalize ${panel === tab ? "text-violet-300 border-b-2 border-violet-400" : "text-white/40 hover:text-white/70"}`}
                  onClick={() => setPanel(tab)}>
                  {tab === "chat" ? "💬" : tab === "notes" ? "📝" : tab === "materials" ? "📄" : "🎯"}
                </button>
              ))}
              <button onClick={() => setPanel(null)} className="px-3 text-white/40 hover:text-white/70">
                <X size={16} />
              </button>
            </div>

            {panel === "chat" && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {msgs.slice(0, 3).map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.own ? "flex-row-reverse" : ""}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${msg.own ? "text-white rounded-tr-sm" : "text-white rounded-tl-sm"}`}
                        style={{ background: msg.own ? B.violet : "rgba(255,255,255,0.1)" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 flex gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    placeholder="Escribe un mensaje…"
                    className="flex-1 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-400"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: B.violet }}>
                    <Send size={13} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {panel === "notes" && (
              <div className="flex-1 p-4 flex flex-col gap-3">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider">Notas de sesión</p>
                <textarea
                  className="flex-1 rounded-2xl p-3 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Escribí tus notas aquí…"
                  defaultValue="Mateo mostró avance en la pronunciación de /r/ vibrante. Practicar en casa: trabalenguas con /r/." />
              </div>
            )}

            {panel === "materials" && (
              <div className="flex-1 p-4">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">Materiales</p>
                {["Ejercicios semana 12.pdf","Guía fonemas R-L.pdf","Actividades vocabulario.pdf"].map(f => (
                  <div key={f} className="flex items-center gap-2 p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FileText size={14} className="text-violet-400 flex-shrink-0" />
                    <span className="text-xs text-white/80 font-medium truncate flex-1">{f}</span>
                    <Download size={12} className="text-violet-400" />
                  </div>
                ))}
              </div>
            )}

            {panel === "objectives" && (
              <div className="flex-1 p-4">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">Objetivos</p>
                {[["🗣️","Pronunciación de la R","En progreso"],["👂","Comprensión verbal","Completado"],["🎮","Juego interactivo","Pendiente"]].map(([icon,label,status]) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <span className="text-base">{icon}</span>
                    <span className="text-xs text-white/80 font-medium flex-1">{label}</span>
                    <span className={`text-xs font-bold ${status === "Completado" ? "text-emerald-400" : status === "En progreso" ? "text-amber-400" : "text-white/30"}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex-shrink-0 h-16 flex items-center justify-center gap-2 px-4" style={{ background: "#0A0618", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Left group: main controls */}
        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => setMuted(m => !m)}
            className={`flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl transition-all ${muted ? "bg-red-500/20 text-red-400" : "text-white/70 hover:bg-white/10"}`}>
            <span className="text-lg">{muted ? "🔇" : "🎤"}</span>
          </button>
          <button onClick={() => setCamOff(c => !c)}
            className={`flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl transition-all ${camOff ? "bg-red-500/20 text-red-400" : "text-white/70 hover:bg-white/10"}`}>
            <span className="text-lg">{camOff ? "📷" : "📸"}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl text-white/70 hover:bg-white/10 transition-all">
            <span className="text-lg">⛶</span>
          </button>
        </div>

        {/* Center: secondary actions */}
        <div className="flex items-center gap-2">
          {(["chat","notes","materials","objectives"] as const).map(tab => {
            const icons: Record<string, string> = { chat: "💬", notes: "📝", materials: "📄", objectives: "🎯" };
            const labels: Record<string, string> = { chat: "Chat", notes: "Notas", materials: "Docs", objectives: "Metas" };
            return (
              <button key={tab} onClick={() => setPanel(p => p === tab ? null : tab)}
                className={`flex flex-col items-center gap-0.5 px-3 h-12 rounded-2xl transition-all text-xs font-bold ${panel === tab ? "bg-violet-600/30 text-violet-300" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}>
                <span className="text-base">{icons[tab]}</span>
                <span>{labels[tab]}</span>
              </button>
            );
          })}
          <button onClick={() => setTools(t => !t)}
            className={`flex flex-col items-center gap-0.5 px-3 h-12 rounded-2xl transition-all text-xs font-bold ${tools ? "bg-orange-500/20 text-orange-300" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}>
            <span className="text-base">🧸</span>
            <span>Tools</span>
          </button>
        </div>

        {/* Right: leave */}
        <div className="flex items-center gap-2 ml-auto">
          {/* ASHI help */}
          <button className="w-10 h-10 rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-400 transition-all flex-shrink-0">
            <Ashi size={40} mood="happy" />
          </button>
          <button onClick={() => go("session/end")}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm transition-all">
            <Phone size={14} className="rotate-[135deg]" /> Finalizar
          </button>
        </div>
      </div>

      {/* Tools overlay */}
      {tools && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-3xl p-4 shadow-2xl" style={{ background: "#1C0F45", border: "1px solid rgba(255,255,255,0.15)", zIndex: 60 }}>
          <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-3 text-center">🧸 Herramientas Interactivas</p>
          <div className="grid grid-cols-6 gap-2">
            {[["✏️","Lápiz"],["🖊️","Marcador"],["⭐","Stickers"],["😊","Emojis"],["🎨","Colores"],["🃏","Tarjetas"],["🖼️","Imágenes"],["🧩","Rompecabezas"],["🔤","Letras"],["🔢","Números"],["✏️","Dibujos"],["🗑️","Borrar"]].map(([icon, label]) => (
              <button key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-white/60 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 5 ── Session End — Celebration
export function AshaSessionEnd({ go }: { go: (v: View) => void }) {
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const downloadSessionPdf = () => {
    const safe = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\\()]/g, "\\$&");
    const lines = [
      "Sesion Finalizada - 30 Jul 2026",
      "Terapeuta: Dra. Ana Ruiz",
      "Duracion: 45 minutos  Inicio: 10:00 AM",
      "", "Objetivos trabajados:",
      "  - Pronunciacion de la R",
      "  - Comprension verbal",
      "  - Juego interactivo",
      "", "Notas del terapeuta:",
      "  Excelente progreso en R inicial. Continuar ejercicios en casa.",
      "", "Proxima sesion: pendiente de confirmar",
      "", "ASHAKids - Plataforma de terapia infantil",
    ];
    const body = ["BT", "/F1 16 Tf", "50 790 Td", `(${safe("Resumen de sesion - ASHAKids")}) Tj`, "/F1 10 Tf",
      ...lines.flatMap(l => ["0 -20 Td", `(${safe(l)}) Tj`]), "ET"].join("\n");
    const objs = ["<< /Type /Catalog /Pages 2 0 R >>", "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [];
    objs.forEach((o, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = pdf.length;
    pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + offsets.map(o => `${String(o).padStart(10, "0")} 00000 n \n`).join("") +
      `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const a = document.createElement("a");
    const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
    a.href = url; a.download = "resumen-sesion-30jul2026.pdf";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${B.violetDeep} 0%, #4C1D95 50%, ${B.violet} 100%)`, fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <Confetti />

      {/* Session summary modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSummaryModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">📋 Resumen de sesión</h2>
              <button onClick={() => setShowSummaryModal(false)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" style={{ background: B.violet }}>AR</div>
                <div>
                  <p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">Terapia del Lenguaje</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#9E95B7]">Duración</p>
                  <p className="font-black text-[#1C1135] text-xl">45 min</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: "📅", label: "Fecha", val: "30 Jul 2026" },
                  { icon: "⏰", label: "Inicio", val: "10:00 AM" },
                  { icon: "🎯", label: "Objetivos", val: "3 / 3" },
                  { icon: "💻", label: "Tipo", val: "Virtual" },
                ].map(item => (
                  <div key={item.label} className="rounded-2xl p-3 text-center" style={{ background: B.violetLight }}>
                    <div className="text-xl mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{item.label}</p>
                    <p className="text-sm font-extrabold text-[#1C1135]">{item.val}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-3">🎯 Objetivos trabajados</p>
                {[["🗣️","Pronunciación de la R","completado"],["👂","Comprensión verbal","completado"],["🎮","Juego interactivo","completado"]].map(([icon,label,status]) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl p-2.5 mb-1.5 last:mb-0" style={{ background: "#DCFCE7" }}>
                    <span>{icon}</span>
                    <span className="text-sm font-bold text-[#1C1135] flex-1">{label}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{status === "completado" ? "✓" : "…"}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl p-4" style={{ background: B.violetLight }}>
                <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">💬 Notas del terapeuta</p>
                <p className="text-sm text-[#4B4264] font-medium leading-relaxed">Excelente progreso en R inicial. Practica en casa con los ejercicios enviados. ¡Muy buen trabajo hoy!</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3">
              <button onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E8E5F4] text-sm font-extrabold text-[#7C6F9A] hover:bg-violet-50 transition-colors">
                Cerrar
              </button>
              <button onClick={downloadSessionPdf}
                className="flex-1 py-2.5 rounded-2xl text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: B.violet }}>
                <Download size={14} /> Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background glow circles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: B.orange }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-15" style={{ background: B.teal }} />
      </div>

      <div className="relative z-10 max-w-sm">
        <div className="text-6xl mb-3 animate-bounce">🎉</div>
        <div className="mb-5" style={{ filter: "drop-shadow(0 8px 24px rgba(124,58,237,0.5))" }}>
          <Ashi size={130} mood="celebrate" />
        </div>

        <h1 className="text-4xl font-black text-white mb-3 leading-tight">
          ¡Excelente trabajo!
        </h1>
        <p className="text-violet-200 text-lg font-medium mb-2 leading-relaxed">
          Hoy completaste otra sesión con la Dra. Ana Ruiz.
        </p>
        <p className="text-violet-300 text-sm font-medium mb-8">¡Cada sesión te acerca más a tu meta! 🌟</p>

        <div className="flex flex-col gap-3 w-full">
          <button onClick={() => setShowSummaryModal(true)}
            className="w-full py-4 rounded-2xl font-black text-white shadow-lg hover:brightness-110 transition-all"
            style={{ background: `linear-gradient(135deg, ${B.orange} 0%, #EA580C 100%)` }}>
            📋 Ver resumen de sesión
          </button>
          <button onClick={() => go("terapeuta")}
            className="w-full py-3.5 rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-all text-sm">
            🏠 Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

// 6 ── Session Summary + Rating + Rewards
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

// ── TerapeutaDatosActividad ────────────────────────────────────────────────────
export function TerapeutaDatosActividad({ go }: { go: (v: View) => void }) {
  const [filter, setFilter] = useState<"todos" | "asignadas" | "exploracion">("todos");

  const sessions = [
    { id: "ASHA-A3F1", patient: "B.R.", activity: "Bosque de los Cuentos", type: "asignada", date: "2026-08-22", duration: "4m 38s", scenes: 3, hints: 1, pauses: 0, inputMode: "manual", participation: "Completada" },
    { id: "ASHA-B2C9", patient: "M.L.", activity: "Montaña Musical", type: "asignada", date: "2026-08-22", duration: "5m 12s", scenes: 3, hints: 0, pauses: 1, inputMode: "sin micrófono", participation: "Completada" },
    { id: "ASHA-C7D4", patient: "S.T.", activity: "Valle de Adivinanzas", type: "exploracion", date: "2026-08-21", duration: "3m 57s", scenes: 2, hints: 4, pauses: 0, inputMode: "botones", participation: "Incompleta" },
    { id: "ASHA-D5E8", patient: "B.R.", activity: "Valle de Adivinanzas", type: "exploracion", date: "2026-08-21", duration: "6m 01s", scenes: 3, hints: 2, pauses: 1, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-E1F3", patient: "M.L.", activity: "Bosque de los Cuentos", type: "asignada", date: "2026-08-20", duration: "5m 44s", scenes: 3, hints: 0, pauses: 0, inputMode: "con micrófono (simulado)", participation: "Completada" },
    { id: "ASHA-F2G6", patient: "S.T.", activity: "Isla Creativa", type: "exploracion", date: "2026-08-23", duration: "6m 22s", scenes: 4, hints: 1, pauses: 0, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-G4H1", patient: "B.R.", activity: "Laboratorio · Circuito", type: "asignada",   date: "2026-08-23", duration: "7m 48s", scenes: 3, hints: 2, pauses: 1, inputMode: "botones", participation: "Completada" },
    { id: "ASHA-H7J2", patient: "M.L.", activity: "Laboratorio · Asociación", type: "exploracion", date: "2026-08-23", duration: "3m 05s", scenes: 1, hints: 0, pauses: 0, inputMode: "botones", participation: "Completada" },
  ];

  const filtered = sessions.filter(s => filter === "todos" || (filter === "asignadas" ? s.type === "asignada" : s.type === "exploracion"));

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)" }}>
          <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Vista de terapeuta · Solo uso interno</p>
          <h1 className="text-2xl font-black text-white mb-1">Datos de actividad · Mundo ASHA</h1>
          <p className="text-sm text-violet-200 font-medium">Registros de participación pseudonimizados · No reemplaza la evaluación clínica</p>
        </div>

        {/* Notice */}
        <div className="rounded-2xl p-4 mb-5 flex items-start gap-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
          <Shield size={16} className="text-violet-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-bold text-[#5B21B6] leading-relaxed">
            Estos datos son <strong>registros de participación</strong>, no evaluaciones clínicas. No usar como base para diagnóstico ni como sustituto de la sesión terapéutica. Los identificadores de paciente están pseudonimizados.
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(["todos", "asignadas", "exploracion"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold border transition-all ${filter === f ? "border-violet-500 bg-violet-600 text-white" : "border-[#E8E5F4] bg-white text-[#7C6F9A] hover:bg-[#F5F3FF]"}`}>
              {f === "todos" ? "Todos" : f === "asignadas" ? "Asignadas ✓" : "Exploración libre"}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] overflow-hidden mb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0EDF8]">
                  {["ID sesión", "Paciente", "Actividad", "Tipo", "Fecha", "Duración", "Pistas", "Pausas", "Entrada", "Resultado"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={i} className="border-b border-[#F8F7FF] hover:bg-[#F5F3FF] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#7C6F9A]">{s.id}</td>
                    <td className="px-4 py-3 font-extrabold text-[#1C1135]">{s.patient}</td>
                    <td className="px-4 py-3 font-medium text-[#4B4869] whitespace-nowrap">{s.activity}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.type === "asignada" ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                        {s.type === "asignada" ? "Asignada ✓" : "Exploración"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#7C6F9A] whitespace-nowrap">{s.date}</td>
                    <td className="px-4 py-3 text-xs font-medium text-[#4B4869]">{s.duration}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-[#1C1135]">{s.hints}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-[#1C1135]">{s.pauses}</td>
                    <td className="px-4 py-3 text-xs text-[#7C6F9A] whitespace-nowrap">{s.inputMode}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.participation === "Completada" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {s.participation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl p-3 flex items-center gap-2" style={{ background: "#F5F3FF" }}>
          <Database size={13} className="text-violet-400 flex-shrink-0" />
          <p className="text-xs font-bold text-[#7C6F9A]">Esquema de datos simulados · pendiente de aprobación regulatoria · v0.3-demo</p>
        </div>
      </div>
    </div>
  );
}

// ── AdminCalidadDatos ──────────────────────────────────────────────────────────
export function AdminCalidadDatos({ go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<"cobertura" | "arquitectura" | "consentimiento">("cobertura");

  const dataLevels = [
    {
      level: "Nivel 1",
      name: "Telemetría de producto",
      color: "#0D9488",
      bgColor: "#D1FAE5",
      consent: "Implícito en TyC",
      examples: ["Tiempo en pantalla", "Navegación entre vistas", "Errores de interfaz", "Abandono de flujo"],
      rows: 12450,
      coverage: 98,
    },
    {
      level: "Nivel 2",
      name: "Seguimiento terapéutico",
      color: "#7C3AED",
      bgColor: "#EDE9FE",
      consent: "Consentimiento informado explícito",
      examples: ["Actividades completadas", "Tiempo por ronda", "Pistas solicitadas", "Modalidad de entrada"],
      rows: 3210,
      coverage: 87,
    },
    {
      level: "Nivel 3",
      name: "Investigación / ML",
      color: "#D97706",
      bgColor: "#FFFBEB",
      consent: "Opt-in separado · desactivado por defecto",
      examples: ["Patrones de interacción anonimizados", "Metadatos de sesión", "Secuencia de intentos"],
      rows: 410,
      coverage: 12,
    },
  ];

  const architectureSteps = [
    { icon: "📱", label: "Dispositivo cliente", desc: "Captura interacción · sin audio real" },
    { icon: "🔑", label: "Pseudonimización", desc: "ID real → ID hash · en edge antes de transmitir" },
    { icon: "🛡️", label: "Clasificación por nivel", desc: "N1/N2/N3 según consentimiento activo" },
    { icon: "🗄️", label: "Almacén segregado", desc: "Tres buckets independientes · sin cruce" },
    { icon: "🔬", label: "Análisis / ML (N3)", desc: "Solo si opt-in activo · modelo diferencial" },
    { icon: "📊", label: "Vista terapeuta (N2)", desc: "Participación agregada · sin microdatos" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F7FF]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="rounded-3xl p-5 mb-5" style={{ background: "linear-gradient(135deg, #1C1135 0%, #2D1B6B 100%)" }}>
          <p className="text-xs font-black text-violet-400 uppercase tracking-widest mb-1">Panel de administración · Acceso restringido</p>
          <h1 className="text-2xl font-black text-white mb-1">Calidad de datos · Mundo ASHA</h1>
          <p className="text-sm text-violet-300 font-medium">Arquitectura ML · Consentimientos · Cobertura</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border border-[#E8E5F4] rounded-2xl p-1 bg-white">
          {(["cobertura", "arquitectura", "consentimiento"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all capitalize ${tab === t ? "bg-[#1C1135] text-white" : "text-[#7C6F9A] hover:bg-[#F5F3FF]"}`}>
              {t === "cobertura" ? "Cobertura" : t === "arquitectura" ? "Arquitectura ML" : "Consentimientos"}
            </button>
          ))}
        </div>

        {/* COBERTURA */}
        {tab === "cobertura" && (
          <div className="flex flex-col gap-4">
            {dataLevels.map((dl, i) => (
              <div key={i} className="bg-white rounded-3xl border border-[#E8E5F4] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full" style={{ background: dl.bgColor, color: dl.color }}>{dl.level}</span>
                    <h3 className="font-extrabold text-[#1C1135] mt-2">{dl.name}</h3>
                    <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">Consentimiento: {dl.consent}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-2xl" style={{ color: dl.color }}>{dl.rows.toLocaleString()}</p>
                    <p className="text-xs text-[#9E95B7] font-medium">registros simulados</p>
                  </div>
                </div>
                <div className="h-2 rounded-full mb-3" style={{ background: "#F0EDF8" }}>
                  <div className="h-2 rounded-full transition-all" style={{ width: `${dl.coverage}%`, background: dl.color }} />
                </div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-[#9E95B7]">Cobertura de consentimiento</p>
                  <p className="text-xs font-extrabold" style={{ color: dl.color }}>{dl.coverage}%</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {dl.examples.map((ex, j) => (
                    <span key={j} className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: dl.bgColor, color: dl.color }}>{ex}</span>
                  ))}
                </div>
              </div>
            ))}
            {/* ML banner */}
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <span className="text-base">🔬</span>
              <div>
                <p className="text-xs font-extrabold text-[#92400E]">Machine learning futuro · No activo en esta demo</p>
                <p className="text-xs font-medium text-[#B45309] mt-0.5">Los datos N3 no se procesan actualmente. El pipeline ML requiere aprobación regulatoria y DPA antes de activarse.</p>
              </div>
            </div>
            {/* Per-world breakdown */}
            <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5">
              <h3 className="font-extrabold text-[#1C1135] mb-1">Cobertura por mundo · Registros N2 simulados</h3>
              <p className="text-xs text-[#9E95B7] font-medium mb-4">Eventos de participación (sin microdatos · sin PII) · N3 no elegible en esta demo</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#F0EDF8]">
                      {["Mundo", "Sesiones", "Completadas", "Eventos N2", "N3 elegible"].map(h => (
                        <th key={h} className="text-left px-3 py-2 text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Bosque de los Cuentos", sessions: 28, completed: 24, n2Events: 140 },
                      { name: "Montaña Musical",       sessions: 19, completed: 17, n2Events: 95  },
                      { name: "Valle de Adivinanzas",  sessions: 23, completed: 16, n2Events: 86  },
                      { name: "Isla Creativa",          sessions: 7,  completed: 6,  n2Events: 34  },
                      { name: "Laboratorio de Juegos", sessions: 11, completed: 9,  n2Events: 58  },
                    ].map((w, i) => (
                      <tr key={i} className="border-b border-[#F8F7FF] hover:bg-[#F5F3FF] transition-colors">
                        <td className="px-3 py-2.5 font-extrabold text-[#1C1135]">{w.name}</td>
                        <td className="px-3 py-2.5 text-[#4B4869]">{w.sessions}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{w.completed}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium text-[#7C3AED]">{w.n2Events}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">No activo</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ARQUITECTURA */}
        {tab === "arquitectura" && (
          <div className="bg-white rounded-3xl border border-[#E8E5F4] p-6">
            <h2 className="font-extrabold text-[#1C1135] text-lg mb-1">Flujo de datos · Prototipo v0.3</h2>
            <p className="text-xs text-[#9E95B7] font-medium mb-5">Esquema simplificado para revisión regulatoria · pendiente de aprobación</p>
            <div className="flex flex-col gap-3">
              {architectureSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: "#F5F3FF" }}>{step.icon}</div>
                    {i < architectureSteps.length - 1 && <div className="w-0.5 h-4 bg-[#E8E5F4] mt-1" />}
                  </div>
                  <div className="pt-1">
                    <p className="font-extrabold text-sm text-[#1C1135]">{step.label}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl p-4" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <p className="text-xs font-bold text-[#92400E] leading-relaxed">
                ⚠️ <strong>Prototipo de demostración</strong>: Este esquema es conceptual y no está auditado. El pipeline real requerirá revisión de seguridad, DPA con proveedores de nube, y aprobación del DPO antes de producción.
              </p>
            </div>
          </div>
        )}

        {/* CONSENTIMIENTO */}
        {tab === "consentimiento" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-3xl border border-[#E8E5F4] p-5">
              <h2 className="font-extrabold text-[#1C1135] text-lg mb-4">Estado de consentimientos · Demo</h2>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Consentimiento de plataforma (N1)", pct: 100, color: "#0D9488", note: "Obligatorio · 100% cobertura" },
                  { label: "Consentimiento terapéutico (N2)", pct: 87, color: "#7C3AED", note: "Opt-in explícito · 87% de usuarios activos" },
                  { label: "Consentimiento ML/investigación (N3)", pct: 12, color: "#D97706", note: "Opt-in separado · desactivado por defecto · 12% voluntarios" },
                ].map((c, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm font-extrabold text-[#1C1135]">{c.label}</p>
                      <p className="text-sm font-extrabold" style={{ color: c.color }}>{c.pct}%</p>
                    </div>
                    <div className="h-2 rounded-full mb-1" style={{ background: "#F0EDF8" }}>
                      <div className="h-2 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
                    </div>
                    <p className="text-xs text-[#9E95B7] font-medium">{c.note}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#EDE9FE", border: "1px solid #C4B5FD" }}>
              <Shield size={15} className="text-violet-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-[#5B21B6] leading-relaxed">
                Los consentimientos N2 y N3 son separados e independientes. La revocación de N3 no afecta N2. Los datos N3 existentes se eliminan en ciclo de 30 días tras revocación. Texto legal pendiente de aprobación del DPO.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

