import { useQuery } from '@tanstack/react-query';
import { learningGames } from '@/services/learningGames';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { ArrowRight, AudioLines, MessageCircle, Music2, Mic, Smile } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicMundo({ go }: { go: (v: View) => void }) {
  const catalog = useQuery({ queryKey: ['public-basic-worlds'], queryFn: ({ signal }) => learningGames.catalog(signal) });
  const icons = { HABLA: AudioLines, LENGUAJE: MessageCircle, FLUIDEZ: Music2, VOZ: Mic, OROFACIAL: Smile };
  const items = catalog.data ?? [];
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/mundo" />
      {/* Hero */}
      <div className="py-14 px-4 text-center" style={{ background: `linear-gradient(135deg, ${B.violetLight}, ${B.tealLight})` }}>
        <span className="text-6xl block mb-4">🌎</span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4">Mundo ASHA</h1>
        <p className="text-lg text-[#7C6F9A] font-medium max-w-2xl mx-auto mb-6">Cinco mundos de práctica con niveles básicos. El profesional selecciona los mundos de cada niño; los juegos definitivos se desarrollarán después.</p>
        <div className="flex items-center justify-center gap-6 flex-wrap text-center mb-8">
          {[{ v: "5", l: "Mundos de práctica" }, { v: "15", l: "Niveles básicos" }, { v: "Libre", l: "Orden de niveles" }].map(s => (
            <div key={s.l}><p className="text-2xl font-black text-[#1C1135]">{s.v}</p><p className="text-sm text-[#7C6F9A] font-medium">{s.l}</p></div>
          ))}
        </div>
        <Btn variant="cta" size="lg" onClick={() => go("login")}>Ingresar a Mundo ASHA <ArrowRight size={16} /></Btn>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <RemoteFeedback pending={catalog.isPending} error={catalog.error} retry={() => void catalog.refetch()}/>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10 max-w-5xl mx-auto justify-items-center">
          {items.map(item => { const Icon = icons[item.id]; return (
            <div key={item.id} className="w-full max-w-sm bg-white rounded-3xl p-6 border border-[#E8E5F4] hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 opacity-30" style={{ background: B.violet }} />
              <Icon size={36} className="mb-4" aria-hidden="true"/>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-extrabold text-[#1C1135]">{item.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: B.violetLight, color: B.violet }}>{item.levels.length} niveles</span>
              </div>
              <p className="text-sm text-[#7C6F9A] font-medium mb-4">{item.description}</p>
              <Btn variant="secondary" size="sm" onClick={() => go("login")}>Ingresar <ArrowRight size={12} /></Btn>
            </div>
          ); })}
        </div>
        {/* CTA strip */}
        <div className="rounded-3xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${B.violetDeep}, #1a3461)` }}>
          <h2 className="text-2xl font-black text-white mb-3">¿Listo para comenzar la aventura?</h2>
          <p className="text-sm font-medium mb-6" style={{ color: "rgba(255,255,255,.7)" }}>Ingresa con tu cuenta familiar para ver los mundos asignados, intentos guardados y medallas.</p>
          <Btn variant="cta" size="lg" onClick={() => go("login")}>Ingresar</Btn>
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
