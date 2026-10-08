import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

export function RegisterTerapeutaSuccess({ go }: { go: (v: View) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAF9]" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="w-full max-w-md text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-6" style={{ background: B.tealLight }}>🎉</div>
        <h1 className="text-3xl font-black text-[#1C1135] mb-3">¡Solicitud enviada!</h1>
        <p className="text-[#7C6F9A] font-medium mb-6">Gracias por postular a ASHAKids. Nuestro equipo revisará tu información y te notificará cuando tu cuenta sea aprobada.</p>
        <div className="rounded-3xl p-6 mb-6 text-left" style={{ background: `linear-gradient(135deg, ${B.tealLight}, ${B.violetLight})` }}>
          <p className="font-extrabold text-[#1C1135] mb-3">¿Qué sigue?</p>
          {["Revisión de tus documentos (2-5 días hábiles)", "Entrevista breve con nuestro equipo clínico", "Aprobación y creación de tu cuenta", "Acceso a ASHI y tu panel profesional"].map((s, i) => (
            <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0" style={{ background: B.teal }}>{i + 1}</div>
              <p className="text-sm font-medium text-[#1C1135]">{s}</p>
            </div>
          ))}
        </div>
        <button onClick={() => go("landing")}
          className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
          style={{ background: `linear-gradient(135deg, ${B.teal}, #0f766e)` }}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
