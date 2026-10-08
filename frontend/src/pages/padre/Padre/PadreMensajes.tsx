import { useState, useRef, useEffect } from "react";
import { Search, X, Video, Phone, Send, Paperclip, FileText } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";

// ─── Shared micro components ──────────────────────────────────────────────────
import { Msg } from "@/pages/padre/Padre/Msg";
import { CONVERSATIONS } from "@/pages/padre/Padre/CONVERSATIONS";
import { CHAT_HISTORY } from "@/pages/padre/Padre/CHAT_HISTORY";

export function PadreMensajes() {
  const [activeCon, setActiveCon] = useState(1);
  const [searchChat, setSearchChat] = useState("");
  const [chats, setChats]         = useState(CHAT_HISTORY);
  const [input, setInput]         = useState("");
  const [status, setStatus]       = useState<Record<number,number>>({ 1: 2, 2: 0, 3: 1 });
  const [calling, setCalling]     = useState<"phone" | "video" | null>(null);
  const [attach, setAttach]       = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);

  const sessionChats = CONVERSATIONS.filter(conversation => conversation.canMessage);
  const visibleChats = sessionChats.filter(conversation => `${conversation.name} ${conversation.child}`.toLowerCase().includes(searchChat.toLowerCase()));
  const curCon = sessionChats.find(c => c.id === activeCon) ?? sessionChats[0];
  const curMsgs = chats[curCon.id] ?? [];

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [curMsgs]);

  const sendMsg = () => {
    const txt = input.trim();
    if (!txt || !curCon.canMessage) return;
    const newMsg: Msg = {
      id: Date.now(), from: "Yo", text: txt,
      time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
      own: true, av: "LG", color: B.violet,
    };
    setChats(c => ({ ...c, [curCon.id]: [...(c[curCon.id] ?? []), newMsg] }));
    setInput("");
    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Entendido, gracias por avisarme.",
        "Perfecto, lo tendré en cuenta para la próxima sesión.",
        "¡Excelente progreso! Sigue así.",
        "Anotado, hablamos en la sesión del martes.",
        "Gracias por el mensaje. Nos vemos pronto.",
      ];
      const reply: Msg = {
        id: Date.now() + 1, from: curCon.name,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }),
        own: false, av: curCon.av, color: curCon.color,
      };
      setChats(c => ({ ...c, [curCon.id]: [...(c[curCon.id] ?? []), reply] }));
    }, 1500);
  };

  const selectCon = (id: number) => {
    setActiveCon(id);
    setStatus(s => ({ ...s, [id]: 0 }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col" style={{ fontFamily: '"Nunito", system-ui, sans-serif', height: "calc(100vh - 4rem)" }}>
      {calling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 text-center max-w-xs w-full shadow-2xl">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4" style={{ background: B.tealLight }}>
              {calling === "phone" ? "📞" : "📹"}
            </div>
            <p className="font-extrabold text-[#1C1135] text-lg mb-1">{curCon.name}</p>
            <p className="text-sm text-[#7C6F9A] font-medium mb-2">Llamando…</p>
            <div className="flex justify-center gap-1 mb-6">
              {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
            </div>
            <button onClick={() => setCalling(null)}
              className="w-full py-3 rounded-2xl font-extrabold text-white bg-red-500 hover:bg-red-600 transition-colors">
              Colgar
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135]">Mensajes</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Cada chat está vinculado a una sesión confirmada o en seguimiento</p>
        </div>
      </div>

      <Crd className="flex overflow-hidden flex-1 min-h-0">
        {/* Conversations sidebar */}
        <div className="w-72 flex-shrink-0 border-r border-[#F5F3FF] flex flex-col overflow-hidden hidden sm:flex">
          <div className="p-3 border-b border-[#F5F3FF]">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
              <input placeholder="Buscar por terapeuta o hijo…" value={searchChat} onChange={e => setSearchChat(e.target.value)} className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E8E5F4] text-xs font-medium focus:outline-none focus:border-violet-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2.5 bg-violet-50 border-b border-violet-100"><p className="text-[10px] font-black uppercase tracking-wider text-violet-600">Chats por sesión</p></div>
            {visibleChats.length === 0 && <div className="p-5 text-center text-xs font-medium text-[#9E95B7]">Los chats se habilitan al confirmar una cita.</div>}
            {visibleChats.map(c => (
              <button key={c.id} onClick={() => selectCon(c.id)}
                className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors border-b border-[#FAFAF9] last:border-0 ${activeCon === c.id ? "bg-violet-50" : "hover:bg-[#FAFAF9]"}`}>
                <div className="relative flex-shrink-0">
                  <Av initials={c.av} color={c.color} size="sm" />
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${c.online ? "bg-emerald-400" : "bg-slate-300"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-extrabold text-[#1C1135] truncate">{c.name}</p>
                    {status[c.id] > 0 && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0" style={{ background: B.violet }}>
                        {status[c.id]}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold text-violet-500 truncate">{c.child} · {c.sessionStatus}</p>
                  <p className="text-xs text-[#9E95B7] truncate">{c.last}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#F5F3FF] flex-shrink-0">
            <Av initials={curCon.av} color={curCon.color} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-[#1C1135] text-sm">{curCon.name}</p>
              <p className="text-xs font-bold text-violet-600">{curCon.child} · {curCon.session}</p>
              <p className={`text-[11px] flex items-center gap-1 font-bold ${curCon.online ? "text-emerald-500" : "text-[#9E95B7]"}`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${curCon.online ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
                {curCon.online ? "En línea" : "Última vez: hace 2h"}
              </p>
            </div>
            <Btn size="sm" variant="ghost" onClick={() => setCalling("phone")}><Phone size={14} /></Btn>
            <Btn size="sm" variant="ghost" onClick={() => setCalling("video")}><Video size={14} /></Btn>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {curMsgs.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.own ? "flex-row-reverse" : ""}`}>
                {!msg.own && <Av initials={msg.av} color={msg.color} size="sm" />}
                <div className={`max-w-[75%] flex flex-col gap-1 ${msg.own ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium ${msg.own ? "text-white rounded-tr-sm" : "text-[#1C1135] rounded-tl-sm"}`}
                    style={{ background: msg.own ? B.violet : B.violetLight }}>
                    {msg.text}
                  </div>
                  <span className="text-xs text-[#9E95B7] font-medium">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEnd} />
          </div>

          {attach && (
            <div className="px-4 pb-2">
              <div className="flex items-center gap-2 p-2 rounded-xl border border-dashed border-[#C4B5FD] bg-violet-50">
                <FileText size={14} style={{ color: B.violet }} />
                <span className="text-xs font-bold text-[#7C6F9A]">Adjuntar archivo</span>
                <div className="flex gap-1.5 ml-2">
                  {["📄 Documento", "🖼️ Imagen", "📊 Reporte"].map(t => (
                    <button key={t} onClick={() => setAttach(false)}
                      className="text-xs font-bold px-2 py-1 bg-white rounded-lg border border-[#E8E5F4] hover:border-violet-300 transition-colors">{t}</button>
                  ))}
                </div>
                <button onClick={() => setAttach(false)} className="ml-auto text-[#9E95B7]"><X size={12} /></button>
              </div>
            </div>
          )}

          <div className="p-4 border-t border-[#F5F3FF] flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setAttach(a => !a)} className="p-2 hover:bg-violet-50 rounded-xl text-[#9E95B7] hover:text-violet-600 transition-colors flex-shrink-0">
              <Paperclip size={17} />
            </button>
            <input type="text" placeholder="Escribe un mensaje…" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMsg()}
              className="flex-1 rounded-2xl px-4 py-2.5 text-sm border border-[#E8E5F4] focus:outline-none focus:ring-2 focus:ring-violet-300/30 focus:border-violet-400 font-medium"
              style={{ background: B.violetLight }} />
            <button onClick={sendMsg} disabled={!input.trim()}
              className="p-2.5 rounded-xl text-white transition-all active:scale-[.97] disabled:opacity-40 flex-shrink-0"
              style={{ background: B.violet }}>
              <Send size={15} />
            </button>
          </div>
        </div>
      </Crd>
    </div>
  );
}
