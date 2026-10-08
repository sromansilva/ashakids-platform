import { useState } from "react";
import { ChevronRight, Download, X, Star } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, kids, Ashi } from "@/components/shared";
import { useChild } from "@/context/ChildContext";
import { getAvatarInfo } from "@/config/avatars";

// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────

const OBJETIVOS_DEMO = [
  { nombre: "Pronunciación de la R", estado: "En progreso", prioridad: "Alta", terapeuta: "Dra. Ana Ruiz", meta: "agosto de 2026", pct: 78, recomendacion: "Practicar 10 minutos al día con cuentos" },
  { nombre: "Comprensión verbal", estado: "En progreso", prioridad: "Alta", terapeuta: "Dra. Ana Ruiz", meta: "septiembre de 2026", pct: 65, recomendacion: "Utilizar tarjetas de imágenes" },
  { nombre: "Vocabulario expresivo", estado: "Completado", prioridad: "Media", terapeuta: "Dra. Ana Ruiz", meta: "junio de 2026", pct: 90, recomendacion: "Mantener con lectura diaria" },
];

const ACTIVIDADES_PENDIENTES = [
  { cat: "Cuentos", nombre: "El osito viajero", objetivo: "Comprensión verbal", terapeuta: "Dra. Ana Ruiz", asignada: "28 Jul 2026", freq: "3 veces por semana", estado: "Pendiente", mundoAsha: true },
  { cat: "Trabalenguas", nombre: "Trabalenguas nivel 2", objetivo: "Pronunciación /r/", terapeuta: "Dra. Ana Ruiz", asignada: "30 Jul 2026", freq: "Diario", estado: "Iniciada", mundoAsha: false },
];

const ACTIVIDADES_HIST = [
  { fecha: "30 Jul 2026", cat: "Cuentos", nombre: "El osito viajero", origen: "Sesión", objetivo: "Comprensión verbal", estado: "Completada", resultado: "8/10 correctas", obs: "Excelente comprensión de secuencias" },
  { fecha: "28 Jul 2026", cat: "Canciones", nombre: "La canción del arcoíris", origen: "Mundo ASHA", objetivo: "Vocabulario expresivo", estado: "Completada", resultado: "10/10 correctas", obs: "Disfrutó mucho la actividad" },
  { fecha: "25 Jul 2026", cat: "Adivinanzas", nombre: "¿Qué animal soy?", origen: "Casa", objetivo: "Comprensión verbal", estado: "Parcial", resultado: "5/8 correctas", obs: "Necesita más práctica con categorías" },
  { fecha: "22 Jul 2026", cat: "Trabalenguas", nombre: "Trabalenguas nivel 2", origen: "Sesión", objetivo: "Pronunciación /r/", estado: "Completada", resultado: "7/10 correctas", obs: "Mejora progresiva" },
  { fecha: "20 Jul 2026", cat: "Cuentos", nombre: "El León y el Ratón", origen: "Sesión", objetivo: "Comprensión verbal", estado: "Completada", resultado: "9/10 correctas", obs: "Muy buena participación" },
  { fecha: "18 Jul 2026", cat: "Juegos", nombre: "Voz aventura", origen: "Mundo ASHA", objetivo: "Fluidez", estado: "Completada", resultado: "12 puntos", obs: "Alta motivación" },
];

const SESIONES_DEMO = [
  { fecha: "28 Jul 2026", duracion: "45 min", modalidad: "Virtual", tema: "Trabalenguas /r/", estado: "Completada", terapeuta: "Dra. Ana Ruiz",
    objetivos: ["Pronunciación /r/", "Fluidez del habla"], actividades: ["Trabalenguas nivel 2", "Voz aventura"],
    avances: "Mejora notable en la pronunciación del fonema /r/ en posición media.", recomendaciones: "Practicar 5 minutos diarios con trabalenguas.",
    resumen: "Sesión productiva. El niño mostró alta motivación y participación activa." },
  { fecha: "20 Jul 2026", duracion: "45 min", modalidad: "Virtual", tema: "Comprensión verbal", estado: "Completada", terapeuta: "Dra. Ana Ruiz",
    objetivos: ["Comprensión verbal"], actividades: ["El osito viajero", "¿Qué animal soy?"],
    avances: "Mayor velocidad en respuesta a instrucciones de dos pasos.", recomendaciones: "Usar tarjetas de imágenes en casa.",
    resumen: "El niño logró seguir instrucciones de dos pasos con apoyo mínimo." },
];

const REPORTES_DEMO = [
  { titulo: "Reporte de progreso — Julio/Agosto 2026", tipo: "Progreso", periodo: "1 Jul – 31 Ago 2026", publicado: "2 Sep 2026", terapeuta: "Dra. Ana Ruiz",
    resumen: "Avance significativo en pronunciación /r/ (60%→78%). Comprensión verbal en progreso. Se recomienda continuar con actividades de práctica diaria." },
  { titulo: "Reporte de cierre — Vocabulario expresivo", tipo: "Cierre", periodo: "Mar – Jun 2026", publicado: "5 Jul 2026", terapeuta: "Dra. Ana Ruiz",
    resumen: "Objetivo alcanzado al 90%. El niño domina vocabulario básico de categorías. Se cierra el objetivo." },
];

const NOTAS_COMPARTIDAS = [
  { titulo: "Nota de sesión", fecha: "28 Jul 2026", terapeuta: "Dra. Ana Ruiz", sesion: "28 Jul 2026", contenido: "Mateo mostró gran entusiasmo durante la sesión. Recomiendo continuar con actividades lúdicas relacionadas con el fonema /r/ en casa." },
  { titulo: "Comunicación con la familia", fecha: "20 Jul 2026", terapeuta: "Dra. Ana Ruiz", sesion: "20 Jul 2026", contenido: "Es importante mantener la práctica diaria. Los 10 minutos de lectura en voz alta están ayudando mucho." },
];

type CaminoTab = "resumen" | "objetivos" | "actividades" | "sesiones" | "logros" | "notas" | "reportes" | "bienestar";

export function MiCaminoAsha({ go, padrePlan = "familia" }: { go: (v: View) => void; padrePlan?: "exploracion" | "familia" }) {
  const [tab, setTab] = useState<CaminoTab>("resumen");
  const [reportViewId, setReportViewId] = useState<number | null>(null);
  const [actFilter, setActFilter] = useState("todas");
  const [openSession, setOpenSession] = useState<number | null>(null);
  // Period selector state
  const [periodoMode, setPeriodoMode] = useState<"actual"|"historial">("actual");
  const [historialRango, setHistorialRango] = useState<"30d"|"3m"|"custom">("30d");
  const [periodoDesde, setPeriodoDesde] = useState("");
  const [periodoHasta, setPeriodoHasta] = useState("");
  // New tab state
  const [actSubTab, setActSubTab] = useState<"pendientes"|"historial">("pendientes");
  const [actHistFilter, setActHistFilter] = useState("Todas");
  const [expandedSesion, setExpandedSesion] = useState<number|null>(null);
  const [reporteAbierto, setReporteAbierto] = useState<null|typeof REPORTES_DEMO[0]>(null);

  const isExploracion = padrePlan === "exploracion";
  const ALLOWED_CATS = ["cuentos", "canciones", "adivinanzas"];

  const { activeChild } = useChild();

  const child = activeChild
    ? {
        name: activeChild.nombres,
        fullName: `${activeChild.nombres} ${activeChild.apellidos}`,
        age: activeChild.edad_anios,
        avatarNombre: activeChild.avatar_nombre,
        emoji: getAvatarInfo(activeChild.avatar_nombre).fallbackIcon,
        bg: "#EDE9FE",
      }
    : {
        name: kids[0].name,
        fullName: `${kids[0].name} Gómez`,
        age: kids[0].age,
        avatarNombre: "zorro",
        emoji: kids[0].emoji,
        bg: kids[0].bg,
      };
  const avatarInfo = getAvatarInfo(child.avatarNombre);

  const caminoTabs: { id: CaminoTab; icon: string; label: string }[] = [
    { id: "resumen",     icon: "📈", label: "Resumen"     },
    { id: "objetivos",   icon: "🎯", label: "Objetivos"   },
    { id: "actividades", icon: "📚", label: "Actividades" },
    { id: "sesiones",    icon: "🎥", label: "Sesiones"    },
    { id: "logros",      icon: "🏅", label: "Logros"      },
    { id: "notas",       icon: "💬", label: "Notas"       },
    { id: "reportes",    icon: "📋", label: "Reportes"    },
    { id: "bienestar",   icon: "❤️", label: "Bienestar"   },
  ];

  const milestones = [
    { icon: "🌱", title: "Inicio en ASHAKids",         date: "10 Ene 2026", desc: "Primer acceso y configuración del perfil.", done: true  },
    { icon: "🎥", title: "Primera sesión",              date: "15 Ene 2026", desc: "Terapia del Lenguaje con Dra. Ana Ruiz.", done: true  },
    { icon: "📚", title: "Primer cuento",               date: "20 Ene 2026", desc: '"El Osito Viajero" completado.', done: true  },
    { icon: "🏅", title: "Primera insignia",            date: "25 Ene 2026", desc: "«Explorador Valiente» desbloqueada.", done: true  },
    { icon: "🗣️", title: "Pronunciación R",            date: "12 Feb 2026", desc: "Avance del 40% en fonología.", done: true  },
    { icon: "🎉", title: "Objetivo alcanzado",          date: "5 Mar 2026",  desc: "Plan de lenguaje mensual completado.", done: true  },
    { icon: "📖", title: "10 cuentos completados",      date: "18 Abr 2026", desc: "Insignia «Lector Estrella» ganada.", done: true  },
    { icon: "🔥", title: "Racha de 7 días",             date: "22 Jun 2026", desc: "7 días consecutivos de actividades.", done: true  },
    { icon: "🚀", title: "Comprensión avanzada",        date: "Ago 2026",    desc: "Próxima meta en comprensión verbal.", done: false },
  ];


  const objectives = [
    { title: "Pronunciación de la R", pct: 78, status: "en progreso", priority: "alta",   date: "Ago 2026",  therapist: "Dra. Ana Ruiz",       rec: "Practicar 10 min/día con cuentos."        },
    { title: "Comprensión verbal",    pct: 65, status: "en progreso", priority: "alta",   date: "Sep 2026",  therapist: "Dra. Ana Ruiz",       rec: "Usar tarjetas de imágenes."               },
    { title: "Vocabulario expresivo", pct: 90, status: "completado",  priority: "media",  date: "Jun 2026",  therapist: "Dra. Ana Ruiz",       rec: "Mantener con lectura diaria."             },
  ];

  const activities = [
    { title: "El Osito Viajero",         category: "cuentos",       date: "28 Jul 2026", duration: "12 min", score: 95, icon: "📖" },
    { title: "La Canción del Arcoíris",  category: "canciones",     date: "27 Jul 2026", duration: "8 min",  score: 88, icon: "🎵" },
    { title: "¿Qué animal soy?",         category: "adivinanzas",   date: "26 Jul 2026", duration: "10 min", score: 100, icon: "🧩"},
    { title: "Trabalenguas nivel 2",     category: "trabalenguas",  date: "25 Jul 2026", duration: "6 min",  score: 72, icon: "🗣️"},
    { title: "El León y el Ratón",       category: "cuentos",       date: "24 Jul 2026", duration: "14 min", score: 91, icon: "📖" },
    { title: "Puzzle de animales",       category: "juegos",        date: "23 Jul 2026", duration: "15 min", score: 85, icon: "🎮" },
  ];

  const sessions = [
    { id: 1, date: "30 Jul 2026", time: "10:00 AM", duration: "45 min", therapist: "Dra. Ana Ruiz", type: "virtual", goals: ["Pronunciación R", "Comprensión verbal"], comment: "Excelente progreso en R inicial. Practica en casa con los ejercicios enviados." },
    { id: 2, date: "23 Jul 2026", time: "10:00 AM", duration: "45 min", therapist: "Dra. Ana Ruiz", type: "virtual", goals: ["Vocabulario", "Lenguaje expresivo"],      comment: "Amplió vocabulario a 12 nuevas palabras. Muy participativo." },
    { id: 3, date: "16 Jul 2026", time: "10:30 AM", duration: "40 min", therapist: "Dra. Ana Ruiz", type: "virtual", goals: ["Atención sostenida", "Comprensión"],      comment: "Mejoró 15% en tiempo de atención. Excelente concentración." },
  ];

  const reports = [
    { id: 1, title: "Informe Mensual — Julio 2026",    date: "31 Jul 2026", therapist: "Dra. Ana Ruiz", status: "completado", summary: "Avance significativo en pronunciación y comprensión verbal. Racha de 7 días activos en Mundo ASHA.", fav: true  },
    { id: 2, title: "Informe Mensual — Junio 2026",    date: "30 Jun 2026", therapist: "Dra. Ana Ruiz", status: "completado", summary: "Vocabulario expresivo alcanzó el 90%. Se completó el objetivo de lenguaje receptivo del plan mensual.", fav: false },
    { id: 3, title: "Evaluación Inicial — Enero 2026", date: "15 Ene 2026", therapist: "Dra. Ana Ruiz", status: "completado", summary: "Diagnóstico funcional de inicio. Línea base establecida para plan terapéutico individualizado.", fav: true  },
    { id: 4, title: "Plan Terapéutico Q3 2026",        date: "1 Jul 2026",  therapist: "Dra. Ana Ruiz", status: "activo",     summary: "Objetivos para el tercer trimestre: pronunciación avanzada, comprensión verbal y juego simbólico.",  fav: false },
  ];

  const badges = [
    { icon: "🌟", name: "Explorador Valiente",    desc: "Primera sesión completada",       date: "Ene 2026",  unlocked: true,  color: B.orange },
    { icon: "🔥", name: "Racha Imparable",         desc: "7 días seguidos de actividades",  date: "Mar 2026",  unlocked: true,  color: "#EF4444" },
    { icon: "📖", name: "Lector Estrella",          desc: "10 cuentos completados",          date: "Abr 2026",  unlocked: true,  color: B.violet },
    { icon: "🎵", name: "Pequeño Músico",           desc: "5 canciones aprendidas",          date: "May 2026",  unlocked: true,  color: B.teal   },
    { icon: "🏆", name: "Meta Cumplida",            desc: "Primer objetivo alcanzado",       date: "Mar 2026",  unlocked: true,  color: B.orange },
    { icon: "🧩", name: "Maestro Adivinanzas",      desc: "20 adivinanzas resueltas",        date: "Jun 2026",  unlocked: true,  color: "#EC4899"},
    { icon: "💎", name: "Coleccionista",            desc: "Obtener 5 insignias",             date: "Jun 2026",  unlocked: true,  color: "#6366F1"},
    { icon: "🚀", name: "Superestrella ASHA",       desc: "50 actividades completadas",      date: "",          unlocked: false, color: B.textMuted },
    { icon: "🌈", name: "Maestro del Arcoíris",     desc: "Completar todos los mundos",      date: "",          unlocked: false, color: B.textMuted },
    { icon: "🎓", name: "Graduado ASHA",            desc: "Completar plan terapéutico",      date: "",          unlocked: false, color: B.textMuted },
  ];

  const comments = [
    { from: "Dra. Ana Ruiz", av: "AR", color: B.violet, date: "30 Jul 2026", type: "felicitación", text: "¡Mateo tuvo una semana excelente! Ha demostrado gran avance en la pronunciación de la R en posición inicial. Estoy muy orgullosa de su esfuerzo. 🌟" },
    { from: "Dra. Ana Ruiz", av: "AR", color: B.violet, date: "23 Jul 2026", type: "recomendación", text: "Para esta semana recomiendo practicar 10 minutos diarios con los cuentos del Bosque en Mundo ASHA. Enfocarse especialmente en palabras con R inicial: ratón, rosa, roca." },
    { from: "Dra. Ana Ruiz", av: "AR", color: B.violet, date: "16 Jul 2026", type: "próximos pasos", text: "En la próxima sesión trabajaremos comprensión verbal con imágenes secuenciales. Les envío material preparatorio por mensajes. Por favor revisar antes de la sesión del 30/07." },
    { from: "Dra. Ana Ruiz", av: "AR", color: B.violet, date: "9 Jul 2026",  type: "consejo",       text: "Consejo para casa: cuando lean juntos, pregunten a Mateo qué creen que pasará después en el cuento. Esto estimula comprensión anticipatoria y vocabulario emocional." },
  ];

  const wellness = [
    { icon: "💙", title: "Cómo apoyar la terapia en casa",        time: "5 min", color: B.violet, bg: B.violetLight, tag: "Guía"        },
    { icon: "🌿", title: "Rutinas que potencian el aprendizaje",  time: "4 min", color: B.teal,   bg: B.tealLight,   tag: "Consejos"    },
    { icon: "🌞", title: "Manejo del estrés infantil",            time: "3 min", color: B.orange, bg: B.orangeLight, tag: "Bienestar"   },
    { icon: "🎯", title: "Cómo leer los reportes de tu hijo",     time: "6 min", color: "#6366F1",bg: "#EEF2FF",     tag: "Educación"   },
    { icon: "💬", title: "Comunicación efectiva con el terapeuta",time: "4 min", color: "#EC4899",bg: "#FDF2F8",     tag: "Relación"    },
    { icon: "🧘", title: "Autocuidado para padres en proceso",    time: "7 min", color: "#059669",bg: "#ECFDF5",     tag: "Autoayuda"   },
  ];

  const reportView = reportViewId !== null ? reports.find(r => r.id === reportViewId) ?? null : null;
  const visibleActivities = isExploracion
    ? activities.filter((a) => ALLOWED_CATS.includes(a.category))
    : activities;
  const filteredActs = actFilter === "todas" ? visibleActivities : visibleActivities.filter(a => a.category === actFilter);

  const MUNDO_MAP: Record<string, View> = {
    cuentos: "mundo-asha/cuentos", canciones: "mundo-asha/canciones",
    adivinanzas: "mundo-asha/adivinanzas", trabalenguas: "mundo-asha/trabalenguas",
    juegos: "mundo-asha/juegos",
  };

  const downloadReport = (r: typeof reports[0]) => {
    const sections = [
      { title: "Resumen Ejecutivo", content: r.summary },
      { title: "Objetivos Trabajados", content: "Pronunciación de la R en posición inicial e intervocálica. Comprensión verbal con imágenes secuenciales. Vocabulario temático: animales y colores." },
      { title: "Observaciones Clínicas", content: "Mateo mostró alta motivación durante las actividades lúdicas. Se observó mayor tiempo de atención sostenida (hasta 8 min vs 5 min inicial). La racha de 7 días en Mundo ASHA correlaciona positivamente con el avance fonológico." },
      { title: "Recomendaciones para Casa", content: "Practicar 10–15 minutos diarios de lectura en voz alta. Usar los cuentos del Bosque ASHA. Celebrar cada pequeño logro para reforzar la autoconfianza." },
    ];
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${r.title}</title>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<style>
@page{margin:20mm 18mm}*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;color:#1C1135;font-size:13px;line-height:1.6}
.hdr{background:linear-gradient(135deg,#6D28D9,#0D9488);color:white;padding:28px 32px;margin-bottom:28px}
.brand{font-size:15px;font-weight:900;margin-bottom:12px;opacity:.85}
h1{font-size:21px;font-weight:900;margin-bottom:4px}
.meta{font-size:12px;opacity:.75}
.content{padding:0 32px}
.patient{font-size:11px;font-weight:700;color:#9E95B7;text-transform:uppercase;letter-spacing:.06em;margin-bottom:18px}
.section{background:#F8F7FF;border-radius:12px;padding:18px 20px;margin-bottom:14px}
.stitle{font-size:10px;font-weight:900;color:#9E95B7;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px}
.sbody{font-size:13px;font-weight:500;color:#4B4264;line-height:1.7}
.footer{margin-top:30px;padding:16px 32px;border-top:1px solid #E8E5F4;display:flex;justify-content:space-between;font-size:11px;color:#9E95B7}
.sig{font-weight:700;color:#1C1135}
.badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:700}
.bg{background:#D1FAE5;color:#059669}.bo{background:#FEF3C7;color:#D97706}
</style></head><body>
<div class="hdr">
  <div class="brand">ASHAKids · Mi Camino ASHA</div>
  <h1>${r.title}</h1>
  <p class="meta">${r.date} · ${r.therapist} · <span class="badge ${r.status === "activo" ? "bo" : "bg"}">${r.status}</span></p>
</div>
<div class="content">
  <p class="patient">Paciente: ${child.fullName} · ${child.age} años · Terapia del Lenguaje</p>
  ${sections.map(s => `<div class="section"><div class="stitle">${s.title}</div><div class="sbody">${s.content}</div></div>`).join("")}
</div>
<div class="footer">
  <div><p>Firmado digitalmente por: <span class="sig">${r.therapist}</span></p><p>Matrícula: TP-2847 · Plataforma ASHAKids</p></div>
  <div style="text-align:right"><p>Generado: ${r.date}</p><p style="color:#6D28D9;font-weight:700">ashakids.com</p></div>
</div>
<script>window.addEventListener('load',()=>{window.print();setTimeout(()=>window.close(),300)})</script>
</body></html>`;
    const win = window.open("", "_blank", "width=820,height=960");
    if (win) { win.document.write(html); win.document.close(); }
  };

  const statusColors: Record<string, "green" | "orange" | "violet"> = { completado: "green", "en progreso": "orange", pendiente: "violet" };
  const typeColors: Record<string, string> = { felicitación: B.orange, recomendación: B.violet, "próximos pasos": B.teal, consejo: "#059669" };

  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {/* ── Reporte: modal pantalla completa ── */}
      {reportView && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5F4] flex-shrink-0" style={{ background: "linear-gradient(135deg,#6D28D9,#0D9488)" }}>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,.7)" }}>Informe completo · ASHAKids</p>
                <h2 className="font-extrabold text-white text-lg leading-tight">{reportView.title}</h2>
                <p className="text-sm font-medium mt-0.5" style={{ color: "rgba(255,255,255,.75)" }}>{reportView.date} · {reportView.therapist}</p>
              </div>
              <button onClick={() => setReportViewId(null)} className="p-2 rounded-xl flex-shrink-0" style={{ background: "rgba(255,255,255,.15)" }}>
                <X size={17} color="white" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider">Paciente: {child.fullName} · {child.age} años · Terapia del Lenguaje</p>
              {[
                { title: "Resumen Ejecutivo", content: reportView.summary },
                { title: "Objetivos Trabajados", content: "Pronunciación de la R en posición inicial e intervocálica. Comprensión verbal con imágenes secuenciales. Vocabulario temático: animales y colores." },
                { title: "Observaciones Clínicas", content: "El paciente mostró alta motivación durante las actividades lúdicas. Se observó mayor tiempo de atención sostenida. La racha de actividades correlaciona positivamente con el avance fonológico." },
                { title: "Recomendaciones para Casa", content: "Practicar 10–15 minutos diarios de lectura en voz alta. Usar los cuentos de Mundo ASHA. Celebrar cada pequeño logro para reforzar la autoconfianza." },
              ].map(s => (
                <div key={s.title} className="rounded-2xl p-4" style={{ background: B.bg }}>
                  <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1.5">{s.title}</p>
                  <p className="text-sm font-medium text-[#4B4264] leading-relaxed">{s.content}</p>
                </div>
              ))}
              <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-1.5">Firma Digital</p>
                <p className="text-sm font-medium text-[#1C1135]">Firmado por: <strong>{reportView.therapist}</strong></p>
                <p className="text-xs text-[#9E95B7] font-medium mt-0.5">Matrícula profesional: TP-2847 · {reportView.date}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#E8E5F4] flex gap-3 flex-shrink-0">
              <Btn variant="outline" className="flex-1 justify-center" onClick={() => setReportViewId(null)}>Cerrar</Btn>
              <Btn variant="cta" className="flex-1 justify-center" onClick={() => downloadReport(reportView)}>
                <Download size={14} /> Descargar PDF
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <div className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${B.violetDeep} 0%, #4C1D95 60%, ${B.violet} 100%)` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-white/5" />
        </div>
        <div className="relative z-10 px-4 sm:px-6 pt-8 pb-6 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg border-2 border-white/20 bg-white/90">
              <img
                src={avatarInfo.assetPath}
                alt={avatarInfo.name}
                className="w-16 h-16 object-contain"
                onError={(ev) => {
                  (ev.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="text-5xl leading-none" style={{ display: "none" }}>{child.emoji}</span>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-violet-300 uppercase tracking-widest">🌱 Mi Camino ASHA</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-1">{child.fullName}</h1>
              <p className="text-violet-200 text-lg font-bold mb-3">{child.age} años · Terapia del Lenguaje</p>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 bg-white/15 text-white px-3.5 py-2 rounded-full backdrop-blur-sm">
                  <span className="text-sm font-black">👩‍⚕️</span>
                  <span className="text-sm font-extrabold">Dra. Ana Ruiz</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 text-white px-3.5 py-2 rounded-full">
                  <span className="text-sm font-black">⏳</span>
                  <span className="text-sm font-extrabold">6 meses en ASHAKids</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-400/30 text-orange-200 px-3.5 py-2 rounded-full">
                  <span className="text-sm font-black">⭐</span>
                  <span className="text-sm font-extrabold">Nivel 4 · Explorador</span>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { val: "12", lbl: "Sesiones" },
                  { val: "78%", lbl: "Progreso" },
                  { val: "7 🔥", lbl: "Racha días" },
                  { val: "3/5", lbl: "Objetivos" },
                  { val: "47", lbl: "Actividades" },
                  { val: "7", lbl: "Insignias" },
                ].map(s => (
                  <div key={s.lbl} className="bg-white/10 rounded-2xl px-3 py-2 text-center">
                    <p className="text-lg font-black text-white">{s.val}</p>
                    <p className="text-xs font-medium text-violet-200">{s.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* ASHI */}
            <div className="hidden lg:block flex-shrink-0">
              <Ashi size={100} mood="happy" />
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="relative z-10 px-4 sm:px-6 max-w-7xl mx-auto">
          <div className="flex overflow-x-auto gap-0.5 pb-0 scrollbar-hide">
            {caminoTabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-extrabold whitespace-nowrap transition-all flex-shrink-0 rounded-t-2xl
                  ${tab === t.id ? "bg-white text-[#1C1135]" : "text-violet-200 hover:text-white hover:bg-white/10"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Reportes modal ─── */}
      {reporteAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setReporteAbierto(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E8E5F4] px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-[#1C1135] text-sm">{reporteAbierto.titulo}</h3>
              <button onClick={() => setReporteAbierto(null)} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">Este reporte resume el seguimiento registrado por el terapeuta y no constituye un diagnóstico independiente.</p>
              </div>
              {[
                {label:"Paciente", val:"Mateo García"},
                {label:"Período evaluado", val:reporteAbierto.periodo},
                {label:"Sesiones realizadas", val:"4 sesiones"},
                {label:"Asistencia", val:"100%"},
                {label:"Terapeuta", val:reporteAbierto.terapeuta},
                {label:"Fecha de publicación", val:reporteAbierto.publicado},
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm border-b border-[#F0EDF8] pb-2">
                  <span className="font-medium text-[#7C6F9A]">{item.label}</span>
                  <span className="font-bold text-[#1C1135]">{item.val}</span>
                </div>
              ))}
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Objetivos trabajados</p><p className="text-sm text-[#4B4468]">Pronunciación /r/, Comprensión verbal, Vocabulario expresivo</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Logros principales</p><p className="text-sm text-[#4B4468]">Aumento de 18 puntos porcentuales en pronunciación. Vocabulario expresivo alcanzado al 90%.</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Dificultades observadas</p><p className="text-sm text-[#4B4468]">La comprensión verbal en oraciones complejas requiere más trabajo.</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Recomendaciones para la familia</p><p className="text-sm text-[#4B4468]">Practicar 10 minutos diarios con cuentos. Usar tarjetas de imágenes secuenciales.</p></div>
              <div><p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-2">Próximos pasos</p><p className="text-sm text-[#4B4468]">Continuar con automatización del fonema /r/ y comprensión de instrucciones complejas.</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tab Content ─── */}
      <div className="max-w-7xl mx-auto">

        {/* ── Period selector card — always visible ── */}
        <div className="mx-4 mt-4 mb-4 rounded-2xl border border-[#E8E5F4] bg-white p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-extrabold text-[#1C1135]">Período de consulta</p>
            <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-lg">
              {(["actual","historial"] as const).map(m => (
                <button key={m} onClick={() => setPeriodoMode(m)}
                  className={`px-3 py-1 rounded-md text-xs font-bold capitalize transition-all ${periodoMode === m ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                  {m === "actual" ? "Estado actual" : "Ver historial"}
                </button>
              ))}
            </div>
          </div>
          {periodoMode === "historial" && (
            <div className="space-y-2 pt-2 border-t border-[#F0EDF8]">
              <div className="flex gap-2 flex-wrap">
                {[{val:"30d",label:"Últimos 30 días"},{val:"3m",label:"Últimos 3 meses"},{val:"custom",label:"Rango personalizado"}].map(opt => (
                  <button key={opt.val} onClick={() => setHistorialRango(opt.val as "30d"|"3m"|"custom")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${historialRango === opt.val ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {historialRango === "custom" && (
                <div className="flex gap-2 flex-wrap items-center">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-[#7C6F9A]">Desde</label>
                    <input type="date" value={periodoDesde} onChange={e => setPeriodoDesde(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-[#7C6F9A]">Hasta</label>
                    <input type="date" value={periodoHasta} onChange={e => setPeriodoHasta(e.target.value)}
                      className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                  </div>
                  <button className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white" style={{background:"#7C3AED"}}>Aplicar</button>
                  <button onClick={() => { setPeriodoDesde(""); setPeriodoHasta(""); }} className="text-xs font-bold text-[#9E95B7] hover:text-red-400">Limpiar</button>
                </div>
              )}
              <p className="text-xs text-[#9E95B7]">
                {historialRango === "30d" ? "Mostrando información del 11 de agosto al 10 de septiembre de 2026" :
                 historialRango === "3m" ? "Mostrando información del 10 de junio al 10 de septiembre de 2026" :
                 periodoDesde && periodoHasta ? `Mostrando información del ${periodoDesde} al ${periodoHasta}` :
                 "Selecciona un rango de fechas"}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">

        {/* ── RESUMEN ── */}
        {tab === "resumen" && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { icon: "🎥", label: "Sesiones",    value: "12"      },
                { icon: "⏱️", label: "Horas",       value: "9 h"     },
                { icon: "📚", label: "Actividades", value: "47"      },
                { icon: "🎯", label: "Objetivos",   value: "3 / 5"   },
                { icon: "🔥", label: "Racha",       value: "7 días"  },
                { icon: "📅", label: "Última sesión",value: "30 Jul" },
              ].map(s => (
                <Crd key={s.label} className="p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <p className="text-lg font-black text-[#1C1135]">{s.value}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{s.label}</p>
                </Crd>
              ))}
            </div>

            {/* El Viaje ASHA — 3×3 matrix */}
            <Crd className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-extrabold text-[#1C1135]">🌱 El Viaje ASHA</h3>
                <Bdg color="violet">{milestones.filter(m => m.done).length}/{milestones.length} etapas</Bdg>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {milestones.map((m) => (
                  <div key={m.title} className={`relative rounded-2xl p-4 flex flex-col items-center text-center gap-2 border-2 transition-all cursor-pointer hover:scale-[1.02] ${m.done ? "border-transparent" : "border-dashed border-[#C8C2DC]"}`}
                    style={{ background: m.done ? B.violetLight : "#F9F8FE" }}>
                    {m.done && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                        <span className="text-white text-[9px] font-black">✓</span>
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-2xl border-2 ${m.done ? "border-transparent" : "border-dashed border-[#C8C2DC]"}`}
                      style={{ background: m.done ? B.violetMid : "#EDEBFA" }}>
                      {m.icon}
                    </div>
                    <p className={`text-xs font-extrabold leading-tight ${m.done ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>{m.title}</p>
                    <p className="text-[10px] text-[#9E95B7] font-medium leading-tight">{m.date}</p>
                    {!m.done && <Bdg color="gray">Próximo</Bdg>}
                  </div>
                ))}
              </div>
            </Crd>

            {/* ASHI recommendation */}
            <div className="rounded-3xl p-5 border border-violet-100 flex items-start gap-4" style={{ background: B.violetLight }}>
              <Ashi size={60} mood="happy" />
              <div>
                <p className="font-extrabold text-[#1C1135] mb-1">Análisis de ASHI</p>
                <p className="text-sm text-[#7C6F9A] font-medium mb-3 max-w-lg">
                  "{child.name} ha mejorado un 18% en pronunciación durante el último mes. Te recomendamos practicar cuentos cortos durante 15 minutos al día para consolidar el avance."
                </p>
                <Btn variant="secondary" size="sm" onClick={() => go("mundo-asha/cuentos")}>
                  <Star size={13} /> Ver actividades recomendadas
                </Btn>
              </div>
            </div>
          </div>
        )}

        {/* ── OBJETIVOS ── */}
        {tab === "objetivos" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Objetivos Terapéuticos</h3>
              <Bdg color="violet">{OBJETIVOS_DEMO.filter(o => o.estado === "En progreso").length} en progreso</Bdg>
            </div>
            {periodoMode === "actual" ? (
              OBJETIVOS_DEMO.map((obj) => (
                <div key={obj.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-extrabold text-[#1C1135] text-sm">{obj.nombre}</h4>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${obj.estado === "Completado" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"}`}>{obj.estado}</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">{obj.prioridad}</span>
                    <span className="text-[10px] text-[#9E95B7]">{obj.terapeuta} · Meta: {obj.meta}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 rounded-full bg-[#E8E5F4]">
                      <div className="h-full rounded-full transition-all" style={{width:`${obj.pct}%`, background: obj.estado === "Completado" ? "#10B981" : "#06B6D4"}} />
                    </div>
                    <span className="text-xs font-extrabold" style={{color: obj.estado === "Completado" ? "#10B981" : "#06B6D4"}}>{obj.pct}%</span>
                  </div>
                  <p className="text-[10px] text-[#9E95B7] mb-2">Desempeño actual</p>
                  <div className="rounded-xl p-2.5" style={{background:"#F5F0FF"}}>
                    <p className="text-xs font-medium text-violet-700">💡 {obj.recomendacion}</p>
                  </div>
                </div>
              ))
            ) : (
              OBJETIVOS_DEMO.map(obj => (
                <div key={obj.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                  <h4 className="font-extrabold text-[#1C1135] text-sm mb-3">{obj.nombre}</h4>
                  <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                    <div className="rounded-xl p-2 bg-[#F5F0FF]">
                      <p className="text-[10px] text-[#9E95B7] font-medium">Inicio</p>
                      <p className="text-lg font-extrabold text-violet-700">{obj.pct - 18}%</p>
                    </div>
                    <div className="rounded-xl p-2" style={{background:"#D1FAE5"}}>
                      <p className="text-[10px] text-green-600 font-medium">Avance</p>
                      <p className="text-lg font-extrabold text-green-700">+18%</p>
                    </div>
                    <div className="rounded-xl p-2 bg-[#F0FDF4]">
                      <p className="text-[10px] text-[#9E95B7] font-medium">Actual</p>
                      <p className="text-lg font-extrabold text-green-600">{obj.pct}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#7C6F9A]">{obj.nombre}: aumentó de {obj.pct-18}% a {obj.pct}% durante el período. Fue trabajado en 4 sesiones.</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── ACTIVIDADES ── */}
        {tab === "actividades" && (
          <div>
            {/* Sub-tabs */}
            <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-xl mb-4 w-fit">
              {(["pendientes","historial"] as const).map(st => (
                <button key={st} onClick={() => setActSubTab(st)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${actSubTab === st ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                  {st === "pendientes" ? "Pendientes" : "Historial"}
                </button>
              ))}
            </div>

            {actSubTab === "pendientes" && (
              <div className="space-y-3">
                {ACTIVIDADES_PENDIENTES.map((act) => (
                  <div key={act.nombre} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-extrabold text-[#1C1135] text-sm">{act.nombre}</h4>
                        <p className="text-[10px] text-[#9E95B7] mt-0.5">{act.cat} · {act.objetivo}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${act.estado === "Iniciada" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{act.estado}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-[#7C6F9A]">
                      <div><span className="font-bold">Terapeuta:</span> {act.terapeuta}</div>
                      <div><span className="font-bold">Asignada:</span> {act.asignada}</div>
                      <div><span className="font-bold">Frecuencia:</span> {act.freq}</div>
                    </div>
                    {act.mundoAsha && (
                      <button onClick={() => go("mundo-asha")}
                        className="text-xs font-extrabold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90"
                        style={{background:"#7C3AED"}}>
                        Ir a la actividad →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {actSubTab === "historial" && (
              <div>
                {periodoMode === "historial" && (
                  <div className="mb-3 rounded-xl p-2.5 bg-violet-50 border border-violet-200">
                    <p className="text-xs text-violet-700 font-medium">Mostrando actividades del período seleccionado</p>
                  </div>
                )}
                {/* Category filter pills */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {["Todas","Cuentos","Canciones","Adivinanzas","Trabalenguas","Juegos"].map(f => (
                    <button key={f} onClick={() => setActHistFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${actHistFilter === f ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200 bg-white"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                {(() => {
                  const filtered = ACTIVIDADES_HIST.filter(a => actHistFilter === "Todas" || a.cat === actHistFilter);
                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm font-bold text-[#1C1135]">No encontramos información en este período</p>
                        <p className="text-xs text-[#9E95B7] mt-1">Prueba seleccionando otras fechas</p>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-3">
                      {filtered.map((a) => (
                        <div key={a.nombre + a.fecha} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-extrabold text-[#1C1135] text-sm">{a.nombre}</h4>
                              <p className="text-[10px] text-[#9E95B7] mt-0.5">{a.fecha} · {a.cat} · {a.origen}</p>
                            </div>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0 ${a.estado === "Completada" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{a.estado}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-[#7C6F9A]">
                            <div><span className="font-bold">Objetivo:</span> {a.objetivo}</div>
                            <div><span className="font-bold">Resultado:</span> {a.resultado}</div>
                          </div>
                          {a.obs && <p className="text-xs text-[#9E95B7] mt-2 italic">"{a.obs}"</p>}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── SESIONES ── */}
        {tab === "sesiones" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Historial de Sesiones</h3>
              <Bdg color="violet">{SESIONES_DEMO.length} sesiones</Bdg>
            </div>
            {periodoMode === "historial" && (
              <div className="rounded-xl p-2.5 bg-violet-50 border border-violet-200 mb-2">
                <p className="text-xs text-violet-700 font-medium">Mostrando sesiones del período seleccionado</p>
              </div>
            )}
            {SESIONES_DEMO.map((s, i) => (
              <div key={i} className="rounded-2xl border border-[#E8E5F4] bg-white overflow-hidden">
                <button onClick={() => setExpandedSesion(expandedSesion === i ? null : i)} className="w-full flex items-start justify-between p-4 text-left">
                  <div>
                    <p className="font-extrabold text-[#1C1135] text-sm">{s.fecha} · {s.duracion}</p>
                    <p className="text-xs text-[#7C6F9A] mt-0.5">{s.modalidad} · {s.tema}</p>
                    <p className="text-xs text-[#9E95B7] mt-0.5">{s.estado} · {s.terapeuta}</p>
                  </div>
                  <ChevronRight size={16} className={`text-[#9E95B7] mt-1 transition-transform ${expandedSesion === i ? "rotate-90" : ""}`} />
                </button>
                {expandedSesion === i && (
                  <div className="px-4 pb-4 border-t border-[#F0EDF8] space-y-3 pt-3">
                    <div>
                      <p className="text-xs font-bold text-[#7C6F9A] mb-1">Objetivos trabajados</p>
                      <div className="flex flex-wrap gap-1">{s.objetivos.map(o => <span key={o} className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">{o}</span>)}</div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#7C6F9A] mb-1">Actividades realizadas</p>
                      <div className="flex flex-wrap gap-1">{s.actividades.map(a => <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">{a}</span>)}</div>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F5F0FF]">
                      <p className="text-xs font-bold text-violet-700 mb-1">Avances observados</p>
                      <p className="text-xs text-[#4B4468]">{s.avances}</p>
                    </div>
                    <div className="rounded-xl p-3 bg-[#F0FDF4]">
                      <p className="text-xs font-bold text-green-700 mb-1">Recomendaciones</p>
                      <p className="text-xs text-[#4B4468]">{s.recomendaciones}</p>
                    </div>
                    <div className="rounded-xl p-3 border border-[#E8E5F4]">
                      <p className="text-xs font-bold text-[#7C6F9A] mb-1">Resumen compartido por el terapeuta</p>
                      <p className="text-xs text-[#4B4468]">{s.resumen}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── LOGROS ── */}
        {tab === "logros" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-extrabold text-[#1C1135]">Colección de Logros</h3>
                <p className="text-xs text-[#9E95B7] font-medium">{badges.filter(b => b.unlocked).length} de {badges.length} insignias desbloqueadas</p>
              </div>
              <Bdg color="orange">🏅 {badges.filter(b => b.unlocked).length} obtenidas</Bdg>
            </div>
            {/* XP bar */}
            <Crd className="p-4 mb-5">
              <div className="flex items-center gap-4">
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-black text-[#1C1135]">⭐ Nivel 4</p>
                  <p className="text-xs text-[#9E95B7] font-medium">Explorador</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-extrabold text-[#1C1135]">765 XP</span>
                    <span className="text-[#9E95B7] font-medium">1000 XP para Nivel 5</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: B.violetLight }}>
                    <div className="h-full rounded-full" style={{ width: "76.5%", background: `linear-gradient(90deg, ${B.violet}, ${B.orange})` }} />
                  </div>
                </div>
              </div>
            </Crd>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {badges.map((b, i) => (
                <div key={i} className={`rounded-3xl p-4 text-center border-2 transition-all ${b.unlocked ? "border-transparent hover:shadow-md hover:-translate-y-0.5" : "border-dashed border-[#E8E5F4] opacity-50"}`}
                  style={{ background: b.unlocked ? b.color + "12" : B.bg }}>
                  <div className={`text-4xl mb-2 ${b.unlocked ? "" : "grayscale opacity-40"}`}>{b.icon}</div>
                  <p className={`text-xs font-extrabold leading-tight mb-0.5 ${b.unlocked ? "text-[#1C1135]" : "text-[#9E95B7]"}`}>{b.name}</p>
                  <p className="text-xs text-[#9E95B7] font-medium">{b.desc}</p>
                  {b.unlocked && b.date && <p className="text-xs font-bold mt-1" style={{ color: b.color }}>{b.date}</p>}
                  {!b.unlocked && <p className="text-xs font-bold mt-1 text-[#C8C2DC]">Bloqueado</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── NOTAS ── */}
        {tab === "notas" && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Notas del Terapeuta</h3>
              <Bdg color="violet">{NOTAS_COMPARTIDAS.length} compartidas</Bdg>
            </div>
            {NOTAS_COMPARTIDAS.map(n => (
              <div key={n.titulo + n.fecha} className="rounded-2xl border border-[#E8E5F4] bg-white p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-bold text-[#1C1135]">{n.titulo}</p>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex-shrink-0 ml-2">Compartida con la familia</span>
                </div>
                <p className="text-xs text-[#9E95B7] mb-2">{n.fecha} · {n.terapeuta} · Sesión del {n.sesion}</p>
                <p className="text-sm text-[#4B4468] leading-relaxed">{n.contenido}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTES ── */}
        {tab === "reportes" && (
          <div className="space-y-4">
            <h3 className="font-extrabold text-[#1C1135] mb-2">Reportes del Terapeuta</h3>
            {/* Último reporte */}
            <div className="rounded-2xl overflow-hidden border-2 border-violet-200 bg-white mb-4">
              <div className="px-4 pt-3 pb-1 text-xs font-extrabold text-violet-600 uppercase tracking-wider">Último reporte</div>
              <div className="px-4 pb-4">
                <h4 className="font-extrabold text-[#1C1135] text-sm mb-1">{REPORTES_DEMO[0].titulo}</h4>
                <p className="text-xs text-[#7C6F9A] mb-2">{REPORTES_DEMO[0].tipo} · {REPORTES_DEMO[0].periodo} · {REPORTES_DEMO[0].terapeuta}</p>
                <p className="text-xs text-[#4B4468] mb-3 leading-relaxed">{REPORTES_DEMO[0].resumen}</p>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setReporteAbierto(REPORTES_DEMO[0])}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-white" style={{background:"#7C3AED"}}>
                    Ver reporte completo
                  </button>
                  <button className="px-4 py-2 rounded-xl text-xs font-bold border border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50">
                    Descargar PDF
                  </button>
                </div>
              </div>
            </div>
            {/* Previous reports */}
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Reportes anteriores</p>
            {REPORTES_DEMO.slice(1).map(r => (
              <div key={r.titulo} className="rounded-xl border border-[#E8E5F4] p-3 flex items-start justify-between bg-white">
                <div>
                  <p className="text-sm font-bold text-[#1C1135]">{r.titulo}</p>
                  <p className="text-xs text-[#9E95B7]">{r.periodo} · {r.publicado} · <span className="text-green-600">Publicado</span></p>
                </div>
                <button onClick={() => setReporteAbierto(r)} className="text-xs font-extrabold px-3 py-1.5 rounded-xl border border-violet-200 text-violet-700 hover:bg-violet-50 flex-shrink-0 ml-2">Ver</button>
              </div>
            ))}
          </div>
        )}

        {/* ── BIENESTAR ── */}
        {tab === "bienestar" && (
          <div>
            <div className="mb-5">
              <h3 className="font-extrabold text-[#1C1135]">Centro de Bienestar para Padres</h3>
              <p className="text-sm text-[#9E95B7] font-medium">Recursos, guías y consejos seleccionados para acompañar el proceso terapéutico de {child.name}.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wellness.map(w => (
                <Crd key={w.title} className="p-5 cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform" style={{ background: w.bg }}>{w.icon}</div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full" style={{ background: w.color + "18", color: w.color }}>{w.tag}</span>
                    <span className="text-xs text-[#9E95B7] font-medium">{w.time} de lectura</span>
                  </div>
                  <p className="font-extrabold text-[#1C1135] text-sm leading-tight mb-2">{w.title}</p>
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: w.color }}>
                    Leer artículo <ChevronRight size={11} />
                  </div>
                </Crd>
              ))}
            </div>
            {/* ASHI tip */}
            <div className="mt-5 rounded-3xl p-5 border border-violet-100 flex items-center gap-4" style={{ background: B.violetLight }}>
              <Ashi size={52} mood="happy" />
              <div>
                <p className="font-extrabold text-[#1C1135] text-sm mb-1">Consejo de ASHI para esta semana</p>
                <p className="text-sm text-[#7C6F9A] font-medium">
                  Leer 15 minutos en voz alta con {child.name} antes de dormir refuerza todo lo trabajado en terapia. Elijan un cuento de Mundo ASHA para hacerlo aún más especial. ✨
                </p>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

