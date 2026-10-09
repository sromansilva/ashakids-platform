import type { useAshhiFloat } from "@/components/assistant/useAshhiFloat";
import { Sparkles } from "lucide-react";

type Props = Pick<ReturnType<typeof useAshhiFloat>, "ashiTriggerRef" | "onBtnPointerDown" | "onBtnPointerMove" | "onBtnPointerUp" | "onBtnClick" | "isDragging" | "btnBottom">;
export function AshhiFloatContentSection2({ ashiTriggerRef, onBtnPointerDown, onBtnPointerMove, onBtnPointerUp, onBtnClick, isDragging, btnBottom }: Props) {
return (<button
          ref={ashiTriggerRef}
          onPointerDown={onBtnPointerDown}
          onPointerMove={onBtnPointerMove}
          onPointerUp={onBtnPointerUp}
          onClick={onBtnClick}
          aria-label="Abrir asistente ASHI"
          className={`fixed right-4 sm:right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full ashi-breathe ${isDragging ? "" : "ashi-float"}`}
          style={{
            bottom: `calc(${btnBottom}px + env(safe-area-inset-bottom))`,
            background:
              "linear-gradient(135deg, #0a7a71, #5b21b6)",
            boxShadow: "0 8px 32px rgba(13,148,136,.4)",
            cursor: isDragging ? "grabbing" : "grab",
            transform: isDragging ? "scale(1.09)" : "scale(1)",
            transition: isDragging
              ? "transform 0.1s ease"
              : "transform 0.25s ease",
            userSelect: "none",
            touchAction: "none",
          }}
        >
          <div
            className="rounded-full flex items-center justify-center ring-2 ring-white/30"
            style={{
              width: 38,
              height: 38,
              background: "rgba(255,255,255,.15)",
            }}
          >
            <Sparkles size={18} color="white" />
          </div>
          <div className="hidden">
            <p className="text-sm font-black text-white leading-none">
              ASHI
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,.75)" }}
              >
                Disponible
              </span>
            </div>
          </div>
        </button>);
}
