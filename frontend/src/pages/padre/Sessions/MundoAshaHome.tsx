import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import type { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { useSelectedFamilyPatient } from "@/hooks/useSelectedFamilyPatient";
import { LEARNING_WORLDS, LEARNING_PROTOTYPES, deriveWorldProgress } from "@/services/learningWorlds";
import { Ashi } from "./Ashi";

export function MundoAshaHome({ go }: { go: (view: View) => void; padrePlan?: "exploracion" | "familia" }) {
  const { patients, children, patient, selectPatient } = useSelectedFamilyPatient();
  const [worldId, setWorldId] = useState<string | null>(null);
  const world = LEARNING_WORLDS.find(w => w.id === worldId);
  // There is no educational progress API yet. Unknown must never appear as zero/completed.
  const progress = world && patient ? deriveWorldProgress(world, patient.id_paciente, null) : null;
  return <section className="min-h-screen p-4 sm:p-6 text-[#1C1135]" style={{background: "linear-gradient(180deg, #EFF6FF 0%, #F0FDF4 50%, #FEF9EE 100%)", fontFamily: '"Nunito", system-ui, sans-serif'}}>
    <div className="max-w-5xl mx-auto pb-12">
      <header className="flex items-center gap-4 mb-6"><Ashi size={64} mood="wave" /><div><h1 className="text-3xl font-black">Mundo ASHA</h1><p className="text-base text-[#4B4264] mt-2">Un mundo para cada habilidad, con niveles de dificultad progresiva.</p></div></header>
      <p role="note" className="bg-white rounded-2xl border border-[#E8E5F4] p-5 mb-6 text-base leading-relaxed">La aventura por mundos y niveles está en preparación. El catálogo es una propuesta para revisar con el equipo y el profesional; los juegos actuales son prototipos. Todavía no guardan avance educativo por hijo.</p>
      {patients.error ? <div role="alert" className="bg-red-50 rounded-2xl p-5 mb-6"><p>No pudimos consultar los hijos.</p><Btn className="mt-3" onClick={() => void patients.refetch()}>Reintentar hijos</Btn></div> : patients.isPending ? <p role="status" className="mb-6">Cargando hijos…</p> : patient ? <div className="mb-6">
        <label className="block font-bold mb-2" htmlFor="learning-child">Hijo o hija</label>
        <select id="learning-child" value={patient.id_paciente} onChange={e => selectPatient(Number(e.target.value))} className="w-full sm:max-w-md rounded-2xl border border-[#C4BAE0] bg-white px-4 py-3 text-base focus-visible:outline-violet-700">{children.map(child => <option key={child.id_paciente} value={child.id_paciente}>{child.nombres_paciente} {child.apellidos_paciente}</option>)}</select>
        <p className="text-base text-[#4B4264] mt-3">Avance educativo de {patient.nombres_paciente} {patient.apellidos_paciente}: sin seguimiento conectado.</p>
      </div> : <div className="mb-6"><p className="text-base mb-3">Aún no tienes hijos registrados. Puedes explorar los prototipos; no se registrarán resultados.</p><Btn onClick={() => go("padre/config")}>Gestionar hijos</Btn></div>}
      {world ? <section aria-label="Niveles propuestos">
        <Btn variant="outline" onClick={() => setWorldId(null)} className="mb-5"><ArrowLeft size={16} /> Volver a los mundos</Btn>
        <h2 className="text-2xl font-black mb-2">{world.name}</h2><p className="text-base text-[#4B4264] mb-5">{world.skill} · {world.difficulty} · {world.levels.length} niveles propuestos</p>
        <p className="text-base mb-5">{progress?.connected === false ? "Progreso no disponible: no hay seguimiento educativo conectado." : "Los niveles todavía no están publicados."}</p>
        <ol className="space-y-3">{world.levels.map((level, index) => <li key={level.id} className="p-4 bg-white border border-[#E8E5F4] rounded-2xl"><h3 className="font-extrabold text-lg">Nivel {index + 1}: {level.title}</h3><p className="text-sm mt-2 text-[#4B4264]">En preparación · {level.validation === "professional" ? "Requiere revisión profesional" : "Criterio de juego por definir"}</p></li>)}</ol>
      </section> : <section aria-label="Mundos propuestos"><h2 className="text-xl font-extrabold mb-4">Explora los mundos propuestos</h2><ul className="space-y-4">{LEARNING_WORLDS.map(w => <li key={w.id} className="rounded-2xl border border-[#E8E5F4] bg-white p-5 flex items-center justify-between gap-4 flex-wrap"><div><h3 className="text-xl font-extrabold" style={{color: w.color}}>{w.name}</h3><p className="text-base text-[#4B4264] mt-2">{w.skill}</p><p className="text-sm font-bold mt-2">{w.difficulty} · {w.levels.length} niveles propuestos · En preparación</p></div><Btn variant="outline" onClick={() => setWorldId(w.id)}>Ver propuesta de niveles <ChevronRight size={16} /></Btn></li>)}</ul></section>}
      <section className="mt-9" aria-label="Prototipos disponibles"><h2 className="text-xl font-extrabold mb-3">Prototipos para explorar</h2><p className="text-base text-[#4B4264] mb-4">Prueba sus interacciones. Los puntos y resultados de estos prototipos no se incorporan a los niveles propuestos ni al expediente.</p><div className="flex flex-wrap gap-3">{LEARNING_PROTOTYPES.map(p => <Btn key={p.view} variant="secondary" onClick={() => go(p.view)}>{p.title} · demo</Btn>)}</div></section>
      <p className="text-sm text-[#4B4264] mt-7">Los niveles describen participación educativa, no una medición de mejoría clínica. La producción oral no se valida con el volumen del micrófono.</p>
    </div>
  </section>;
}
