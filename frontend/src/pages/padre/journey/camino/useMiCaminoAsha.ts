import { useState } from "react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { kids } from "@/mocks/demo";

// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────
import { REPORTES_DEMO } from "@/pages/padre/journey/camino/REPORTES_DEMO";
import { CaminoTab } from "@/pages/padre/journey/camino/CaminoTab";

export function useMiCaminoAsha({ go, padrePlan = "familia" }: { go: (v: View) => void; padrePlan?: "exploracion" | "familia" }) {
const [tab, setTab] = useState<CaminoTab>("resumen");
const [reportViewId, setReportViewId] = useState<number | null>(null);
const [actFilter, setActFilter] = useState("todas");
const [openSession, setOpenSession] = useState<number | null>(null);
const [periodoMode, setPeriodoMode] = useState<"actual"|"historial">("actual");
const [historialRango, setHistorialRango] = useState<"30d"|"3m"|"custom">("30d");
const [periodoDesde, setPeriodoDesde] = useState("");
const [periodoHasta, setPeriodoHasta] = useState("");
const [actSubTab, setActSubTab] = useState<"pendientes"|"historial">("pendientes");
const [actHistFilter, setActHistFilter] = useState("Todas");
const [expandedSesion, setExpandedSesion] = useState<number|null>(null);
const [reporteAbierto, setReporteAbierto] = useState<null|typeof REPORTES_DEMO[0]>(null);
const isExploracion = padrePlan === "exploracion";
const ALLOWED_CATS = ["cuentos", "canciones", "adivinanzas"];
const child = kids[0];
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
  <p class="patient">Paciente: Mateo Gómez · 7 años · Terapia del Lenguaje</p>
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
return { go, padrePlan, tab, setTab, reportViewId, setReportViewId, actFilter, setActFilter, openSession, setOpenSession, periodoMode, setPeriodoMode, historialRango, setHistorialRango, periodoDesde, setPeriodoDesde, periodoHasta, setPeriodoHasta, actSubTab, setActSubTab, actHistFilter, setActHistFilter, expandedSesion, setExpandedSesion, reporteAbierto, setReporteAbierto, isExploracion, ALLOWED_CATS, child, caminoTabs, milestones, objectives, activities, sessions, reports, badges, comments, wellness, reportView, visibleActivities, filteredActs, MUNDO_MAP, downloadReport, statusColors, typeColors };
}
