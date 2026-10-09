import type { useAshhiFloat } from "@/components/assistant/useAshhiFloat";
import { X, Send, Paperclip, HelpCircle } from "lucide-react";
import { B } from "@/theme/brand/B";


type Props = Pick<ReturnType<typeof useAshhiFloat>, "AshiAvatar" | "closeAshi" | "setTab" | "tab" | "ctx" | "send" | "msgs" | "draftStates" | "setDraftStates" | "thinking" | "input" | "setInput">;
export function AshhiFloatPanel({ AshiAvatar, closeAshi, setTab, tab, ctx, send, msgs, draftStates, setDraftStates, thinking, input, setInput }: Props) {
return (<div
          className="ashi-up fixed inset-x-3 bottom-[calc(12px+env(safe-area-inset-bottom))] z-50 h-[min(65dvh,520px)] w-auto rounded-3xl overflow-hidden flex flex-col sm:inset-auto sm:right-6 sm:top-4 sm:bottom-4 sm:h-auto sm:w-96"
          style={{
            boxShadow:
              "0 24px 80px rgba(13,148,136,.22), 0 4px 24px rgba(0,0,0,.12)",
            background: "white",
          }}
        >
          {/* Header */}
          <div
            className="px-5 py-4 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, #0a7a71, #5b21b6)",
            }}
          >
            <AshiAvatar size={40} />
            <div className="flex-1 min-w-0">
              <p className="font-black text-white text-sm leading-none">
                ASHI
              </p>
              <p
                className="text-xs font-medium mt-0.5"
                style={{ color: "rgba(255,255,255,.7)" }}
              >
                Asistente Inteligente · ASHAKids
              </p>
            </div>
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-emerald-300">
                Demo
              </span>
            </div>
            <button
              onClick={closeAshi}
              className="p-1.5 rounded-xl"
              style={{ background: "rgba(255,255,255,.15)" }}
            >
              <X size={15} color="white" />
            </button>
          </div>

          {/* Tabs */}
          <div
            className="flex border-b"
            style={{ borderColor: B.border }}
          >
            {(["home", "chat"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-xs font-extrabold transition-colors"
                style={{
                  color: tab === t ? B.teal : B.textMuted,
                  borderBottom:
                    tab === t
                      ? `2px solid ${B.teal}`
                      : "2px solid transparent",
                }}
              >
                {t === "home" ? "✦ Inicio" : "💬 Conversación"}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* ── HOME tab ── */}
            {tab === "home" && (
              <div className="p-4">
                {/* Greeting */}
                <div className="flex items-start gap-3 mb-4">
                  <AshiAvatar size={32} />
                  <div
                    className="rounded-2xl rounded-tl-sm px-3 py-2.5 flex-1"
                    style={{ background: "#F5F3FF" }}
                  >
                    <p className="text-sm font-bold text-[#1C1135] leading-snug">
                      {ctx.greeting}
                    </p>
                  </div>
                </div>

                {/* ASHI disclaimer */}
                <div className="rounded-2xl px-3 py-2.5 mb-4 border border-[#E8E5F4] flex items-start gap-2">
                  <span className="text-sm flex-shrink-0">ℹ️</span>
                  <p className="text-xs font-medium text-[#7C6F9A] leading-snug">
                    ASHI brinda orientación y apoyo operativo. <span className="font-extrabold text-[#1C1135]">No diagnostica, no prescribe y no sustituye el criterio profesional.</span>
                  </p>
                </div>

                {/* Proactive notifications */}
                <div
                  className="rounded-2xl p-3 mb-4"
                  style={{ background: B.tealLight }}
                >
                  <p
                    className="text-xs font-extrabold mb-2"
                    style={{ color: B.teal }}
                  >
                    ✦ Ejemplos ilustrativos (no son datos de tu cuenta)
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {ctx.proactive.map((n, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                          style={{ background: B.teal }}
                        />
                        <p className="text-xs font-medium text-[#1C1135] leading-snug">
                          {n}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action cards */}
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
                  ¿Qué deseas hacer hoy?
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {ctx.actions.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => send(a.prompt)}
                      className="rounded-2xl p-3 text-left hover:scale-[1.02] transition-all cursor-pointer"
                      style={{
                        background: B.violetLight,
                        border: `1px solid ${B.violetMid}`,
                      }}
                    >
                      <span className="text-lg block mb-1">
                        {a.icon}
                      </span>
                      <span className="text-xs font-extrabold text-[#1C1135] leading-tight">
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Quick chips */}
                <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">
                  Sugerencias rápidas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ctx.chips.map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={{
                        background: B.violetLight,
                        color: B.violet,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHAT tab ── */}
            {tab === "chat" && (
              <div className="p-4 flex flex-col gap-3">
                {msgs.map((m, i) => {
                  /* ── Draft card ── */
                  if (m.draft) {
                    const ds = draftStates[m.draft.id];
                    if (!ds) return null;
                    const isReporte = m.draft.type === "reporte";
                    const approved = ds.status === "aprobado";
                    return (
                      <div key={i} className="flex gap-2.5">
                        <AshiAvatar size={28} />
                        <div
                          className="flex-1 rounded-2xl overflow-hidden"
                          style={{ border: `1.5px solid ${approved ? "#10b981" : B.violetMid}`, borderTopLeftRadius: 4 }}
                        >
                          {/* Draft header */}
                          <div
                            className="px-3 py-2 flex items-center gap-2"
                            style={{ background: approved ? "#d1fae5" : B.violetLight }}
                          >
                            <span className="text-base">{isReporte ? "📝" : "🎯"}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-extrabold text-[#1C1135] leading-none">
                                {isReporte ? "Borrador de reporte" : "Borrador de objetivos"}
                              </p>
                              {approved ? (
                                <p className="text-xs font-bold mt-0.5" style={{ color: "#059669" }}>
                                  ✔ Aprobado por profesional
                                </p>
                              ) : (
                                <p className="text-xs font-medium mt-0.5" style={{ color: B.violet }}>
                                  Borrador generado por ASHI · Requiere revisión profesional
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Draft content */}
                          <div className="px-3 py-2" style={{ background: "#FAFAFA" }}>
                            {ds.editing && !approved ? (
                              <textarea
                                className="w-full text-xs leading-relaxed rounded-xl p-2 resize-none border outline-none focus:ring-1"
                                style={{ minHeight: 120, borderColor: B.violetMid, color: "#1C1135" }}
                                value={ds.content}
                                onChange={(e) =>
                                  setDraftStates((prev) => ({
                                    ...prev,
                                    [m.draft!.id]: { ...prev[m.draft!.id], content: e.target.value },
                                  }))
                                }
                              />
                            ) : (
                              <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: "#1C1135" }}>
                                {ds.content}
                              </p>
                            )}
                          </div>
                          {/* Draft actions */}
                          {!approved && (
                            <div className="px-3 py-2 flex gap-2 border-t" style={{ borderColor: B.border, background: "white" }}>
                              <button
                                onClick={() =>
                                  setDraftStates((prev) => ({
                                    ...prev,
                                    [m.draft!.id]: { ...prev[m.draft!.id], editing: !prev[m.draft!.id].editing },
                                  }))
                                }
                                className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                                style={{ background: B.violetLight, color: B.violet, border: `1px solid ${B.violetMid}` }}
                              >
                                {ds.editing ? "Guardar cambios" : "Editar borrador"}
                              </button>
                              <button
                                onClick={() =>
                                  setDraftStates((prev) => ({
                                    ...prev,
                                    [m.draft!.id]: { ...prev[m.draft!.id], status: "aprobado", editing: false },
                                  }))
                                }
                                className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white transition-all"
                                style={{ background: "linear-gradient(135deg, #0D9488, #7C3AED)" }}
                              >
                                Aprobar y guardar
                              </button>
                            </div>
                          )}
                          <p className="text-xs opacity-40 text-right px-3 pb-2 pt-0" style={{ color: B.textMuted }}>
                            {m.time}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  /* ── Normal message ── */
                  return (
                  <div
                    key={i}
                    className={`flex gap-2.5 ${m.from === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {m.from === "ashi" && (
                      <AshiAvatar size={28} />
                    )}
                    <div
                      className="max-w-[80%] rounded-2xl px-3.5 py-2.5"
                      style={
                        m.from === "ashi"
                          ? {
                              background: "#F5F3FF",
                              borderTopLeftRadius: 4,
                            }
                          : {
                              background:
                                "linear-gradient(135deg, #0D9488, #7C3AED)",
                              borderTopRightRadius: 4,
                            }
                      }
                    >
                      <p
                        className="text-xs font-medium leading-relaxed"
                        style={{
                          color:
                            m.from === "ashi"
                              ? "#1C1135"
                              : "white",
                        }}
                      >
                        {m.text}
                      </p>
                      <p
                        className="text-xs mt-1 opacity-50 text-right"
                        style={{
                          color:
                            m.from === "ashi"
                              ? B.textMuted
                              : "white",
                        }}
                      >
                        {m.time}
                      </p>
                    </div>
                  </div>
                  );
                })}

                {thinking && (
                  <div className="flex gap-2.5">
                    <AshiAvatar size={28} />
                    <div
                      className="rounded-2xl px-4 py-3"
                      style={{ background: "#F5F3FF" }}
                    >
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((n) => (
                          <span
                            key={n}
                            className={`w-2 h-2 rounded-full ashi-dot${n}`}
                            style={{ background: B.teal }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick chips in chat */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ctx.chips.slice(0, 3).map((c) => (
                    <button
                      key={c}
                      onClick={() => send(c)}
                      className="px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: B.violetLight,
                        color: B.violet,
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input area */}
          <div
            className="p-3 border-t flex-shrink-0"
            style={{ borderColor: B.border }}
          >
            <div
              className="flex items-end gap-2 rounded-2xl px-3 py-2"
              style={{
                background: B.bg,
                border: `1.5px solid ${B.border}`,
              }}
            >
              <input
                className="flex-1 bg-transparent text-sm font-medium text-[#1C1135] placeholder:text-[#9E95B7] focus:outline-none resize-none"
                placeholder="Pregúntale algo a ASHI…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-500 transition-colors"
                  title="Adjuntar archivo"
                >
                  <Paperclip size={14} />
                </button>
                <button
                  className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-500 transition-colors"
                  title="Voz (próximamente)"
                >
                  <HelpCircle size={14} />
                </button>
                <button
                  onClick={() => send(input)}
                  className="p-1.5 rounded-xl text-white flex-shrink-0 disabled:opacity-40 transition-all"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #0D9488, #7C3AED)"
                      : B.textMuted,
                  }}
                  disabled={!input.trim()}
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
            <p
              className="text-center text-xs mt-1.5 font-medium"
              style={{ color: B.textMuted }}
            >
              ASHI puede cometer errores. Verifica información
              importante.
            </p>
          </div>
        </div>);
}
