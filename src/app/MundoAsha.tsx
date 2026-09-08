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
// ── Flappy Bird Component ──────────────────────────────────────────────────────
function VozAventuraGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const stateRef = useRef<{
    bird: { y: number; vy: number };
    pipes: { x: number; topH: number }[];
    score: number;
    frame: number;
    phase: "idle" | "running" | "dead";
    micLevel: number;
    keyHeld: boolean;
  }>({
    bird: { y: 0, vy: 0 },
    pipes: [],
    score: 0,
    frame: 0,
    phase: "idle",
    micLevel: 0,
    keyHeld: false,
  });

  const [phase, setPhase] = useState<"idle" | "running" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [inputMode, setInputMode] = useState<"mic" | "keyboard" | "detecting">("detecting");
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const CHARACTER = "🦊";
  const GRAVITY = 0.5;
  const THRUST = -7;
  const PIPE_W = 52;
  const GAP = 150;
  const PIPE_SPEED = 3;
  const MIC_THRESHOLD = 20;

  const startMic = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      ctx.createMediaStreamSource(stream).connect(analyser);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getMicLevel = useCallback(() => {
    if (!analyserRef.current) return 0;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);
    return data.reduce((s, v) => s + v, 0) / data.length;
  }, []);

  const startGame = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const H = canvas.height;
    let mode = inputMode;
    if (mode === "detecting") {
      const ok = await startMic();
      mode = ok ? "mic" : "keyboard";
      setInputMode(mode);
    } else if (mode === "mic") {
      await startMic();
    }
    stateRef.current = {
      bird: { y: H / 2, vy: 0 },
      pipes: [],
      score: 0,
      frame: 0,
      phase: "running",
      micLevel: 0,
      keyHeld: false,
    };
    setScore(0);
    setPhase("running");
  }, [startMic, inputMode]);

  const stopMic = useCallback(() => {
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  // Keyboard / touch flap for fallback mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.code === "Space") { e.preventDefault(); stateRef.current.keyHeld = true; } };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === "Space") stateRef.current.keyHeld = false; };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const BIRD_R = 24;

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, "#DBEAFE");
      sky.addColorStop(1, "#D1FAE5");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      if (s.phase === "idle") {
        ctx.font = "bold 18px Nunito, system-ui";
        ctx.fillStyle = "#1C1135";
        ctx.textAlign = "center";
        ctx.fillText("¡Habla para volar! 🎤", W / 2, H / 2 - 20);
        ctx.font = "14px Nunito, system-ui";
        ctx.fillStyle = "#7C6F9A";
        ctx.fillText("Presiona Iniciar y habla al micrófono", W / 2, H / 2 + 10);
        ctx.font = "40px serif";
        ctx.fillText(CHARACTER, W / 2 - 20, H / 2 + 70);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      if (s.phase === "dead") {
        ctx.font = "bold 26px Nunito, system-ui";
        ctx.fillStyle = "#1C1135";
        ctx.textAlign = "center";
        ctx.fillText("¡Fin del juego!", W / 2, H / 2 - 30);
        ctx.font = "bold 18px Nunito, system-ui";
        ctx.fillStyle = B.violet;
        ctx.fillText(`Puntuación: ${s.score}`, W / 2, H / 2 + 10);
        animRef.current = requestAnimationFrame(loop);
        return;
      }

      // Running phase
      s.frame++;
      const level = getMicLevel();
      s.micLevel = level;

      if (level > MIC_THRESHOLD || s.keyHeld) {
        s.bird.vy = THRUST;
      }
      s.bird.vy += GRAVITY;
      s.bird.y += s.bird.vy;

      // Spawn pipes
      if (s.frame % 90 === 0) {
        const topH = 60 + Math.random() * (H - GAP - 120);
        s.pipes.push({ x: W, topH });
      }

      // Move pipes
      s.pipes = s.pipes.map(p => ({ ...p, x: p.x - PIPE_SPEED })).filter(p => p.x > -PIPE_W);

      // Score
      s.pipes.forEach(p => {
        if (Math.round(p.x) === Math.round(W / 3 - PIPE_SPEED)) {
          s.score++;
          setScore(s.score);
        }
      });

      // Draw pipes
      const pipeGrad = ctx.createLinearGradient(0, 0, PIPE_W, 0);
      pipeGrad.addColorStop(0, "#16A34A");
      pipeGrad.addColorStop(1, "#22C55E");
      s.pipes.forEach(p => {
        ctx.fillStyle = pipeGrad;
        ctx.beginPath();
        ctx.roundRect(p.x, 0, PIPE_W, p.topH, [0, 0, 8, 8]);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(p.x, p.topH + GAP, PIPE_W, H - p.topH - GAP, [8, 8, 0, 0]);
        ctx.fill();
        // Cap
        ctx.fillStyle = "#15803D";
        ctx.fillRect(p.x - 4, p.topH - 14, PIPE_W + 8, 14);
        ctx.fillRect(p.x - 4, p.topH + GAP, PIPE_W + 8, 14);
      });

      // Draw bird
      ctx.font = `${BIRD_R * 2}px serif`;
      ctx.textAlign = "left";
      const bx = W / 3 - BIRD_R;
      const by = s.bird.y - BIRD_R;
      ctx.save();
      ctx.translate(bx + BIRD_R, by + BIRD_R);
      ctx.rotate(Math.max(-0.4, Math.min(0.4, s.bird.vy * 0.05)));
      ctx.fillText(CHARACTER, -BIRD_R, BIRD_R);
      ctx.restore();

      // Input indicator
      ctx.font = "11px Nunito, system-ui";
      ctx.fillStyle = "#7C6F9A";
      ctx.textAlign = "left";
      if (analyserRef.current) {
        const barW = Math.min(level * 2, 80);
        ctx.fillStyle = level > MIC_THRESHOLD ? "#22C55E" : "#9E95B7";
        ctx.fillRect(12, 12, barW, 8);
        ctx.strokeStyle = "#E8E5F4";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(12, 12, 80, 8);
        ctx.fillStyle = "#7C6F9A";
        ctx.fillText("🎤 voz", 100, 21);
      } else {
        ctx.fillStyle = s.keyHeld ? "#22C55E" : "#9E95B7";
        ctx.fillText("⌨ espacio / tap", 12, 21);
      }

      // Score display
      ctx.font = "bold 20px Nunito, system-ui";
      ctx.fillStyle = "#1C1135";
      ctx.textAlign = "right";
      ctx.fillText(`⭐ ${s.score}`, W - 12, 28);

      // Collision detection
      const birdLeft = bx;
      const birdRight = bx + BIRD_R * 2;
      const birdTop = by;
      const birdBottom = by + BIRD_R * 2;
      let dead = s.bird.y - BIRD_R < 0 || s.bird.y + BIRD_R > H;
      s.pipes.forEach(p => {
        if (birdRight > p.x + 4 && birdLeft < p.x + PIPE_W - 4) {
          if (birdTop < p.topH || birdBottom > p.topH + GAP) dead = true;
        }
      });

      if (dead) {
        s.phase = "dead";
        setPhase("dead");
        stopMic();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animRef.current); };
  }, [getMicLevel, stopMic]);

  useEffect(() => () => { stopMic(); }, [stopMic]);

  const restart = useCallback(() => {
    setPhase("idle");
    stateRef.current.phase = "idle";
    stateRef.current.pipes = [];
    stateRef.current.score = 0;
  }, []);

  const handleCanvasTap = () => {
    if (phase === "running") {
      stateRef.current.keyHeld = true;
      setTimeout(() => { stateRef.current.keyHeld = false; }, 200);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {inputMode === "keyboard" && (
        <div className="mb-2 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2" style={{ background: "#FEF3C7", color: "#92400E" }}>
          ⚠️ Micrófono no detectado · Usa <kbd className="px-1.5 py-0.5 rounded bg-amber-200 font-black">Espacio</kbd> o toca la pantalla para volar
        </div>
      )}
      <div
        className="relative flex-1 bg-gradient-to-b from-blue-50 to-emerald-50 rounded-2xl overflow-hidden"
        style={{ minHeight: 320, cursor: phase === "running" ? "pointer" : "default" }}
        onClick={handleCanvasTap}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={400}
          className="w-full h-full"
          style={{ display: "block" }}
        />
        {phase === "idle" && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={e => { e.stopPropagation(); startGame(); }}
              className="px-8 py-3 rounded-2xl text-white font-extrabold text-lg shadow-lg hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)" }}
            >
              {inputMode === "keyboard" ? "⌨ Iniciar" : "🎤 Iniciar"}
            </button>
          </div>
        )}
        {phase === "dead" && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button
              onClick={e => { e.stopPropagation(); restart(); setTimeout(startGame, 100); }}
              className="px-8 py-3 rounded-2xl text-white font-extrabold text-lg shadow-lg hover:scale-105 transition-transform"
              style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)" }}
            >
              🔄 Jugar de nuevo
            </button>
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-xs text-[#7C6F9A] font-medium">
          {inputMode === "keyboard" ? "⌨ Mantén espacio · toca pantalla para volar" : "🎤 Habla fuerte para subir · silencio para bajar"}
        </p>
        <p className="text-sm font-extrabold text-[#1C1135]">⭐ {score} puntos</p>
      </div>
    </div>
  );
}

export function MundoAshaJuegos({ go }: { go: (v: View) => void }) {
  const [activeGame, setActiveGame] = useState<"voz" | "misterio">("voz");

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
              onClick={() => setActiveGame("voz")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all"
              style={{
                background: activeGame === "voz" ? "linear-gradient(135deg, #7C3AED, #0D9488)" : "white",
                color: activeGame === "voz" ? "white" : "#7C6F9A",
                border: activeGame === "voz" ? "none" : "1.5px solid #E8E5F4",
              }}
            >
              🎤 Voz Aventura
            </button>
            <button
              onClick={() => setActiveGame("misterio")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all"
              style={{
                background: activeGame === "misterio" ? "linear-gradient(135deg, #1E1B4B, #312E81)" : "white",
                color: activeGame === "misterio" ? "white" : "#7C6F9A",
                border: activeGame === "misterio" ? "none" : "1.5px solid #E8E5F4",
              }}
            >
              🚀 Misterio Espacial
            </button>
          </div>

          {/* Game area */}
          <div className="flex-1 overflow-hidden relative p-4">
            {activeGame === "voz" && <VozAventuraGame />}
            {activeGame === "misterio" && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center p-8 rounded-3xl" style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)", maxWidth: 360 }}>
                  <div className="text-7xl mb-5">🚀</div>
                  <h2 className="text-2xl font-black text-white mb-3">¡Próximamente!</h2>
                  <p className="text-sm text-indigo-200 font-medium leading-relaxed mb-5">
                    Misterio Espacial es un juego de vocabulario galáctico donde descubrirás palabras en el cosmos. ¡Muy pronto disponible!
                  </p>
                  <span className="inline-block px-5 py-2 rounded-full text-xs font-extrabold text-indigo-300 border border-indigo-500">
                    En camino 🚀
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
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
