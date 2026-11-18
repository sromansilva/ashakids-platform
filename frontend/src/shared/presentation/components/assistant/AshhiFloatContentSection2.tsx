import type { useAshhiFloat } from "@/shared/presentation/components/assistant/useAshhiFloat";
import { PublicIllustration } from "@/shared/presentation/components/illustrations/PublicIllustration";

type Props = Pick<ReturnType<typeof useAshhiFloat>, "ashiTriggerRef" | "onBtnPointerDown" | "onBtnPointerMove" | "onBtnPointerUp" | "onBtnClick" | "isDragging" | "btnBottom">;
export function AshhiFloatContentSection2({ ashiTriggerRef, onBtnPointerDown, onBtnPointerMove, onBtnPointerUp, onBtnClick, isDragging, btnBottom }: Props) {
  return (
    <button
      ref={ashiTriggerRef}
      onPointerDown={onBtnPointerDown}
      onPointerMove={onBtnPointerMove}
      onPointerUp={onBtnPointerUp}
      onClick={onBtnClick}
      aria-label="Abrir asistente ASHI"
      className="landing-dock-control"
      style={{
        position: "fixed",
        right: 24,
        bottom: `calc(${btnBottom}px + env(safe-area-inset-bottom))`,
        zIndex: 50,
        cursor: isDragging ? "grabbing" : "pointer",
        transform: isDragging ? "scale(1.08)" : undefined,
        touchAction: "none",
        userSelect: "none",
      }}
    >
      <span className="landing-dock-ashi">
        <PublicIllustration sizes="88px" src="/illustrations/ashi-head-v1.png" alt="" />
      </span>
      <span className="landing-dock-label">Ashi</span>
    </button>
  );
}
