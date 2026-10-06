import { useState } from "react";
import { ChevronLeft, ChevronRight, Video, CheckCircle, Plus, Eye, FileText, Check, Edit, Star, UserPlus } from "lucide-react";
import { B, View, Btn, Crd, Bdg, Av, Inp } from "@/components/shared";

const terapeutaPatients = [
  { name: "Mateo Gómez",       age: 7,  parent: "Laura Gómez",   sessions: 12, progress: 78, dx: "Trastorno fonológico",        nextSession: "Hoy 09:00",  status: "activo",    av: "MG", color: B.violet,  nota: "Excelente avance en trabalenguas. Continuar con /r/ vibrante." },
  { name: "Valentina López",   age: 5,  parent: "Rosa López",    sessions: 6,  progress: 55, dx: "Retraso simple del lenguaje",  nextSession: "Hoy 11:30",  status: "activo",    av: "VL", color: B.teal,    nota: "Incrementar vocabulario. Buena comprensión auditiva." },
  { name: "Bruno Ríos",        age: 9,  parent: "Andrés Ríos",   sessions: 20, progress: 88, dx: "Dislexia leve",                nextSession: "Hoy 15:00",  status: "activo",    av: "BR", color: "#22C55E", nota: "Grandes progresos en lectoescritura. Preparar para el alta." },
  { name: "Fernanda Torres",   age: 6,  parent: "Claudia Torres",sessions: 4,  progress: 32, dx: "Trastorno del lenguaje",       nextSession: "Mañana",     status: "nuevo",     av: "FT", color: B.orange,  nota: "Evaluación inicial completada. Definir objetivos terapéuticos." },
  { name: "Sebastián Vargas",  age: 8,  parent: "Jorge Vargas",  sessions: 15, progress: 70, dx: "Déficit de atención",          nextSession: "Jue 02 Ago", status: "activo",    av: "SV", color: "#8B5CF6", nota: "Mejoró concentración. Aumentar dificultad en actividades." },
  { name: "Camila Ponce",      age: 4,  parent: "Sofía Ponce",   sessions: 3,  progress: 20, dx: "Retraso del desarrollo",       nextSession: "Vie 03 Ago", status: "nuevo",     av: "CP", color: "#EC4899", nota: "Familia muy comprometida. Asignar actividades en casa." },
];

type ExpTab = "resumen" | "historial" | "sesiones" | "objetivos" | "actividades" | "reportes" | "notas";

export function TerapeutaPacientes({ go }: { go: (v: View) => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [expTab, setExpTab] = useState<ExpTab>("resumen");
  const [search, setSearch] = useState("");
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [showAddObj, setShowAddObj] = useState(false);
  const [objectives, setObjectives] = useState([
    { id: 1, desc: "Pronunciar correctamente el fonema /r/ vibrante en palabras", area: "Fonología", priority: "Alta", status: "En progreso", baseline: "30%", criterion: "80% en 3 sesiones consecutivas", current: 75, support: "Apoyo mínimo" },
    { id: 2, desc: "Comprensión de instrucciones de dos pasos", area: "Comprensión", priority: "Media", status: "En progreso", baseline: "50%", criterion: "90% de manera independiente", current: 80, support: "Independiente" },
  ]);
  const [newObj, setNewObj] = useState({ desc: "", area: "Fonología", priority: "Media" });
  const [actSubTab, setActSubTab] = useState<"asignadas" | "resultados">("asignadas");
  const [resSubTab, setResSubTab] = useState<"sesion" | "casa">("casa");
  const [resFilterDesde, setResFilterDesde] = useState("");
  const [resFilterHasta, setResFilterHasta] = useState("");
  const [resFilterMundo, setResFilterMundo] = useState("todos");
  const [resFilterTipo, setResFilterTipo] = useState("todos");
  const [resFilterBuscar, setResFilterBuscar] = useState("");
  const [resRapido, setResRapido] = useState<"hoy"|"7d"|"30d"|"custom"|null>("30d");
  const [expandedRes, setExpandedRes] = useState<number[]>([]);
  const [expandedSesAct, setExpandedSesAct] = useState<number[]>([]);
  const [showGenReport, setShowGenReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState("");
  const [reportType, setReportType] = useState("Progreso");
  const [reportNotes, setReportNotes] = useState("");
  const [noteType, setNoteType] = useState("Nota de sesión");
  const [noteText, setNoteText] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [savedNotes, setSavedNotes] = useState<{title:string;text:string;type:string;visibility:string;date:string}[]>([]);

  if (selected !== null) {
    const p = terapeutaPatients[selected];
    const expTabs: { id: ExpTab; label: string }[] = [
      { id: "resumen",    label: "Resumen"     },
      { id: "historial",  label: "Evolución"   },
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
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 inline-block mt-1"
                  style={{ background: "#F5F0FF", color: "#7C3AED" }}>
                  Resumen compartido
                </span>
                <p className="text-xs text-[#9E95B7] mt-2 font-medium">— Dra. Ana Ruiz · 28 Jul 2026</p>
              </div>
              <Btn variant="secondary" size="sm"><Edit size={12} /> Editar nota</Btn>
            </Crd>
          </div>
        )}

        {expTab === "sesiones" && (
          <div className="flex flex-col gap-3">
            {[
              { date: "28 Jul 2026", dur: "45 min", type: "Virtual", obj: "Trabalenguas /r/", rating: 5, goals: ["Pronunciación /r/", "Fluidez verbal"] },
              { date: "21 Jul 2026", dur: "45 min", type: "Virtual", obj: "Fonema /l/",       rating: 4, goals: ["Articulación /l/"] },
              { date: "14 Jul 2026", dur: "60 min", type: "Virtual", obj: "Evaluación mes",   rating: 5, goals: ["Evaluación integral"] },
            ].map((s, i) => (
              <Crd key={i} className="overflow-hidden">
                <button onClick={() => setExpandedSession(expandedSession === i ? null : i)} className="w-full text-left p-5">
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
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={12} fill={j < s.rating ? "#F59E0B" : "none"} stroke={j < s.rating ? "#F59E0B" : "#D1D5DB"} />
                        ))}
                      </div>
                      <ChevronRight size={14} className="text-[#9E95B7] transition-transform" style={{ transform: expandedSession === i ? "rotate(90deg)" : "rotate(0deg)" }} />
                    </div>
                  </div>
                </button>
                {expandedSession === i && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#F0EDF8] space-y-3">
                    {[
                      { label: "Modalidad", val: s.type },
                      { label: "Asistencia", val: "Presente" },
                      { label: "Objetivos trabajados", val: s.goals?.join(", ") || "No registrado" },
                      { label: "Nivel de ayuda", val: "Apoyo mínimo" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="font-medium text-[#7C6F9A]">{item.label}</span>
                        <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{item.val}</span>
                      </div>
                    ))}
                    <div className="rounded-xl p-3 mt-2" style={{ background: "#F5F0FF" }}>
                      <p className="text-xs font-bold text-violet-700 mb-1">Observaciones iniciales</p>
                      <p className="text-xs text-[#7C6F9A]">El niño llegó motivado. Respondió bien a los materiales lúdicos.</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "#F0FDF4" }}>
                      <p className="text-xs font-bold text-green-700 mb-1">Próximos pasos</p>
                      <p className="text-xs text-[#7C6F9A]">Continuar con automatización del fonema /r/ en palabras bisílabas.</p>
                    </div>
                  </div>
                )}
              </Crd>
            ))}
          </div>
        )}

        {expTab === "objetivos" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Objetivos terapéuticos</h3>
              <Btn size="sm" variant="primary" onClick={() => setShowAddObj(true)}>
                <Plus size={13} /> Agregar
              </Btn>
            </div>
            <div className="space-y-3 mb-4">
              {objectives.map(obj => (
                <div key={obj.id} className="rounded-2xl border border-[#E8E5F4] p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-bold text-[#1C1135] leading-snug flex-1">{obj.desc}</p>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: obj.priority === "Alta" ? "#FEF3C7" : "#F5F0FF", color: obj.priority === "Alta" ? "#D97706" : "#7C3AED" }}>
                      {obj.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8E5F4] text-[#7C6F9A]">{obj.area}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#059669" }}>{obj.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-2 rounded-full bg-[#E8E5F4] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${obj.current}%`, background: "#7C3AED" }} />
                    </div>
                    <span className="text-xs font-extrabold" style={{ color: "#7C3AED" }}>{obj.current}%</span>
                  </div>
                  <p className="text-[10px] text-[#9E95B7]">Desempeño actual · {obj.support}</p>
                  <p className="text-[10px] text-[#9E95B7] mt-0.5">Criterio: {obj.criterion}</p>
                  <div className="flex gap-2 mt-3">
                    {["Pausar", "Alcanzado", "Archivar"].map(action => (
                      <button key={action} onClick={() => setObjectives(prev => prev.map(o => o.id === obj.id ? { ...o, status: action === "Alcanzado" ? "Alcanzado" : action === "Pausar" ? "Pausado" : "Archivado" } : o))}
                        className="text-xs font-bold px-2 py-1 rounded-lg border border-[#E8E5F4] text-[#7C6F9A] hover:bg-gray-50 transition-colors">
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {showAddObj && (
              <div className="rounded-2xl border-2 border-violet-200 p-4 bg-[#F5F0FF]">
                <h4 className="font-bold text-[#1C1135] mb-3 text-sm">Nuevo objetivo</h4>
                <textarea value={newObj.desc} onChange={e => setNewObj(d => ({ ...d, desc: e.target.value }))} rows={2}
                  placeholder="Descripción del objetivo..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm focus:outline-none focus:border-violet-400 mb-2 resize-none" />
                <div className="flex gap-2 mb-3">
                  <select value={newObj.area} onChange={e => setNewObj(d => ({ ...d, area: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white">
                    {["Fonología","Comprensión","Expresión","Pragmática","Articulación"].map(a => <option key={a}>{a}</option>)}
                  </select>
                  <select value={newObj.priority} onChange={e => setNewObj(d => ({ ...d, priority: e.target.value }))} className="flex-1 px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white">
                    {["Alta","Media","Baja"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="primary" onClick={() => { if (newObj.desc.trim()) { setObjectives(prev => [...prev, { id: Date.now(), ...newObj, status: "En progreso", baseline: "0%", criterion: "Por definir", current: 0, support: "Apoyo total" }]); setNewObj({ desc: "", area: "Fonología", priority: "Media" }); setShowAddObj(false); } }}>Guardar</Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setShowAddObj(false)}>Cancelar</Btn>
                </div>
              </div>
            )}
          </div>
        )}

        {expTab === "historial" && (
          <div>
            <h3 className="font-extrabold text-[#1C1135] mb-4">Línea de tiempo</h3>
            <div className="space-y-1">
              {[
                { date: "30 Jul 2026", type: "sesion",   icon: "🎥", title: "Sesión completada",             detail: "Se trabajó el fonema /r/ mediante trabalenguas. Desempeño: 70% con apoyo moderado.", action: "Ver sesión" },
                { date: "30 Jul 2026", type: "actividad",icon: "🎮", title: "Actividad completada en Mundo ASHA", detail: "Juego \"La ruta de la R\". 8 de 10 respuestas correctas.", action: "Ver resultado" },
                { date: "28 Jul 2026", type: "objetivo", icon: "🎯", title: "Progreso actualizado",           detail: "Pronunciación del fonema /r/: 75% con apoyo mínimo.", action: null },
                { date: "25 Jul 2026", type: "reporte",  icon: "📄", title: "Reporte publicado",              detail: "Reporte de progreso mensual publicado para el representante.", action: "Ver reporte" },
                { date: "20 Jul 2026", type: "sesion",   icon: "🎥", title: "Sesión completada",             detail: "Comprensión verbal con imágenes secuenciales. Desempeño: 80% independiente.", action: "Ver sesión" },
                { date: "15 Jul 2026", type: "objetivo", icon: "✅", title: "Objetivo alcanzado",             detail: "Vocabulario básico de colores y animales: criterio de logro cumplido.", action: null },
                { date: "10 Jul 2026", type: "nota",     icon: "📝", title: "Nota agregada",                 detail: "Observación: el niño muestra mayor comodidad en actividades lúdicas.", action: null },
              ].map((evt, i) => (
                <div key={i} className="flex gap-3 pb-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 border border-[#E8E5F4] bg-white">{evt.icon}</div>
                    {i < 6 && <div className="w-0.5 flex-1 mt-1 min-h-4" style={{ background: "#E8E5F4" }} />}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-xs font-bold text-[#9E95B7] mb-0.5">{evt.date}</p>
                    <p className="text-sm font-extrabold text-[#1C1135]">{evt.title}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium mt-0.5 leading-relaxed">{evt.detail}</p>
                    {evt.action && (
                      <button className="mt-1 text-xs font-bold underline" style={{ color: "#7C3AED" }}>{evt.action}</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expTab === "actividades" && (() => {
          // ── Demo data ────────────────────────────────────────────────
          const ASIGNADAS_DEMO = [
            { name: "El osito viajero",       goal: "Pronunciación de la R", lugar: "Mundo ASHA",              assigned: "28 Jul 2026", freq: "3 veces/semana", status: "Completada", mundo: "Bosque de los Cuentos",      terapeuta: "Dra. Ana Ruiz" },
            { name: "Trabalenguas nivel 2",   goal: "Pronunciación de la R", lugar: "Mundo ASHA",              assigned: "30 Jul 2026", freq: "Diario",         status: "Iniciada",   mundo: "Laberinto de Trabalenguas",  terapeuta: "Dra. Ana Ruiz" },
            { name: "¿Qué animal soy?",       goal: "Comprensión verbal",    lugar: "Casa/Mundo ASHA",         assigned: "25 Jul 2026", freq: "2 veces/semana", status: "Pendiente",  mundo: "Valle de Adivinanzas",       terapeuta: "Dra. Ana Ruiz" },
          ];
          const SESION_ACTS_DEMO = [
            { name: "Trabalenguas nivel 2", cat: "Trabalenguas", sesion: "28 Jul 2026", durSesion: "45 min", goal: "Pronunciación de la R", resultado: "80 % · Apoyo mínimo", estado: "Completada", terapeuta: "Dra. Ana Ruiz",
              detail: { intentos: 10, correctas: 8, errores: 2, pct: 80, ayuda: "Apoyo mínimo", obs: "Buena articulación en posición media de la palabra. Dificultad en posición inicial.", rec: "Practicar diariamente 5 minutos con espejo.", goalPost: "En progreso", modalidad: "Virtual" } },
            { name: "El osito viajero", cat: "Cuentos", sesion: "20 Jul 2026", durSesion: "45 min", goal: "Comprensión verbal", resultado: "90 % · Independiente", estado: "Completada", terapeuta: "Dra. Ana Ruiz",
              detail: { intentos: 10, correctas: 9, errores: 1, pct: 90, ayuda: "Independiente", obs: "Excelente comprensión de secuencias narrativas.", rec: "Continuar con cuentos de mayor longitud.", goalPost: "En progreso", modalidad: "Virtual" } },
          ];
          const CASA_RESULTS_DEMO = [
            { id: 0, name: "El osito viajero", mundo: "Bosque de los Cuentos", cat: "Cuentos", fecha: "30 Jul 2026", hora: "18:20", correctas: 3, total: 3, errores: 0, durSeg: 92, intento: 1, tipo: "primera", estrellas: 15, acumuladas: 62, pct: 100, goal: "Pronunciación de la R", asignada: "28 Jul 2026", terapeuta: "Dra. Ana Ruiz", modo: "selección", escenas: 3, mejorPct: 100, msg: "¡Excelente explorador! Comprendiste muy bien la historia y encontraste las respuestas correctas." },
            { id: 1, name: "El osito viajero", mundo: "Bosque de los Cuentos", cat: "Cuentos", fecha: "31 Jul 2026", hora: "17:45", correctas: 2, total: 3, errores: 1, durSeg: 105, intento: 2, tipo: "repeticion", estrellas: 0, acumuladas: 62, pct: 67, goal: "Pronunciación de la R", asignada: "28 Jul 2026", terapeuta: "Dra. Ana Ruiz", modo: "selección", escenas: 3, mejorPct: 100, msg: "¡Muy buen recorrido por el bosque! Recuerda algunos detalles de la historia y vuelve a intentarlo cuando quieras." },
            { id: 2, name: "Trabalenguas nivel 2", mundo: "Laberinto de Trabalenguas", cat: "Trabalenguas", fecha: "01 Ago 2026", hora: "16:10", correctas: 4, total: 5, errores: 1, durSeg: 138, intento: 1, tipo: "primera", estrellas: 15, acumuladas: 77, pct: 80, goal: "Pronunciación de la R", asignada: "30 Jul 2026", terapeuta: "Dra. Ana Ruiz", modo: "micrófono", escenas: 5, mejorPct: 80, msg: "¡Encontraste la salida del laberinto! Completaste el trabalenguas con gran esfuerzo." },
          ];
          const fmtDur = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")} min`;

          // Filter logic for casa results
          const filteredCasa = CASA_RESULTS_DEMO.filter(r => {
            if (resFilterMundo !== "todos" && r.mundo !== resFilterMundo) return false;
            if (resFilterTipo === "primera" && r.tipo !== "primera") return false;
            if (resFilterTipo === "repeticion" && r.tipo !== "repeticion") return false;
            if (resFilterBuscar && !r.name.toLowerCase().includes(resFilterBuscar.toLowerCase())) return false;
            return true;
          });

          return (
          <div>
            {/* Primary tab switcher */}
            <div className="flex gap-1 p-1 bg-[#F0EDF8] rounded-xl mb-4 w-fit">
              {([{val:"asignadas",label:"Asignadas"},{val:"resultados",label:"Resultados"}] as const).map(t => (
                <button key={t.val} onClick={() => setActSubTab(t.val)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${actSubTab === t.val ? "bg-white text-[#1C1135] shadow-sm" : "text-[#7C6F9A]"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── ASIGNADAS ── */}
            {actSubTab === "asignadas" && (
              <div>
                <div className="space-y-3 mb-4">
                  {ASIGNADAS_DEMO.map(act => (
                    <div key={act.name + act.assigned} className="rounded-2xl border border-[#E8E5F4] p-3">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-bold text-[#1C1135]">{act.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${act.status === "Completada" ? "bg-green-100 text-green-700" : act.status === "Iniciada" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}>{act.status}</span>
                      </div>
                      <p className="text-xs text-[#7C6F9A]">Objetivo: {act.goal}</p>
                      <p className="text-xs text-[#9E95B7] mt-0.5">{act.mundo} · {act.lugar} · {act.freq}</p>
                      <p className="text-xs text-[#9E95B7]">Asignada: {act.assigned} · {act.terapeuta}</p>
                    </div>
                  ))}
                </div>
                <Btn size="sm" variant="primary"><Plus size={13} /> Asignar actividad</Btn>
              </div>
            )}

            {/* ── RESULTADOS ── */}
            {actSubTab === "resultados" && (
              <div>
                {/* Secondary tab: sesión / casa */}
                <div className="flex gap-1 p-0.5 bg-[#F0EDF8] rounded-xl mb-4 w-fit">
                  {([{val:"casa",label:"Actividades de casa"},{val:"sesion",label:"Actividades de sesión"}] as const).map(t => (
                    <button key={t.val} onClick={() => setResSubTab(t.val)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${resSubTab === t.val ? "bg-white text-[#1C1135] shadow-sm" : "text-[#9E95B7]"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* ── ACTIVIDADES DE CASA (Mundo ASHA) ── */}
                {resSubTab === "casa" && (
                  <div>
                    {/* Info banners */}
                    <div className="rounded-xl p-3 bg-[#F5F0FF] mb-3">
                      <p className="text-xs text-violet-700 font-medium leading-relaxed">Estos resultados se registran automáticamente cuando el niño realiza actividades en Mundo ASHA. Sirven como información complementaria para el seguimiento terapéutico.</p>
                    </div>
                    <div className="rounded-xl p-2.5 border border-amber-200 bg-amber-50 mb-4">
                      <p className="text-[10px] text-amber-700 font-medium text-center">Las estrellas, los aciertos y la duración reflejan participación dentro de Mundo ASHA. No actualizan automáticamente el progreso clínico del paciente.</p>
                    </div>

                    {/* Summary KPI cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                      {[
                        { icon: "✅", label: "Completadas", val: resRapido === "hoy" ? "1" : "4" },
                        { icon: "⏱️", label: "Práctica",    val: resRapido === "hoy" ? "2 min" : "18 min" },
                        { icon: "🔁", label: "Intentos",    val: resRapido === "hoy" ? "1" : "7" },
                        { icon: "⭐", label: "Estrellas",   val: resRapido === "hoy" ? "+15" : "+42" },
                      ].map(k => (
                        <div key={k.label} className="rounded-xl border border-[#E8E5F4] bg-white p-3 text-center">
                          <p className="text-xl mb-0.5">{k.icon}</p>
                          <p className="text-base font-extrabold text-[#1C1135]">{k.val}</p>
                          <p className="text-[10px] text-[#9E95B7] font-medium">{k.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Filter card */}
                    <div className="rounded-2xl border border-[#E8E5F4] bg-white p-4 mb-4">
                      <p className="text-xs font-extrabold text-[#7C6F9A] uppercase tracking-wide mb-3">Filtros</p>
                      {/* Quick date shortcuts */}
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {([{val:"hoy",label:"Hoy"},{val:"7d",label:"7 días"},{val:"30d",label:"30 días"},{val:"custom",label:"Rango"}] as const).map(opt => (
                          <button key={opt.val} onClick={() => setResRapido(opt.val)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${resRapido === opt.val ? "border-violet-500 bg-violet-50 text-violet-700" : "border-[#E8E5F4] text-[#7C6F9A] hover:border-violet-200"}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {resRapido === "custom" && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-bold text-[#7C6F9A]">Desde</label>
                            <input type="date" value={resFilterDesde} onChange={e => setResFilterDesde(e.target.value)} className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <label className="text-xs font-bold text-[#7C6F9A]">Hasta</label>
                            <input type="date" value={resFilterHasta} onChange={e => setResFilterHasta(e.target.value)} className="text-xs px-2 py-1.5 rounded-xl border border-[#E8E5F4] focus:outline-none focus:border-violet-400" />
                          </div>
                          <button className="text-xs font-extrabold px-3 py-1.5 rounded-xl text-white" style={{background:"#7C3AED"}}>Aplicar</button>
                          <button onClick={() => { setResFilterDesde(""); setResFilterHasta(""); }} className="text-xs font-bold text-[#9E95B7] hover:text-red-400">Limpiar</button>
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input value={resFilterBuscar} onChange={e => setResFilterBuscar(e.target.value)} placeholder="Buscar actividad..." className="px-3 py-2 rounded-xl border border-[#E8E5F4] text-xs focus:outline-none focus:border-violet-400" />
                        <select value={resFilterMundo} onChange={e => setResFilterMundo(e.target.value)} className="px-3 py-2 rounded-xl border border-[#E8E5F4] text-xs bg-white focus:outline-none focus:border-violet-400">
                          <option value="todos">Todos los mundos</option>
                          <option value="Bosque de los Cuentos">Bosque de los Cuentos</option>
                          <option value="Montaña Musical">Montaña Musical</option>
                          <option value="Valle de Adivinanzas">Valle de Adivinanzas</option>
                          <option value="Laberinto de Trabalenguas">Laberinto de Trabalenguas</option>
                          <option value="Laboratorio de Juegos">Laboratorio de Juegos</option>
                        </select>
                        <select value={resFilterTipo} onChange={e => setResFilterTipo(e.target.value)} className="px-3 py-2 rounded-xl border border-[#E8E5F4] text-xs bg-white focus:outline-none focus:border-violet-400">
                          <option value="todos">Todos los intentos</option>
                          <option value="primera">Primera finalización</option>
                          <option value="repeticion">Repeticiones</option>
                        </select>
                      </div>
                    </div>

                    {/* Period label */}
                    <p className="text-xs text-[#9E95B7] mb-3">
                      {resRapido === "hoy" ? "Mostrando resultados del 31 de julio de 2026" : resRapido === "7d" ? "Mostrando resultados del 25 de julio al 31 de julio de 2026" : "Mostrando resultados del 28 de julio al 31 de agosto de 2026"}
                    </p>

                    {/* Result cards */}
                    {filteredCasa.length === 0 ? (
                      <div className="text-center py-10 rounded-2xl border border-dashed border-[#E8E5F4]">
                        <p className="text-2xl mb-2">🔍</p>
                        <p className="text-sm font-bold text-[#1C1135]">No hay actividades completadas en este período</p>
                        <p className="text-xs text-[#9E95B7] mt-1 mb-4">Prueba seleccionando otras fechas o revisa las actividades asignadas.</p>
                        <Btn size="sm" variant="ghost" onClick={() => setActSubTab("asignadas")}>Ver actividades asignadas</Btn>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCasa.map((r, idx) => {
                          const open = expandedRes.includes(r.id);
                          return (
                            <div key={r.id} className={`rounded-2xl border-2 overflow-hidden ${r.tipo === "primera" ? "border-green-200" : "border-violet-200"}`}>
                              {/* Compact header */}
                              <button onClick={() => setExpandedRes(prev => open ? prev.filter(x => x !== r.id) : [...prev, r.id])}
                                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{background: r.tipo === "primera" ? "#D1FAE5" : "#EDE9FE"}}>
                                  {r.cat === "Cuentos" ? "📖" : r.cat === "Trabalenguas" ? "🌀" : r.cat === "Canciones" ? "🎵" : r.cat === "Adivinanzas" ? "❓" : "🎮"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-extrabold text-[#1C1135]">{r.name}</p>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${r.tipo === "primera" ? "bg-green-100 text-green-700" : "bg-violet-100 text-violet-700"}`}>
                                      {r.tipo === "primera" ? "Primera finalización" : "Repetición"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#9E95B7]">{r.mundo}</p>
                                  <p className="text-xs text-[#7C6F9A] mt-0.5">{r.fecha} · {r.hora} · {r.correctas}/{r.total} correctas · {fmtDur(r.durSeg)}</p>
                                  <p className="text-xs font-bold mt-0.5" style={{color: r.estrellas > 0 ? "#D97706" : "#9E95B7"}}>
                                    {r.estrellas > 0 ? `+${r.estrellas} ⭐` : "+0 ⭐ · Recompensa anterior"}
                                  </p>
                                </div>
                                <ChevronRight size={15} className={`text-[#9E95B7] flex-shrink-0 mt-1 transition-transform ${open ? "rotate-90" : ""}`} />
                              </button>

                              {/* Expanded detail */}
                              {open && (
                                <div className="border-t border-[#F0EDF8] px-4 pb-4 pt-3 space-y-4">
                                  {/* Info general */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Información general</p>
                                    <div className="space-y-1.5">
                                      {[
                                        ["Actividad", r.name],
                                        ["Categoría", r.cat],
                                        ["Mundo", r.mundo],
                                        ["Objetivo relacionado", r.goal],
                                        ["Fecha de asignación", r.asignada],
                                        ["Realizada", `${r.fecha} · ${r.hora}`],
                                        ["Lugar", "Casa / Mundo ASHA"],
                                        ["Terapeuta", r.terapeuta],
                                        ["Estado", "Completada"],
                                      ].map(([k,v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                          <span className="text-[#7C6F9A] font-medium">{k}</span>
                                          <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{v}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Participación */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Participación</p>
                                    <div className="grid grid-cols-2 gap-2">
                                      {[
                                        { icon: "📝", label: "Escenas", val: `${r.escenas} de ${r.escenas}` },
                                        { icon: "✅", label: "Correctas", val: String(r.correctas) },
                                        { icon: "❌", label: "Errores", val: String(r.errores) },
                                        { icon: "⏱️", label: "Duración", val: fmtDur(r.durSeg) },
                                        { icon: "🔁", label: "N.º intento", val: `Intento ${r.intento}` },
                                        { icon: "🎯", label: "Resultado", val: `${r.pct} %` },
                                      ].map(s => (
                                        <div key={s.label} className="rounded-xl border border-[#E8E5F4] p-2.5 text-center bg-white">
                                          <p className="text-base mb-0.5">{s.icon}</p>
                                          <p className="text-sm font-extrabold text-[#1C1135]">{s.val}</p>
                                          <p className="text-[10px] text-[#9E95B7]">{s.label}</p>
                                        </div>
                                      ))}
                                    </div>
                                    {r.cat !== "Cuentos" && r.cat !== "Adivinanzas" && (
                                      <p className="text-xs text-[#9E95B7] mt-2">Modo de entrada: {r.modo}</p>
                                    )}
                                    <div className="flex justify-between text-xs mt-2">
                                      <span className="text-[#7C6F9A]">Mejor resultado</span>
                                      <span className="font-extrabold text-green-600">{r.mejorPct} %</span>
                                    </div>
                                  </div>

                                  {/* Recompensa */}
                                  <div className={`rounded-xl p-3 text-center ${r.tipo === "primera" ? "bg-amber-50 border border-amber-200" : "bg-gray-50 border border-gray-200"}`}>
                                    <p className="text-[10px] font-extrabold uppercase tracking-wide mb-1" style={{color: r.tipo === "primera" ? "#D97706" : "#9E95B7"}}>Recompensa</p>
                                    <p className="text-xl font-extrabold" style={{color: r.tipo === "primera" ? "#D97706" : "#9E95B7"}}>{r.tipo === "primera" ? `+${r.estrellas} estrellas` : "+0 estrellas"}</p>
                                    <p className="text-[10px] mt-0.5" style={{color: r.tipo === "primera" ? "#92400E" : "#9E95B7"}}>{r.tipo === "primera" ? "Primera recompensa obtenida" : "Recompensa obtenida anteriormente"}</p>
                                    <p className="text-[10px] text-[#9E95B7] mt-0.5">Total acumulado: {r.acumuladas} ⭐ · Máx. disponible: {r.tipo === "primera" ? r.estrellas : 15}</p>
                                  </div>

                                  {/* Retroalimentación */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Mensaje mostrado al niño</p>
                                    <div className="rounded-xl p-3 bg-[#F5F0FF] border border-violet-100">
                                      <p className="text-xs text-violet-800 font-medium leading-relaxed">"{r.msg}"</p>
                                    </div>
                                  </div>

                                  {/* Seguimiento */}
                                  <div>
                                    <p className="text-[10px] font-extrabold text-[#9E95B7] uppercase tracking-wide mb-2">Datos de seguimiento</p>
                                    <div className="space-y-1.5">
                                      {[
                                        ["Primera vez completada", r.tipo === "primera" ? r.fecha : "30 Jul 2026"],
                                        ["Último intento", r.fecha],
                                        ["Total de intentos", `${r.intento} de esta asignación`],
                                        ["Mejor resultado", `${r.mejorPct} %`],
                                        ["Último resultado", `${r.pct} %`],
                                        ["Diferencia vs. intento anterior", r.tipo === "primera" ? "— (primer intento)" : `−${r.mejorPct - r.pct} %`],
                                      ].map(([k,v]) => (
                                        <div key={k} className="flex justify-between text-xs">
                                          <span className="text-[#7C6F9A] font-medium">{k}</span>
                                          <span className="font-bold text-[#1C1135] text-right max-w-[55%]">{v}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <p className="text-[9px] text-[#9E95B7] mt-2 italic">Datos informativos. El progreso clínico lo evalúa el terapeuta.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* ── ACTIVIDADES DE SESIÓN ── */}
                {resSubTab === "sesion" && (
                  <div>
                    {SESION_ACTS_DEMO.length === 0 ? (
                      <div className="text-center py-10 rounded-2xl border border-dashed border-[#E8E5F4]">
                        <p className="text-2xl mb-2">📋</p>
                        <p className="text-sm font-bold text-[#1C1135]">No se registraron actividades durante las sesiones de este período</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {SESION_ACTS_DEMO.map((act, idx) => {
                          const open = expandedSesAct.includes(idx);
                          return (
                            <div key={idx} className="rounded-2xl border-2 border-[#E8E5F4] overflow-hidden">
                              <button onClick={() => setExpandedSesAct(prev => open ? prev.filter(x => x !== idx) : [...prev, idx])}
                                className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-[#F5F0FF]">
                                  {act.cat === "Cuentos" ? "📖" : act.cat === "Trabalenguas" ? "🌀" : "🎵"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-extrabold text-[#1C1135]">{act.name}</p>
                                  <p className="text-xs text-[#9E95B7]">{act.cat} · Sesión {act.sesion}</p>
                                  <p className="text-xs text-[#7C6F9A] mt-0.5">Objetivo: {act.goal}</p>
                                  <p className="text-xs font-bold text-violet-700 mt-0.5">{act.resultado}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 block mb-1">{act.estado}</span>
                                  <ChevronRight size={14} className={`text-[#9E95B7] transition-transform inline-block ${open ? "rotate-90" : ""}`} />
                                </div>
                              </button>
                              {open && (
                                <div className="border-t border-[#F0EDF8] px-4 pb-4 pt-3">
                                  <div className="space-y-1.5 mb-3">
                                    {[
                                      ["Sesión relacionada", act.sesion],
                                      ["Modalidad", act.detail.modalidad],
                                      ["Intentos", String(act.detail.intentos)],
                                      ["Correctas", String(act.detail.correctas)],
                                      ["Errores", String(act.detail.errores)],
                                      ["Desempeño", `${act.detail.pct} %`],
                                      ["Nivel de ayuda", act.detail.ayuda],
                                      ["Estado del objetivo", act.detail.goalPost],
                                    ].map(([k,v]) => (
                                      <div key={k} className="flex justify-between text-xs">
                                        <span className="text-[#7C6F9A] font-medium">{k}</span>
                                        <span className="font-bold text-[#1C1135]">{v}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="rounded-xl p-2.5 bg-[#F5F0FF] mb-2">
                                    <p className="text-[10px] font-bold text-violet-700 mb-0.5">Observación</p>
                                    <p className="text-xs text-[#4B4468]">{act.detail.obs}</p>
                                  </div>
                                  <div className="rounded-xl p-2.5 bg-[#F0FDF4] mb-3">
                                    <p className="text-[10px] font-bold text-green-700 mb-0.5">Recomendación</p>
                                    <p className="text-xs text-[#4B4468]">{act.detail.rec}</p>
                                  </div>
                                  <button className="text-xs font-extrabold underline" style={{color:"#7C3AED"}}>Ver sesión relacionada</button>
                                  <p className="text-[9px] text-[#9E95B7] mt-2 italic">Solo lectura. Para editar, abre el registro de la sesión correspondiente.</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          );
        })()}

        {expTab === "reportes" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[#1C1135]">Reportes</h3>
              <Btn size="sm" variant="primary" onClick={() => setShowGenReport(true)}><Plus size={13} /> Generar reporte</Btn>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { title: "Reporte julio 2026", type: "Progreso", date: "25 Jul 2026", status: "Publicado" },
                { title: "Reporte junio 2026", type: "Progreso", date: "28 Jun 2026", status: "Publicado" },
              ].map((r, i) => (
                <div key={i} className="rounded-2xl border border-[#E8E5F4] p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base" style={{ background: B.violetLight }}>📄</div>
                    <div>
                      <p className="text-sm font-bold text-[#1C1135]">{r.title}</p>
                      <p className="text-xs text-[#7C6F9A]">{r.type} · {r.date}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r.status}</span>
                </div>
              ))}
            </div>
            {showGenReport && (
              <div className="rounded-2xl border-2 border-violet-200 p-4 mt-4 bg-[#F5F0FF]">
                <h4 className="font-bold text-[#1C1135] mb-3 text-sm">Nuevo reporte</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Tipo de reporte</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white">
                      {["Progreso","Cierre","Personalizado"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Periodo</label>
                    <input value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} placeholder="Ej: Julio 2026" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#7C6F9A] block mb-1">Valoración profesional</label>
                    <textarea value={reportNotes} onChange={e => setReportNotes(e.target.value)} rows={3} placeholder="Logros, dificultades, recomendaciones..." className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none" />
                  </div>
                  <div className="flex gap-2">
                    <Btn size="sm" variant="primary" onClick={() => { setShowGenReport(false); }}>Publicar para representante</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => setShowGenReport(false)}>Guardar borrador</Btn>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {expTab === "notas" && (
          <div>
            <h3 className="font-extrabold text-[#1C1135] mb-4">Notas clínicas</h3>
            <div className="rounded-2xl border border-[#E8E5F4] p-4 mb-4">
              <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="Título (opcional)" className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm mb-3 focus:outline-none focus:border-violet-400" />
              <select value={noteType} onChange={e => setNoteType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm bg-white mb-3">
                {["Nota de sesión","Observación general","Comunicación con familia","Incidencia","Recordatorio profesional"].map(t => <option key={t}>{t}</option>)}
              </select>
              <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={4} placeholder="Contenido de la nota..."
                className="w-full px-3 py-2 rounded-xl border border-[#E8E5F4] text-sm resize-none mb-3 focus:outline-none focus:border-violet-400" />
              <div className="flex gap-2">
                <Btn size="sm" variant="ghost" onClick={() => { if (noteText.trim()) { setSavedNotes(n => [...n, { title: noteTitle || noteType, text: noteText, type: noteType, visibility: "privada", date: new Date().toLocaleDateString("es-ES") }]); setNoteText(""); setNoteTitle(""); } }}>
                  Guardar nota privada
                </Btn>
                <Btn size="sm" variant="primary" onClick={() => { if (noteText.trim()) { setSavedNotes(n => [...n, { title: noteTitle || noteType, text: noteText, type: noteType, visibility: "compartida", date: new Date().toLocaleDateString("es-ES") }]); setNoteText(""); setNoteTitle(""); } }}>
                  Compartir con representante
                </Btn>
              </div>
            </div>
            <div className="space-y-2">
              {savedNotes.map((n, i) => (
                <div key={i} className="rounded-xl border border-[#E8E5F4] p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-[#1C1135]">{n.title}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${n.visibility === "compartida" ? "bg-green-100 text-green-700" : "bg-[#F5F0FF] text-violet-700"}`}>
                      {n.visibility === "compartida" ? "Compartida" : "Privada"}
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6F9A]">{n.type} · {n.date}</p>
                  <p className="text-xs text-[#4B4468] mt-1 leading-relaxed">{n.text}</p>
                </div>
              ))}
            </div>
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
