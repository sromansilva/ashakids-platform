import { useState } from "react";
import { X, Download, Phone, FileText, Send } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Av } from "@/components/common/Av";
import { Ashi } from "@/pages/padre/Sessions/Ashi";
import { SESSION_THERAPIST } from "@/pages/padre/GamesShared";
import { msgs } from "@/pages/padre/SessionsMeeting/msgs";

export function AshaSessionActive({ go }: { go: (v: View) => void }) {
  const [muted,    setMuted]    = useState(false);
  const [camOff,   setCamOff]   = useState(false);
  const [panel,    setPanel]    = useState<"chat"|"notes"|"materials"|"objectives"|null>(null);
  const [chatMsg,  setChatMsg]  = useState("");
  const [tools,    setTools]    = useState(false);
  const t = SESSION_THERAPIST;

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#0D0820", fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Main video area */}
      <div className="flex-1 relative flex">
        {/* Therapist main video */}
        <div className="flex-1 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #1C0F45 0%, #2D1B69 100%)" }}>
          {/* Simulated video — therapist avatar centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: `${B.violet}20`, scale: "1.3" }} />
              <Av initials={t.av} color={t.color} size="xl" />
            </div>
            <div className="text-center">
              <p className="text-white font-extrabold text-lg">{t.name}</p>
              <p className="text-violet-300 text-sm font-medium">{t.specialty}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-300 font-bold">En vivo</span>
              </div>
            </div>
          </div>

          {/* Objective card — top left */}
          <div className="absolute top-4 left-4 rounded-2xl px-4 py-2.5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-0.5">🎯 Objetivo actual</p>
            <p className="text-sm font-extrabold text-white">Pronunciación de la R</p>
          </div>

          {/* Timer + connection — top right */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="rounded-2xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-white font-bold">HD</span>
            </div>
            <div className="rounded-2xl px-3 py-1.5 backdrop-blur-sm" style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <span className="text-sm font-black text-white tabular-nums">00:32:14</span>
            </div>
          </div>

          {/* Child PiP — bottom right */}
          <div className="absolute bottom-20 right-4 w-36 h-28 rounded-2xl overflow-hidden border-2 border-violet-400/30 shadow-2xl"
            style={{ background: camOff ? "#1C0F45" : "linear-gradient(135deg, #2D1B69 0%, #4C1D95 100%)" }}>
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              {camOff
                ? <><div className="text-2xl">📷</div><p className="text-xs text-violet-300 font-bold">Cámara off</p></>
                : <><Av initials="MG" color={B.orange} size="sm" /><p className="text-xs text-white font-bold mt-1">Mateo</p></>
              }
            </div>
          </div>
        </div>

        {/* Side Panel */}
        {panel && (
          <div className="w-80 flex-shrink-0 flex flex-col border-l" style={{ background: "#120A2E", borderColor: "rgba(255,255,255,0.08)" }}>
            {/* Panel tabs */}
            <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              {(["chat","notes","materials","objectives"] as const).map(tab => (
                <button key={tab}
                  className={`flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-colors capitalize ${panel === tab ? "text-violet-300 border-b-2 border-violet-400" : "text-white/40 hover:text-white/70"}`}
                  onClick={() => setPanel(tab)}>
                  {tab === "chat" ? "💬" : tab === "notes" ? "📝" : tab === "materials" ? "📄" : "🎯"}
                </button>
              ))}
              <button onClick={() => setPanel(null)} className="px-3 text-white/40 hover:text-white/70">
                <X size={16} />
              </button>
            </div>

            {panel === "chat" && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {msgs.slice(0, 3).map(msg => (
                    <div key={msg.id} className={`flex gap-2 ${msg.own ? "flex-row-reverse" : ""}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs font-medium leading-relaxed ${msg.own ? "text-white rounded-tr-sm" : "text-white rounded-tl-sm"}`}
                        style={{ background: msg.own ? B.violet : "rgba(255,255,255,0.1)" }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 flex gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <input value={chatMsg} onChange={e => setChatMsg(e.target.value)}
                    placeholder="Escribe un mensaje…"
                    className="flex-1 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-400"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <button className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: B.violet }}>
                    <Send size={13} className="text-white" />
                  </button>
                </div>
              </div>
            )}

            {panel === "notes" && (
              <div className="flex-1 p-4 flex flex-col gap-3">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider">Notas de sesión</p>
                <textarea
                  className="flex-1 rounded-2xl p-3 text-xs text-white font-medium focus:outline-none focus:ring-1 focus:ring-violet-400 resize-none leading-relaxed"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  placeholder="Escribí tus notas aquí…"
                  defaultValue="Mateo mostró avance en la pronunciación de /r/ vibrante. Practicar en casa: trabalenguas con /r/." />
              </div>
            )}

            {panel === "materials" && (
              <div className="flex-1 p-4">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">Materiales</p>
                {["Ejercicios semana 12.pdf","Guía fonemas R-L.pdf","Actividades vocabulario.pdf"].map(f => (
                  <div key={f} className="flex items-center gap-2 p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <FileText size={14} className="text-violet-400 flex-shrink-0" />
                    <span className="text-xs text-white/80 font-medium truncate flex-1">{f}</span>
                    <Download size={12} className="text-violet-400" />
                  </div>
                ))}
              </div>
            )}

            {panel === "objectives" && (
              <div className="flex-1 p-4">
                <p className="text-xs font-black text-violet-400 uppercase tracking-wider mb-3">Objetivos</p>
                {[["🗣️","Pronunciación de la R","En progreso"],["👂","Comprensión verbal","Completado"],["🎮","Juego interactivo","Pendiente"]].map(([icon,label,status]) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl mb-2" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <span className="text-base">{icon}</span>
                    <span className="text-xs text-white/80 font-medium flex-1">{label}</span>
                    <span className={`text-xs font-bold ${status === "Completado" ? "text-emerald-400" : status === "En progreso" ? "text-amber-400" : "text-white/30"}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control bar */}
      <div className="flex-shrink-0 h-16 flex items-center justify-center gap-2 px-4" style={{ background: "#0A0618", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Left group: main controls */}
        <div className="flex items-center gap-2 mr-auto">
          <button onClick={() => setMuted(m => !m)}
            className={`flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl transition-all ${muted ? "bg-red-500/20 text-red-400" : "text-white/70 hover:bg-white/10"}`}>
            <span className="text-lg">{muted ? "🔇" : "🎤"}</span>
          </button>
          <button onClick={() => setCamOff(c => !c)}
            className={`flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl transition-all ${camOff ? "bg-red-500/20 text-red-400" : "text-white/70 hover:bg-white/10"}`}>
            <span className="text-lg">{camOff ? "📷" : "📸"}</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 w-12 h-12 rounded-2xl text-white/70 hover:bg-white/10 transition-all">
            <span className="text-lg">⛶</span>
          </button>
        </div>

        {/* Center: secondary actions */}
        <div className="flex items-center gap-2">
          {(["chat","notes","materials","objectives"] as const).map(tab => {
            const icons: Record<string, string> = { chat: "💬", notes: "📝", materials: "📄", objectives: "🎯" };
            const labels: Record<string, string> = { chat: "Chat", notes: "Notas", materials: "Docs", objectives: "Metas" };
            return (
              <button key={tab} onClick={() => setPanel(p => p === tab ? null : tab)}
                className={`flex flex-col items-center gap-0.5 px-3 h-12 rounded-2xl transition-all text-xs font-bold ${panel === tab ? "bg-violet-600/30 text-violet-300" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}>
                <span className="text-base">{icons[tab]}</span>
                <span>{labels[tab]}</span>
              </button>
            );
          })}
          <button onClick={() => setTools(t => !t)}
            className={`flex flex-col items-center gap-0.5 px-3 h-12 rounded-2xl transition-all text-xs font-bold ${tools ? "bg-orange-500/20 text-orange-300" : "text-white/50 hover:bg-white/10 hover:text-white/80"}`}>
            <span className="text-base">🧸</span>
            <span>Tools</span>
          </button>
        </div>

        {/* Right: leave */}
        <div className="flex items-center gap-2 ml-auto">
          {/* ASHI help */}
          <button className="w-10 h-10 rounded-xl overflow-hidden hover:ring-2 hover:ring-violet-400 transition-all flex-shrink-0">
            <Ashi size={40} mood="happy" />
          </button>
          <button onClick={() => go("session/end")}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-sm transition-all">
            <Phone size={14} className="rotate-[135deg]" /> Finalizar
          </button>
        </div>
      </div>

      {/* Tools overlay */}
      {tools && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-3xl p-4 shadow-2xl" style={{ background: "#1C0F45", border: "1px solid rgba(255,255,255,0.15)", zIndex: 60 }}>
          <p className="text-xs font-black text-violet-300 uppercase tracking-wider mb-3 text-center">🧸 Herramientas Interactivas</p>
          <div className="grid grid-cols-6 gap-2">
            {[["✏️","Lápiz"],["🖊️","Marcador"],["⭐","Stickers"],["😊","Emojis"],["🎨","Colores"],["🃏","Tarjetas"],["🖼️","Imágenes"],["🧩","Rompecabezas"],["🔤","Letras"],["🔢","Números"],["✏️","Dibujos"],["🗑️","Borrar"]].map(([icon, label]) => (
              <button key={label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                <span className="text-xl">{icon}</span>
                <span className="text-xs text-white/60 font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
