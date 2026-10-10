/**
 * Página de Login conectada a FastAPI (POST /api/v1/auth/login).
 * Aplica los campos compartidos del sistema visual y conecta con useAuth().
 * Identificador de acceso: codigo_usuario (VARCHAR(6)).
 */

import React, { useRef, useState } from "react";
import { ChevronLeft, Lock, User as UserIcon } from "lucide-react";
import { Inp } from "@/components/common/Inp";
import { IsotipoWhite } from "@/components/illustrations/IsotipoWhite";
import { LoginIllustration } from "@/components/illustrations/LoginIllustration";
import { AshaKidsLogo } from "@/components/illustrations/AshaKidsLogo";
import { useAuth } from "@/hooks/useAuth";
import { SemanticRole } from "@/types/auth";

interface LoginPageProps {
  onSuccess: (role: SemanticRole) => void;
  onGoHome: () => void;
  onForgotPassword?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onGoHome,
  onForgotPassword,
}) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [codigoUsuario, setCodigoUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const submitting = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    setErrorMessage(null);

    const codigoToSend = codigoUsuario.trim();
    const passToSend = password;

    if (!codigoToSend || !passToSend) {
      setErrorMessage("Por favor ingresa tu código de usuario y contraseña.");
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    try {
      const user = await login({ codigo_usuario: codigoToSend, password: passToSend });
      onSuccess(user.rol);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión.";
      setErrorMessage(msg);
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoCodigo: string) => {
    setCodigoUsuario(demoCodigo);
    // Only prefill the identifier; authentication always requires a password.
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      {/* Panel Izquierdo Ilustrativo (Figma Design) */}
      <div
        className="hidden lg:flex lg:w-[48%] flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #1a0b3b 0%, #2D1B69 40%, #4C1D95 75%, #6D28D9 100%)" }}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #A78BFA, transparent 70%)" }} />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #7C3AED, transparent 70%)" }} />

        <div className="relative z-10 text-white text-center max-w-xs">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(255,255,255,.15)" }}>
              <IsotipoWhite size={30} />
            </div>
            <span className="font-black text-2xl tracking-tight">AshaKids</span>
          </div>

          <div className="relative mx-auto mb-8 rounded-3xl p-6" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}>
            <LoginIllustration />
          </div>

          <h2 className="text-2xl font-black mb-3 leading-snug">El acompañamiento<br />que tu hijo merece</h2>
          <p className="text-sm font-medium leading-relaxed mb-6" style={{ color: "#DDD6FE" }}>
            Organiza las citas y consulta los reportes compartidos por el profesional que acompaña a tu familia.
          </p>
        </div>
      </div>

      {/* Panel Derecho — Formulario de Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#FAFAF9] overflow-y-auto">
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={onGoHome}
            className="flex min-h-11 items-center gap-1.5 text-sm font-bold text-[var(--text-secondary)] hover:text-violet-700 mb-8 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al inicio
          </button>

          <div className="lg:hidden mb-6">
            <AshaKidsLogo variant="header" />
          </div>

          <h1 className="text-2xl font-black text-[#1C1135] mb-1">Bienvenido de vuelta 👋</h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-6">
            Inicia sesión con tu código de usuario de ASHAKids.
          </p>

          {errorMessage && (
            <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm font-bold text-[var(--error-text)]">
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Inp id="login-user-code" name="codigo_usuario" label="Código de usuario"
              value={codigoUsuario} onChange={setCodigoUsuario} placeholder="Ej. p00001"
              autoComplete="username" maxLength={6} disabled={isLoading} icon={<UserIcon size={20} />} />
            <Inp id="login-password" name="password" label="Contraseña" type="password"
              value={password} onChange={setPassword} autoComplete="current-password"
              disabled={isLoading} icon={<Lock size={20} />} />
            {onForgotPassword && <button type="button" onClick={onForgotPassword}
              className="self-end min-h-11 text-sm font-bold text-[var(--primary)] hover:underline">
              ¿Olvidaste tu contraseña?
            </button>}

            <button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full min-h-12 rounded-2xl bg-[var(--primary)] py-3.5 font-extrabold text-base text-white flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-[#5B21B6] transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Iniciando sesión…</span>
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Accesos rápidos de desarrollo (Usuarios de prueba oficiales) */}
          {import.meta.env.DEV && <div className="mt-6 p-4 rounded-2xl border border-[#E8E5F4] bg-white shadow-sm">
            <p className="text-sm font-bold text-[var(--text-secondary)] mb-2.5">
              Accesos de prueba · solo desarrollo
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "👨‍👩‍👧 Padre / Familia", codigo: "p00001", role: "PADRE" },
                { label: "👩‍⚕️ Terapeuta", codigo: "t00001", role: "TERAPEUTA" },
                { label: "🛡️ Administrador", codigo: "a00001", role: "ADMIN" },
              ].map(d => (
                <button
                  key={d.codigo}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleQuickDemo(d.codigo)}
                  className="flex min-h-11 items-center justify-between gap-3 text-sm px-3 py-2 rounded-xl hover:bg-violet-50 border border-transparent hover:border-[#E8E5F4] transition-all text-left"
                >
                  <span className="font-extrabold text-[#1C1135]">{d.label}</span>
                  <span className="font-mono text-sm text-[var(--text-secondary)] font-bold">{d.codigo}</span>
                </button>
              ))}
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
};
