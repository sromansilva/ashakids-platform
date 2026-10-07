import { useState } from "react";
import { Search, ChevronLeft, Phone, Video, Paperclip, Send } from "lucide-react";
import { B, Av, Btn } from "@/components/shared";

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

