import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, AlertCircle } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";
import { authService } from "@/modules/auth/infrastructure/authService";

export function CreatePassword() {
  const navigate = useNavigate();

  // Lee el token desde query params (?token=...) o hash fragment (#token=...)
  const [token] = useState<string>(() => {
    try {
      const hashToken = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("token");
      if (hashToken) return hashToken;
      const searchToken = new URLSearchParams(window.location.search).get("token");
      if (searchToken) return searchToken;
    } catch {
      // ignore
    }
    return "";
  });

  useEffect(() => {
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const handleSubmitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden. Por favor verifica.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setBusy(true);
    try {
      const result = await authService.createPassword(token, password);
      setMessage(result.message || "Contraseña creada con éxito.");
      setDone(true);
      setPassword("");
      setConfirmation("");
    } catch (cause: unknown) {
      const msg = cause instanceof Error ? cause.message : "No pudimos crear tu contraseña. Solicita otro enlace.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) {
      setError("Por favor ingresa tu código de usuario.");
      return;
    }
    setError(null);
    setMessage(null);
    setBusy(true);

    try {
      const result = await authService.resendActivation(cleanCode);
      setMessage(result.message || "Si está pendiente, recibirás un enlace en tu correo.");
      setResendDone(true);
    } catch (cause: unknown) {
      const msg = cause instanceof Error ? cause.message : "No pudimos solicitar el enlace. Intenta nuevamente.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell>
      <section className="w-full max-w-md text-[#1C1135]" aria-labelledby="password-title">
        <button
          type="button"
          className="flex items-center gap-2 mb-8 font-black focus-visible:outline-violet-700"
          onClick={() => navigate("/")}
          aria-label="Volver al inicio de ASHAKids"
        >
          <Isotipo size={40} /> ASHAKids
        </button>

        <div className="w-14 h-14 rounded-2xl bg-violet-100 text-[#6B46FE] flex items-center justify-center mb-5">
          <KeyRound size={28} />
        </div>

        <h1 id="password-title" className="text-2xl font-black mb-2 text-[#1C1135]">
          {done ? "¡Contraseña Creada!" : "Crea tu contraseña"}
        </h1>
        <p className="text-sm text-[#615274] leading-relaxed mb-6">
          {done
            ? "Tu nueva contraseña ha sido guardada de forma segura. Ya puedes iniciar sesión con tu código de usuario."
            : "Elige una contraseña personal de al menos 8 caracteres. Después inicia sesión con el código que recibiste por correo."}
        </p>

        {error && (
          <div role="alert" className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        {message && !error && (
          <div role="status" className="mb-5 p-3.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-900 text-sm flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[#6B46FE]" size={16} />
            <span>{message}</span>
          </div>
        )}

        {/* Flujo cuando se creó exitosamente */}
        {done && (
          <div className="space-y-4">
            <Link to="/login" className="block text-center w-full py-3 px-4 rounded-2xl bg-[#6B46FE] text-white font-extrabold text-sm hover:bg-[#5833EA] transition-colors">
              Ir al inicio de sesión
            </Link>
            <Link to="/" className="block text-center text-sm font-bold text-[#6B46FE] hover:underline">
              Volver a la página principal
            </Link>
          </div>
        )}

        {/* Flujo con Token activo */}
        {token && !done && (
          <form onSubmit={handleSubmitPassword} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-xs font-bold uppercase tracking-wider text-[#615274] mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E8E5F4] bg-white text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-[#6B46FE] transition-all text-sm font-medium"
                />
                <Lock className="absolute left-3.5 top-3.5 text-[#9E95B7]" size={18} />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-3.5 text-[#9E95B7] hover:text-[#1C1135]"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-xs font-bold uppercase tracking-wider text-[#615274] mb-2">
                Repite la contraseña
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmation ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={busy}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-[#E8E5F4] bg-white text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-[#6B46FE] transition-all text-sm font-medium"
                />
                <Lock className="absolute left-3.5 top-3.5 text-[#9E95B7]" size={18} />
                <button
                  type="button"
                  onClick={() => setShowConfirmation((s) => !s)}
                  className="absolute right-3.5 top-3.5 text-[#9E95B7] hover:text-[#1C1135]"
                  aria-label={showConfirmation ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Btn type="submit" className="w-full flex items-center justify-center gap-2 mt-4" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Guardando…</span>
                </>
              ) : (
                "Crear mi contraseña"
              )}
            </Btn>
          </form>
        )}

        {/* Flujo cuando el enlace expiró o se pide otro enlace */}
        {!done && (
          <div className="mt-8 border-t border-[#E8E5F4] pt-6 space-y-4">
            <h2 className="font-extrabold text-sm text-[#1C1135]">
              ¿No llegó el correo o venció el enlace?
            </h2>
            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <label htmlFor="activation-code" className="block text-xs font-bold uppercase tracking-wider text-[#615274] mb-2">
                  Código de usuario
                </label>
                <input
                  id="activation-code"
                  type="text"
                  autoComplete="username"
                  required
                  maxLength={64}
                  disabled={busy}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ej. p10001"
                  className="w-full px-4 py-3 rounded-xl border border-[#E8E5F4] bg-white text-[#1C1135] focus:outline-none focus:ring-2 focus:ring-[#6B46FE] transition-all text-sm font-medium"
                />
              </div>

              <Btn type="submit" variant="outline" className="w-full flex items-center justify-center gap-2" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Solicitando…</span>
                  </>
                ) : (
                  <>
                    <Mail size={18} />
                    <span>Enviar otro enlace</span>
                  </>
                )}
              </Btn>
            </form>
            <Link to="/login" className="block mt-4 text-sm font-bold text-[#6B46FE] hover:underline">
              Ir al inicio de sesión
            </Link>
          </div>
        )}
      </section>
    </AuthShell>
  );
}
