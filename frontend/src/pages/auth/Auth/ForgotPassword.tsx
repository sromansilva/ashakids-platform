import { useState } from "react";
import { ArrowRight, Mail, Lock, Sparkles } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Isotipo } from "@/components/illustrations/Isotipo";

// ─── Shared auth shell ─────────────────────────────────────────────────────────
import { AuthShell } from "@/pages/auth/Auth/AuthShell";
import { FieldRow } from "@/pages/auth/Auth/FieldRow";

export function ForgotPassword({ go }: { go: (v: View) => void }) {
  const [step, setStep] = useState<"email" | "sent" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [pass, setPass]   = useState("");
  const [pass2, setPass2] = useState("");

  return (
    <AuthShell>
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <button onClick={() => go("login")} className="flex items-center gap-2.5">
            <Isotipo size={44} />
            <span className="font-black text-[#1C1135] text-lg tracking-tight">AshaKids</span>
          </button>
        </div>

        {step === "email" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.violetLight }}>🔑</div>
              <h1 className="text-2xl font-black text-[#1C1135] mb-1">¿Olvidaste tu contraseña?</h1>
              <p className="text-sm text-[#7C6F9A] font-medium">Ingresa tu correo y te enviaremos un enlace para restablecerla.</p>
            </div>
            <div className="flex flex-col gap-4">
              <FieldRow label="Correo electrónico" type="email" placeholder="tu@email.com" value={email} onChange={setEmail} icon={<Mail size={15} />} />
              <button onClick={() => setStep("sent")}
                className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
                Enviar enlace <ArrowRight size={16} />
              </button>
              <button onClick={() => go("login")} className="text-sm font-bold text-center text-[#7C6F9A] hover:text-violet-600 transition-colors">
                Volver al inicio de sesión
              </button>
            </div>
          </>
        )}

        {step === "sent" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.violetLight }}>📧</div>
            <h1 className="text-2xl font-black text-[#1C1135] mb-2">Revisa tu correo</h1>
            <p className="text-sm text-[#7C6F9A] font-medium mb-6">Enviamos un enlace a <strong className="text-[#1C1135]">{email || "tu correo"}</strong>. Válido por 30 minutos.</p>
            <div className="rounded-2xl p-4 mb-6" style={{ background: B.violetLight }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, #0D9488, ${B.violet})` }}>
                  <Sparkles size={13} color="white" />
                </div>
                <p className="text-xs font-medium text-[#1C1135] leading-relaxed">Si no encuentras el correo, revisa tu carpeta de spam. ASHI estará aquí para ayudarte cuando regreses.</p>
              </div>
            </div>
            <button onClick={() => setStep("reset")}
              className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
              style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
              Ya tengo el enlace
            </button>
          </div>
        )}

        {step === "reset" && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.violetLight }}>🔐</div>
              <h1 className="text-2xl font-black text-[#1C1135] mb-1">Nueva contraseña</h1>
              <p className="text-sm text-[#7C6F9A] font-medium">Elige una contraseña segura para tu cuenta.</p>
            </div>
            <div className="flex flex-col gap-4">
              <FieldRow label="Nueva contraseña" type="password" placeholder="Mínimo 8 caracteres" value={pass} onChange={setPass} icon={<Lock size={15} />} />
              <FieldRow label="Confirmar contraseña" type="password" placeholder="Repite la contraseña" value={pass2} onChange={setPass2} icon={<Lock size={15} />} />
              <div className="flex gap-1.5">
                {["Mayúscula", "Número", "8+ chars"].map((r, i) => (
                  <div key={r} className="flex-1 text-center rounded-xl py-1.5 text-xs font-bold" style={{ background: pass.length > i * 3 ? B.successLight : "#F5F5F5", color: pass.length > i * 3 ? B.success : B.textMuted }}>
                    {r}
                  </div>
                ))}
              </div>
              <button onClick={() => setStep("done")}
                className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
                style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
                Guardar contraseña
              </button>
            </div>
          </>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4" style={{ background: B.successLight }}>✅</div>
            <h1 className="text-2xl font-black text-[#1C1135] mb-2">¡Contraseña actualizada!</h1>
            <p className="text-sm text-[#7C6F9A] font-medium mb-6">Tu contraseña fue cambiada con éxito. Ya puedes iniciar sesión.</p>
            <button onClick={() => go("login")}
              className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white"
              style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}>
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
