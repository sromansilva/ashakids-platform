import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, ShieldAlert, ShieldCheck, X } from "lucide-react";
import type { usePadreConfig } from "@/modules/padre/presentation/settings/usePadreConfig";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Inp } from "@/shared/presentation/components/common/Inp";
import { authService } from "@/modules/auth/infrastructure/authService";
import { padresService } from "@/modules/padre/infrastructure/padresService";
import { ApiError } from "@/core/api/client";

type Props = Pick<
  ReturnType<typeof usePadreConfig>,
  "setShowDeleteAccount" | "setDeleteConfirm" | "deleteConfirm" | "showToast"
>;

export function PadreConfigShowDeleteAccount({
  setShowDeleteAccount,
  setDeleteConfirm,
  showToast,
}: Props) {
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [requires2fa, setRequires2fa] = useState(false);
  const [loading2fa, setLoading2fa] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function check2fa() {
      try {
        const status = await authService.get2faStatus();
        if (active) setRequires2fa(Boolean(status.totp_activado));
      } catch {
        if (active) setRequires2fa(false);
      } finally {
        if (active) setLoading2fa(false);
      }
    }
    void check2fa();
    return () => {
      active = false;
    };
  }, []);

  const handleClose = () => {
    if (submitting) return;
    setShowDeleteAccount(false);
    setDeleteConfirm("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage("Ingresa tu contraseña actual para confirmar.");
      return;
    }
    if (requires2fa && totpCode.trim().length !== 6) {
      setErrorMessage("Ingresa el código de 6 dígitos de tu aplicación autenticadora.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await padresService.solicitarDesactivacion({
        password: password.trim(),
        totp_code: requires2fa ? totpCode.trim() : undefined,
      });
      setShowDeleteAccount(false);
      setDeleteConfirm("");
      showToast(res.message || "Tu solicitud de desactivación fue enviada a administración.");
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo enviar la solicitud. Inténtalo nuevamente.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-deactivate-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={handleClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 border border-[#E8E5F4]">
        <button
          type="button"
          onClick={handleClose}
          disabled={submitting}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F8F7FC] hover:bg-violet-100 text-[#615274] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-600"
          style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}
        >
          <AlertTriangle size={26} aria-hidden="true" />
        </div>

        <h2
          id="modal-deactivate-title"
          className="font-extrabold text-center text-red-700 text-lg mb-2"
        >
          ¿Confirmas enviar la solicitud de desactivación?
        </h2>
        <p className="text-sm text-center text-[#615274] font-medium mb-4 leading-relaxed">
          Tu cuenta <strong>no se desactivará ni eliminará de inmediato</strong>. La solicitud será enviada a
          administración para que evalúe y proceda con la suspensión correspondiente.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2"
          >
            <ShieldAlert size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loading2fa ? (
          <div className="py-6 flex items-center justify-center gap-2 text-xs font-bold text-[#615274]">
            <Loader2 size={18} className="animate-spin text-[#6B46FE]" />
            <span>Verificando requisitos de seguridad…</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Inp
              label="Contraseña actual"
              type="password"
              placeholder="Ingresa tu contraseña actual"
              maxLength={128}
              value={password}
              onChange={setPassword}
            />

            {requires2fa && (
              <div>
                <label
                  htmlFor="deactivate-2fa-code"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#1C1135] mb-1.5"
                >
                  <ShieldCheck size={14} className="text-[#6B46FE]" aria-hidden="true" />
                  Código de verificación en dos pasos (2FA)
                </label>
                <input
                  id="deactivate-2fa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                  disabled={submitting}
                  autoComplete="one-time-code"
                  className="w-full py-2.5 px-3 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] focus:bg-white text-center font-mono tracking-widest text-base font-black text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-[#6B46FE]"
                />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Btn
                type="button"
                variant="secondary"
                className="flex-1 justify-center"
                disabled={submitting}
                onClick={handleClose}
              >
                Cancelar
              </Btn>
              <Btn
                type="submit"
                variant="danger"
                className="flex-1 justify-center"
                disabled={
                  submitting ||
                  !password.trim() ||
                  (requires2fa && totpCode.trim().length !== 6)
                }
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Enviando…
                  </>
                ) : (
                  "Enviar solicitud"
                )}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
