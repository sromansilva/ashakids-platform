import { useEffect, useState } from "react";
import type { usePadreConfig } from "@/modules/padre/presentation/settings/usePadreConfig";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { authService } from "@/modules/auth/infrastructure/authService";
import type { TwoFactorSetupData } from "@/modules/auth/domain/auth";
import { CheckCircle2, Copy, Loader2, ShieldAlert, ShieldCheck, X } from "lucide-react";

type Props = Pick<ReturnType<typeof usePadreConfig>, "setShow2FA" | "setTwoFADone" | "twoFADone" | "showToast">;

export function PadreConfigShow2FA({ setShow2FA, setTwoFADone, twoFADone: _twoFADone, showToast }: Props) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [code, setCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadStatus() {
      try {
        setLoading(true);
        const status = await authService.get2faStatus();
        if (!active) return;
        setIsEnabled(status.totp_activado);

        if (!status.totp_activado) {
          const data = await authService.setup2fa();
          if (!active) return;
          setSetupData(data);
        }
      } catch (err: unknown) {
        if (!active) return;
        setErrorMessage(err instanceof Error ? err.message : "No se pudo cargar la configuración 2FA.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadStatus();
    return () => {
      active = false;
    };
  }, []);

  const handleCopySecret = async () => {
    if (!setupData?.secret) return;
    try {
      await navigator.clipboard.writeText(setupData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleConfirmSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim().length !== 6 || submitting) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await authService.confirm2faSetup(code.trim());
      setIsEnabled(true);
      setTwoFADone(true);
      showToast("Autenticación en dos pasos (2FA) activada con éxito.");
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Código de verificación incorrecto.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisable2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await authService.disable2fa({ password: disablePassword.trim() || undefined });
      setIsEnabled(false);
      setShowDisableConfirm(false);
      showToast("Autenticación en dos pasos desactivada.");
      setShow2FA(false);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "No se pudo desactivar 2FA.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-2fa-title" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={() => {
          setShow2FA(false);
          setTwoFADone(false);
        }}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-7 border border-[#E8E5F4] text-center max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => {
            setShow2FA(false);
            setTwoFADone(false);
          }}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F8F7FC] hover:bg-violet-100 text-[#615274] flex items-center justify-center cursor-pointer transition-colors"
          aria-label="Cerrar modal"
        >
          <X size={16} />
        </button>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-[#6B46FE]" />
            <p className="text-xs font-bold text-[#615274]">Cargando configuración de seguridad…</p>
          </div>
        ) : isEnabled ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100 shadow-xs">
              <ShieldCheck size={32} />
            </div>
            <h2 id="modal-2fa-title" className="text-xl font-black text-[#1C1135]">2FA Activado</h2>
            <p className="text-xs font-semibold text-[#615274] mt-1.5 mb-5 max-w-xs">
              Tu cuenta está protegida. Al iniciar sesión, se te solicitará el código de 6 dígitos de tu aplicación autenticadora.
            </p>

            {errorMessage && (
              <div role="alert" className="w-full mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-left flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {showDisableConfirm ? (
              <form onSubmit={handleDisable2fa} className="w-full bg-[#F8F7FC] rounded-2xl p-4 border border-[#E8E5F4] mb-4 text-left">
                <p className="text-xs font-black text-[#1C1135] mb-2">Confirmar desactivación</p>
                <p className="text-[11px] font-semibold text-[#615274] mb-3">
                  Ingresa tu contraseña actual para confirmar la desactivación del segundo factor:
                </p>
                <input
                  type="password"
                  placeholder="Tu contraseña actual"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  disabled={submitting}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8E5F4] bg-white text-xs font-bold text-[#1C1135] mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {submitting ? "Desactivando…" : "Desactivar 2FA"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDisableConfirm(false)}
                    className="py-2 px-3 rounded-xl bg-white border border-[#E8E5F4] text-[#615274] text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="w-full flex flex-col gap-2.5">
                <Btn
                  variant="cta"
                  className="w-full justify-center"
                  onClick={() => {
                    setShow2FA(false);
                    setTwoFADone(false);
                  }}
                >
                  Entendido
                </Btn>
                <button
                  type="button"
                  onClick={() => setShowDisableConfirm(true)}
                  className="text-xs font-bold text-red-500 hover:text-red-700 py-1 transition-colors cursor-pointer"
                >
                  Desactivar autenticación en dos pasos
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#6B46FE] flex items-center justify-center mb-2">
              <ShieldCheck size={28} />
            </div>
            <h2 id="modal-2fa-title" className="text-xl font-black text-[#1C1135]">Activar autenticación en dos pasos</h2>
            <p className="text-xs font-semibold text-[#615274] mt-1 mb-4 max-w-sm">
              Escanea este código con <strong>Google Authenticator</strong> o <strong>Microsoft Authenticator</strong> en tu teléfono.
            </p>

            {errorMessage && (
              <div role="alert" className="w-full mb-3 p-2.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-left flex items-start gap-2">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {setupData?.qr_code && (
              <div className="mb-4 flex flex-col items-center">
                <div className="p-3 rounded-2xl bg-[#F8F7FC] border border-[#E8E5F4] shadow-xs">
                  <img
                    src={setupData.qr_code}
                    alt="Código QR para vincular autenticador"
                    className="w-44 h-44 object-contain rounded-xl"
                  />
                </div>

                <div className="mt-3 flex items-center gap-1.5 bg-[#EDE9FE] px-3 py-1.5 rounded-xl max-w-xs">
                  <span className="text-[11px] font-mono font-bold text-[#6B46FE] break-all select-all">
                    {setupData.manual_code}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="shrink-0 p-1 rounded-md text-[#6B46FE] hover:bg-violet-200 transition-colors cursor-pointer"
                    title="Copiar clave manual"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
                <span className="text-[10px] text-[#9E95B7] mt-1">Clave de configuración manual</span>
              </div>
            )}

            <form onSubmit={handleConfirmSetup} className="w-full space-y-3">
              <div>
                <label htmlFor="confirm-2fa-input" className="block text-xs font-bold text-[#1C1135] mb-1 text-left">
                  Ingresa el código de 6 dígitos de tu app:
                </label>
                <input
                  id="confirm-2fa-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  disabled={submitting}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#E8E5F4] bg-[#F8F7FC] focus:bg-white text-center font-mono tracking-widest text-lg font-black text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-[#6B46FE]"
                  autoComplete="one-time-code"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Btn
                  type="submit"
                  variant="cta"
                  className="flex-1 justify-center"
                  disabled={submitting || code.trim().length !== 6}
                >
                  {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Verificando…</span></>
                  ) : (
                    "Confirmar y activar"
                  )}
                </Btn>
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={() => setShow2FA(false)}
                  disabled={submitting}
                >
                  Cancelar
                </Btn>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
