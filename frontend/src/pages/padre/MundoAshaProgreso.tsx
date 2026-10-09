import type { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { MundoAshaHome } from "./Sessions/MundoAshaHome";

function EducationalProgressPending({ title, go }: { title: string; go: (view: View) => void }) {
  return <section className="p-4 sm:p-6 max-w-3xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-4">{title}</h1>
    <p className="text-base leading-relaxed text-[#4B4264] mb-6">El progreso educativo por hijo todavía no está conectado. No hay niveles completados, rachas ni recompensas verificadas que mostrar desde esta sección.</p>
    <p className="text-base leading-relaxed text-[#4B4264] mb-6">Mundo ASHA tendrá mundos centrados en habilidades de lenguaje y niveles progresivos. Su contenido y los criterios de avance se revisarán en una etapa propia.</p>
    <Btn onClick={() => go("mundo-asha")}>Explorar mundos y prototipos</Btn>
  </section>;
}
export function MundoAshaAcademia({ go }: { go: (view: View) => void }) { return <EducationalProgressPending title="Academia ASHA" go={go} />; }
export function MundoAshaRetos({ go }: { go: (view: View) => void }) { return <EducationalProgressPending title="Camino de los retos" go={go} />; }
export function MundoAshaInsignias({ go }: { go: (view: View) => void }) { return <EducationalProgressPending title="Insignias" go={go} />; }
export function MundoAshaPerfil({ go }: { go: (view: View) => void }) { return <EducationalProgressPending title="Perfil del aventurero" go={go} />; }
export function PadreRecompensas({ go }: { go: (view: View) => void }) { return <MundoAshaHome go={go} />; }
