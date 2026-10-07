import React, { useState } from "react";
import { ChevronRight, Database } from "lucide-react";
import { B } from "@/components/shared";

export type VoiceRecognition = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export function SimulatedDataLog({ log }: { log: object }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-5 rounded-2xl border border-[#E8E5F4] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-extrabold text-[#7C6F9A] hover:bg-[#F5F3FF] transition-colors"
      >
        <span className="flex items-center gap-2">
          <Database size={13} /> 🔬 Prototipo de instrumentación · Datos simulados
        </span>
        <ChevronRight
          size={13}
          className={`transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-2 flex-wrap">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#FFFBEB", color: "#D97706" }}
            >
              Datos simulados · No datos reales
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#EDE9FE", color: "#7C3AED" }}
            >
              Esquema v0.3-demo
            </span>
          </div>
          <pre className="text-xs text-[#4B4869] bg-[#F5F3FF] rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(log, null, 2)}
          </pre>
          <p className="text-xs text-[#9E95B7] font-medium mt-2 italic">
            En producción estos datos se pseudonimizan antes de almacenarse. El consentimiento para entrenamiento de ML es opcional y separado.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Shared: ExitConfirmModal ───────────────────────────────────────────────────
export function ExitConfirmModal({
  onStay,
  onExit,
}: {
  onStay: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onStay}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="text-4xl mb-3">🚪</div>
        <h3 className="font-extrabold text-[#1C1135] text-lg mb-2">
          ¿Salir de la actividad?
        </h3>
        <p className="text-sm text-[#7C6F9A] font-medium mb-5 leading-relaxed">
          Perderás el progreso de esta ronda. Podrás volver a intentarlo cuando quieras.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onStay}
            aria-label="Continuar actividad"
            className="flex-1 py-2.5 rounded-xl font-extrabold text-sm border border-[#E8E5F4] text-[#1C1135] hover:bg-[#F5F3FF] transition-colors"
          >
            Continuar actividad
          </button>
          <button
            onClick={onExit}
            aria-label="Salir sin completar"
            className="flex-1 py-2.5 rounded-xl font-extrabold text-sm text-white transition-colors"
            style={{ background: "#DC2626" }}
          >
            Salir sin completar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ASHA Session therapist info ───────────────────────────────────────────────
export const SESSION_THERAPIST = {
  name: "Dra. Ana Ruiz",
  specialty: "Terapia del Lenguaje",
  av: "AR",
  color: B.violet,
  date: "30 Jul 2026",
  time: "10:00 AM",
  duration: "45 min",
  type: "Virtual",
  status: "Confirmada",
};

// Confetti burst (CSS-only)
export function Confetti() {
  const colors = [
    "#7C3AED",
    "#F97316",
    "#0D9488",
    "#EC4899",
    "#FCD34D",
    "#34D399",
    "#60A5FA",
  ];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 56 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-sm animate-bounce"
          style={{
            width: Math.random() * 10 + 6,
            height: Math.random() * 10 + 6,
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            background: colors[i % colors.length],
            opacity: 0.85,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1.5 + Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
