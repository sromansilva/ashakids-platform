import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, Star, Heart, PlayCircle, Clock, Users, Check, Search, Volume2, RefreshCw, Lock } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Ashi } from "./shared";
import { CheckCircle } from "lucide-react";

// Gamification HUD bar
export function AshaHUD({ stars, level, streak, go }: { stars: number; level: number; streak: number; go: (v: View) => void }) {
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

// World map zone node
export function WorldZone({ emoji, name, color, bg, locked, onClick, x, y, size = 110 }: {
  emoji: string; name: string; color: string; bg: string;
  locked?: boolean; onClick: () => void; x: number; y: number; size?: number;
}) {
  return (
    <g transform={`translate(${x},${y})`} style={{ cursor: locked ? "not-allowed" : "pointer" }} onClick={locked ? undefined : onClick}>
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
export function MundoAshaHome({ go }: { go: (v: View) => void }) {
  const [stars]  = useState(47);
  const [level]  = useState(3);
  const [streak] = useState(7);

  const worlds = [
    { emoji: "🌳", name: "Bosque de\nlos Cuentos",  color: "#16A34A", bg: "#DCFCE7", view: "mundo-asha/cuentos"      as View, locked: false },
    { emoji: "🎵", name: "Montaña\nMusical",         color: "#9333EA", bg: "#F3E8FF", view: "mundo-asha/canciones"    as View, locked: false },
    { emoji: "🧩", name: "Valle de las\nAdivinanzas",color: "#B45309", bg: "#FEF3C7", view: "mundo-asha/adivinanzas"  as View, locked: false },
    { emoji: "🎨", name: "Isla\nCreativa",            color: "#DB2777", bg: "#FCE7F3", view: "mundo-asha/juegos"       as View, locked: false },
    { emoji: "🧠", name: "Laboratorio\nde Juegos",   color: "#0284C7", bg: "#E0F2FE", view: "mundo-asha/juegos"       as View, locked: false },
    { emoji: "🚀", name: "Academia\nASHA",            color: "#7C3AED", bg: "#EDE9FE", view: "mundo-asha/academia"     as View, locked: false },
    { emoji: "🏆", name: "Camino de\nlos Retos",     color: "#EA580C", bg: "#FFF1E6", view: "mundo-asha/retos"        as View, locked: false },
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

  // Path connections between zones (pairs of zone indices)
  const connections: [number, number][] = [[0,6],[6,1],[1,2],[2,3],[3,4],[4,5],[5,6],[5,2]];

  const cx = (i: number) => positions[i][0] + 55;
  const cy = (i: number) => positions[i][1] + 55;

  return (
    <div style={{ background: "linear-gradient(180deg, #EFF6FF 0%, #F0FDF4 50%, #FEF9EE 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Floating decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[
          { emoji: "☁️", top: "8%",  left: "5%",  size: 32, delay: 0    },
          { emoji: "☁️", top: "15%", left: "72%", size: 40, delay: 1.5  },
          { emoji: "⭐", top: "25%", left: "90%", size: 22, delay: 0.8  },
          { emoji: "🌸", top: "60%", left: "3%",  size: 26, delay: 2    },
          { emoji: "🌿", top: "80%", left: "88%", size: 24, delay: 1.2  },
          { emoji: "✨", top: "45%", left: "95%", size: 20, delay: 0.4  },
          { emoji: "🫧", top: "70%", left: "8%",  size: 18, delay: 1.8  },
          { emoji: "🌈", top: "5%",  left: "40%", size: 36, delay: 0.6  },
        ].map((el, i) => (
          <div key={i} className="absolute animate-bounce select-none"
            style={{ top: el.top, left: el.left, fontSize: el.size, animationDelay: `${el.delay}s`, animationDuration: "3s" }}>
            {el.emoji}
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-6 pb-12">
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
            <Bdg color="violet">7 mundos</Bdg>
          </div>
          <div className="overflow-x-auto">
            <div style={{ minWidth: 640 }}>
              <svg viewBox="0 0 900 430" style={{ width: "100%", height: "auto" }}>
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
                {/* Clouds */}
                <ellipse cx="100" cy="80" rx="45" ry="22" fill="white" opacity="0.8" />
                <ellipse cx="130" cy="68" rx="30" ry="18" fill="white" opacity="0.8" />
                <ellipse cx="80"  cy="72" rx="28" ry="16" fill="white" opacity="0.8" />
                <ellipse cx="750" cy="55" rx="40" ry="20" fill="white" opacity="0.8" />
                <ellipse cx="780" cy="44" rx="28" ry="16" fill="white" opacity="0.8" />
                <ellipse cx="730" cy="48" rx="25" ry="14" fill="white" opacity="0.8" />
                {/* Decorative stars */}
                <text x="380" y="35" fontSize="16" opacity="0.5">✦</text>
                <text x="560" y="25" fontSize="12" opacity="0.4">✦</text>
                <text x="200" y="45" fontSize="10" opacity="0.4">✦</text>
                {/* Connecting paths */}
                {connections.map(([a, b], i) => (
                  <path key={i}
                    d={`M${cx(a)},${cy(a)} Q${(cx(a)+cx(b))/2},${Math.min(cy(a),cy(b))-30} ${cx(b)},${cy(b)}`}
                    stroke="#DDD6FE" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 6" fill="none" />
                ))}
                {/* World zones */}
                {worlds.map((w, i) => (
                  <WorldZone
                    key={w.name.replace(/\n/, "-")}
                    emoji={w.emoji}
                    name={w.name.replace("\n", " ")}
                    color={w.color}
                    bg={w.bg}
                    locked={w.locked}
                    onClick={() => go(w.view)}
                    x={positions[i][0]}
                    y={positions[i][1]}
                    size={90}
                  />
                ))}
                {/* ASHI on the map */}
                <g transform="translate(390, 310)">
                  <circle cx="32" cy="32" r="36" fill="#FEF9EE" opacity="0.8" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* Quick access world cards */}
        <h2 className="font-extrabold text-[#1C1135] mb-4 flex items-center gap-2"><span className="text-xl">⚡</span> Explorar mundos</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { emoji: "🌳", name: "Cuentos",      sub: "12 historias",  view: "mundo-asha/cuentos"     as View, bg: "#DCFCE7", border: "#86EFAC", color: "#16A34A" },
            { emoji: "🎵", name: "Canciones",    sub: "8 canciones",   view: "mundo-asha/canciones"   as View, bg: "#F3E8FF", border: "#C4B5FD", color: "#7C3AED" },
            { emoji: "🗣️", name: "Trabalenguas", sub: "Nivel 3",       view: "mundo-asha/trabalenguas"as View, bg: B.tealLight,  border: "#5EEAD4", color: B.teal   },
            { emoji: "🧩", name: "Adivinanzas",  sub: "5 nuevas",      view: "mundo-asha/adivinanzas" as View, bg: "#FEF3C7", border: "#FCD34D", color: "#B45309" },
            { emoji: "🧠", name: "Mini Juegos",  sub: "3 disponibles", view: "mundo-asha/juegos"      as View, bg: "#E0F2FE", border: "#7DD3FC", color: "#0284C7" },
            { emoji: "🚀", name: "Academia",     sub: "Letras y nums", view: "mundo-asha/academia"    as View, bg: B.violetLight, border: "#A78BFA", color: B.violet },
            { emoji: "🏆", name: "Retos",        sub: "2 pendientes",  view: "mundo-asha/retos"       as View, bg: B.orangeLight, border: "#FCA5A5", color: B.orange },
            { emoji: "🏅", name: "Insignias",    sub: "5 ganadas",     view: "mundo-asha/insignias"   as View, bg: "#FEF3C7", border: "#FCD34D", color: "#92400E" },
          ].map(w => (
            <button key={w.name} onClick={() => go(w.view)}
              className="rounded-3xl p-5 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2"
              style={{ backgroundColor: w.bg, borderColor: w.border }}>
              <div className="text-4xl mb-3">{w.emoji}</div>
              <p className="font-extrabold text-sm" style={{ color: w.color }}>{w.name}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: w.color, opacity: 0.7 }}>{w.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bosque de los Cuentos ──────────────────────────────────────────────────────
export function MundoAshaCuentos({ go }: { go: (v: View) => void }) {
  const stories = [
    { id: 1, title: "El León y el Ratón",       age: "4+", dur: "5 min", color: "#DCFCE7", emoji: "🦁", genre: "Fábula",    popular: true,  rating: 4.9 },
    { id: 2, title: "Caperucita Roja",          age: "3+", dur: "7 min", color: "#FEF3C7", emoji: "🐺", genre: "Clásico",   popular: true,  rating: 4.8 },
    { id: 3, title: "Los Tres Cerditos",        age: "4+", dur: "6 min", color: "#FEE2E2", emoji: "🐷", genre: "Clásico",   popular: false, rating: 4.7 },
    { id: 4, title: "La Tortuga y la Liebre",   age: "5+", dur: "5 min", color: "#E0F2FE", emoji: "🐢", genre: "Fábula",    popular: false, rating: 4.6 },
    { id: 5, title: "El Patito Feo",            age: "4+", dur: "8 min", color: "#F3E8FF", emoji: "🦆", genre: "Clásico",   popular: true,  rating: 4.9 },
    { id: 6, title: "Hansel y Gretel",          age: "6+", dur: "10 min",color: "#FCE7F3", emoji: "🍬", genre: "Clásico",   popular: false, rating: 4.5 },
  ];
  const [search, setSearch] = useState("");
  const filtered = stories.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

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
            <Btn size="sm" onClick={() => {}} className="!bg-green-600 !text-white">Continuar</Btn>
          </div>
        </div>

        <h2 className="font-extrabold text-[#1C1135] mb-4">⭐ Más populares</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(story => (
            <button key={story.id}
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
  const [playing, setPlaying] = useState<number | null>(1);
  const songs = [
    { id: 1, title: "El Abecedario Bailarín",   artist: "ASHA Band",   dur: "2:30", color: "#F3E8FF", emoji: "🎹", genre: "Educativa" },
    { id: 2, title: "Los Colores del Arcoíris",  artist: "Mundo ASHA",  dur: "3:10", color: "#FEF3C7", emoji: "🌈", genre: "Relajante" },
    { id: 3, title: "Cuenta Conmigo",            artist: "ASHA Band",   dur: "2:45", color: "#DCFCE7", emoji: "🔢", genre: "Educativa" },
    { id: 4, title: "Soy un Explorador",         artist: "Mundo ASHA",  dur: "2:58", color: "#E0F2FE", emoji: "🚀", genre: "Aventura"  },
    { id: 5, title: "La Canción de las Letras",  artist: "ASHA Band",   dur: "1:55", color: "#FCE7F3", emoji: "📝", genre: "Educativa" },
  ];
  return (
    <div style={{ background: "linear-gradient(180deg, #F3E8FF 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-violet-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🎵</span>
          <div>
            <p className="text-xs font-black text-violet-300 uppercase tracking-widest mb-1">Mundo 2</p>
            <h1 className="text-3xl font-black text-white">Montaña Musical</h1>
            <p className="text-violet-200 text-sm font-medium mt-1">Canciones, rimas y melodías para aprender</p>
            <div className="flex gap-3 mt-3">
              <Bdg color="violet">8 canciones</Bdg>
              <Bdg color="violet">3 playlists</Bdg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {/* Now playing card */}
        {playing !== null && (() => {
          const song = songs.find(s => s.id === playing)!;
          return (
            <div className="rounded-3xl p-6 mb-7 border border-violet-200 shadow-sm" style={{ background: "linear-gradient(135deg, #7C3AED 0%, #9F67FA 100%)" }}>
              <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-3">🎵 Reproduciendo ahora</p>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-3xl flex-shrink-0">{song.emoji}</div>
                <div className="flex-1">
                  <p className="font-extrabold text-white text-lg">{song.title}</p>
                  <p className="text-violet-200 text-sm font-medium">{song.artist}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-white/20">
                    <div className="h-1.5 rounded-full bg-white w-2/5" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setPlaying(null)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center transition-colors" style={{ color: B.violet }}>
                    ⏸
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        <h2 className="font-extrabold text-[#1C1135] mb-4">🎶 Todas las canciones</h2>
        <div className="bg-white rounded-3xl border border-[#E8E5F4] overflow-hidden shadow-sm">
          {songs.map((song, i) => (
            <div key={song.id}
              className={`flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-violet-50 transition-colors ${playing === song.id ? "bg-violet-50 border-l-4 border-violet-600" : ""} ${i < songs.length - 1 ? "border-b border-[#F5F3FF]" : ""}`}
              onClick={() => setPlaying(song.id)}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ backgroundColor: song.color }}>{song.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className={`font-extrabold truncate ${playing === song.id ? "text-violet-700" : "text-[#1C1135]"}`}>{song.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{song.artist} · {song.genre}</p>
              </div>
              <div className="flex items-center gap-3">
                <Bdg color="gray">{song.dur}</Bdg>
                {playing === song.id
                  ? <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs">▶</div>
                  : <button className="w-6 h-6 rounded-full border border-[#E8E5F4] hover:bg-violet-100 flex items-center justify-center text-[#9E95B7] text-xs">▶</button>
                }
              </div>
            </div>
          ))}
        </div>
      </div>
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

  const startTimer = () => setPracticing(true);
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
            <p className="text-xs font-black text-teal-300 uppercase tracking-widest mb-1">Mundo 3</p>
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
                  <p className="text-sm text-[#7C6F9A] font-medium">Practicá 3 veces seguidas</p>
                </div>
                <div className="text-2xl font-black text-amber-600">+{item.pts} ⭐</div>
              </Crd>
            </div>
          );
        })() : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map(item => (
              <button key={item.id} onClick={() => setActive(item.id)}
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
  const riddles = [
    { id: 1, q: "Tengo hojas pero no soy árbol, tengo lomo pero no soy animal. ¿Qué soy?",    a: "Un libro",   emoji: "📚", hint: "Lo usás para leer",  pts: 10, color: "#FEF3C7" },
    { id: 2, q: "Cuanto más me secas, más mojado me pongo. ¿Qué soy?",                        a: "Una toalla", emoji: "🛁", hint: "Está en el baño",    pts: 10, color: "#E0F2FE" },
    { id: 3, q: "Soy redonda, vivo en el cielo y me ven mejor de noche. ¿Qué soy?",           a: "La luna",    emoji: "🌙", hint: "Brilla por la noche", pts: 10, color: "#EDE9FE" },
    { id: 4, q: "Tengo dientes pero no como, pelo pero no soy animal. ¿Qué soy?",             a: "Un peine",   emoji: "💇", hint: "Lo usás en el pelo",  pts: 15, color: "#DCFCE7" },
  ];
  const [current, setCurrent]   = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score,    setScore]    = useState(0);
  const [showHint, setShowHint] = useState(false);
  const riddle = riddles[current];

  const next = () => {
    if (!revealed) setScore(s => s + riddle.pts);
    setRevealed(false); setShowHint(false);
    setCurrent(c => (c + 1) % riddles.length);
  };

  return (
    <div style={{ background: "linear-gradient(180deg, #FEF9EE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #B45309 0%, #92400E 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-amber-300 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🧩</span>
          <div>
            <p className="text-xs font-black text-amber-300 uppercase tracking-widest mb-1">Mundo 4</p>
            <h1 className="text-3xl font-black text-white">Valle de las Adivinanzas</h1>
            <p className="text-amber-100 text-sm font-medium mt-1">¿Podés adivinarlas todas?</p>
          </div>
          <div className="ml-auto bg-white/15 rounded-2xl px-4 py-2 text-white text-center">
            <p className="font-black text-2xl">{score}</p>
            <p className="text-xs text-amber-200 font-bold">estrellas ⭐</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-1.5 mb-7">
          {riddles.map((_, i) => (
            <div key={i} className="flex-1 h-2.5 rounded-full" style={{ background: i <= current ? "#B45309" : "#FDE68A" }} />
          ))}
        </div>

        <Crd className="p-7 text-center mb-5">
          <div className="text-6xl mb-5">{riddle.emoji}</div>
          <p className="text-xl font-extrabold text-[#1C1135] leading-relaxed mb-6">&ldquo;{riddle.q}&rdquo;</p>

          {showHint && (
            <div className="rounded-2xl p-3 mb-4 text-sm font-bold text-amber-700" style={{ background: "#FEF3C7" }}>
              💡 Pista: {riddle.hint}
            </div>
          )}

          {revealed ? (
            <div>
              <div className="rounded-2xl p-5 mb-5 border-2 border-green-300" style={{ background: "#DCFCE7" }}>
                <p className="text-xs font-black text-green-600 uppercase tracking-wider mb-1">¡Respuesta!</p>
                <p className="text-2xl font-black text-green-700">{riddle.a}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Btn size="lg" variant="cta" onClick={next}>Siguiente <ChevronRight size={16} /></Btn>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 items-center">
              <div className="flex gap-3">
                {!showHint && (
                  <Btn variant="outline" onClick={() => setShowHint(true)}>💡 Ver pista</Btn>
                )}
                <Btn onClick={() => setRevealed(true)} className="!bg-amber-600 !text-white">🔓 Revelar respuesta</Btn>
              </div>
            </div>
          )}
        </Crd>

        <div className="flex items-center justify-center gap-2 text-sm text-[#7C6F9A] font-medium">
          <span className="font-black text-amber-700">{current + 1}</span> de {riddles.length} adivinanzas
        </div>
      </div>
    </div>
  );
}

// ── Mini Juegos ────────────────────────────────────────────────────────────────
const VOZ_W = 640;
const VOZ_H = 380;
const VOZ_BIRD_X = 130;
const VOZ_BIRD_R = 15;
const VOZ_PIPE_W = 58;
const VOZ_GAP = 165;
const VOZ_GRAVITY = 0.38;
const VOZ_LIFT = 0.55;
const VOZ_MAX_UP = -4.8;
const VOZ_MAX_DOWN = 5.2;
const VOZ_PIPE_SPEED = 2.8;
const VOZ_CEIL = 30;
const VOZ_FLOOR_Y = VOZ_H - 58;

function VozAventuraGame() {
  type Phase = "pre"|"requesting"|"allowed"|"blocked"|"calibrating"|"noisy"|"countdown"|"playing"|"paused"|"done";

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const micStreamRef = useRef<MediaStream|null>(null);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const audioCtxRef = useRef<AudioContext|null>(null);
  const phaseRef = useRef<Phase>("pre");
  const noiseFloorRef = useRef(12);
  const smoothedRef = useRef(0);
  const isSpeakingRef = useRef(false);
  const survivedRef = useRef(0);
  const lastTickRef = useRef(0);
  const bestTimeRef = useRef(28);
  const isFirstRef = useRef(true);
  const touchHeldRef = useRef(false);
  const useMicRef = useRef(true);

  const [phase, setPhase] = useState<Phase>("pre");
  const [countdown, setCountdown] = useState(3);
  const [survivedSecs, setSurvivedSecs] = useState(0);
  const [bestTime, setBestTime] = useState(28);
  const [attemptNum, setAttemptNum] = useState(2);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPct, setMicPct] = useState(0);
  const [lastResult, setLastResult] = useState<{survived:number;isRecord:boolean;prevBest:number}|null>(null);
  const [inputMode, setInputMode] = useState<"mic"|"touch">("mic");

  type Pipe = {x:number;topH:number;safe:boolean};
  type Cloud = {x:number;y:number;sz:number;spd:number};
  type Particle = {x:number;y:number;vx:number;vy:number;life:number};

  const gRef = useRef<{
    birdY:number; birdVY:number; tilt:number; squish:number;
    pipes:Pipe[]; clouds:Cloud[]; particles:Particle[];
    bgOff:number; frame:number; lastPipe:number;
  }>({
    birdY: VOZ_H/2, birdVY:0, tilt:0, squish:0,
    pipes:[], clouds:[], particles:[],
    bgOff:0, frame:0, lastPipe:-200,
  });

  useEffect(() => {
    gRef.current.clouds = Array.from({length:5},(_,i)=>({
      x:(i/5)*VOZ_W+Math.random()*60, y:25+Math.random()*100,
      sz:55+Math.random()*70, spd:0.35+Math.random()*0.25,
    }));
  }, []);

  const stopMic = useCallback(()=>{
    micStreamRef.current?.getTracks().forEach(t=>t.stop());
    micStreamRef.current=null;
    audioCtxRef.current?.close().catch(()=>{});
    audioCtxRef.current=null; analyserRef.current=null;
  },[]);

  const getRaw = useCallback(():number=>{
    if(!analyserRef.current) return 0;
    const d=new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(d);
    return d.reduce((s,v)=>s+v,0)/d.length;
  },[]);

  const setP = useCallback((p:Phase)=>{setPhase(p);phaseRef.current=p;},[]);

  const requestMic = useCallback(async()=>{
    setP("requesting");
    try {
      const isSecure = window.isSecureContext || location.protocol === "https:" || location.hostname === "localhost";
      if(!isSecure || !navigator.mediaDevices?.getUserMedia){setP("blocked");return;}
      const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
      micStreamRef.current=stream;
      const actx=new (window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext)();
      audioCtxRef.current=actx;
      const analyser=actx.createAnalyser();
      analyser.fftSize=512; analyser.smoothingTimeConstant=0.8;
      analyserRef.current=analyser;
      actx.createMediaStreamSource(stream).connect(analyser);
      useMicRef.current=true;
      setInputMode("mic");
      setP("calibrating");
      const samples:number[]=[]; const t0=Date.now();
      const iv=setInterval(()=>{
        samples.push(getRaw());
        if(Date.now()-t0>=1600){
          clearInterval(iv);
          const avg=samples.reduce((a,b)=>a+b,0)/samples.length;
          const std=Math.sqrt(samples.reduce((s,v)=>s+(v-avg)**2,0)/samples.length);
          noiseFloorRef.current=avg+std*1.8+6;
          if(noiseFloorRef.current>42) setP("noisy");
          else setP("allowed");
        }
      },50);
    } catch { setP("blocked"); }
  },[getRaw,setP]);

  const startCountdown = useCallback(()=>{
    const g=gRef.current;
    g.birdY=VOZ_H/2; g.birdVY=0; g.tilt=0; g.pipes=[]; g.frame=0;
    g.lastPipe=-200; g.particles=[]; g.squish=0;
    setSurvivedSecs(0); survivedRef.current=0;
    setP("countdown"); setCountdown(3);
    let c=3;
    const iv=setInterval(()=>{
      c--;
      if(c>0){setCountdown(c);}
      else{
        clearInterval(iv); setCountdown(0);
        setTimeout(()=>{lastTickRef.current=Date.now(); setP("playing");},900);
      }
    },850);
  },[setP]);

  const startTouchMode = useCallback(()=>{
    useMicRef.current=false;
    setInputMode("touch");
    startCountdown();
  },[startCountdown]);

  // Keyboard/touch events for fallback mode
  useEffect(()=>{
    const onDown=(e:KeyboardEvent)=>{ if(e.code==="Space"||e.code==="ArrowUp"){e.preventDefault();touchHeldRef.current=true;} };
    const onUp=(e:KeyboardEvent)=>{ if(e.code==="Space"||e.code==="ArrowUp") touchHeldRef.current=false; };
    window.addEventListener("keydown",onDown); window.addEventListener("keyup",onUp);
    return()=>{ window.removeEventListener("keydown",onDown); window.removeEventListener("keyup",onUp); };
  },[]);

  // Poll mic level during "allowed" phase for the voice meter
  useEffect(()=>{
    if(phase!=="allowed") return;
    const iv=setInterval(()=>{
      const raw=getRaw();
      smoothedRef.current=smoothedRef.current*0.7+raw*0.3;
      const speaking=smoothedRef.current>noiseFloorRef.current+7;
      setIsSpeaking(speaking); isSpeakingRef.current=speaking;
      setMicPct(Math.min(100,Math.round((smoothedRef.current/Math.max(1,noiseFloorRef.current+28))*100)));
    },60);
    return()=>clearInterval(iv);
  },[phase,getRaw]);

  // Reset timer on resume from pause
  useEffect(()=>{ if(phase==="playing") lastTickRef.current=Date.now(); },[phase]);

  // Main canvas loop
  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d"); if(!ctx) return;
    const W=VOZ_W, H=VOZ_H;

    const drawCloud=(x:number,y:number,sz:number)=>{
      ctx.save(); ctx.fillStyle="rgba(255,255,255,0.82)";
      ctx.beginPath();
      ctx.arc(x,y,sz*0.38,0,Math.PI*2);
      ctx.arc(x+sz*0.28,y-sz*0.12,sz*0.26,0,Math.PI*2);
      ctx.arc(x-sz*0.22,y-sz*0.08,sz*0.22,0,Math.PI*2);
      ctx.arc(x+sz*0.18,y+sz*0.06,sz*0.2,0,Math.PI*2);
      ctx.fill(); ctx.restore();
    };

    const drawPipe=(x:number,topH:number)=>{
      const pw=VOZ_PIPE_W, CAP=12, R=7;
      const tg=ctx.createLinearGradient(x,0,x+pw,0);
      tg.addColorStop(0,"#059669"); tg.addColorStop(0.4,"#10B981"); tg.addColorStop(1,"#047857");
      ctx.fillStyle=tg;
      if(topH>CAP) ctx.fillRect(x+4,0,pw-8,topH-CAP);
      ctx.beginPath(); ctx.roundRect(x,topH-CAP,pw,CAP,[0,0,R,R]); ctx.fill();
      ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.fillRect(x+7,0,9,Math.max(0,topH-CAP));
      const by2=topH+VOZ_GAP, bh=H-by2;
      const bg2=ctx.createLinearGradient(x,0,x+pw,0);
      bg2.addColorStop(0,"#059669"); bg2.addColorStop(0.4,"#10B981"); bg2.addColorStop(1,"#047857");
      ctx.fillStyle=bg2;
      ctx.beginPath(); ctx.roundRect(x,by2,pw,CAP,[R,R,0,0]); ctx.fill();
      if(bh>CAP) ctx.fillRect(x+4,by2+CAP,pw-8,bh-CAP);
      ctx.fillStyle="rgba(255,255,255,0.18)"; ctx.fillRect(x+7,by2+CAP,9,Math.max(0,bh-CAP));
    };

    const loop=()=>{
      const g=gRef.current;
      const ph=phaseRef.current;

      const sky=ctx.createLinearGradient(0,0,0,H);
      sky.addColorStop(0,"#7DD3FC"); sky.addColorStop(0.55,"#BAE6FD"); sky.addColorStop(1,"#ECFDF5");
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);

      if(ph==="playing") g.bgOff=(g.bgOff+VOZ_PIPE_SPEED*0.4)%80;
      ctx.fillStyle="#86EFAC"; ctx.fillRect(0,H-32,W,32);
      ctx.fillStyle="#4ADE80";
      for(let i=-1;i<W/80+1;i++){
        ctx.beginPath(); ctx.arc(i*80-g.bgOff,H-32,20,Math.PI,0); ctx.fill();
      }

      g.clouds.forEach(c=>{
        if(ph==="playing"){c.x-=c.spd; if(c.x<-c.sz)c.x=W+c.sz;}
        drawCloud(c.x,c.y,c.sz);
      });

      const preScreens=["pre","requesting","allowed","blocked","calibrating","noisy"] as Phase[];
      if(preScreens.includes(ph)||ph==="countdown"){
        const bob=Math.sin(Date.now()/700)*8;
        ctx.font="44px serif"; ctx.textAlign="center";
        ctx.fillText("🦋",VOZ_BIRD_X,H/2+bob);
        animRef.current=requestAnimationFrame(loop); return;
      }

      // playing / paused / done
      if(ph==="playing"){
        g.frame++;
        const now=Date.now();
        if(now-lastTickRef.current>=1000){
          survivedRef.current++; lastTickRef.current+=1000;
          setSurvivedSecs(survivedRef.current);
        }
        let speaking = false;
        if(useMicRef.current){
          const raw=getRaw();
          smoothedRef.current=smoothedRef.current*0.72+raw*0.28;
          speaking=smoothedRef.current>noiseFloorRef.current+7;
          setMicPct(Math.min(100,Math.round((smoothedRef.current/Math.max(1,noiseFloorRef.current+28))*100)));
        } else {
          speaking=touchHeldRef.current;
          setMicPct(speaking?85:0);
        }
        if(speaking!==isSpeakingRef.current){isSpeakingRef.current=speaking;setIsSpeaking(speaking);}

        if(speaking) g.birdVY=Math.max(g.birdVY-VOZ_LIFT,VOZ_MAX_UP);
        else g.birdVY=Math.min(g.birdVY+VOZ_GRAVITY,VOZ_MAX_DOWN);
        g.birdY+=g.birdVY;

        const tTilt=g.birdVY*0.07; g.tilt+=(tTilt-g.tilt)*0.1;

        if(g.birdY<VOZ_CEIL){g.birdY=VOZ_CEIL;g.birdVY=Math.max(0,g.birdVY);g.squish=-1;}
        if(g.birdY>VOZ_FLOOR_Y){g.birdY=VOZ_FLOOR_Y;g.birdVY=Math.min(0,g.birdVY);g.squish=1;}
        g.squish*=0.82;

        const interval=Math.max(100,140-Math.floor(g.frame/300)*4);
        if(g.frame-g.lastPipe>=interval){
          const minH=55, maxH=VOZ_H-VOZ_GAP-VOZ_FLOOR_Y+55;
          g.pipes.push({x:W+5,topH:minH+Math.random()*(Math.max(20,maxH-minH)),safe:false});
          g.lastPipe=g.frame;
        }
        g.pipes=g.pipes.map(p=>({...p,x:p.x-VOZ_PIPE_SPEED})).filter(p=>p.x>-VOZ_PIPE_W-10);

        const bL=VOZ_BIRD_X-VOZ_BIRD_R, bR=VOZ_BIRD_X+VOZ_BIRD_R;
        const bT=g.birdY-VOZ_BIRD_R, bB=g.birdY+VOZ_BIRD_R;
        let dead=false;

        for(const pipe of g.pipes){
          const xOv=bR>pipe.x+5&&bL<pipe.x+VOZ_PIPE_W-5;
          if(!xOv){pipe.safe=false;continue;}
          const inGap=bT>=pipe.topH-2&&bB<=pipe.topH+VOZ_GAP+2;
          if(!pipe.safe){
            if(inGap){pipe.safe=true;}
            else{dead=true;break;}
          }
          if(pipe.safe){
            if(bT<pipe.topH){g.birdY=pipe.topH+VOZ_BIRD_R+1;g.birdVY=Math.max(0,g.birdVY);}
            if(bB>pipe.topH+VOZ_GAP){g.birdY=pipe.topH+VOZ_GAP-VOZ_BIRD_R-1;g.birdVY=Math.min(0,g.birdVY);}
          }
        }

        if(speaking&&g.frame%4===0){
          g.particles.push({x:VOZ_BIRD_X-VOZ_BIRD_R-4,y:g.birdY+(Math.random()-0.5)*10,vx:-(0.8+Math.random()),vy:(Math.random()-0.5)*1.2,life:1});
        }
        g.particles=g.particles.map(p=>({...p,x:p.x+p.vx,y:p.y+p.vy,life:p.life-0.05})).filter(p=>p.life>0);

        if(dead){
          const survived=survivedRef.current;
          const prevBest=bestTimeRef.current;
          const isRecord=survived>prevBest;
          if(isRecord) bestTimeRef.current=survived;
          setLastResult({survived,isRecord,prevBest});
          if(isRecord) setBestTime(survived);
          setAttemptNum(a=>a+1);
          phaseRef.current="done"; setPhase("done");
          stopMic(); return;
        }
      }

      g.pipes.forEach(p=>drawPipe(p.x,p.topH));

      g.particles.forEach(p=>{
        ctx.save(); ctx.globalAlpha=p.life*0.8;
        ctx.fillStyle="#A78BFA";
        ctx.beginPath(); ctx.arc(p.x,p.y,5*p.life,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.translate(VOZ_BIRD_X,g.birdY+g.squish*3);
      ctx.rotate(g.tilt);
      ctx.scale(1,1+Math.abs(g.squish)*0.12);
      if(isSpeakingRef.current&&ph==="playing"){ctx.shadowColor="#7C3AED";ctx.shadowBlur=14;}
      ctx.font="42px serif"; ctx.textAlign="center";
      ctx.fillText("🦋",0,16);
      ctx.restore();

      animRef.current=requestAnimationFrame(loop);
    };

    animRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(animRef.current);
  },[getRaw,stopMic]);

  useEffect(()=>()=>{stopMic();},[stopMic]);

  const getFeedback=(s:number)=>{
    if(s<10) return "¡Buen comienzo! Prueba hablar suavemente para subir y guardar silencio para bajar.";
    if(s<30) return "¡Muy bien! Ya estás aprendiendo a controlar tu voz durante la aventura.";
    if(s<60) return "¡Excelente control! Tu voz llevó al personaje muy lejos.";
    return "¡Increíble aventura! Mantuviste un gran control de tu voz durante todo el recorrido.";
  };

  if(phase==="done"&&lastResult){
    const stars=isFirstRef.current?15:0;
    if(isFirstRef.current) isFirstRef.current=false;
    const diff=lastResult.survived-lastResult.prevBest;
    return(
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex-1 rounded-2xl p-5" style={{background:"linear-gradient(135deg,#EDE9FE,#E0F2FE)"}}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">🦋</div>
            <h2 className="text-2xl font-black text-[#1C1135]">¡Buen intento!</h2>
            <p className="text-[#7C6F9A] font-medium text-sm">Tu aventura duró {lastResult.survived} segundo{lastResult.survived!==1?"s":""}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-2xl p-4 text-center border border-[#E8E5F4]">
              <p className="text-xs text-[#7C6F9A] font-medium mb-1">Tiempo</p>
              <p className="text-3xl font-black text-[#7C3AED]">{lastResult.survived}<span className="text-base ml-1">s</span></p>
            </div>
            <div className="bg-white rounded-2xl p-4 text-center border border-[#E8E5F4]">
              <p className="text-xs text-[#7C6F9A] font-medium mb-1">Mejor tiempo</p>
              <p className="text-3xl font-black text-[#0D9488]">{Math.max(lastResult.survived,lastResult.prevBest)}<span className="text-base ml-1">s</span></p>
            </div>
          </div>
          {lastResult.isRecord&&(
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-3 text-center">
              <p className="text-amber-700 font-extrabold text-sm">🏆 ¡Nuevo récord! Superaste tu mejor tiempo por {diff} segundo{diff!==1?"s":""}</p>
            </div>
          )}
          {stars>0?(
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-3 mb-3 text-center">
              <p className="text-violet-700 font-extrabold text-sm">⭐ +{stars} estrellas ganadas</p>
            </div>
          ):(
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3 mb-3 text-center">
              <p className="text-gray-500 text-xs">+0 estrellas · Ya recibiste la recompensa de esta actividad. Tu nuevo tiempo sí quedó registrado.</p>
            </div>
          )}
          <div className="bg-white rounded-2xl p-3 mb-3 border border-[#E8E5F4]">
            <p className="text-[#1C1135] font-medium text-sm text-center">{getFeedback(lastResult.survived)}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-[#7C6F9A] mb-4">
            <span>Intento #{attemptNum}</span><span>Mateo · Voz Aventura · Laboratorio de Juegos</span>
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={startCountdown} className="w-full py-3 rounded-2xl text-white font-extrabold text-base" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>🔄 Jugar de nuevo</button>
            <button onClick={()=>setP("pre")} className="w-full py-2.5 rounded-2xl font-bold text-sm text-[#7C6F9A] border border-[#E8E5F4] bg-white">Volver al Laboratorio</button>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div className="flex flex-col h-full gap-2">
      <div className="relative flex-1 rounded-2xl overflow-hidden" style={{minHeight:260}}>
        <canvas ref={canvasRef} width={VOZ_W} height={VOZ_H} className="w-full h-full block"
          style={{cursor: phase==="playing"&&inputMode==="touch"?"pointer":"default"}}
          onPointerDown={()=>{ if(phase==="playing"&&inputMode==="touch") touchHeldRef.current=true; }}
          onPointerUp={()=>{ touchHeldRef.current=false; }}
          onPointerLeave={()=>{ touchHeldRef.current=false; }}
        />

        {/* Countdown */}
        {phase==="countdown"&&(
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              {countdown>0
                ?<div className="text-8xl font-black text-white" style={{textShadow:"0 4px 24px rgba(0,0,0,0.35)"}}>{countdown}</div>
                :<div className="text-xl font-black text-white px-6 py-3 rounded-2xl" style={{background:"rgba(124,58,237,0.88)"}}>{inputMode==="touch"?"¡Toca para volar! 👆":"¡Habla para volar! 🎤"}</div>
              }
            </div>
          </div>
        )}

        {/* Playing HUD */}
        {phase==="playing"&&(
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
            <div className="bg-white/92 rounded-xl px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] text-[#7C6F9A] font-medium">Tiempo</p>
              <p className="text-xl font-black text-[#1C1135]">{survivedSecs}<span className="text-xs ml-0.5">s</span></p>
            </div>
            <div className="bg-white/92 rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm pointer-events-auto">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-20 h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all duration-75" style={{width:`${micPct}%`,background:isSpeaking?"#7C3AED":"#CBD5E1"}} />
                </div>
                <p className="text-[9px] font-bold" style={{color:isSpeaking?"#7C3AED":"#94A3B8"}}>
                  {inputMode==="touch"?(isSpeaking?"👆 Presionando":"👆 Suelta para bajar"):(isSpeaking?"🎤 Voz detectada":"🤫 Silencio")}
                </p>
              </div>
              <button onClick={()=>setP("paused")} className="ml-1 w-7 h-7 rounded-lg flex items-center justify-center text-xs bg-gray-100 text-gray-500">⏸</button>
            </div>
            <div className="bg-white/92 rounded-xl px-3 py-2 text-center shadow-sm">
              <p className="text-[10px] text-[#7C6F9A] font-medium">Récord</p>
              <p className="text-xl font-black text-[#0D9488]">{bestTime}<span className="text-xs ml-0.5">s</span></p>
            </div>
          </div>
        )}

        {/* Pause overlay */}
        {phase==="paused"&&(
          <div className="absolute inset-0 flex items-center justify-center" style={{background:"rgba(0,0,0,0.42)"}}>
            <div className="bg-white rounded-3xl p-6 w-60 text-center shadow-xl">
              <p className="text-xl font-black text-[#1C1135] mb-1">Juego en pausa</p>
              <p className="text-[#7C6F9A] text-sm mb-4">Tiempo: {survivedSecs}s</p>
              <div className="flex flex-col gap-2">
                <button onClick={()=>{lastTickRef.current=Date.now();setP("playing");}} className="py-2.5 rounded-2xl text-white font-extrabold text-sm" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>▶ Continuar</button>
                <button onClick={startCountdown} className="py-2 rounded-2xl font-bold text-sm text-[#7C6F9A] border border-[#E8E5F4]">🔄 Reiniciar</button>
                <button onClick={()=>{stopMic();setP("pre");}} className="py-2 rounded-2xl font-bold text-sm text-red-500 border border-red-100">Salir</button>
              </div>
            </div>
          </div>
        )}

        {/* Pre-game overlay */}
        {(["pre","requesting","allowed","blocked","calibrating","noisy"] as Phase[]).includes(phase)&&(
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-white/96 rounded-3xl p-5 w-full max-w-xs shadow-lg border border-[#E8E5F4]">
              {phase==="pre"&&(
                <>
                  <div className="text-center mb-3">
                    <h2 className="text-xl font-black text-[#1C1135]">Voz Aventura</h2>
                    <p className="text-[#7C6F9A] text-sm font-medium">¡Usa tu voz para volar!</p>
                  </div>
                  <div className="bg-violet-50 rounded-2xl p-3 mb-3 text-center border border-violet-100">
                    <p className="text-violet-700 text-sm font-semibold">Habla para subir · Silencio para bajar</p>
                  </div>
                  <div className="flex items-start gap-2 mb-3 text-xs text-[#7C6F9A] p-2.5 rounded-xl" style={{background:"#F8F7FF"}}>
                    <span className="mt-0.5">🔒</span>
                    <p>El micrófono se utiliza únicamente mientras juegas. No se guarda ni se reproduce tu voz.</p>
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <span className="text-[#7C6F9A] font-medium">Mejor tiempo:</span>
                    <span className="font-extrabold text-[#0D9488]">{bestTime}s · Mateo</span>
                  </div>
                  <button onClick={requestMic} className="w-full py-3 rounded-2xl text-white font-extrabold mb-2" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>🎤 Preparar micrófono</button>
                  <button onClick={startTouchMode} className="w-full py-2.5 rounded-2xl font-bold text-sm border border-[#E8E5F4] text-[#7C6F9A]">👆 Jugar tocando la pantalla</button>
                </>
              )}
              {phase==="requesting"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3 animate-pulse">🎤</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Solicitando permiso...</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Acepta el permiso del micrófono en tu navegador</p>
                  <button onClick={startTouchMode} className="py-2 rounded-xl text-xs font-bold text-[#7C6F9A] border border-[#E8E5F4] px-4">Saltar y jugar con toque</button>
                </div>
              )}
              {phase==="calibrating"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3">🔊</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Calibrando sonido...</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Guarda silencio un momento</p>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-violet-400 animate-pulse" style={{width:"65%"}} />
                  </div>
                </div>
              )}
              {phase==="noisy"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3">📢</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Entorno demasiado ruidoso</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Intenta jugar en un lugar más tranquilo, o usa el modo táctil.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={requestMic} className="py-2.5 rounded-2xl text-white font-extrabold text-sm" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>Intentar nuevamente</button>
                    <button onClick={startTouchMode} className="py-2 rounded-xl text-sm font-bold text-[#7C6F9A] border border-[#E8E5F4]">👆 Jugar con toque / teclado</button>
                    <button onClick={()=>setP("pre")} className="py-1.5 rounded-xl text-xs font-bold text-[#9E95B7]">Volver</button>
                  </div>
                </div>
              )}
              {phase==="blocked"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-3">🎤</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">Micrófono no disponible</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">No fue posible acceder al micrófono. Puedes igualmente jugar tocando la pantalla o con las teclas ↑ / Espacio.</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={startTouchMode} className="py-2.5 rounded-2xl text-white font-extrabold text-sm" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>👆 Jugar con toque / teclado</button>
                    <button onClick={requestMic} className="py-2 rounded-xl text-sm font-bold text-[#7C6F9A] border border-[#E8E5F4]">Intentar micrófono de nuevo</button>
                    <button onClick={()=>setP("pre")} className="py-1.5 rounded-xl text-xs font-bold text-[#9E95B7]">Volver</button>
                  </div>
                </div>
              )}
              {phase==="allowed"&&(
                <div className="text-center py-2">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="font-extrabold text-[#1C1135] mb-1">¡Micrófono listo!</p>
                  <p className="text-xs text-[#7C6F9A] mb-3">Di una palabra para confirmar que te escuchamos</p>
                  <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden mb-2">
                    <div className="h-full rounded-full transition-all duration-100" style={{width:`${micPct}%`,background:isSpeaking?"#7C3AED":"#CBD5E1"}} />
                  </div>
                  <p className="text-xs font-bold mb-4" style={{color:isSpeaking?"#7C3AED":"#94A3B8"}}>{isSpeaking?"✓ Voz detectada":"Habla ahora..."}</p>
                  <button onClick={startCountdown} className="w-full py-3 rounded-2xl text-white font-extrabold transition-all" style={{background:"linear-gradient(135deg,#7C3AED,#0D9488)"}}>
                    🚀 Comenzar aventura
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MundoAshaJuegos({ go }: { go: (v: View) => void }) {
  const [misterioModal, setMisterioModal] = useState(false);

  return (
    <div style={{ background: "linear-gradient(180deg, #E0F2FE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-blue-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🧠</span>
          <div>
            <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1">Juegos</p>
            <h1 className="text-3xl font-black text-white">Laboratorio de Juegos</h1>
            <p className="text-blue-100 text-sm font-medium mt-1">Mini juegos interactivos para aprender</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        {/* Game card */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden" style={{ height: "80vh", display: "flex", flexDirection: "column" }}>
          {/* Game navbar */}
          <div className="flex items-center gap-2 p-3 border-b border-[#E8E5F4] flex-shrink-0" style={{ background: "#F8F7FF" }}>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all"
              style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)", color: "white" }}
            >
              🎤 Voz Aventura
            </button>
            <button
              onClick={() => setMisterioModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all"
              style={{ background: "white", color: "#7C6F9A", border: "1.5px solid #E8E5F4" }}
            >
              🚀 Misterio Espacial
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: "#1E1B4B", color: "#A5B4FC" }}>En desarrollo</span>
            </button>
          </div>

          {/* Game area */}
          <div className="flex-1 overflow-hidden relative p-4">
            <VozAventuraGame />
          </div>
        </div>
      </div>

      {/* Misterio Espacial modal */}
      {misterioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMisterioModal(false)}>
          <div className="text-center p-8 rounded-3xl w-full max-w-sm" style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)" }} onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-black text-white mb-2">Misterio Espacial</h2>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold text-indigo-300 border border-indigo-500 mb-4">En desarrollo</span>
            <p className="text-sm text-indigo-200 font-medium leading-relaxed mb-6">
              Un juego de vocabulario galáctico donde descubrirás palabras en el cosmos. ¡Muy pronto disponible!
            </p>
            <button onClick={() => setMisterioModal(false)} className="w-full py-2.5 rounded-2xl font-extrabold text-sm text-indigo-300 border border-indigo-500">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
            <div key={m.name} className="bg-white rounded-3xl border border-[#E8E5F4] p-6 hover:shadow-md transition-all cursor-pointer">
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
            </div>
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
            <p className="text-orange-100 text-sm font-medium mt-1">Completá cada desafío y ganás la recompensa final</p>
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
export function PadreRecompensas({ go }: { go: (v: View) => void }) {
  return <MundoAshaHome go={go} />;
}
