import { useState } from "react";
import {
  Search, Star, ChevronRight, ArrowRight, Check, X, Phone, Mail, Globe,
  MapPin, Clock, Heart, Users, Video, BookOpen, Sparkles, MessageCircle,
  PlayCircle, ChevronDown, Send, CheckCircle, Zap, Shield, Award,
} from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Isotipo, MobileTopBar, therapists } from "../shared";

// ─── Shared public nav ────────────────────────────────────────────────────────

export function PublicNav({ go, cur }: { go: (v: View) => void; cur: View }) {
  const [mob, setMob] = useState(false);
  const links: { label: string; view: View }[] = [
    { label: "Especialistas",  view: "public/especialistas" },
    { label: "Mundo ASHA",     view: "public/mundo" },
    { label: "Recursos",       view: "public/recursos" },
    { label: "Sobre Nosotros", view: "public/nosotros" },
  ];
  const mobileTitle = cur === "landing" ? "Inicio" : links.find((link) => link.view === cur)?.label ?? "AshaKids";
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur md:border-b md:border-[#E8E5F4]">
      <MobileTopBar title={mobileTitle} onMenu={() => setMob((value) => !value)} menuOpen={mob} />
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 items-center justify-between h-16">
        <button onClick={() => go("landing")} className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-transparent hover:border-[#E8E5F4] hover:shadow-sm transition-all">
          <Isotipo size={32} />
          <span className="font-extrabold text-[#1C1135] text-lg tracking-tight">AshaKids</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <button key={l.view} onClick={() => go(l.view)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${cur === l.view ? "text-violet-700 bg-violet-50" : "text-[#7C6F9A] hover:text-violet-700 hover:bg-violet-50"}`}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Btn variant="ghost" size="sm" onClick={() => go("login")}>Iniciar sesión</Btn>
          <Btn variant="cta"   size="sm" onClick={() => go("register")}>Crear Cuenta</Btn>
        </div>

      </div>
      {mob && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
          <aside className="w-[84vw] max-w-none h-[100dvh] flex flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200" style={{ paddingTop: "max(59px, env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3"><div className="flex items-center gap-2"><Isotipo size={38} /><span className="font-extrabold text-[#1C1135] text-sm">AshaKids</span></div><button type="button" onClick={() => setMob(false)} className="w-11 h-11 rounded-xl flex items-center justify-center text-[#7C6F9A] hover:bg-violet-50" aria-label="Cerrar menú"><X size={18} /></button></div>
            <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
              {links.map(l => <button key={l.view} onClick={() => { go(l.view); setMob(false); }} className={`w-full flex items-center px-3.5 py-2.5 rounded-2xl text-left text-sm font-bold transition-all ${cur === l.view ? "bg-violet-700 text-white shadow-sm shadow-violet-200" : "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700"}`}>{l.label}</button>)}
            </nav>
            <div className="shrink-0 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"><div className="grid grid-cols-2 gap-2"><Btn variant="outline" className="w-full justify-center" onClick={() => { go("login"); setMob(false); }}>Iniciar sesión</Btn><Btn variant="cta" className="w-full justify-center" onClick={() => { go("register"); setMob(false); }}>Crear Cuenta</Btn></div></div>
          </aside>
          <button type="button" aria-label="Cerrar menú" onClick={() => setMob(false)} className="flex-1" />
        </div>
      )}
    </nav>
  );
}

export function PublicFooter({ go }: { go: (v: View) => void }) {
  const cols = [
    { title: "Plataforma",  links: [{ l: "Especialistas", v: "public/especialistas" as View }, { l: "Mundo ASHA", v: "public/mundo" as View }, { l: "ASHI Intelligence", v: "public/ashi" as View }] },
    { title: "Empresa",     links: [{ l: "Sobre Nosotros", v: "public/nosotros" as View }, { l: "Historias", v: "public/historias" as View }, { l: "Trabaja con nosotros", v: "public/trabaja" as View }] },
    { title: "Soporte",     links: [{ l: "Centro de Ayuda", v: "public/ayuda" as View }, { l: "Contacto", v: "public/contacto" as View }] },
  ];
  return (
    <footer style={{ background: B.violetDeep }} className="text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Isotipo size={32} />
            <span className="font-extrabold text-lg">AshaKids</span>
          </div>
          <p className="text-sm font-medium opacity-70 leading-relaxed">Plataforma de terapia de lenguaje infantil virtual. Conectamos familias con especialistas certificados.</p>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <p className="font-extrabold text-sm mb-3 opacity-90">{col.title}</p>
            <div className="flex flex-col gap-2">
              {col.links.map(lk => (
                <button key={lk.l} onClick={() => go(lk.v)}
                  className="text-left text-sm opacity-60 hover:opacity-100 transition-opacity font-medium">{lk.l}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-6 py-4 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs opacity-50">
        <span>© 2026 ASHAKids. Todos los derechos reservados.</span>
        <span>Hecho con ❤️ para las familias</span>
      </div>
    </footer>
  );
}

// ─── 1. Especialistas ─────────────────────────────────────────────────────────

export function PublicEspecialistas({ go }: { go: (v: View) => void }) {
  const [search, setSearch]   = useState("");
  const [spec,   setSpec]     = useState("Todos");
  const specialties = ["Todos", "Lenguaje", "Fonología", "Articulación", "Comprensión", "Fluidez", "Comunicación"];
  const filtered = therapists.filter(t =>
    (spec === "Todos" || t.tags.some(tag => tag.toLowerCase().includes(spec.toLowerCase()))) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/especialistas" />
      {/* Hero */}
      <div className="py-12 px-4 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full mb-4" style={{ background: B.violetLight, color: B.violet }}>
          <Users size={12} /> {therapists.filter(t => t.available).length} especialistas disponibles ahora
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4 leading-tight">Encuentra al especialista en <span style={{ color: B.violet }}>terapia de lenguaje</span></h1>
        <p className="text-lg text-[#7C6F9A] font-medium mb-6">Especialistas en terapia de lenguaje infantil, verificados y con experiencia en atención virtual.</p>
        <div className="flex items-center gap-2 max-w-lg mx-auto bg-white rounded-2xl border border-[#E8E5F4] px-4 py-3 shadow-sm">
          <Search size={16} className="text-[#9E95B7]" />
          <input className="flex-1 bg-transparent text-sm font-medium focus:outline-none text-[#1C1135] placeholder:text-[#9E95B7]"
            placeholder="Buscar por nombre o especialidad…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="flex gap-2 flex-wrap">
            {specialties.map(s => (
              <button key={s} onClick={() => setSpec(s)}
                className="px-3 py-1.5 rounded-2xl text-xs font-bold transition-all"
                style={{ background: spec === s ? B.violet : B.violetLight, color: spec === s ? "white" : B.textMid }}>
                {s}
              </button>
            ))}
          </div>

        </div>
        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12 max-w-5xl mx-auto justify-items-center">
          {filtered.map(t => (
            <div key={t.id} className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E5F4] p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <Av initials={t.av} color={t.color} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-extrabold text-[#1C1135] text-sm">{t.name}</p>
                    {t.available && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[#7C6F9A] font-medium">{t.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-extrabold text-[#1C1135]">{t.rating}</span>
                    <span className="text-xs text-[#9E95B7]">({t.reviews} reseñas)</span>
                  </div>
                </div>
                <p className="font-black text-lg text-[#1C1135]">S/ {t.price}<span className="text-xs font-medium text-[#9E95B7]">/ses</span></p>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {t.tags.map(tag => <Bdg key={tag} color="violet">{tag}</Bdg>)}
                <Bdg color="gray">{t.experience}</Bdg>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Btn variant="secondary" size="sm" onClick={() => go("login")}><Video size={12} /> Ver perfil</Btn>
                <Btn variant="cta"       size="sm" onClick={() => go("login")}>Agendar</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 2. Especialidades ────────────────────────────────────────────────────────

export function PublicEspecialidades({ go }: { go: (v: View) => void }) {
  const [active, setActive] = useState(0);
  const specs = [
    { icon: "🗣️", title: "Lenguaje y Comunicación", color: B.violet, bg: B.violetLight,
      desc: "Intervención para niños que presentan dificultades en la expresión oral, el vocabulario, la comprensión y la comunicación funcional.",
      symptoms: ["Vocabulario limitado para su edad", "Dificultad para expresar ideas", "Comprensión verbal reducida", "Retrasos en el lenguaje"],
      benefits: ["Mayor capacidad de expresión oral", "Vocabulario activo ampliado", "Mejor comprensión de instrucciones", "Comunicación más fluida"],
      therapists: ["Dra. Ana Ruiz", "Dra. Lucía Vargas"] },
    { icon: "🔤", title: "Articulación y Pronunciación", color: B.teal, bg: B.tealLight,
      desc: "Trabajo específico sobre la producción correcta de sonidos, la claridad del habla y la inteligibilidad en la comunicación.",
      symptoms: ["Pronunciación poco clara", "Omisión o sustitución de sonidos", "Dificultad con sonidos complejos", "Habla difícil de entender"],
      benefits: ["Habla más clara e inteligible", "Producción correcta de sonidos", "Mayor confianza al hablar", "Comunicación efectiva con pares"],
      therapists: ["Lic. Pedro Sánchez", "Lic. Roberto Díaz"] },
    { icon: "🎵", title: "Fonología y Conciencia Fonológica", color: "#7C3AED", bg: "#F5F3FF",
      desc: "Desarrollo del sistema de sonidos del lenguaje y la conciencia fonológica, base para la lectura y escritura.",
      symptoms: ["Procesos fonológicos persistentes", "Dificultad para rimar o segmentar sílabas", "Confusión entre sonidos similares", "Habla simplificada"],
      benefits: ["Sistema fonológico organizado", "Base sólida para lectoescritura", "Discriminación auditiva mejorada", "Mayor precisión en el habla"],
      therapists: ["Dra. Ana Ruiz", "Lic. Roberto Díaz"] },
    { icon: "💬", title: "Fluidez del Habla", color: "#EC4899", bg: "#FDF2F8",
      desc: "Intervención para niños con tartamudez u otras disfluencias que afectan la fluidez y naturalidad de su comunicación.",
      symptoms: ["Repeticiones de sílabas o palabras", "Bloqueos al hablar", "Prolongaciones de sonidos", "Tensión visible al intentar hablar"],
      benefits: ["Habla más fluida y natural", "Estrategias de comunicación efectivas", "Mayor comodidad al expresarse", "Reducción de la tensión comunicativa"],
      therapists: ["Dra. María Torres"] },
    { icon: "📖", title: "Comprensión del Lenguaje", color: B.orange, bg: B.orangeLight,
      desc: "Trabajo sobre la comprensión de instrucciones, narrativas, conceptos y estructuras lingüísticas complejas.",
      symptoms: ["Dificultad para seguir instrucciones", "Comprensión literal limitada", "Problemas con narraciones", "Respuestas inapropiadas al contexto"],
      benefits: ["Mejor seguimiento de instrucciones", "Comprensión de textos e historias", "Mayor participación en conversaciones", "Lenguaje receptivo fortalecido"],
      therapists: ["Lic. Carlos Mendoza", "Dra. Lucía Vargas"] },
    { icon: "🧩", title: "Pragmática y Habilidades Sociales del Lenguaje", color: "#2563EB", bg: "#EFF6FF",
      desc: "Desarrollo del uso social del lenguaje: turnos conversacionales, adecuación al contexto e interacción comunicativa.",
      symptoms: ["Dificultad para iniciar o mantener conversaciones", "Respuestas fuera de contexto", "Uso rígido del lenguaje", "Poca adaptación al interlocutor"],
      benefits: ["Intercambios conversacionales más fluidos", "Uso contextual del lenguaje", "Mejor interacción con pares", "Comunicación social más efectiva"],
      therapists: ["Lic. Carlos Mendoza", "Dra. María Torres"] },
  ];
  const s = specs[active];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/especialidades" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Especialidades terapéuticas</h1>
          <p className="text-lg text-[#7C6F9A] font-medium">Cada niño es único. Encuentra el área de apoyo que tu hijo necesita.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="flex flex-col gap-3">
            {specs.map((sp, i) => (
              <button key={i} onClick={() => setActive(i)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                style={{ background: active === i ? sp.bg : "white", border: `1.5px solid ${active === i ? sp.color + "40" : B.border}` }}>
                <span className="text-2xl">{sp.icon}</span>
                <div>
                  <p className="font-extrabold text-sm text-[#1C1135]">{sp.title}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{sp.therapists.length} especialista{sp.therapists.length !== 1 ? "s" : ""}</p>
                </div>
                {active === i && <ChevronRight size={16} style={{ color: sp.color }} className="ml-auto" />}
              </button>
            ))}
          </div>
          {/* Detail */}
          <div className="lg:col-span-2">
            <Crd className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <h2 className="text-xl font-black text-[#1C1135]">{s.title}</h2>
                  <p className="text-sm text-[#7C6F9A] font-medium">{s.therapists.length} especialistas disponibles</p>
                </div>
              </div>
              <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-6">{s.desc}</p>
              <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto justify-items-center mb-6">
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Señales de alerta</p>
                  <div className="flex flex-col gap-2">
                    {s.symptoms.map((sym, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: s.color }} />
                        <p className="text-sm text-[#7C6F9A] font-medium">{sym}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Beneficios de la intervención</p>
                  <div className="flex flex-col gap-2">
                    {s.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: s.color }} />
                        <p className="text-sm text-[#7C6F9A] font-medium">{b}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Btn variant="cta" onClick={() => go("public/especialistas")}>Ver especialistas en {s.title} <ArrowRight size={14} /></Btn>
            </Crd>
          </div>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 3. Mundo ASHA público ────────────────────────────────────────────────────

export function PublicMundo({ go }: { go: (v: View) => void }) {
  const items = [
    { icon: "📖", cat: "Cuentos",       count: 48, color: B.violet,  bg: B.violetLight, desc: "Historias mágicas para desarrollar el lenguaje" },
    { icon: "🎵", cat: "Canciones",      count: 32, color: B.teal,    bg: B.tealLight,   desc: "Ritmos y melodías para la memoria y expresión" },
    { icon: "🎮", cat: "Juegos",         count: 56, color: B.orange,  bg: B.orangeLight, desc: "Actividades interactivas que estimulan el aprendizaje" },
    { icon: "💬", cat: "Trabalenguas",   count: 24, color: "#8B5CF6", bg: "#EDE9FE",     desc: "Ejercicios de articulación y pronunciación" },
    { icon: "🧩", cat: "Adivinanzas",    count: 40, color: "#EC4899", bg: "#FDF2F8",     desc: "Razonamiento y vocabulario en formato divertido" },
    { icon: "🎓", cat: "Academia ASHA",  count: 18, color: "#2563EB", bg: "#EFF6FF",     desc: "Lecciones interactivas por especialistas" },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/mundo" />
      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: `linear-gradient(135deg, ${B.violetLight}, ${B.tealLight})` }}>
        <span className="text-6xl block mb-4">🌎</span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4">Mundo ASHA</h1>
        <p className="text-lg text-[#7C6F9A] font-medium max-w-2xl mx-auto mb-6">Un universo de actividades diseñadas por terapeutas para hacer el aprendizaje una aventura increíble.</p>
        <div className="flex items-center justify-center gap-6 flex-wrap text-center mb-8">
          {[{ v: "6", l: "Áreas de actividad" }, { v: "Virtual", l: "Disponible siempre" }, { v: "🎯", l: "Diseñado por especialistas" }].map(s => (
            <div key={s.l}><p className="text-2xl font-black text-[#1C1135]">{s.v}</p><p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p></div>
          ))}
        </div>
        <Btn variant="cta" size="lg" onClick={() => go("login")}>Desbloquear Mundo ASHA <ArrowRight size={16} /></Btn>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 max-w-5xl mx-auto justify-items-center">
          {items.map(item => (
            <div key={item.cat} className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E8E5F4] hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 opacity-30" style={{ background: item.color }} />
              <span className="text-4xl block mb-4">{item.icon}</span>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-extrabold text-[#1C1135]">{item.cat}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: item.bg, color: item.color }}>{item.count} actividades</span>
              </div>
              <p className="text-sm text-[#7C6F9A] font-medium mb-4">{item.desc}</p>
              <Btn variant="secondary" size="sm" onClick={() => go("login")}>Desbloquear <ArrowRight size={12} /></Btn>
            </div>
          ))}
        </div>
        {/* CTA strip */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${B.violetDeep}, #1a3461)` }}>
          <h2 className="text-2xl font-black text-white mb-3">¿Listo para comenzar la aventura?</h2>
          <p className="text-sm font-medium mb-6" style={{ color: "rgba(255,255,255,.7)" }}>Regístrate gratis y accede a todo el Mundo ASHA desde el primer día.</p>
          <Btn variant="cta" size="lg" onClick={() => go("login")}>Crear cuenta gratuita</Btn>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 4. Recursos ─────────────────────────────────────────────────────────────

export function PublicRecursos({ go }: { go: (v: View) => void }) {
  const [cat, setCat] = useState("Todos");
  const [selectedResource, setSelectedResource] = useState<null | { icon: string; cat: string; title: string; mins: string; author: string }>(null);
  const cats = ["Todos", "Artículos", "Guías", "Videos", "Infografías"];
  const resources = [
    { icon: "📝", cat: "Artículos",   title: "Cómo apoyar el lenguaje de tu hijo en casa",             mins: "5 min", author: "Dra. Ana Ruiz"       },
    { icon: "📋", cat: "Guías",       title: "Guía completa para padres: Terapia de lenguaje",          mins: "12 min", author: "Equipo ASHAKids"     },
    { icon: "🎬", cat: "Videos",      title: "Ejercicios de soplo para practicar en casa",               mins: "8 min", author: "Dra. Ana Ruiz"       },
    { icon: "📊", cat: "Infografías", title: "Hitos del desarrollo del lenguaje 0-7 años",               mins: "3 min", author: "Equipo ASHAKids"     },
    { icon: "📝", cat: "Artículos",   title: "Señales de alerta en el desarrollo del lenguaje infantil",  mins: "7 min", author: "Lic. Carlos Mendoza" },
    { icon: "🎬", cat: "Videos",      title: "Cómo motivar a los niños durante la terapia de lenguaje",   mins: "10 min", author: "Dra. María Torres"  },
    { icon: "📋", cat: "Guías",       title: "Agenda terapéutica: Cómo organizarse con tu hijo",          mins: "6 min", author: "Equipo ASHAKids"     },
    { icon: "📊", cat: "Infografías", title: "Hitos del lenguaje oral: qué esperar en cada etapa",        mins: "4 min", author: "Lic. Roberto Díaz" },
  ];
  const filtered = cat === "Todos" ? resources : resources.filter(r => r.cat === cat);
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/recursos" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Centro de Recursos</h1>
          <p className="text-lg text-[#7C6F9A] font-medium">Artículos, guías y videos creados por nuestros especialistas para acompañar a las familias.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all"
              style={{ background: cat === c ? B.violet : B.violetLight, color: cat === c ? "white" : B.textMid }}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-5 auto-rows-fr max-w-4xl mx-auto justify-items-center">
          {filtered.map((r) => (
            <button key={r.title} type="button" onClick={() => setSelectedResource(r)}
              className="w-full max-w-md min-h-[154px] h-full rounded-3xl bg-white p-5 border border-[#E8E5F4] text-left hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-500 transition-all">
              <div className="flex h-full items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: B.violetLight }}>{r.icon}</div>
                <div className="flex h-full flex-1 flex-col">
                  <span className="text-xs font-bold text-violet-600 mb-1 block">{r.cat}</span>
                  <h3 className="font-extrabold text-sm text-[#1C1135] mb-2 leading-snug">{r.title}</h3>
                  <p className="mt-auto text-xs text-[#9E95B7] font-medium">{r.author} · {r.mins} de lectura</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="resource-preview-title">
            <button type="button" aria-label="Cerrar vista previa" onClick={() => setSelectedResource(null)} className="absolute inset-0 bg-[#1C1135]/55 backdrop-blur-sm" />
            <section className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8F6FF] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8E5F4] bg-white/95 px-5 sm:px-7 py-4 backdrop-blur">
                <div className="flex items-center gap-3 min-w-0"><span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: B.violetLight }}>📄</span><p className="text-sm font-extrabold text-[#1C1135] truncate">Vista previa del documento</p></div>
                <button type="button" onClick={() => setSelectedResource(null)} className="w-10 h-10 rounded-xl hover:bg-violet-50 flex items-center justify-center text-[#7C6F9A]" aria-label="Cerrar"><X size={20} /></button>
              </div>
              <article className="m-4 sm:m-7 rounded-2xl bg-white border border-[#E8E5F4] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-7"><span className="text-xs font-extrabold px-3 py-1.5 rounded-full" style={{ background: B.violetLight, color: B.violet }}>{selectedResource.cat}</span><span className="text-xs text-[#9E95B7] font-bold">PDF · {selectedResource.mins}</span></div>
                <h2 id="resource-preview-title" className="text-2xl sm:text-3xl font-black leading-tight text-[#1C1135] mb-3">{selectedResource.title}</h2>
                <p className="text-sm font-bold text-[#7C6F9A] mb-7">Por {selectedResource.author}</p>
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#51466F] font-medium">
                  <p>Esta vista previa resume recomendaciones prácticas para acompañar el desarrollo del lenguaje en casa, respetando el ritmo y las necesidades de cada niño.</p>
                  <p>Encontrarás ideas sencillas para integrar en la rutina familiar y preguntas que puedes conversar con el terapeuta durante el seguimiento.</p>
                </div>
                {selectedResource.cat === "Videos" && <a href="https://www.youtube.com/watch?v=ashakids-demo" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90" style={{ background: "#FF0000" }}><PlayCircle size={17} /> Ver video en YouTube</a>}
              </article>
            </section>
          </div>
        )}
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 5. Conoce ASHI ──────────────────────────────────────────────────────────

export function PublicAshi({ go }: { go: (v: View) => void }) {
  const personas = [
    { icon: "👨‍👩‍👧", title: "Para Familias",     color: B.violet,  convos: [
      { role: "user", text: "¿Puedes explicarme el último reporte de Mateo?" },
      { role: "ashi", text: "¡Claro! El reporte muestra que Mateo mejoró su articulación un 15% este mes. En palabras simples: está pronunciando mejor las palabras difíciles. 🌟" },
    ]},
    { icon: "👩‍⚕️", title: "Para Terapeutas",  color: B.teal,    convos: [
      { role: "user", text: "Ayúdame a redactar los objetivos para la próxima sesión de Bruno" },
      { role: "ashi", text: "Basándome en el historial de Bruno, propongo: (1) Ejercicios de soplo 10 min, (2) Lectura guiada nivel B, (3) Juego fonológico de sílabas. ¿Lo ajustamos?" },
    ]},
    { icon: "🛡️", title: "Para Administradores", color: B.orange, convos: [
      { role: "user", text: "¿Cuáles son las tendencias de este mes?" },
      { role: "ashi", text: "Detecté 3 tendencias clave: sesiones virtuales +18%, hora pico 9-11 AM, y 89% retención en pacientes con 4+ sesiones. Recomiendo ampliar disponibilidad matutina." },
    ]},
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/ashi" />
      {/* Hero */}
      <div className="py-16 px-4 text-center" style={{ background: `linear-gradient(135deg, #0a7a71, ${B.violetDeep})` }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,255,255,.15)" }}>
          <Sparkles size={36} color="white" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">ASHI Intelligence</h1>
        <p className="text-lg max-w-2xl mx-auto mb-8 font-medium" style={{ color: "rgba(255,255,255,.8)" }}>
          La inteligencia artificial que acompaña a toda la plataforma. No es un chatbot — es un copiloto que observa, anticipa y ayuda.
        </p>
        <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
          {[{ v: "24/7", l: "Disponible siempre" }, { v: "👨‍👩‍👧 👩‍⚕️ 🛡️", l: "Adapta su rol" }, { v: "🔒", l: "Datos privados" }].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-2xl font-black text-white">{s.v}</p>
              <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,.65)" }}>{s.l}</p>
            </div>
          ))}
        </div>
        <Btn variant="cta" size="lg" onClick={() => go("login")}>Probar ASHI ahora</Btn>
      </div>
      {/* Demo conversations */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-3">ASHI se adapta a cada usuario</h2>
        <p className="text-center text-[#7C6F9A] font-medium mb-10">Diferente contexto, diferente experiencia. Siempre la más útil.</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto justify-items-center">
          {personas.map(p => (
            <Crd key={p.title} className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" style={{ background: `${p.color}15` }}>{p.icon}</div>
                <h3 className="font-extrabold text-[#1C1135]">{p.title}</h3>
              </div>
              <div className="flex flex-col gap-3">
                {p.convos.map((c, i) => (
                  <div key={i} className={`flex gap-2 ${c.role === "user" ? "flex-row-reverse" : ""}`}>
                    {c.role === "ashi" && (
                      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #0D9488, ${p.color})` }}>
                        <Sparkles size={10} color="white" />
                      </div>
                    )}
                    <div className="max-w-[85%] rounded-2xl px-3 py-2 text-xs font-medium leading-relaxed"
                      style={c.role === "ashi"
                        ? { background: `${p.color}10`, color: "#1C1135", borderTopLeftRadius: 4 }
                        : { background: `linear-gradient(135deg, #0D9488, ${p.color})`, color: "white", borderTopRightRadius: 4 }}>
                      {c.text}
                    </div>
                  </div>
                ))}
              </div>
            </Crd>
          ))}
        </div>
        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto justify-items-center">
          {[
            { icon: <Zap size={20} />,          title: "Proactivo",          desc: "Anticipa necesidades antes de que preguntes" },
            { icon: <Shield size={20} />,        title: "Privado y seguro",   desc: "Tus datos nunca salen de la plataforma" },
            { icon: <BookOpen size={20} />,      title: "Basado en evidencia",desc: "Respuestas con base clínica y terapéutica" },
            { icon: <MessageCircle size={20} />, title: "Siempre disponible", desc: "24 horas al día, 7 días a la semana" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-4 border border-[#E8E5F4] text-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: B.violetLight, color: B.violet }}>{f.icon}</div>
              <p className="font-extrabold text-sm text-[#1C1135] mb-1">{f.title}</p>
              <p className="text-xs text-[#7C6F9A] font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 6. Historias de Familias ─────────────────────────────────────────────────

export function PublicHistorias({ go }: { go: (v: View) => void }) {
  const stories = [
    { name: "Laura G.", child: "Mateo, 7 años", specialty: "Terapia del Lenguaje", av: "LG", color: B.violet,
      text: "Desde que comenzamos con la terapia de lenguaje, Mateo participa más en clase y se expresa con mayor soltura. La plataforma nos facilita el seguimiento y la comunicación con la terapeuta.",
      before: "Pronunciación confusa, poca participación oral", after: "Mayor expresión y participación en clase" },
    { name: "Carlos y Patricia R.", child: "Bruno, 9 años", specialty: "Terapia del Lenguaje", av: "CP", color: B.teal,
      text: "El acompañamiento de la terapeuta y las actividades de Mundo ASHA han sido un complemento valioso. Apreciamos poder ver el avance de Bruno de forma organizada y accesible.",
      before: "Dificultades en la comunicación oral", after: "Mayor claridad y fluidez en el habla" },
    { name: "Rosa L.", child: "Valentina, 5 años", specialty: "Terapia del Lenguaje", av: "RL", color: "#EC4899",
      text: "La Dra. María diseñó un plan de fonología muy adaptado a Valentina. El apoyo de ASHI para recordarme los ejercicios en casa ha sido de gran ayuda para mantener la continuidad.",
      before: "Dificultades fonológicas y de articulación", after: "Progreso sostenido en la pronunciación" },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/historias" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Historias ilustrativas</h1>
          <p className="text-lg text-[#7C6F9A] font-medium mb-3">Ejemplos de cómo las familias acompañan el proceso terapéutico en ASHAKids.</p>
          <span className="inline-block text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: B.orangeLight, color: B.orange }}>
            ⚠️ Ejemplos ficticios para el prototipo · No representan casos reales
          </span>
        </div>
        <div className="grid gap-6 mb-12">
          {stories.map((s, i) => (
            <Crd key={i} className="p-6">
              <div className="flex items-start gap-5 flex-wrap">
                <Av initials={s.av} color={s.color} size="xl" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <p className="font-extrabold text-[#1C1135]">{s.name}</p>
                    <span className="text-xs font-bold text-[#9E95B7]">{s.child}</span>
                  </div>
                  <p className="text-xs font-bold text-violet-600 mb-3">{s.specialty}</p>
                  <p className="text-sm text-[#7C6F9A] font-medium leading-relaxed mb-4 italic">"{s.text}"</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl p-3" style={{ background: "#FEE2E2" }}>
                      <p className="text-xs font-extrabold text-red-600 mb-1">Situación inicial</p>
                      <p className="text-xs text-red-700 font-medium">{s.before}</p>
                    </div>
                    <div className="rounded-2xl p-3" style={{ background: "#D1FAE5" }}>
                      <p className="text-xs font-extrabold text-emerald-600 mb-1">Evolución observada</p>
                      <p className="text-xs text-emerald-700 font-medium">{s.after}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Crd>
          ))}
        </div>
        <div className="rounded-3xl p-8 text-center" style={{ background: B.violetLight }}>
          <h2 className="text-2xl font-black text-[#1C1135] mb-2">Acompaña el desarrollo del lenguaje de tu hijo</h2>
          <p className="text-sm text-[#7C6F9A] font-medium mb-5">Regístrate y accede a especialistas en terapia de lenguaje, seguimiento personalizado y Mundo ASHA.</p>
          <Btn variant="cta" size="lg" onClick={() => go("login")}>Comenzar ahora <ArrowRight size={16} /></Btn>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 7. Sobre Nosotros ────────────────────────────────────────────────────────

export function PublicNosotros({ go }: { go: (v: View) => void }) {
  const team = [
    { name: "Ing. Amparito Maximiliano", role: "CEO & Fundadora",          av: "AM", color: B.violet  },
    { name: "Ing. Sergio Roman",         role: "Director del Proyecto",     av: "SR", color: B.teal    },
    { name: "Nicolás Lavado",            role: "Desarrollador Backend",     av: "NL", color: "#2563EB" },
    { name: "Piero Anticona",            role: "Desarrollador Frontend",    av: "PA", color: "#EC4899" },
    { name: "Fabricio del Castillo",     role: "Arquitectura y datos",      av: "FC", color: B.orange  },
  ];
  const values = [
    { icon: "❤️",  title: "Calidez",       desc: "Cada interacción debe sentirse humana y cercana"      },
    { icon: "🔬",  title: "Evidencia",      desc: "Todo lo que hacemos tiene base científica"             },
    { icon: "🌱",  title: "Crecimiento",    desc: "Creemos en el potencial de cada niño"                  },
    { icon: "🔐",  title: "Privacidad",     desc: "Los datos de las familias son sagrados"                },
    { icon: "🤝",  title: "Confianza",      desc: "Construimos relaciones a largo plazo"                  },
    { icon: "✨",  title: "Innovación",     desc: "La tecnología al servicio del bienestar"               },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/nosotros" />
      {/* Hero */}
      <div className="py-16 px-4 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-5">Nuestra misión es <span style={{ color: B.violet }}>acompañar a cada niño</span></h1>
        <p className="text-lg text-[#7C6F9A] font-medium leading-relaxed">ASHAKids nació en 2024 con una idea simple: los niños que necesitan apoyo terapéutico deberían tener acceso a los mejores especialistas, sin importar dónde vivan.</p>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        {/* Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {[{ v: "🗣️", l: "Terapia de lenguaje" }, { v: "🎯", l: "Seguimiento personalizado" }, { v: "🌎", l: "Atención virtual" }, { v: "🔒", l: "Privacidad familiar" }].map(s => (
            <div key={s.l} className="bg-white rounded-2xl p-5 text-center border border-[#E8E5F4]">
              <p className="text-3xl font-black text-[#1C1135] mb-1" style={{ color: B.violet }}>{s.v}</p>
              <p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p>
            </div>
          ))}
        </div>
        {/* Values */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Nuestros valores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-12">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-2xl p-4 border border-[#E8E5F4]">
              <span className="text-3xl block mb-2">{v.icon}</span>
              <p className="font-extrabold text-[#1C1135] mb-1">{v.title}</p>
              <p className="text-xs text-[#7C6F9A] font-medium">{v.desc}</p>
            </div>
          ))}
        </div>
        {/* Team */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Equipo fundador</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto justify-items-center">
          {team.map(t => (
            <div key={t.name} className="w-full max-w-xs min-h-[190px] bg-white rounded-2xl p-6 border border-[#E8E5F4] flex flex-col items-center justify-center text-center">
              <div className="flex w-full justify-center mb-4"><Av initials={t.av} color={t.color} size="xl" /></div>
              <p className="w-full font-extrabold text-[#1C1135] leading-snug">{t.name}</p>
              <p className="w-full text-xs text-[#7C6F9A] font-medium mt-1">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 8. Planes y Precios ──────────────────────────────────────────────────────

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

// ─── 9. Centro de Ayuda ───────────────────────────────────────────────────────

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

// ─── 10. Contacto ─────────────────────────────────────────────────────────────

export function PublicContacto({ go }: { go: (v: View) => void }) {
  const [form, setForm] = useState({ name: "", email: "", msg: "" });
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/contacto" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Contáctanos</h1>
          <p className="text-lg text-[#7C6F9A] font-medium">Estamos aquí para ayudarte. Intentamos responder en menos de 24 horas hábiles.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <Crd className="p-6">
            <h3 className="font-extrabold text-[#1C1135] mb-5">Envíanos un mensaje</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Nombre completo</label>
                <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                  placeholder="Tu nombre" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Correo electrónico</label>
                <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                  placeholder="tu@correo.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Mensaje</label>
                <textarea className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400 resize-none"
                  rows={4} placeholder="¿En qué podemos ayudarte?" value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))} />
              </div>
              <Btn variant="cta" onClick={() => {}} className="justify-center"><Send size={14} /> Enviar mensaje</Btn>
            </div>
          </Crd>
          {/* Info */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <Mail size={20} />,    label: "Email",     val: "hola@ashakids.com",   color: B.violet },
              { icon: <Phone size={20} />,   label: "WhatsApp",  val: "+1 (555) 123-4567",   color: "#25D366" },
              { icon: <Globe size={20} />,   label: "Sitio web", val: "www.ashakids.com",     color: B.teal   },
              { icon: <Clock size={20} />,   label: "Horario",   val: "Lun–Vie 9:00–18:00",  color: B.orange  },
              { icon: <MapPin size={20} />,  label: "Ubicación", val: "Ciudad de México, MX", color: "#EC4899" },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-4 border border-[#E8E5F4] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${c.color}15`, color: c.color }}>{c.icon}</div>
                <div>
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{c.label}</p>
                  <p className="font-bold text-[#1C1135] text-sm">{c.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}

// ─── 11. Trabaja con Nosotros ─────────────────────────────────────────────────

export function PublicTrabaja({ go }: { go: (v: View) => void }) {
  const [form, setForm] = useState({ name: "", email: "", specialty: "", years: "" });
  const benefits = [
    { icon: "⏱️", title: "Horarios flexibles",      desc: "Define tu disponibilidad y gestiona tu agenda desde la plataforma." },
    { icon: "🌍", title: "Atención virtual",         desc: "Atiende a tus pacientes desde cualquier lugar mediante ASHA Session." },
    { icon: "🤖", title: "ASHI como copiloto",       desc: "Asistente inteligente que te ayuda con reportes, objetivos y preparación de sesiones." },
    { icon: "📁", title: "Gestión organizada",       desc: "Historial de pacientes, agenda, reportes y comunicación en un solo lugar." },
    { icon: "📚", title: "Desarrollo profesional",   desc: "Accede a recursos clínicos y a una comunidad de especialistas en lenguaje." },
    { icon: "🛡️", title: "Plataforma estructurada", desc: "Entorno profesional con soporte técnico y gestión de pagos integrada." },
  ];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/trabaja" />
      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: `linear-gradient(135deg, ${B.violetLight}, ${B.tealLight})` }}>
        <span className="text-5xl block mb-4">👩‍⚕️</span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4">Únete a nuestro equipo de especialistas</h1>
        <p className="text-lg text-[#7C6F9A] font-medium max-w-2xl mx-auto mb-6">Ayuda a más familias, con más flexibilidad y mejores herramientas. ASHAKids es el lugar donde los mejores terapeutas crecen.</p>
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[{ v: "🗣️", l: "Terapia de lenguaje" }, { v: "🌐", l: "Sesiones virtuales" }, { v: "🤝", l: "Familias acompañadas" }].map(s => (
            <div key={s.l}><p className="text-2xl font-black text-[#1C1135]">{s.v}</p><p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p></div>
          ))}
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Benefits */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">¿Por qué unirte a ASHAKids?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12 max-w-5xl mx-auto justify-items-center">
          {benefits.map(b => (
            <div key={b.title} className="w-full max-w-sm bg-white rounded-2xl p-5 border border-[#E8E5F4]">
              <span className="text-3xl block mb-3">{b.icon}</span>
              <p className="font-extrabold text-[#1C1135] mb-1">{b.title}</p>
              <p className="text-sm text-[#7C6F9A] font-medium">{b.desc}</p>
            </div>
          ))}
        </div>
        {/* Process */}
        <h2 className="text-2xl font-black text-[#1C1135] text-center mb-6">Proceso de postulación</h2>
        <div className="grid sm:grid-cols-4 gap-4 mb-12">
          {["Completa el formulario", "Revisión de credenciales", "Entrevista con nuestro equipo", "¡Bienvenido a ASHAKids!"].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 font-extrabold text-white text-sm" style={{ background: B.violet }}>{i + 1}</div>
              <p className="text-sm font-extrabold text-[#1C1135]">{step}</p>
            </div>
          ))}
        </div>
        {/* Form */}
        <Crd className="p-6 max-w-lg mx-auto">
          <h3 className="font-extrabold text-[#1C1135] mb-5 text-center">Comenzar postulación</h3>
          <div className="flex flex-col gap-4">
            {[
              { key: "name",      label: "Nombre completo",      ph: "Lic. Ana García"     },
              { key: "email",     label: "Correo electrónico",   ph: "ana@email.com"        },
              { key: "specialty", label: "Especialidad principal",ph: "Terapia del Lenguaje" },
              { key: "years",     label: "Años de experiencia",  ph: "5 años"               },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">{f.label}</label>
                <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                  placeholder={f.ph} value={(form as Record<string, string>)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <Btn variant="cta" onClick={() => {}} className="justify-center"><Send size={14} /> Enviar postulación</Btn>
          </div>
        </Crd>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
