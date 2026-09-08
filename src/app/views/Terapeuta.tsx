import { useState, useRef } from "react";
import { Check, ChevronLeft, ChevronRight, Download, Edit, Eye, EyeOff, FileText, MessageCircle, Paperclip, Plus, RefreshCw, Send, Star, Upload, UserPlus, Users, Video, X, CheckCircle, Calendar, Activity, CreditCard, Search, Clock, Phone, Globe } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Inp, Skeleton, EmptyState, AshiMsg, kids, Ashi } from "../shared";
import type { AppointmentRequest } from "./Padre";


// Genera un PDF ligero, descargable y legible sin depender de servicios externos.
function downloadPdf(filename: string, title: string, lines: string[]) {
  const safe = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\\()]/g, "\\$&");
  const content = [
    "BT", "/F1 18 Tf", "50 790 Td", `(${safe(title)}) Tj`, "/F1 10 Tf",
    ...lines.slice(0, 38).flatMap((line) => ["0 -20 Td", `(${safe(line)}) Tj`]),
    "ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── Mi Camino ASHA ─────────────────────────────────────────────────────────────

type CaminoTab = "resumen" | "objetivos" | "actividades" | "sesiones" | "logros" | "comentarios" | "bienestar";

export function MiCaminoAsha({ go, padrePlan = "familia" }: { go: (v: View) => void; padrePlan?: "exploracion" | "familia" }) {
  const [tab, setTab] = useState<CaminoTab>("resumen");
  const [reportViewId, setReportViewId] = useState<number | null>(null);
  const [actFilter, setActFilter] = useState("todas");
  const [openSession, setOpenSession] = useState<number | null>(null);

  const isExploracion = padrePlan === "exploracion";
  const ALLOWED_CATS = ["cuentos", "canciones", "adivinanzas"];

  const child = kids[0];

  const caminoTabs: { id: CaminoTab; icon: string; label: string }[] = [
    { id: "resumen",     icon: "📈", label: "Resumen"     },
    { id: "objetivos",   icon: "🎯", label: "Objetivos"   },
    { id: "actividades", icon: "📚", label: "Actividades" },
    { id: "sesiones",    icon: "🎥", label: "Sesiones"    },
    { id: "logros",      icon: "🏅", label: "Logros"      },
    { id: "comentarios", icon: "💬", label: "Comentarios" },
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
              <p className="text-xs font-bold text-[#9E95B7] uppercase tracking-wider">Paciente: Mateo Gómez · 7 años · Terapia del Lenguaje</p>
              {[
                { title: "Resumen Ejecutivo", content: reportView.summary },
                { title: "Objetivos Trabajados", content: "Pronunciación de la R en posición inicial e intervocálica. Comprensión verbal con imágenes secuenciales. Vocabulario temático: animales y colores." },
                { title: "Observaciones Clínicas", content: "Mateo mostró alta motivación durante las actividades lúdicas. Se observó mayor tiempo de atención sostenida (hasta 8 min vs 5 min inicial). La racha de 7 días en Mundo ASHA correlaciona positivamente con el avance fonológico." },
                { title: "Recomendaciones para Casa", content: "Practicar 10–15 minutos diarios de lectura en voz alta. Usar los cuentos del Bosque ASHA. Celebrar cada pequeño logro para reforzar la autoconfianza." },
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
            <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl flex-shrink-0 shadow-lg border-2 border-white/20" style={{ background: child.bg }}>
              {child.emoji}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <span className="text-xs font-black text-violet-300 uppercase tracking-widest">🌱 Mi Camino ASHA</span>
              <h1 className="text-3xl sm:text-4xl font-black text-white mt-1 mb-1">{child.name} Gómez</h1>
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

      {/* ─── Tab Content ─── */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">

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
              <Bdg color="violet">{objectives.filter(o => o.status === "en progreso").length} en progreso</Bdg>
            </div>
            {objectives.map((obj, i) => (
              <Crd key={i} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-extrabold text-[#1C1135]">{obj.title}</p>
                      <Bdg color={statusColors[obj.status]}>{obj.status}</Bdg>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${obj.priority === "alta" ? "bg-red-50 text-red-600" : obj.priority === "media" ? "bg-orange-50 text-orange-600" : "bg-slate-100 text-slate-500"}`}>
                        {obj.priority === "alta" ? "↑ Alta" : obj.priority === "media" ? "— Media" : "↓ Baja"}
                      </span>
                    </div>
                    <p className="text-xs text-[#9E95B7] font-medium">{obj.therapist} · Meta: {obj.date}</p>
                  </div>
                  <span className="text-xl font-black flex-shrink-0" style={{ color: obj.pct >= 75 ? B.teal : obj.pct >= 40 ? B.orange : "#EF4444" }}>{obj.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden mb-3" style={{ background: B.violetLight }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${obj.pct}%`, background: obj.pct >= 75 ? B.teal : obj.pct >= 40 ? B.orange : "#EF4444" }} />
                </div>
                <div className="flex items-start gap-2 text-xs text-[#7C6F9A] bg-[#FAFAF9] rounded-2xl px-3 py-2">
                  <span className="flex-shrink-0">💡</span>
                  <span className="font-medium">{obj.rec}</span>
                </div>
              </Crd>
            ))}
          </div>
        )}

        {/* ── ACTIVIDADES ── */}
        {tab === "actividades" && (
          <div>
            {isExploracion && (
              <div className="rounded-2xl p-4 flex items-start gap-3 border mb-4" style={{ background: "#FFF8EC", borderColor: "#F59E0B40" }}>
                <span className="text-lg flex-shrink-0">ℹ️</span>
                <div>
                  <p className="text-sm font-extrabold" style={{ color: "#F59E0B" }}>Plan Exploración — Contenido básico</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: "#92400E" }}>Estás viendo las actividades disponibles en tu plan. Con el Plan Familia accedes a todos los mundos y actividades.</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(isExploracion ? ["todas", ...ALLOWED_CATS] : ["todas","cuentos","canciones","adivinanzas","trabalenguas","juegos"]).map(f => (
                <button key={f} onClick={() => setActFilter(f)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-extrabold capitalize transition-all ${actFilter === f ? "text-white" : "bg-white border border-[#E8E5F4] text-[#7C6F9A] hover:bg-violet-50"}`}
                  style={actFilter === f ? { background: B.violet } : {}}>
                  {f}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActs.map((a, i) => (
                <Crd key={i} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: B.violetLight }}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-[#1C1135] text-sm leading-tight">{a.title}</p>
                      <p className="text-xs text-[#9E95B7] font-medium capitalize">{a.category} · {a.duration}</p>
                      <p className="text-xs text-[#9E95B7] font-medium">{a.date}</p>
                    </div>
                    <span className="text-sm font-black flex-shrink-0" style={{ color: a.score >= 90 ? B.teal : a.score >= 70 ? B.orange : "#EF4444" }}>{a.score}%</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#F5F3FF]">
                    <Btn variant="secondary" size="sm" className="w-full justify-center"
                      onClick={() => go(MUNDO_MAP[a.category] ?? "mundo-asha")}>
                      <RefreshCw size={12} /> Repetir actividad
                    </Btn>
                  </div>
                </Crd>
              ))}
            </div>
          </div>
        )}

        {/* ── SESIONES ── */}
        {tab === "sesiones" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-[#1C1135]">Historial de Sesiones</h3>
              <Bdg color="violet">{sessions.length} sesiones</Bdg>
            </div>
            {sessions.map((s, i) => (
              <div key={s.id} className="bg-white rounded-2xl border border-[#E8E5F4] overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-violet-50/40 transition-colors"
                  onClick={() => setOpenSession(openSession === i ? null : i)}
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: B.violetLight }}
                  >
                    🎥
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm text-[#1C1135]">{s.date} · {s.time}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">{s.duration} · {s.therapist}</p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-[#9E95B7] flex-shrink-0"
                    style={{ transform: openSession === i ? "rotate(90deg)" : "none", transition: "transform .2s" }}
                  />
                </button>
                {openSession === i && (
                  <div className="px-4 pb-4 border-t border-[#E8E5F4]">
                    <div className="mt-3 mb-3">
                      <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-2">Objetivos trabajados</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.goals.map((g) => (
                          <span key={g} className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: B.violetLight, color: B.violet }}>{g}</span>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl p-3 mb-3" style={{ background: B.bg }}>
                      <p className="text-xs font-black text-[#9E95B7] uppercase tracking-wider mb-1">Comentario del terapeuta</p>
                      <p className="text-sm text-[#4B4264] font-medium leading-relaxed">{s.comment}</p>
                    </div>
                    <Btn
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        downloadPdf(`sesion-${s.id}.pdf`, `Sesion ${s.date}`, [
                          `Fecha: ${s.date}`, `Hora: ${s.time}`, `Duracion: ${s.duration}`,
                          `Terapeuta: ${s.therapist}`, "", "Objetivos:", ...s.goals.map(g => `  - ${g}`),
                          "", "Comentario del terapeuta:", s.comment,
                        ])
                      }
                    >
                      <Download size={12} /> Descargar PDF
                    </Btn>
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

        {/* ── COMENTARIOS ── */}
        {tab === "comentarios" && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Comentarios del Terapeuta</h3>
              <Bdg color="violet">{comments.length} entradas</Bdg>
            </div>
            <div className="space-y-4">
              {comments.map((c, i) => (
                <Crd key={i} className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <Av initials={c.av} color={c.color} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-[#1C1135] text-sm">{c.from}</p>
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full"
                          style={{ background: typeColors[c.type] + "18", color: typeColors[c.type] }}>
                          {c.type}
                        </span>
                      </div>
                      <p className="text-xs text-[#9E95B7] font-medium">{c.date}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#4B4264] font-medium leading-relaxed">{c.text}</p>
                </Crd>
              ))}
            </div>
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
  );
}

// ─── Centro Profesional ASHA — Therapist views ──────────────────────────────────

const terapeutaPatients = [
  { name: "Mateo Gómez",       age: 7,  parent: "Laura Gómez",   sessions: 12, progress: 78, dx: "Trastorno fonológico",        nextSession: "Hoy 09:00",  status: "activo",    av: "MG", color: B.violet,  nota: "Excelente avance en trabalenguas. Continuar con /r/ vibrante." },
  { name: "Valentina López",   age: 5,  parent: "Rosa López",    sessions: 6,  progress: 55, dx: "Retraso simple del lenguaje",  nextSession: "Hoy 11:30",  status: "activo",    av: "VL", color: B.teal,    nota: "Incrementar vocabulario. Buena comprensión auditiva." },
  { name: "Bruno Ríos",        age: 9,  parent: "Andrés Ríos",   sessions: 20, progress: 88, dx: "Dislexia leve",                nextSession: "Hoy 15:00",  status: "activo",    av: "BR", color: "#22C55E", nota: "Grandes progresos en lectoescritura. Preparar para el alta." },
  { name: "Fernanda Torres",   age: 6,  parent: "Claudia Torres",sessions: 4,  progress: 32, dx: "Trastorno del lenguaje",       nextSession: "Mañana",     status: "nuevo",     av: "FT", color: B.orange,  nota: "Evaluación inicial completada. Definir objetivos terapéuticos." },
  { name: "Sebastián Vargas",  age: 8,  parent: "Jorge Vargas",  sessions: 15, progress: 70, dx: "Déficit de atención",          nextSession: "Jue 02 Ago", status: "activo",    av: "SV", color: "#8B5CF6", nota: "Mejoró concentración. Aumentar dificultad en actividades." },
  { name: "Camila Ponce",      age: 4,  parent: "Sofía Ponce",   sessions: 3,  progress: 20, dx: "Retraso del desarrollo",       nextSession: "Vie 03 Ago", status: "nuevo",     av: "CP", color: "#EC4899", nota: "Familia muy comprometida. Asignar actividades en casa." },
];

type ExpTab = "resumen" | "historial" | "sesiones" | "objetivos" | "actividades" | "reportes" | "notas";

export function TerapeutaHome({ go }: { go: (v: View) => void }) {
  const todayApts = [
    { time: "09:00", patient: "Mateo Gómez",    dur: "45 min", status: "próxima",    av: "MG", color: B.violet  },
    { time: "11:30", patient: "Valentina López", dur: "60 min", status: "confirmada", av: "VL", color: B.teal    },
    { time: "15:00", patient: "Bruno Ríos",      dur: "45 min", status: "confirmada", av: "BR", color: "#22C55E" },
  ];
  const stats = [
    { icon: <Users size={18}/>,         val: "18",     label: "Pacientes",       color: B.violet,   bg: B.violetLight },
    { icon: <Calendar size={18}/>,      val: "3",      label: "Sesiones hoy",    color: B.teal,     bg: B.tealLight   },
    { icon: <FileText size={18}/>,      val: "5",      label: "Reportes pend.",  color: B.orange,   bg: B.orangeLight },
    { icon: <MessageCircle size={18}/>, val: "7",      label: "Mensajes nuevos", color: B.violet,   bg: B.violetLight },
    { icon: <CreditCard size={18}/>,    val: "—",      label: "Pagos",          color: "#059669",  bg: "#D1FAE5"     },
    { icon: <Star size={18}/>,          val: "4.9",    label: "Calificación",    color: "#D97706",  bg: "#FEF3C7"     },
    { icon: <Activity size={18}/>,      val: "94 h",   label: "Horas totales",   color: B.teal,     bg: B.tealLight   },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Profile header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${B.teal}, #0F766E)` }}>AR</div>
          <div>
            <h2 className="text-xl font-black text-[#1C1135]">Dra. Ana Ruiz</h2>
            <p className="text-sm text-[#7C6F9A] font-medium">Terapeuta de lenguaje · Miércoles, 30 de julio 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold" style={{ background: "#D1FAE5", color: "#059669" }}>
            <span className="w-2 h-2 rounded-full bg-[#059669]" />
            Disponible
          </div>
          <Btn size="sm" variant="primary" onClick={() => go("session")}><Video size={13} /> Iniciar sesión</Btn>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: s.bg }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white" style={{ color: s.color }}>{s.icon}</div>
            <p className="font-black text-lg text-[#1C1135] leading-none">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
          {/* Próxima sesión premium card */}
          <div className="rounded-3xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${B.violet} 0%, #5B21B6 100%)` }}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 0 3px rgba(74,222,128,0.3)" }} />
                <span className="text-violet-200 text-xs font-bold uppercase tracking-wider">Próxima sesión · en 28 min</span>
              </div>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-black text-white text-lg flex-shrink-0">MG</div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-white text-lg">Mateo Gómez</p>
                  <p className="text-violet-200 text-sm font-medium">Trastorno fonológico · 7 años</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-white text-3xl leading-none">09:00</p>
                  <p className="text-violet-200 text-xs font-medium mt-1">45 minutos</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => go("session/prep")}
                  className="inline-flex items-center justify-center gap-1.5 text-xs px-3.5 py-1.5 rounded-2xl font-bold flex-1 transition-all"
                  style={{ background: "rgba(255,255,255,0.18)", color: "white" }}>
                  <FileText size={13} /> Preparar
                </button>
                <Btn size="sm" variant="cta" onClick={() => go("session")} className="flex-1 justify-center">
                  <Video size={13} /> Entrar ahora
                </Btn>
              </div>
            </div>
          </div>

          {/* Today's schedule */}
          <Crd>
            <div className="p-5 border-b border-[#F5F3FF] flex items-center justify-between">
              <h3 className="font-extrabold text-[#1C1135]">Agenda de hoy</h3>
              <Btn size="sm" variant="ghost" onClick={() => go("terapeuta/agenda")}><Calendar size={12} /> Ver completa</Btn>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {todayApts.map((apt, i) => {
                const isNext = i === 0;
                return (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-2xl transition-colors hover:opacity-90"
                    style={{ background: isNext ? B.violetLight : "transparent" }}>
                    <div className="text-center w-12 flex-shrink-0">
                      <p className="font-extrabold text-sm text-[#1C1135]">{apt.time}</p>
                      <p className="text-xs text-[#9E95B7]">{apt.dur}</p>
                    </div>
                    <div className="w-px h-8 rounded-full flex-shrink-0" style={{ background: isNext ? B.violet : "#E8E5F4" }} />
                    <Av initials={apt.av} color={apt.color} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-sm text-[#1C1135]">{apt.patient}</p>
                    </div>
                    <Bdg color={isNext ? "violet" : "gray"}>{apt.status}</Bdg>
                    {isNext && (
                      <Btn size="sm" variant="primary" onClick={() => go("session")}><Video size={12} /></Btn>
                    )}
                  </div>
                );
              })}
            </div>
          </Crd>
      </div>
    </div>
  );
}

export function TerapeutaPacientes({ go }: { go: (v: View) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [expTab, setExpTab] = useState<ExpTab>("resumen");
  const [search, setSearch] = useState("");

  if (selected !== null) {
    const p = terapeutaPatients[selected];
    const expTabs: { id: ExpTab; label: string }[] = [
      { id: "resumen",    label: "Resumen"     },
      { id: "historial",  label: "Historial"   },
      { id: "sesiones",   label: "Sesiones"    },
      { id: "objetivos",  label: "Objetivos"   },
      { id: "actividades",label: "Actividades" },
      { id: "reportes",   label: "Reportes"    },
      { id: "notas",      label: "Notas"       },
    ];
    return (
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Back + patient header */}
        <button className="flex items-center gap-2 text-sm font-bold mb-5 hover:opacity-70 transition-opacity" style={{ color: B.violet }}
          onClick={() => setSelected(null)}>
          <ChevronLeft size={16} /> Volver a pacientes
        </button>
        <div className="rounded-3xl p-6 mb-5" style={{ background: `linear-gradient(135deg, ${p.color}18 0%, ${B.violetLight} 100%)`, border: `1px solid ${p.color}30` }}>
          <div className="flex items-start gap-5 flex-wrap">
            <Av initials={p.av} color={p.color} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-2xl font-black text-[#1C1135]">{p.name}</h2>
                  <p className="text-sm text-[#7C6F9A] font-medium">{p.age} años · {p.parent} · {p.dx}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: p.status === "nuevo" ? B.orangeLight : "#D1FAE5", color: p.status === "nuevo" ? B.orange : "#059669" }}>
                    {p.status}
                  </span>
                  <Btn size="sm" variant="primary" onClick={() => go("session")}><Video size={12} /> Sesión</Btn>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                  { label: "Sesiones", val: String(p.sessions) },
                  { label: "Progreso", val: `${p.progress}%` },
                  { label: "Próxima",  val: p.nextSession      },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-3 bg-white/70">
                    <p className="text-xs text-[#7C6F9A] font-medium">{s.label}</p>
                    <p className="font-black text-[#1C1135]" style={{ color: p.color }}>{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 mb-5">
          {expTabs.map(t => (
            <button key={t.id}
              className="px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-all"
              style={{ background: expTab === t.id ? B.violet : "transparent", color: expTab === t.id ? "white" : B.textMid }}
              onClick={() => setExpTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {expTab === "resumen" && (
          <div className="grid sm:grid-cols-2 gap-5">
            <Crd className="p-5">
              <h4 className="font-extrabold text-[#1C1135] mb-4">Progreso por área</h4>
              {[
                { label: "Comunicación", val: 82 },
                { label: "Lenguaje",     val: p.progress },
                { label: "Motricidad",   val: 65 },
                { label: "Atención",     val: 70 },
              ].map(area => (
                <div key={area.label} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#7C6F9A] font-medium">{area.label}</span>
                    <span className="font-extrabold text-[#1C1135]">{area.val}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: B.violetLight }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${area.val}%`, backgroundColor: p.color }} />
                  </div>
                </div>
              ))}
            </Crd>
            <Crd className="p-5">
              <h4 className="font-extrabold text-[#1C1135] mb-4">Última nota del terapeuta</h4>
              <div className="rounded-2xl p-4 mb-4" style={{ background: B.violetLight }}>
                <p className="text-sm text-[#1C1135] leading-relaxed font-medium">{p.nota}</p>
                <p className="text-xs text-[#9E95B7] mt-2 font-medium">— Dra. Ana Ruiz · 28 Jul 2026</p>
              </div>
              <Btn variant="secondary" size="sm"><Edit size={12} /> Editar nota</Btn>
            </Crd>
          </div>
        )}

        {expTab === "sesiones" && (
          <div className="flex flex-col gap-3">
            {[
              { date: "28 Jul 2026", dur: "45 min", type: "Virtual",    obj: "Trabalenguas /r/", rating: 5 },
              { date: "21 Jul 2026", dur: "45 min", type: "Virtual",    obj: "Fonema /l/",       rating: 4 },
              { date: "14 Jul 2026", dur: "60 min", type: "Virtual", obj: "Evaluación mes",   rating: 5 },
            ].map((s, i) => (
              <Crd key={i} className="p-5">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: B.tealLight }}>
                      <Video size={16} style={{ color: B.teal }} />
                    </div>
                    <div>
                      <p className="font-extrabold text-[#1C1135] text-sm">{s.date} · {s.dur}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium">{s.type} · {s.obj}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={12} fill={j < s.rating ? "#F59E0B" : "none"} stroke={j < s.rating ? "#F59E0B" : "#D1D5DB"} />
                    ))}
                  </div>
                </div>
              </Crd>
            ))}
          </div>
        )}

        {expTab === "objetivos" && (
          <div className="flex flex-col gap-3">
            {[
              { obj: "Pronunciar correctamente el fonema /r/ vibrante",     pct: 80, status: "en progreso", priority: "alta"  },
              { obj: "Ampliar vocabulario a 200 palabras nuevas",            pct: 60, status: "en progreso", priority: "media" },
              { obj: "Completar lecturas de nivel 2 sin apoyo",              pct: 40, status: "iniciado",    priority: "baja"  },
            ].map((ob, i) => (
              <Crd key={i} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <p className="text-sm font-extrabold text-[#1C1135] leading-snug flex-1">{ob.obj}</p>
                  <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: ob.priority === "alta" ? B.orangeLight : B.violetLight, color: ob.priority === "alta" ? B.orange : B.violet }}>
                    {ob.priority}
                  </span>
                </div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#7C6F9A] font-medium">{ob.status}</span>
                  <span className="font-extrabold text-[#1C1135]">{ob.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: B.violetLight }}>
                  <div className="h-full rounded-full" style={{ width: `${ob.pct}%`, background: B.violet }} />
                </div>
              </Crd>
            ))}
          </div>
        )}

        {(expTab === "historial" || expTab === "actividades" || expTab === "reportes" || expTab === "notas") && (
          <div className="rounded-3xl p-12 flex flex-col items-center justify-center gap-3" style={{ background: B.violetLight }}>
            <div className="text-4xl">📋</div>
            <p className="font-extrabold text-[#1C1135]">Sección {expTab}</p>
            <p className="text-sm text-[#7C6F9A] text-center font-medium">El historial completo de {p.name} aparecerá aquí.</p>
            <Btn variant="primary" size="sm"><Plus size={13} /> Agregar entrada</Btn>
          </div>
        )}
      </div>
    );
  }

  const filtered = terapeutaPatients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.dx.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Pacientes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{terapeutaPatients.length} pacientes activos</p>
        </div>
        <div className="flex items-center gap-3">
          <Inp placeholder="Buscar paciente…" value={search} onChange={v => setSearch(v)} />
          <Btn variant="primary" size="sm"><UserPlus size={13} /> Nuevo paciente</Btn>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <Crd key={p.name} className="overflow-hidden">
            <div className="h-2 w-full" style={{ backgroundColor: p.color }} />
            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Av initials={p.av} color={p.color} size="lg" />
                  <div>
                    <p className="font-extrabold text-[#1C1135]">{p.name}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">{p.age} años</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: p.status === "nuevo" ? B.orangeLight : "#D1FAE5", color: p.status === "nuevo" ? B.orange : "#059669" }}>
                  {p.status}
                </span>
              </div>
              <div className="rounded-2xl px-3 py-2 text-xs font-medium text-[#7C6F9A] mb-4" style={{ background: B.violetLight }}>
                {p.dx}
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#7C6F9A] font-medium">Progreso</span>
                  <span className="font-extrabold text-[#1C1135]">{p.progress}%</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ background: B.violetLight }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, backgroundColor: p.color }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs mb-4">
                <div>
                  <span className="text-[#9E95B7]">Próxima sesión</span>
                  <p className="font-bold text-[#1C1135]">{p.nextSession}</p>
                </div>
                <div className="text-right">
                  <span className="text-[#9E95B7]">Sesiones</span>
                  <p className="font-bold text-[#1C1135]">{p.sessions}</p>
                </div>
              </div>
              <Btn variant="secondary" size="sm" className="w-full justify-center" onClick={() => { setSelected(i); setExpTab("resumen"); }}>
                <Eye size={13} /> Abrir expediente
              </Btn>
            </div>
          </Crd>
        ))}
      </div>
    </div>
  );
}

export function TerapeutaAgenda({ go, requests: incomingRequests = [], onRequestUpdate }: { go: (v: View) => void; requests?: AppointmentRequest[]; onRequestUpdate?: (id: number, status: "confirmada" | "rechazada") => void }) {
  const [agView, setAgView] = useState<"dia" | "semana">("semana");
  const pendingRequests = incomingRequests.filter(r => r.status === "por confirmar");
  const [requestNotice, setRequestNotice] = useState("");
  const days = ["Lun 28", "Mar 29", "Mié 30", "Jue 31", "Vie 01", "Sáb 02", "Dom 03"];
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const events = [
    { day: 0, hour: 9,  patient: "Mateo G.",    color: B.violet,  type: "Virtual"    },
    { day: 1, hour: 11, patient: "Valentina L.", color: B.teal,    type: "Virtual" },
    { day: 2, hour: 9,  patient: "Mateo G.",    color: B.violet,  type: "Virtual"    },
    { day: 2, hour: 15, patient: "Bruno R.",     color: "#22C55E", type: "Virtual"    },
    { day: 3, hour: 10, patient: "Fernanda T.",  color: B.orange,  type: "Virtual" },
    { day: 4, hour: 11, patient: "Valentina L.", color: B.teal,    type: "Virtual" },
    { day: 4, hour: 14, patient: "Sebastián V.", color: "#8B5CF6", type: "Virtual"    },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Agenda</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Julio 2026</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-2xl overflow-hidden border" style={{ borderColor: B.border }}>
            {(["dia", "semana"] as const).map(v => (
              <button key={v} className="px-4 py-2 text-sm font-bold transition-all"
                style={{ background: agView === v ? B.violet : "white", color: agView === v ? "white" : B.textMid }}
                onClick={() => setAgView(v)}>
                {v === "dia" ? "Día" : "Semana"}
              </button>
            ))}
          </div>
          <Btn variant="outline" size="sm" onClick={() => go("terapeuta/config")}><Clock size={13} /> Configurar horarios</Btn>
        </div>
      </div>

      {requestNotice && <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-800 bg-emerald-100">✓ {requestNotice}</div>}
      {pendingRequests.length > 0 && (
        <Crd className="p-4 mb-5 border-2 border-orange-100" style={{ background: "#FFFBEB" }}>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div><h3 className="font-extrabold text-[#1C1135]">Solicitudes de cita</h3><p className="text-xs text-[#7C6F9A] font-medium">Aceptá una solicitud para habilitar el pago del tutor.</p></div>
            <Bdg color="orange">{pendingRequests.length} pendientes</Bdg>
          </div>
          <div className="flex flex-col gap-2">
            {pendingRequests.map(req => {
              const initials = req.child.split(" ").map((p: string) => p[0]).join("").slice(0, 2);
              const parentLabel = req.parent ?? "Tutor";
              return (
                <div key={req.id} className="flex items-center gap-3 rounded-2xl p-3 bg-white border border-orange-100 flex-wrap">
                  <Av initials={initials} color={B.orange} size="sm" />
                  <div className="flex-1 min-w-40">
                    <p className="text-sm font-extrabold text-[#1C1135]">{req.child}</p>
                    <p className="text-xs text-[#7C6F9A]">{parentLabel} · {req.date} · {req.time}</p>
                  </div>
                  <Btn size="sm" variant="outline" onClick={() => { onRequestUpdate?.(req.id, "rechazada"); setRequestNotice(`Solicitud de ${req.child} rechazada.`); }}><X size={12} /> Rechazar</Btn>
                  <Btn size="sm" variant="primary" onClick={() => { onRequestUpdate?.(req.id, "confirmada"); setRequestNotice(`Solicitud aceptada. Avisamos a ${parentLabel} para que complete el pago.`); }}><Check size={12} /> Aceptar</Btn>
                </div>
              );
            })}
          </div>
        </Crd>
      )}

      {agView === "semana" ? (
        <Crd className="overflow-hidden">
          <div className="overflow-x-auto">
          <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid border-b" style={{ gridTemplateColumns: "64px repeat(7, 1fr)", borderColor: B.border }}>
            <div className="p-3 border-r" style={{ borderColor: B.border }} />
            {days.map((d, i) => {
              const isToday = i === 2;
              return (
                <div key={d} className="p-3 text-center border-r last:border-0" style={{ borderColor: B.border }}>
                  <p className="text-xs text-[#9E95B7] font-medium">{d.slice(0, 3)}</p>
                  <p className={`font-extrabold text-sm ${isToday ? "text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto" : "text-[#1C1135]"}`}
                    style={isToday ? { background: B.violet } : {}}>
                    {d.slice(4)}
                  </p>
                </div>
              );
            })}
          </div>
          {/* Time grid */}
          <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
            {hours.map((h, hi) => (
              <div key={h} className="grid border-b" style={{ gridTemplateColumns: "64px repeat(7, 1fr)", borderColor: B.border, minHeight: 52 }}>
                <div className="p-2 text-right pr-3 border-r text-xs text-[#9E95B7] font-medium pt-3" style={{ borderColor: B.border }}>{h}</div>
                {days.map((_, di) => {
                  const ev = events.find(e => e.day === di && e.hour === hi + 8);
                  return (
                    <div key={di} className="relative border-r last:border-0 p-1" style={{ borderColor: B.border }}>
                      {ev && (
                        <div className="rounded-xl px-2 py-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ background: `${ev.color}20`, borderLeft: `3px solid ${ev.color}` }}>
                          <p className="text-xs font-extrabold truncate" style={{ color: ev.color }}>{ev.patient}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          </div>
          </div>
        </Crd>
      ) : (
        <div className="flex flex-col gap-3">
          {events.filter(e => e.day === 2).map((ev, i) => (
            <Crd key={i} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${ev.color}20` }}>
                  <Video size={20} style={{ color: ev.color }} />
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-[#1C1135]">{ev.patient}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">{String(ev.hour).padStart(2,"0")}:00 · 45 min</p>
                </div>
                <Btn size="sm" variant="primary" onClick={() => go("session")}><Video size={12} /> Entrar</Btn>
              </div>
            </Crd>
          ))}
        </div>
      )}
    </div>
  );
}

export function TerapeutaReportes({ go: _go }: { go: (v: View) => void }) {
  const initialReports = [
    { title: "Evaluación mensual — Mateo Gómez", date: "28 Jul 2026", patient: "Mateo G.", type: "Seguimiento", status: "firmado", objective: "Trabajar pronunciación y reforzar la discriminación auditiva." },
    { title: "Informe de alta — Bruno Ríos", date: "15 Jul 2026", patient: "Bruno R.", type: "Alta", status: "borrador", objective: "Recopilar avances y recomendaciones de cierre." },
    { title: "Evaluación inicial — Fernanda Torres", date: "10 Jul 2026", patient: "Fernanda T.", type: "Inicial", status: "borrador", objective: "Establecer la línea base de comunicación." },
    { title: "Seguimiento julio — Valentina López", date: "05 Jul 2026", patient: "Valentina L.", type: "Seguimiento", status: "firmado", objective: "Acompañar avances de comunicación funcional." },
  ];
  const [reports, setReports] = useState(initialReports);
  const [selectedRep, setSelectedRep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newReportOpen, setNewReportOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ patient: "", type: "Seguimiento mensual", date: "", objective: "" });
  const templates = ["Evaluación inicial", "Seguimiento mensual", "Alta terapéutica", "Informe psicológico", "Informe de lenguaje"];
  const rep = reports[selectedRep];
  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 3200); };
  const reportLines = (report = rep) => [
    `Paciente: ${report.patient}`, `Tipo de reporte: ${report.type}`, `Fecha: ${report.date}`, "",
    "Objetivos de la sesión", report.objective || "[Completa aquí el objetivo clínico de la sesión]", "",
    "Observaciones clínicas", "Se observa progreso sostenido y buena disposición durante la sesión.", "",
    "Recomendaciones", "Continuar con las actividades asignadas y la práctica guiada en casa.", "",
    `Estado del documento: ${report.status}`,
  ];
  const downloadReport = (report = rep) => downloadPdf(`${report.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`, report.title, reportLines(report));
  const createReport = () => {
    const patient = form.patient.trim() || "Paciente por completar";
    const type = form.type;
    const report = { title: `${type} — ${patient}`, patient, type, date: form.date || "Fecha por completar", status: "borrador", objective: form.objective };
    setReports((current) => [report, ...current]);
    setSelectedRep(0);
    setNewReportOpen(false);
    setForm({ patient: "", type: "Seguimiento mensual", date: "", objective: "" });
    showNotice("Reporte creado con datos generales. Ya puedes completar el contenido.");
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {notice && <div className="fixed right-4 top-5 z-[70] flex max-w-sm items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xl"><CheckCircle size={18} />{notice}</div>}
      {previewOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} aria-label="Cerrar vista previa" />
          <div className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-[#E8E5F4] bg-white/95 px-6 py-5 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Vista previa del PDF</p><h3 className="font-black text-[#1C1135]">{rep.title}</h3></div><button onClick={() => setPreviewOpen(false)} className="rounded-xl p-2 text-[#7C6F9A] hover:bg-[#F5F3FF]"><X size={18} /></button></div>
            <div className="space-y-4 p-6">{reportLines().map((line, index) => line ? <p key={index} className={index === 0 ? "text-sm font-extrabold text-[#1C1135]" : "text-sm font-medium leading-relaxed text-[#51466F]"}>{line}</p> : <div key={index} className="h-1" />)}</div>
            <div className="flex justify-end gap-3 border-t border-[#E8E5F4] px-6 py-4"><Btn variant="outline" onClick={() => setPreviewOpen(false)}>Cerrar</Btn><Btn variant="cta" onClick={() => downloadReport()}><Download size={14} /> Descargar PDF</Btn></div>
          </div>
        </div>
      )}
      {newReportOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setNewReportOpen(false)} aria-label="Cerrar" /><div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-xl font-black text-[#1C1135]">Nuevo reporte</h3><p className="mt-1 text-sm font-medium text-[#7C6F9A]">Completa los datos base; el reporte se creará con espacios listos para editar.</p></div><button onClick={() => setNewReportOpen(false)} className="rounded-xl p-2 text-[#7C6F9A] hover:bg-[#F5F3FF]"><X size={18} /></button></div><div className="space-y-4"><Inp label="Paciente" value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} placeholder="Nombre del paciente" /><div><label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Tipo de reporte</label><select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium"><option>Seguimiento mensual</option><option>Evaluación inicial</option><option>Informe de alta</option></select></div><Inp label="Fecha" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /><div><label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Objetivo principal</label><textarea value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="Ej.: fortalecer la articulación del fonema /r/" className="min-h-24 w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium outline-none focus:border-violet-400" /></div></div><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setNewReportOpen(false)}>Cancelar</Btn><Btn variant="cta" onClick={createReport}><Plus size={14} /> Crear reporte</Btn></div></div></div>
      )}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="mb-1 text-2xl font-black text-[#1C1135]">Reportes</h2><p className="text-sm font-medium text-[#7C6F9A]">Editor profesional de reportes clínicos</p></div><Btn variant="primary" size="sm" onClick={() => setNewReportOpen(true)}><Plus size={13} /> Nuevo reporte</Btn></div>
      <div className="grid gap-5 lg:grid-cols-3"><div className="flex flex-col gap-3"><p className="px-1 text-xs font-bold uppercase tracking-wider text-[#9E95B7]">Reportes</p>{reports.map((report, i) => <button key={`${report.title}-${i}`} className="rounded-2xl border p-4 text-left transition-all" style={{ background: selectedRep === i ? B.violetLight : "white", borderColor: selectedRep === i ? B.violet : B.border }} onClick={() => setSelectedRep(i)}><p className="mb-1 text-sm font-extrabold leading-snug text-[#1C1135]">{report.title}</p><div className="flex items-center justify-between"><p className="text-xs font-medium text-[#9E95B7]">{report.date}</p><span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: report.status === "firmado" ? "#D1FAE5" : B.orangeLight, color: report.status === "firmado" ? "#059669" : B.orange }}>{report.status}</span></div></button>)}<div className="mt-2"><p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-[#9E95B7]">Plantillas descargables</p>{templates.map((template) => <button key={template} onClick={() => downloadPdf(`${template.toLowerCase().replaceAll(" ", "-")}.pdf`, template, ["Plantilla clínica ASHAKids", "", "Paciente: ______________________________", "Fecha: _________________________________", "", "Objetivo clínico: ________________________", "", "Observaciones: __________________________", "", "Recomendaciones: ________________________"])} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#7C6F9A] transition-colors hover:bg-[#F5F3FF]"><Download size={12} /> {template}</button>)}</div></div>
        <div className="lg:col-span-2"><Crd className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b p-5" style={{ borderColor: B.border }}><div><p className="mb-0.5 text-xs font-medium text-[#9E95B7]">{rep.type} · {rep.patient}</p><h3 className="font-extrabold text-[#1C1135]">{rep.title}</h3></div><div className="flex flex-wrap gap-2"><Btn size="sm" variant="ghost" onClick={() => setPreviewOpen(true)}><Eye size={12} /> Vista previa</Btn><Btn size="sm" variant="ghost" onClick={() => downloadReport()}><Download size={12} /> PDF</Btn><Btn size="sm" variant="ghost" onClick={() => showNotice("Reporte enviado correctamente al contacto registrado.")}><Send size={12} /> Enviar</Btn><Btn size="sm" variant="primary" onClick={() => { setReports((current) => current.map((item, i) => i === selectedRep ? { ...item, status: "firmado" } : item)); showNotice("Reporte firmado digitalmente."); }}><Edit size={12} /> Firmar</Btn></div></div><div className="space-y-5 p-6"><div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">Información general</p><div className="grid gap-3 sm:grid-cols-3">{[{ label: "Paciente", val: rep.patient }, { label: "Fecha", val: rep.date }, { label: "Estado", val: rep.status }].map((field) => <div key={field.label} className="rounded-xl p-3" style={{ background: B.violetLight }}><p className="mb-1 text-xs font-medium text-[#9E95B7]">{field.label}</p><p className="text-sm font-extrabold capitalize text-[#1C1135]">{field.val}</p></div>)}</div></div>{[["Objetivos de la sesión", "Trabajar pronunciación del fonema /r/ vibrante en posición inicial y media. Reforzar discriminación auditiva de pares mínimos."], ["Observaciones clínicas", "El niño mostró alta motivación durante toda la sesión. Se observa progreso sostenido desde la última evaluación."], ["Conclusiones y recomendaciones", "Continuar con actividades de automatización y practicar 15 minutos diarios con el material asignado."]].map(([heading, body]) => <div key={heading}><p className="mb-2 text-xs font-bold uppercase tracking-wider text-violet-600">{heading}</p><p className="text-sm font-medium leading-relaxed text-[#4A4560]">{body}</p></div>)}<div className="border-t pt-5" style={{ borderColor: B.border }}><p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-600">Firma digital</p><div className="flex items-center gap-4 rounded-2xl p-4" style={{ background: B.tealLight }}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 font-black text-white">AR</div><div><p className="font-extrabold text-[#1C1135]">Dra. Ana Ruiz</p><p className="text-xs font-medium text-[#7C6F9A]">Terapeuta de lenguaje · Cédula 12345678</p></div>{rep.status === "firmado" && <div className="ml-auto flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle size={14} /> Firmado digitalmente</div>}</div></div></div></Crd></div></div>
    </div>
  );
}
export function TerapeutaAnaliticas() {
  const monthlyData = [
    { mes: "Feb", sesiones: 18, horas: 14 },
    { mes: "Mar", sesiones: 22, horas: 17 },
    { mes: "Abr", sesiones: 19, horas: 15 },
    { mes: "May", sesiones: 25, horas: 20 },
    { mes: "Jun", sesiones: 28, horas: 22 },
    { mes: "Jul", sesiones: 31, horas: 25 },
  ];
  const maxSes = 31;
  const areaStats = [
    { label: "Pacientes atendidos",   val: "18",   trend: "+3 mes",  color: B.violet  },
    { label: "Horas trabajadas",       val: "94",   trend: "+12 mes", color: B.teal    },
    { label: "Sesiones realizadas",    val: "143",  trend: "+18 mes", color: "#22C55E" },
    { label: "Asistencia",             val: "96%",  trend: "+2%",     color: "#F59E0B" },
    { label: "Cancelaciones",          val: "4",    trend: "-2 mes",  color: B.orange  },
    { label: "Prog. promedio",         val: "72%",  trend: "+8%",     color: "#8B5CF6" },
  ];
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Analíticas</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Métricas de desempeño clínico · 2026</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {areaStats.map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: `${s.color}15` }}>
            <p className="font-black text-2xl text-[#1C1135] mb-1">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium leading-snug mb-2">{s.label}</p>
            <span className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</span>
          </div>
        ))}
      </div>
      <div className="mb-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Sesiones por mes</h4>
          <div className="flex items-end gap-3 mb-3" style={{ height: 120 }}>
            {monthlyData.map((d, i) => {
              const barH = Math.max(4, Math.round((d.sesiones / maxSes) * 88));
              const isLast = i === monthlyData.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.sesiones}</span>
                  <div className="w-full rounded-t-xl transition-all" style={{ height: barH, background: isLast ? B.violet : B.violetLight }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? B.violet : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
      </div>
      <Crd className="p-5">
        <h4 className="font-extrabold text-[#1C1135] mb-4">Objetivos alcanzados vs. planificados</h4>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Alcanzados",   val: 38, total: 50, color: "#22C55E" },
            { label: "En progreso",  val: 9,  total: 50, color: "#F59E0B" },
            { label: "Pendientes",   val: 3,  total: 50, color: B.orange  },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: `${s.color}15` }}>
              <p className="font-black text-3xl text-[#1C1135] mb-1">{s.val}</p>
              <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
              <div className="mt-3 h-2 rounded-full bg-white">
                <div className="h-full rounded-full" style={{ width: `${(s.val/s.total)*100}%`, backgroundColor: s.color }} />
              </div>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}

export function TerapeutaMensajes() {
  const [activeChat, setActiveChat] = useState(0);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const conversations = [
    { name: "Laura Gómez",   sub: "Mamá de Mateo",     last: "Gracias doctora! 🙏",          time: "09:15", unread: 2, av: "LG", color: B.violet  },
    { name: "Rosa López",    sub: "Mamá de Valentina", last: "¿Cuándo es la próxima sesión?", time: "Ayer",  unread: 0, av: "RL", color: B.teal    },
    { name: "Andrés Ríos",   sub: "Papá de Bruno",     last: "Excelente, muchas gracias",     time: "Lun",   unread: 0, av: "AR", color: "#22C55E" },
    { name: "Claudia Torres",sub: "Mamá de Fernanda",  last: "¿Recibió el formulario?",       time: "Dom",   unread: 1, av: "CT", color: B.orange  },
  ];
  const msgs = [
    { from: "Laura Gómez",   text: "Doctora, Mateo practicó mucho anoche con los ejercicios que envió",      time: "09:10", own: false },
    { from: "Dra. Ana Ruiz", text: "¡Qué buenas noticias! Se nota el avance, sigan con el mismo ritmo 🎉",   time: "09:12", own: true  },
    { from: "Laura Gómez",   text: "Gracias doctora! 🙏",                                                     time: "09:15", own: false },
  ];
  const conv = conversations[activeChat];

  const handleSelectChat = (i: number) => {
    setActiveChat(i);
    setMobileView("chat");
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Mensajes</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Comunicación con padres de familia</p>
      </div>
      <div className="rounded-3xl overflow-hidden border" style={{ borderColor: B.border }}>
        <div className="lg:grid lg:grid-cols-3">
          {/* Conversation list — visible on desktop always; on mobile only when mobileView==="list" */}
          <div className={`border-r lg:block ${mobileView === "list" ? "block" : "hidden"}`} style={{ borderColor: B.border }}>
            <div className="p-4 border-b" style={{ borderColor: B.border }}>
              <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-2.5 text-sm text-[#1C1135] placeholder-[#9E95B7] focus:outline-none focus:border-violet-400 font-medium" placeholder="Buscar conversación…" />
            </div>
            <div className="divide-y" style={{ borderColor: B.border }}>
              {conversations.map((c, i) => (
                <div key={i} className="p-4 flex items-center gap-3 cursor-pointer transition-colors hover:opacity-80"
                  style={{ background: activeChat === i ? B.violetLight : "white" }}
                  onClick={() => handleSelectChat(i)}>
                  <Av initials={c.av} color={c.color} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-extrabold text-sm text-[#1C1135]">{c.name}</p>
                      <p className="text-xs text-[#9E95B7]">{c.time}</p>
                    </div>
                    <p className="text-xs text-[#7C6F9A] font-medium truncate">{c.sub}</p>
                    <p className="text-xs text-[#9E95B7] truncate mt-0.5">{c.last}</p>
                  </div>
                  {c.unread > 0 && (
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: B.violet }}>{c.unread}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat area — visible on desktop always; on mobile only when mobileView==="chat" */}
          <div className={`lg:col-span-2 flex-col lg:flex ${mobileView === "chat" ? "flex" : "hidden"}`} style={{ minHeight: 480 }}>
            <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: B.border }}>
              <button
                className="lg:hidden p-2 rounded-xl mr-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                style={{ background: B.violetLight, color: B.violet }}
                onClick={() => setMobileView("list")}
                aria-label="Volver a conversaciones">
                <ChevronLeft size={18} />
              </button>
              <Av initials={conv.av} color={conv.color} size="sm" />
              <div>
                <p className="font-extrabold text-sm text-[#1C1135]">{conv.name}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{conv.sub}</p>
              </div>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto" style={{ background: "#FAFAF9" }}>
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.own ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%] sm:max-w-xs rounded-3xl px-4 py-3"
                    style={{ background: m.own ? B.violet : "white", color: m.own ? "white" : "#1C1135", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: m.own ? "rgba(255,255,255,0.7)" : B.textMuted }}>{m.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex gap-2" style={{ borderColor: B.border }}>
              <Btn size="sm" variant="ghost"><Paperclip size={14} /></Btn>
              <input className="flex-1 rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-2 text-sm text-[#1C1135] placeholder-[#9E95B7] focus:outline-none focus:border-violet-400 font-medium" placeholder="Escribir mensaje…" />
              <Btn size="sm" variant="primary"><Send size={14} /></Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TerapeutaIngresos() {
  const sessionData = [
    { mes: "Feb", val: 14 }, { mes: "Mar", val: 17 }, { mes: "Abr", val: 15 },
    { mes: "May", val: 19 }, { mes: "Jun", val: 21 }, { mes: "Jul", val: 18 },
  ];
  const maxVal = 21;
  const transactions = [
    { patient: "Laura Gómez",    concept: "4 sesiones — Julio", amount: "S/ 180.00", date: "28 Jul", status: "cobrado"   },
    { patient: "Andrés Ríos",    concept: "4 sesiones — Julio", amount: "S/ 180.00", date: "26 Jul", status: "cobrado"   },
    { patient: "Rosa López",     concept: "3 sesiones — Julio", amount: "S/ 135.00", date: "22 Jul", status: "cobrado"   },
    { patient: "Claudia Torres", concept: "2 sesiones — Julio", amount: "S/ 90.00",  date: "20 Jul", status: "cobrado"   },
    { patient: "Jorge Vargas",   concept: "5 sesiones — Julio", amount: "S/ 225.00", date: "18 Jul", status: "pendiente" },
  ];
  const downloadStatement = () => downloadPdf("estado-de-cuenta-julio-2026.pdf", "Estado de cuenta — Julio 2026", [
    "Terapeuta: Dra. Ana Ruiz", "Tarifa por sesión: S/ 45.00", "", "Pagos registrados: 5", "Sesiones cobradas: 18", "Importe cobrado: S/ 585.00", "Importe pendiente: S/ 225.00", "", ...transactions.map((payment) => `${payment.date} · ${payment.patient} · ${payment.amount} · ${payment.status}`),
  ]);
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Pagos</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Información de pagos · Julio 2026 · <span className="italic">Datos simulados para demostración</span></p>
        </div>
        <Btn size="sm" variant="ghost" onClick={downloadStatement}><Download size={13} /> Estado de cuenta</Btn>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Pagos mes",         val: "5",       color: "#059669", bg: "#D1FAE5",    trend: "S/ 810 registrados" },
          { label: "Sesiones cobradas", val: "18",      color: B.violet,  bg: B.violetLight, trend: "de 21 sesiones" },
          { label: "Pendientes",        val: "1",       color: B.orange,  bg: B.orangeLight, trend: "S/ 225 por cobrar" },
          { label: "Tarifa/sesión",     val: "S/ 45",   color: B.teal,    bg: B.tealLight,   trend: "por sesión virtual" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135] mb-0.5">{s.val}</p>
            <p className="text-xs text-[#7C6F9A] font-medium mb-1">{s.label}</p>
            <p className="text-xs font-bold" style={{ color: s.color }}>{s.trend}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-5">Sesiones por mes</h4>
          <div className="flex items-end gap-2 mb-2" style={{ height: 110 }}>
            {sessionData.map((d, i) => {
              const barH = Math.max(4, Math.round((d.val / maxVal) * 78));
              const isLast = i === sessionData.length - 1;
              return (
                <div key={d.mes} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-bold" style={{ color: isLast ? "#059669" : B.textMuted }}>{d.val}</span>
                  <div className="w-full rounded-t-xl" style={{ height: barH, background: isLast ? "#059669" : "#D1FAE5" }} />
                  <span className="text-xs font-bold" style={{ color: isLast ? "#059669" : B.textMuted }}>{d.mes}</span>
                </div>
              );
            })}
          </div>
        </Crd>
        <Crd className="p-5">
          <h4 className="font-extrabold text-[#1C1135] mb-4">Métodos de pago</h4>
          {[
            { method: "Transferencia bancaria", pct: 65, color: B.violet },
            { method: "Tarjeta de crédito",     pct: 25, color: B.teal   },
            { method: "Plataforma",             pct: 10, color: B.orange  },
          ].map(m => (
            <div key={m.method} className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#7C6F9A] font-medium">{m.method}</span>
                <span className="font-extrabold text-[#1C1135]">{m.pct}%</span>
              </div>
              <div className="h-2.5 rounded-full" style={{ background: B.violetLight }}>
                <div className="h-full rounded-full" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
              </div>
            </div>
          ))}
        </Crd>
      </div>
      <Crd>
        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: B.border }}>
          <h4 className="font-extrabold text-[#1C1135]">Historial de pagos</h4>
          <Bdg color="violet">{transactions.length}</Bdg>
        </div>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {transactions.map((t, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: t.status === "cobrado" ? "#D1FAE5" : B.orangeLight }}>
                <CreditCard size={16} style={{ color: t.status === "cobrado" ? "#059669" : B.orange }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{t.patient}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{t.concept}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-[#1C1135]">{t.amount}</p>
                <p className="text-xs text-[#9E95B7]">{t.date}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: t.status === "cobrado" ? "#D1FAE5" : B.orangeLight, color: t.status === "cobrado" ? "#059669" : B.orange }}>
                {t.status}
              </span>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
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

// ─── Terapeuta Config ──────────────────────────────────────────────────────────

export function TerapeutaConfig() {
  const [tab, setTab] = useState<"perfil" | "disponibilidad" | "tarifas" | "notificaciones" | "seguridad">("perfil");
  const [saved, setSaved] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [avatarBg, setAvatarBg] = useState(B.teal);
  const [uploadedImg, setUploadedImg] = useState<string | null>(null);
  const [show2faModal, setShow2faModal] = useState(false);
  const [twoFaEmail, setTwoFaEmail] = useState("ana.ruiz@ashakids.pe");
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [securityNotice, setSecurityNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Perfil editable fields
  const [perfilNombre, setPerfilNombre] = useState("Dra. Ana Ruiz");
  const [perfilEmail, setPerfilEmail] = useState("ana.ruiz@ashakids.com");
  const [perfilTel, setPerfilTel] = useState("+51 999 234 567");
  const [perfilEsp, setPerfilEsp] = useState("Terapia del Lenguaje");
  const [perfilExp, setPerfilExp] = useState("8 años");
  const [perfilCedula, setPerfilCedula] = useState("TEL-2018-4821");
  const [perfilBio, setPerfilBio] = useState("Terapeuta del lenguaje con 8 años de experiencia. Especializada en trastornos fonológicos y del desarrollo del lenguaje en niños de 2 a 12 años.");

  // Seguridad editable fields
  const [pwActual, setPwActual] = useState("");
  const [pwNueva, setPwNueva] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPwActual, setShowPwActual] = useState(false);
  const [showPwNueva, setShowPwNueva] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwErrors, setPwErrors] = useState<{ actual?: string; nueva?: string; confirm?: string }>({});

  // Disponibilidad per-day durations
  const [dayDurations, setDayDurations] = useState<string[]>(["45 min", "45 min", "45 min", "45 min", "45 min", "30 min", "30 min"]);

  const photoPresets = [
    { bg: B.teal,    label: "Esmeralda" },
    { bg: B.violet,  label: "Violeta"   },
    { bg: "#EC4899", label: "Rosa"      },
    { bg: "#059669", label: "Verde"     },
    { bg: B.orange,  label: "Naranja"   },
    { bg: "#2563EB", label: "Azul"      },
    { bg: "#7C3AED", label: "Índigo"    },
    { bg: "#DC2626", label: "Rojo"      },
  ];

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const tabs: { key: typeof tab; label: string; icon: string }[] = [
    { key: "perfil",          label: "Perfil",          icon: "👤" },
    { key: "disponibilidad",  label: "Disponibilidad",  icon: "🗓️" },
    { key: "tarifas",         label: "Tarifas",         icon: "💳" },
    { key: "notificaciones",  label: "Notificaciones",  icon: "🔔" },
    { key: "seguridad",       label: "Seguridad",       icon: "🔐" },
  ];

  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const [activeDays, setActiveDays] = useState([true, true, true, true, true, false, false]);
  const toggleDay = (i: number) => setActiveDays(d => d.map((v, j) => j === i ? !v : v));

  const [notifs, setNotifs] = useState({ nuevaCita: true, cancelacion: true, recordatorio: true, mensajes: true, reportes: false, marketing: false });
  const toggleNotif = (k: keyof typeof notifs) => setNotifs(n => ({ ...n, [k]: !n[k] }));

  return (
    <div className="p-4 sm:p-6 max-w-4xl" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>

      {securityNotice && <div className="fixed right-4 top-5 z-[70] flex max-w-sm items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-xl"><CheckCircle size={18} />{securityNotice}</div>}
      {show2faModal && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setShow2faModal(false)} aria-label="Cerrar" /><div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><button onClick={() => setShow2faModal(false)} className="absolute right-4 top-4 rounded-xl p-2 text-[#7C6F9A] hover:bg-[#F5F3FF]"><X size={18} /></button><div className="mb-5 pr-8"><p className="text-xs font-bold uppercase tracking-wider text-violet-600">Seguridad</p><h3 className="mt-1 text-xl font-black text-[#1C1135]">Activar autenticación en dos pasos</h3><p className="mt-2 text-sm font-medium leading-relaxed text-[#7C6F9A]">Te enviaremos una confirmación al correo indicado antes de activar 2FA.</p></div><Inp label="Correo de confirmación" type="email" value={twoFaEmail} onChange={(e) => setTwoFaEmail(e.target.value)} /><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setShow2faModal(false)}>Cancelar</Btn><Btn variant="cta" onClick={() => { setTwoFaEnabled(true); setShow2faModal(false); setSecurityNotice(`2FA activado. Confirmación enviada a ${twoFaEmail}.`); window.setTimeout(() => setSecurityNotice(""), 3500); }}><Check size={14} /> Confirmar activación</Btn></div></div></div>}
      {confirmDelete && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button className="absolute inset-0 bg-[#1C1135]/45 backdrop-blur-sm" onClick={() => setConfirmDelete(false)} aria-label="Cerrar" /><div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600"><X size={22} /></div><h3 className="text-xl font-black text-[#1C1135]">¿Eliminar esta cuenta?</h3><p className="mt-2 text-sm font-medium leading-relaxed text-[#7C6F9A]">Esta acción elimina el acceso y no se puede deshacer. Revisa tus reportes y pagos antes de continuar.</p><div className="mt-6 flex justify-end gap-3"><Btn variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Btn><Btn variant="danger" onClick={() => { setConfirmDelete(false); setSecurityNotice("Solicitud de eliminación recibida. Te contactaremos para verificarla."); window.setTimeout(() => setSecurityNotice(""), 3500); }}>Confirmar eliminación</Btn></div></div></div>}

      {/* ── Modal selector de foto ── */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPhotoModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-sm max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4]">
              <h2 className="font-extrabold text-[#1C1135] text-lg">Foto de perfil</h2>
              <button onClick={() => setShowPhotoModal(false)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]">
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              {/* Preview actual */}
              <div className="flex justify-center mb-6">
                {uploadedImg ? (
                  <img src={uploadedImg} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover shadow-md" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-md transition-all duration-200" style={{ background: avatarBg }}>
                    AR
                  </div>
                )}
              </div>
              {/* Avatares predefinidos */}
              <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Avatares predefinidos</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {photoPresets.map(p => (
                  <button key={p.bg} onClick={() => { setAvatarBg(p.bg); setUploadedImg(null); }}
                    className="flex flex-col items-center gap-1.5 group">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-sm transition-all duration-150 ${avatarBg === p.bg && !uploadedImg ? "ring-2 ring-offset-2 ring-violet-500 scale-105" : "hover:scale-105 hover:shadow-md"}`}
                      style={{ background: p.bg }}>
                      AR
                    </div>
                    <span className="text-xs font-bold text-[#9E95B7] leading-none">{p.label}</span>
                  </button>
                ))}
              </div>
              {/* Subir imagen */}
              <div className="border-t border-[#E8E5F4] pt-4 mb-4">
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-3">Subir imagen propia</p>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedImg(URL.createObjectURL(file));
                }} />
                <button onClick={() => fileRef.current?.click()}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-[#C4B5FD] text-sm font-bold text-violet-600 hover:bg-violet-50 transition-colors flex items-center justify-center gap-2">
                  <Upload size={15} /> Seleccionar archivo de imagen
                </button>
                {uploadedImg && (
                  <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> Imagen cargada correctamente
                  </p>
                )}
              </div>
              <button onClick={() => setShowPhotoModal(false)}
                className="w-full py-3 rounded-2xl font-extrabold text-white text-sm transition-all active:scale-[.97]"
                style={{ background: B.violet }}>
                Guardar foto de perfil
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">Configuración</h1>
        <p className="text-sm text-[#7C6F9A] font-medium">Gestiona tu perfil, disponibilidad y preferencias.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm font-bold transition-all text-left"
              style={{ background: tab === t.key ? B.violet : "white", color: tab === t.key ? "white" : B.textMid, border: `1.5px solid ${tab === t.key ? B.violet : B.border}` }}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Crd className="p-6">

            {/* ── Perfil ── */}
            {tab === "perfil" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Información del perfil</h2>
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  {uploadedImg ? (
                    <img src={uploadedImg} alt="Perfil" className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-md" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0 transition-all duration-200" style={{ background: avatarBg }}>AR</div>
                  )}
                  <div>
                    <p className="font-extrabold text-sm text-[#1C1135]">{perfilNombre}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium mb-2">Foto de perfil</p>
                    <Btn variant="secondary" size="sm" onClick={() => setShowPhotoModal(true)}><Upload size={12} /> Cambiar foto</Btn>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Inp label="Nombre completo" value={perfilNombre} onChange={e => setPerfilNombre(e.target.value)} />
                  <Inp label="Correo electrónico" value={perfilEmail} onChange={e => setPerfilEmail(e.target.value)} />
                  <Inp label="Teléfono" value={perfilTel} onChange={e => setPerfilTel(e.target.value)} />
                  <Inp label="Especialidad principal" value={perfilEsp} onChange={e => setPerfilEsp(e.target.value)} />
                  <Inp label="Años de experiencia" value={perfilExp} onChange={e => setPerfilExp(e.target.value)} />
                  <Inp label="Cédula profesional" value={perfilCedula} onChange={e => setPerfilCedula(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Sobre mí</label>
                  <textarea className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400 resize-none"
                    rows={3} value={perfilBio} onChange={e => setPerfilBio(e.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" onClick={() => { setSecurityNotice("Solicitud enviada al administrador"); setTimeout(() => setSecurityNotice(""), 3500); }}>
                    {saved ? <><CheckCircle size={14} /> Enviado</> : "Solicitar cambio de datos"}
                  </Btn>
                </div>
              </div>
            )}

            {/* ── Disponibilidad ── */}
            {tab === "disponibilidad" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Disponibilidad semanal</h2>
                <div className="flex flex-col gap-3">
                  {days.map((d, i) => (
                    <div key={d} className="flex items-center gap-3 p-3 rounded-2xl flex-wrap" style={{ background: activeDays[i] ? B.violetLight : "#F5F5F5" }}>
                      <button onClick={() => toggleDay(i)}
                        className="w-10 h-6 rounded-full transition-all flex-shrink-0 flex items-center px-0.5"
                        style={{ background: activeDays[i] ? B.violet : "#D1D5DB", justifyContent: activeDays[i] ? "flex-end" : "flex-start" }}>
                        <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                      </button>
                      <span className="w-8 font-extrabold text-sm text-[#1C1135] flex-shrink-0">{d}</span>
                      {activeDays[i] ? (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            <select className="rounded-xl border border-[#E8E5F4] bg-white px-3 py-1.5 text-sm font-medium focus:outline-none" defaultValue="09:00">
                              {["08:00","09:00","10:00"].map(t => <option key={t}>{t}</option>)}
                            </select>
                            <span className="text-xs font-bold text-[#9E95B7]">hasta</span>
                            <select className="rounded-xl border border-[#E8E5F4] bg-white px-3 py-1.5 text-sm font-medium focus:outline-none" defaultValue="17:00">
                              {["16:00","17:00","18:00","19:00"].map(t => <option key={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-xs font-bold text-[#7C6F9A] whitespace-nowrap">Duración de sesión:</span>
                            {["30 min", "45 min", "60 min"].map(dur => (
                              <button key={dur} onClick={() => setDayDurations(prev => prev.map((v, j) => j === i ? dur : v))}
                                className="px-2.5 py-1 rounded-xl text-xs font-bold border transition-all"
                                style={{ borderColor: dayDurations[i] === dur ? B.violet : B.border, background: dayDurations[i] === dur ? B.violet : "white", color: dayDurations[i] === dur ? "white" : B.textMid }}>
                                {dur}
                              </button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-[#9E95B7] font-medium">No disponible</span>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" onClick={save}>{saved ? <><CheckCircle size={14} /> Guardado</> : "Guardar disponibilidad"}</Btn>
                </div>
              </div>
            )}

            {/* ── Tarifas ── */}
            {tab === "tarifas" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Tarifas y pagos</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Tarifa por sesión (PEN)</label>
                    <input className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                      defaultValue="45" type="number" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-[#1C1135] mb-1.5 block">Moneda</label>
                    <select className="w-full rounded-2xl border border-[#E8E5F4] bg-[#F5F3FF] px-4 py-3 text-sm font-medium focus:outline-none">
                      <option>PEN — Sol peruano</option>
                      <option>USD — Dólar americano</option>
                      <option>MXN — Peso mexicano</option>
                      <option>EUR — Euro</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-[#1C1135] mb-2 block">Métodos de pago aceptados</label>
                  <div className="flex flex-col gap-2">
                    {[{ label: "Tarjeta de crédito / débito", on: true }, { label: "Transferencia bancaria", on: true }, { label: "PayPal", on: false }].map(m => (
                      <div key={m.label} className="flex items-center justify-between p-3 rounded-2xl border border-[#E8E5F4]">
                        <span className="text-sm font-bold text-[#1C1135]">{m.label}</span>
                        <div className="w-10 h-6 rounded-full flex items-center px-0.5 cursor-pointer"
                          style={{ background: m.on ? B.violet : "#D1D5DB", justifyContent: m.on ? "flex-end" : "flex-start" }}>
                          <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-4" style={{ background: B.tealLight }}>
                  <p className="text-xs font-extrabold mb-1" style={{ color: B.teal }}>Comisión de la plataforma</p>
                  <p className="text-sm font-medium text-[#1C1135]">ASHAKids retiene un <strong>12%</strong> por sesión procesada. Tu ingreso neto por sesión de <strong>S/ 45.00</strong> sería <strong>S/ 39.60</strong>.</p>
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" onClick={save}>{saved ? <><CheckCircle size={14} /> Guardado</> : "Guardar tarifas"}</Btn>
                </div>
              </div>
            )}

            {/* ── Notificaciones ── */}
            {tab === "notificaciones" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Notificaciones</h2>
                <div className="flex flex-col gap-3">
                  {([
                    { key: "nuevaCita",    label: "Nueva solicitud de cita",        desc: "Cuando un padre solicita una cita contigo"        },
                    { key: "cancelacion",  label: "Cancelación de cita",         desc: "Cuando se cancela una sesión programada"        },
                    { key: "recordatorio", label: "Recordatorios de sesión",     desc: "30 minutos antes de cada sesión"                },
                    { key: "mensajes",     label: "Nuevos mensajes",             desc: "Cuando recibes un mensaje de una familia"       },
                    { key: "reportes",     label: "Reportes listos",             desc: "Cuando ASHI genera un reporte automático"       },
                    { key: "marketing",    label: "Novedades de la plataforma",  desc: "Actualizaciones y nuevas funcionalidades"       },
                  ] as { key: keyof typeof notifs; label: string; desc: string }[]).map(n => (
                    <div key={n.key} className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E5F4]">
                      <div>
                        <p className="font-extrabold text-sm text-[#1C1135]">{n.label}</p>
                        <p className="text-xs text-[#7C6F9A] font-medium">{n.desc}</p>
                      </div>
                      <button onClick={() => toggleNotif(n.key)}
                        className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all flex-shrink-0"
                        style={{ background: notifs[n.key] ? B.violet : "#D1D5DB", justifyContent: notifs[n.key] ? "flex-end" : "flex-start" }}>
                        <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" onClick={save}>{saved ? <><CheckCircle size={14} /> Guardado</> : "Guardar preferencias"}</Btn>
                </div>
              </div>
            )}

            {/* ── Seguridad ── */}
            {tab === "seguridad" && (
              <div className="flex flex-col gap-5">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Seguridad de la cuenta</h2>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Contraseña actual</label>
                    <div className="relative">
                      <input
                        type={showPwActual ? "text" : "password"}
                        value={pwActual}
                        onChange={e => { setPwActual(e.target.value); setPwErrors(er => ({ ...er, actual: undefined })); }}
                        placeholder="Ingresa tu contraseña actual"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium outline-none bg-[#F5F3FF] focus:border-violet-400 ${pwErrors.actual ? "border-red-400" : "border-[#E8E5F4]"}`}
                      />
                      <button type="button" onClick={() => setShowPwActual(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#7C6F9A] hover:bg-white">
                        {showPwActual ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {pwErrors.actual && <p className="text-xs text-red-500 font-bold mt-1">{pwErrors.actual}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPwNueva ? "text" : "password"}
                        value={pwNueva}
                        onChange={e => { setPwNueva(e.target.value); setPwErrors(er => ({ ...er, nueva: undefined })); }}
                        placeholder="Mínimo 8 caracteres"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium outline-none bg-[#F5F3FF] focus:border-violet-400 ${pwErrors.nueva ? "border-red-400" : "border-[#E8E5F4]"}`}
                      />
                      <button type="button" onClick={() => setShowPwNueva(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#7C6F9A] hover:bg-white">
                        {showPwNueva ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {pwErrors.nueva && <p className="text-xs text-red-500 font-bold mt-1">{pwErrors.nueva}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-bold text-[#1C1135]">Confirmar nueva contraseña</label>
                    <div className="relative">
                      <input
                        type={showPwConfirm ? "text" : "password"}
                        value={pwConfirm}
                        onChange={e => { setPwConfirm(e.target.value); setPwErrors(er => ({ ...er, confirm: undefined })); }}
                        placeholder="Repite la nueva contraseña"
                        className={`w-full rounded-2xl border px-4 py-3 pr-12 text-sm font-medium outline-none bg-[#F5F3FF] focus:border-violet-400 ${pwErrors.confirm ? "border-red-400" : "border-[#E8E5F4]"}`}
                      />
                      <button type="button" onClick={() => setShowPwConfirm(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl p-2 text-[#7C6F9A] hover:bg-white">
                        {showPwConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    {pwErrors.confirm && <p className="text-xs text-red-500 font-bold mt-1">{pwErrors.confirm}</p>}
                  </div>
                </div>
                <div className="rounded-2xl p-4 border border-[#E8E5F4]">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">Autenticación en dos pasos</p>
                  <p className="text-xs text-[#7C6F9A] font-medium mb-3">Añade una capa extra de seguridad a tu cuenta</p>
                  <Btn variant="secondary" size="sm" onClick={() => setShow2faModal(true)}>{twoFaEnabled ? <><CheckCircle size={14} /> 2FA activado</> : "Activar 2FA"}</Btn>
                </div>
                <div className="rounded-2xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <p className="font-extrabold text-sm text-red-700 mb-1">Zona de peligro</p>
                  <p className="text-xs text-red-600 font-medium mb-3">Estas acciones son irreversibles.</p>
                  <Btn variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>Eliminar cuenta</Btn>
                </div>
                <div className="flex justify-end">
                  <Btn variant="cta" onClick={() => {
                    const errs: typeof pwErrors = {};
                    if (!pwActual) errs.actual = "Ingresa tu contraseña actual";
                    if (!pwNueva || pwNueva.length < 8) errs.nueva = "La contraseña debe tener al menos 8 caracteres";
                    if (pwNueva !== pwConfirm) errs.confirm = "Las contraseñas no coinciden";
                    if (Object.keys(errs).length > 0) { setPwErrors(errs); return; }
                    setPwActual(""); setPwNueva(""); setPwConfirm("");
                    setSecurityNotice("Contraseña actualizada correctamente");
                    setTimeout(() => setSecurityNotice(""), 3500);
                  }}>
                    Cambiar contraseña
                  </Btn>
                </div>
              </div>
            )}

          </Crd>
        </div>
      </div>
    </div>
  );
}
