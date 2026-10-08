import { useState } from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

// ─── Shared auth shell ─────────────────────────────────────────────────────────
import { AuthShell } from "@/pages/auth/Auth/AuthShell";

export function RegisterVerify({ go }: { go: (v: View) => void }) {
  const [resent, setResent] = useState(false);
  return (
    <AuthShell>
      <div className="w-full max-w-sm text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6" style={{ background: B.violetLight }}>📧</div>
        <h1 className="text-2xl font-black text-[#1C1135] mb-2">Revisa tu correo</h1>
        <p className="text-sm text-[#7C6F9A] font-medium mb-8">Enviamos un enlace de verificación a <strong className="text-[#1C1135]">ana@email.com</strong>. Haz clic en él para activar tu cuenta.</p>

        <div className="rounded-2xl p-5 mb-6 text-left" style={{ background: B.violetLight }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #0D9488, ${B.violet})` }}>
              <Sparkles size={14} color="white" />
            </div>
            <div>
              <p className="font-extrabold text-sm text-[#1C1135] mb-0.5">ASHI dice:</p>
              <p className="text-xs text-[#7C6F9A] font-medium leading-relaxed">Verifica tu correo y regresa aquí para comenzar a configurar tu cuenta. ¡Te espero con el primer paso!</p>
            </div>
          </div>
        </div>

        <button onClick={() => go("onboarding")}
          className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white mb-3 flex items-center justify-center gap-2"
          style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
          Ya verifiqué mi correo <ArrowRight size={16} />
        </button>

        <button onClick={() => setResent(true)}
          className="w-full rounded-2xl py-3 border border-[#E8E5F4] bg-white font-bold text-sm transition-all"
          style={{ color: resent ? B.success : B.textMid }}>
          {resent ? <><CheckCircle size={14} className="inline mr-1" />Correo reenviado</> : "Reenviar correo"}
        </button>
      </div>
    </AuthShell>
  );
}
