import { PublicIllustration } from '@/shared/presentation/components/illustrations/PublicIllustration';
import { useAshhiFloat } from "@/shared/presentation/components/assistant/useAshhiFloat";
import { AshhiFloatPanel } from "@/shared/presentation/components/assistant/AshhiFloatPanel";
import { getAshaKidsWhatsAppUrl } from "@/shared/domain/contact";

export function AshhiFloat({ appearance, ...props }: Parameters<typeof useAshhiFloat>[0] & { appearance?: 'landing' }) {
  const { ashiCSS, open, ashiTriggerRef, closeAshi, tab, setTab, input, setInput, thinking, btnBottom, draftStates, setDraftStates, isDragging, onBtnPointerDown, onBtnPointerMove, onBtnPointerUp, onBtnClick, msgs, ctx, send, AshiAvatar } = useAshhiFloat(props);

  const ashiAriaLabel = appearance === 'landing' ? "Abrir Ashi, asistente de demostración" : "Abrir asistente ASHI";

  return (
    <>
      <style>{ashiCSS}</style>

      {/* ── Modern Floating Assistant & WhatsApp Dock ── */}
      {!open && (
        <div
          className="landing-assistant-dock"
          style={appearance === 'landing' ? undefined : { bottom: `calc(${btnBottom}px + env(safe-area-inset-bottom))` }}
        >
          <button
            ref={ashiTriggerRef}
            type="button"
            onPointerDown={onBtnPointerDown}
            onPointerMove={onBtnPointerMove}
            onPointerUp={onBtnPointerUp}
            onClick={onBtnClick}
            aria-label={ashiAriaLabel}
            className="landing-dock-control"
            style={{
              cursor: isDragging ? "grabbing" : "pointer",
              transform: isDragging ? "scale(1.08)" : undefined,
              touchAction: "none",
            }}
          >
            <span className="landing-dock-ashi">
              <PublicIllustration sizes="88px" src="/illustrations/ashi-head-v1.png" alt="" />
            </span>
            <span className="landing-dock-label">Ashi</span>
          </button>
          <a
            href={getAshaKidsWhatsAppUrl("Hola AshaKids, necesito ayuda.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contactar a AshaKids por WhatsApp"
            className="landing-dock-control"
          >
            <span className="landing-dock-whatsapp">
              <svg viewBox="0 0 32 32" aria-hidden="true">
                <path d="M27 15.6a11 11 0 0 1-16.5 9.5L5 26.5l1.5-5.3A11 11 0 1 1 27 15.6Z" fill="none" stroke="currentColor" strokeWidth="2.2"/>
                <path d="M12 9.5c-.4-.6-1.3-.6-1.8-.1-1.7 1.7-.4 5.2 2.7 8.2 3 3 6.6 4.2 8.2 2.5.5-.5.5-1.3-.1-1.7l-2.3-1.4c-.4-.2-.8-.2-1.1.1l-.9.9c-1.7-.7-3.3-2.3-4-3.9l.9-1c.3-.3.3-.8.1-1.1Z" fill="currentColor"/>
              </svg>
            </span>
            <span className="landing-dock-label">WhatsApp</span>
          </a>
        </div>
      )}

      {/* ── Panel ── */}
      {open && (
        <>
          <button type="button" aria-label="Cerrar asistente ASHI" onClick={closeAshi} className="fixed inset-0 z-40 bg-black/20 sm:hidden" />
          <AshhiFloatPanel
            AshiAvatar={AshiAvatar}
            closeAshi={closeAshi}
            setTab={setTab}
            tab={tab}
            ctx={ctx}
            send={send}
            msgs={msgs}
            draftStates={draftStates}
            setDraftStates={setDraftStates}
            thinking={thinking}
            input={input}
            setInput={setInput}
          />
        </>
      )}
    </>
  );
}
