import { PatientActivities } from "@/pages/terapeuta/TerapeutaPacientes/PatientActivities";
import { useTerapeutaPacientes } from "@/pages/terapeuta/TerapeutaPacientes/useTerapeutaPacientes";
import { TerapeutaPacientesObjetivos } from "@/pages/terapeuta/TerapeutaPacientes/TerapeutaPacientesObjetivos";
import { PatientClinicalHistory } from './PatientClinicalHistory';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { ChevronLeft, Video, Eye, Edit, UserPlus } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";
import { Inp } from "@/components/common/Inp";
import { ExpTab } from "@/pages/terapeuta/TerapeutaPacientes/ExpTab";

export function TerapeutaPacientes(props: Parameters<typeof useTerapeutaPacientes>[0]) {
const { go, selected, setSelected, expTab, setExpTab, search, setSearch, showAddObj, setShowAddObj, objectives, setObjectives, newObj, setNewObj, actSubTab, setActSubTab, resSubTab, setResSubTab, resFilterDesde, setResFilterDesde, resFilterHasta, setResFilterHasta, resFilterMundo, setResFilterMundo, resFilterTipo, setResFilterTipo, resFilterBuscar, setResFilterBuscar, resRapido, setResRapido, expandedRes, setExpandedRes, expandedSesAct, setExpandedSesAct, noteType, setNoteType, noteText, setNoteText, noteTitle, setNoteTitle, savedNotes, setSavedNotes, patientsList, query } = useTerapeutaPacientes(props);
if (selected !== null && patientsList.some(p => p.id === selected)) {
    const p = patientsList.find(p => p.id === selected)!;
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
                  <Btn size="sm" variant="primary" onClick={() => setExpTab('sesiones')}><Video size={12} /> Sesión</Btn>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                {[
                  { label: "Sesiones", val: String(p.sessions) },
                  { label: "Progreso", val: 'Sin medición en API' },
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
        {!['sesiones', 'reportes'].includes(expTab) && <p role="note" className="mb-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">Prototipo ilustrativo: progreso, evolución, objetivos, actividades y notas no proceden del expediente clínico ni se guardan en el servidor. Las pestañas Sesiones y Reportes contienen registros reales.</p>}
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
          <PatientClinicalHistory key={p.id} patientId={p.id} />
        )}

        {expTab === "objetivos" && (
          <TerapeutaPacientesObjetivos setShowAddObj={setShowAddObj} objectives={objectives} setObjectives={setObjectives} showAddObj={showAddObj} newObj={newObj} setNewObj={setNewObj} />
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

        {expTab === "actividades" && <PatientActivities resFilterMundo={resFilterMundo} resFilterTipo={resFilterTipo} resFilterBuscar={resFilterBuscar} setActSubTab={setActSubTab} actSubTab={actSubTab} setResSubTab={setResSubTab} resSubTab={resSubTab} resRapido={resRapido} setResRapido={setResRapido} resFilterDesde={resFilterDesde} setResFilterDesde={setResFilterDesde} resFilterHasta={resFilterHasta} setResFilterHasta={setResFilterHasta} setResFilterBuscar={setResFilterBuscar} setResFilterMundo={setResFilterMundo} setResFilterTipo={setResFilterTipo} expandedRes={expandedRes} setExpandedRes={setExpandedRes} expandedSesAct={expandedSesAct} setExpandedSesAct={setExpandedSesAct} />}

        {expTab === "reportes" && (
          <PatientClinicalHistory key={`reports-${p.id}`} patientId={p.id} reportsOnly />
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

  const filtered = patientsList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.dx.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Pacientes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{patientsList.length} pacientes activos</p>
        </div>
        <div className="flex items-center gap-3">
          <Inp placeholder="Buscar paciente…" value={search} onChange={v => setSearch(v)} />
          <Btn variant="primary" size="sm"><UserPlus size={13} /> Nuevo paciente</Btn>
        </div>
      </div>
      <RemoteFeedback pending={query.isPending} error={query.error} retry={() => void query.refetch()} />
      {query.isSuccess && !query.error && !filtered.length && <Crd className="p-5 text-sm text-[#7C6F9A]">Sin pacientes asignados que coincidan con la búsqueda.</Crd>}
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
                  <span className="font-extrabold text-[#1C1135]">Sin medición en API</span>
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
              <Btn variant="secondary" size="sm" className="w-full justify-center" onClick={() => { setSelected(p.id); setExpTab("resumen"); }}>
                <Eye size={13} /> Abrir expediente
              </Btn>
            </div>
          </Crd>
        ))}
      </div>
    </div>
  );

}
