import { useAshhiFloat } from "@/components/assistant/useAshhiFloat";
import { AshhiFloatPanel } from "@/components/assistant/AshhiFloatPanel";
import { AshhiFloatContentSection2 } from "@/components/assistant/AshhiFloatContentSection2";
import { MessageCircle } from "lucide-react";


export function AshhiFloat(props: Parameters<typeof useAshhiFloat>[0]) {
const { role, ashiCSS, open, setOpen, ashiTriggerRef, closeAshi, tab, setTab, input, setInput, thinking, setThinking, btnBottom, setBtnBottom, draftStates, setDraftStates, isDragging, setIsDragging, dragData, hasMoved, onBtnPointerDown, onBtnPointerMove, onBtnPointerUp, onBtnClick, msgs, setMsgs, roleCtx, ctx, send, AshiAvatar } = useAshhiFloat(props);
return (
    <>
      <style>{ashiCSS}</style>

      {/* ── Floating button ── */}
      {!open && (
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
        <AshhiFloatPanel AshiAvatar={AshiAvatar} closeAshi={closeAshi} setTab={setTab} tab={tab} ctx={ctx} send={send} msgs={msgs} draftStates={draftStates} setDraftStates={setDraftStates} thinking={thinking} input={input} setInput={setInput} />
        </>
      )}
    </>
  );

}
