import type { View } from "@/shared/domain/types/navigation";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { MundoAshaHome } from "./Sessions/MundoAshaHome";

function EducationalProgressPending({ title, go }: { title: string; go: (view: View) => void }) {
  return <section className="p-4 sm:p-6 max-w-3xl mx-auto text-[#1C1135]">
    <h1 className="text-2xl font-black mb-4">{title}</h1>
    <p className="text-base leading-relaxed text-[#4B4264] mb-6">Esta sección está pendiente. Puedes consultar los intentos guardados, experiencia, nivel y medallas de cada hijo en Mundo ASHA.</p>
    <p className="text-base leading-relaxed text-[#4B4264] mb-6">Mundo ASHA tendrá mundos centrados en habilidades de lenguaje y niveles progresivos. Su contenido y los criterios de avance se revisarán en una etapa propia.</p>
    <Btn onClick={() => go("mundo-asha")}>Explorar mundos y prototipos</Btn>
  </section>;
}
export function MundoAshaAcademia({ go }: { go: (view: View) => void }) { return <EducationalProgressPending title="Academia ASHA" go={go} />; }
export function MundoAshaRetos({ go }: { go: (view: View) => void }) { return <EducationalProgressPending title="Camino de los retos" go={go} />; }
export function MundoAshaInsignias({ go }: { go: (view: View) => void }) { return <MundoAshaHome go={go} />; }
export function MundoAshaPerfil({ go }: { go: (view: View) => void }) { return <MundoAshaHome go={go} />; }
export function PadreRecompensas({ go }: { go: (view: View) => void }) { return <MundoAshaHome go={go} />; }
