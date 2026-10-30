import { useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
import type { View } from "@/shared/domain/types/navigation";
import { AuthShell } from "./AuthShell";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";
import { apiClient } from "@/core/api/client";

export function ForgotPassword({ go }: { go: (v: View) => void }) {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();
    if (!val) {
      setError("Por favor ingresa tu correo electrónico o código de usuario.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const isEmail = val.includes("@");
      const payload = isEmail ? { email: val } : { codigo_usuario: val };
      await apiClient.post("/auth/forgot-password", payload);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "No se pudo procesar la solicitud. Intenta nuevamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <section className="w-full max-w-md text-[#1C1135]" aria-labelledby="forgot-title">
        <button
          type="button"
          className="flex items-center gap-2 mb-8 font-black focus-visible:outline-violet-700"
          onClick={() => go("landing")}
          aria-label="Volver al inicio de ASHAKids"
        >
          <Isotipo size={40} /> ASHAKids
        </button>

        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-[#6B46FE] flex items-center justify-center mb-5">
          <KeyRound size={28} />
        </div>

        <h1 id="forgot-title" className="text-2xl font-black mb-2 text-[#1C1135]">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-sm text-[#615274] leading-relaxed mb-6">
          Ingresa tu correo electrónico o tu código de usuario registrado y te enviaremos las instrucciones de restablecimiento.
        </p>

        {sent ? (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#EDE9FE] border border-[#6B46FE]/30 p-5 text-[#1C1135]">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="text-[#6B46FE] mt-0.5 shrink-0" size={22} />
                <div>
                  <h2 className="font-extrabold text-base text-[#1C1135] mb-1">
                    Instrucciones enviadas
                  </h2>
                  <p className="text-sm text-[#615274] leading-relaxed">
                    Si la cuenta existe en ASHAKids, hemos enviado un enlace seguro a tu correo electrónico. Por favor revisa tu bandeja de entrada y la carpeta de correo no deseado (spam).
                  </p>
                </div>
              </div>
            </div>

            <Btn className="w-full" onClick={() => go("login")}>
              Ir al inicio de sesión
            </Btn>
            <button
              type="button"
              className="w-full text-center text-sm font-bold text-[#6B46FE] hover:underline"
              onClick={() => {
                setSent(false);
                setIdentifier("");
              }}
            >
              Reenviar a otra dirección o código
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="forgot-identifier"
                className="block text-xs font-bold uppercase tracking-wider text-[#615274] mb-2"
              >
                Correo o Código de usuario
              </label>
              <div className="relative">
                <input
                  id="forgot-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ej. familia@gmail.com o p12345"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E5F4] bg-white text-[#1C1135] placeholder:text-[#9E95B7] focus:outline-none focus:ring-2 focus:ring-[#6B46FE] transition-all text-sm font-medium"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <Btn
              type="submit"
              className="w-full flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Enviando enlace...</span>
                </>
              ) : (
                <>
                  <Mail size={18} />
                  <span>Enviar enlace de recuperación</span>
                </>
              )}
            </Btn>

            <div className="pt-2">
              <Btn
                variant="ghost"
                type="button"
                className="w-full"
                onClick={() => go("login")}
              >
                <ArrowLeft size={16} /> Ir al inicio de sesión
              </Btn>
            </div>
          </form>
        )}
      </section>
    </AuthShell>
  );
}
