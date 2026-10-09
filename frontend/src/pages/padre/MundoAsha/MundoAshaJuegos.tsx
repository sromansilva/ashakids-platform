import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { View } from "@/types/navigation";
import { VozAventuraGame } from "@/pages/padre/MundoAsha/VozAventuraGame";

export function MundoAshaJuegos({ go }: { go: (v: View) => void }) {
  const [misterioModal, setMisterioModal] = useState(false);

  return (
    <div style={{ background: "linear-gradient(180deg, #E0F2FE 0%, #FAFAF9 100%)", minHeight: "100vh", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Header */}
      <div className="relative overflow-hidden px-4 sm:px-8 pt-8 pb-6" style={{ background: "linear-gradient(135deg, #0284C7 0%, #0369A1 100%)" }}>
        <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10" />
        <button onClick={() => go("mundo-asha")} className="flex items-center gap-1.5 text-sm font-bold text-blue-200 hover:text-white mb-4 transition-colors">
          <ChevronLeft size={16} /> Mapa del Mundo
        </button>
        <div className="flex items-center gap-5 max-w-5xl mx-auto">
          <span className="text-7xl">🧠</span>
          <div>
            <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1">Juegos</p>
            <h1 className="text-3xl font-black text-white">Laboratorio de Juegos</h1>
            <p className="text-blue-100 text-sm font-medium mt-1">Mini juegos interactivos para aprender</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7">
        {/* Game card */}
        <div className="bg-white rounded-3xl border border-[#E8E5F4] shadow-sm overflow-hidden" style={{ height: "80vh", display: "flex", flexDirection: "column" }}>
          {/* Game navbar */}
          <div className="flex items-center gap-2 p-3 border-b border-[#E8E5F4] flex-shrink-0" style={{ background: "#F8F7FF" }}>
            <button
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all"
              style={{ background: "linear-gradient(135deg, #7C3AED, #0D9488)", color: "white" }}
            >
              🎤 Voz Aventura
            </button>
            <button
              onClick={() => setMisterioModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-extrabold transition-all"
              style={{ background: "white", color: "#7C6F9A", border: "1.5px solid #E8E5F4" }}
            >
              🚀 Misterio Espacial
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: "#1E1B4B", color: "#A5B4FC" }}>En desarrollo</span>
            </button>
          </div>

          {/* Game area */}
          <div className="flex-1 overflow-hidden relative p-4">
            <VozAventuraGame />
          </div>
        </div>
      </div>

      {/* Misterio Espacial modal */}
      {misterioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMisterioModal(false)}>
          <div className="text-center p-8 rounded-3xl w-full max-w-sm" style={{ background: "linear-gradient(135deg, #1E1B4B, #312E81)" }} onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-black text-white mb-2">Misterio Espacial</h2>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold text-indigo-300 border border-indigo-500 mb-4">En desarrollo</span>
            <p className="text-sm text-indigo-200 font-medium leading-relaxed mb-6">
              Un juego de vocabulario galáctico donde descubrirás palabras en el cosmos. ¡Muy pronto disponible!
            </p>
            <button onClick={() => setMisterioModal(false)} className="w-full py-2.5 rounded-2xl font-extrabold text-sm text-indigo-300 border border-indigo-500">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
