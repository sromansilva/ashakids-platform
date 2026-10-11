import { useAshhiFloat } from "@/components/assistant/useAshhiFloat";
import { AshhiFloatPanel } from "@/components/assistant/AshhiFloatPanel";
import { AshhiFloatContentSection2 } from "@/components/assistant/AshhiFloatContentSection2";
import { MessageCircle } from "lucide-react";

const LandingAshiAvatar = ({ size = 36 }: { size?: number }) => <img src="/illustrations/ashi-head-v1.png" alt="" width={size} height={size} style={{ objectFit: 'contain' }}/>;

export function AshhiFloat({ appearance, ...props }: Parameters<typeof useAshhiFloat>[0] & { appearance?: 'landing' }) {
const { role, ashiCSS, open, setOpen, ashiTriggerRef, closeAshi, tab, setTab, input, setInput, thinking, setThinking, btnBottom, setBtnBottom, draftStates, setDraftStates, isDragging, setIsDragging, dragData, hasMoved, onBtnPointerDown, onBtnPointerMove, onBtnPointerUp, onBtnClick, msgs, setMsgs, roleCtx, ctx, send, AshiAvatar } = useAshhiFloat(props);
return (
    <>
      <style>{ashiCSS}</style>

      {/* ── Floating button ── */}
      {!open && appearance === 'landing' && <div className="landing-assistant-dock">
        <button ref={ashiTriggerRef} type="button" onClick={onBtnClick} aria-label="Abrir Ashi, asistente de demostración" className="landing-dock-control">
          <span className="landing-dock-ashi"><img src="/illustrations/ashi-head-v1.png" alt=""/></span><span className="landing-dock-label">Ashi</span>
        </button>
        <a href="https://wa.me/51986309426?text=Hola%20AshaKids%2C%20necesito%20ayuda." target="_blank" rel="noreferrer" aria-label="Contactar a AshaKids por WhatsApp" className="landing-dock-control">
          <span className="landing-dock-whatsapp"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M27 15.6a11 11 0 0 1-16.5 9.5L5 26.5l1.5-5.3A11 11 0 1 1 27 15.6Z" fill="none" stroke="currentColor" strokeWidth="2.2"/><path d="M12 9.5c-.4-.6-1.3-.6-1.8-.1-1.7 1.7-.4 5.2 2.7 8.2 3 3 6.6 4.2 8.2 2.5.5-.5.5-1.3-.1-1.7l-2.3-1.4c-.4-.2-.8-.2-1.1.1l-.9.9c-1.7-.7-3.3-2.3-4-3.9l.9-1c.3-.3.3-.8.1-1.1Z" fill="currentColor"/></svg></span><span className="landing-dock-label">WhatsApp</span>
        </a>
      </div>}
      {!open && appearance !== 'landing' && (
        <>
        <a href="https://wa.me/51986309426?text=Hola%20AshaKids%2C%20necesito%20ayuda." target="_blank" rel="noreferrer" aria-label="Contactar a AshaKids por WhatsApp" className="fixed right-4 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2" style={{ bottom: `calc(${btnBottom}px + 72px + env(safe-area-inset-bottom))` }}>
          <MessageCircle size={22} fill="currentColor" />
        </a>
        <AshhiFloatContentSection2 ashiTriggerRef={ashiTriggerRef} onBtnPointerDown={onBtnPointerDown} onBtnPointerMove={onBtnPointerMove} onBtnPointerUp={onBtnPointerUp} onBtnClick={onBtnClick} isDragging={isDragging} btnBottom={btnBottom} />
        </>
      )}

      {/* ── Panel ── */}
      {open && (
        <>
        <button type="button" aria-label="Cerrar asistente ASHI" onClick={closeAshi} className="fixed inset-0 z-40 bg-black/20 sm:hidden" />
        <AshhiFloatPanel AshiAvatar={appearance === 'landing' ? LandingAshiAvatar : AshiAvatar} closeAshi={closeAshi} setTab={setTab} tab={tab} ctx={ctx} send={send} msgs={msgs} draftStates={draftStates} setDraftStates={setDraftStates} thinking={thinking} input={input} setInput={setInput} />
        </>
      )}
    </>
  );

}
