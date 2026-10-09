import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";






import { speakForChild } from "@/pages/padre/Sessions/speakForChild";





export function MundoAshaTrabalenguas({ go }: { go: (v: View) => void }) {
  const [active,    setActive]    = useState<number | null>(null);
  const [practicing, setPracticing] = useState(false);

  const items = [
    { id: 1, text: "Tres tristes tigres comen trigo en un trigal.", level: "Fácil",  pts: 10, color: "#DCFCE7", emoji: "🐯" },
    { id: 2, text: "Pepe Pecas pica papas con un pico.",             level: "Fácil",  pts: 10, color: "#FEF3C7", emoji: "🥔" },
    { id: 3, text: "El cielo está enladrillado, ¿quién lo desenladrillará? El desenladrillador que lo desenladrille, buen desenladrillador será.", level: "Difícil", pts: 25, color: "#FEE2E2", emoji: "🧱" },
    { id: 4, text: "Pablito clavó un clavito. ¿Qué clavito clavó Pablito?", level: "Medio", pts: 15, color: "#E0F2FE", emoji: "🔨" },
  ];

  const startTimer = () => { setPracticing(true); const item = items.find(i => i.id === active); if (item) speakForChild(`Escucha y repite despacio: ${item.text}`); };
  const stopTimer  = () => setPracticing(false);

  return (
    <div style={{ background: "linear-gradient(180deg, #CCFBF1 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: `linear-gradient(135deg, ${B.teal} 0%, #0F766E 100%)` }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-teal-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🗣️</span>
          <div>
            <p className="text-xs font-black text-teal-300 uppercase tracking-widest mb-1">Actividad adicional</p>
            <h1 className="text-3xl font-black text-white">Trabalenguas</h1>
            <p className="text-teal-100 text-sm font-medium mt-1">Entrena tu pronunciación jugando</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">
        {active !== null ? (() => {
          const item = items.find(i => i.id === active)!;
          return (
            <div>
              <button onClick={() => { setActive(null); setPracticing(false); }} className="flex items-center gap-1.5 text-sm font-bold text-teal-600 hover:underline mb-5">
                <ChevronLeft size={14} /> Volver a la lista
              </button>
              <Crd className="p-7 text-center mb-5">
                <div className="text-5xl mb-4">{item.emoji}</div>
                <Bdg color={item.level === "Fácil" ? "green" : item.level === "Medio" ? "orange" : "red"}>{item.level}</Bdg>
                <p className="text-2xl font-extrabold text-[#1C1135] leading-relaxed mt-5 mb-5">{item.text}</p>
                <div className="flex gap-3 justify-center flex-wrap mb-2">
                  {!practicing
                    ? <Btn size="lg" onClick={startTimer} className="!bg-teal-600 !text-white">🎤 Practicar</Btn>
                    : <>
                        <div className="flex items-center gap-2 text-teal-600 font-extrabold text-lg">
                          <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse inline-block" /> Practicando…
                        </div>
                        <Btn size="lg" variant="outline" onClick={stopTimer}>⏹ Parar</Btn>
                      </>
                  }
                </div>
              </Crd>
              <Crd className="p-5 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#1C1135]">Recompensa por completar</p>
                  <p className="text-sm text-[#7C6F9A] font-medium">Practica 3 veces seguidas</p>
                </div>
                <div className="text-2xl font-black text-amber-600">+{item.pts} ⭐</div>
              </Crd>
            </div>
          );
        })() : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map(item => (
              <button key={item.id} onClick={() => { setActive(item.id); speakForChild(`Preparados para practicar. ${item.text}`); }}
                className="rounded-3xl p-6 text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-2 border-transparent hover:border-teal-300"
                style={{ backgroundColor: item.color }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{item.emoji}</span>
                  <Bdg color={item.level === "Fácil" ? "green" : item.level === "Medio" ? "orange" : "red"}>{item.level}</Bdg>
                </div>
                <p className="font-extrabold text-[#1C1135] mb-2 line-clamp-2">{item.text}</p>
                <p className="text-xs font-extrabold text-amber-600">+{item.pts} ⭐ al completar</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


