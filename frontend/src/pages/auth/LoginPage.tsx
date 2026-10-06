/**
 * Página de Login conectada a FastAPI (POST /api/v1/auth/login).
 * Conserva el diseño visual exportado de Figma y conecta con useAuth().
 * Identificador de acceso: codigo_usuario (VARCHAR(6)).
 */

import React, { useState } from "react";
import {
  Check,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { B, IsotipoWhite, LoginIllustration, AshaKidsLogo } from "@/components/shared";
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
  const { login, isLoading } = useAuth();
  const [codigoUsuario, setCodigoUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent, customCodigo?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const codigoToSend = (customCodigo || codigoUsuario).trim();
    const passToSend = customPass || password;

    if (!codigoToSend || !passToSend) {
      setErrorMessage("Por favor ingresa tu código de usuario y contraseña.");
      return;
    }

    try {
      const user = await login({ codigo_usuario: codigoToSend, password: passToSend });
      onSuccess(user.rol);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión.";
      setErrorMessage(msg);
    }
  };

  const handleQuickDemo = (demoCodigo: string) => {
    setCodigoUsuario(demoCodigo);
    setPassword("12345");
    handleSubmit(undefined, demoCodigo, "12345");
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
          <p className="text-sm font-medium leading-relaxed mb-6" style={{ color: "rgba(196,181,253,.85)" }}>
            Conecta con los mejores especialistas y sigue el progreso de tu hijo en tiempo real.
          </p>

          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "🗣️", l: "Lenguaje" },
              { v: "🎯", l: "Seguimiento" },
              { v: "24/7", l: "Disponible" },
            ].map(s => (
              <div key={s.l} className="rounded-2xl py-2 px-2" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)" }}>
                <p className="text-base font-black text-white">{s.v}</p>
                <p className="text-xs font-medium" style={{ color: "rgba(196,181,253,.75)" }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Derecho — Formulario de Login */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#FAFAF9] overflow-y-auto">
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-1.5 text-sm font-bold text-[#7C6F9A] hover:text-violet-700 mb-8 transition-colors"
          >
            <ChevronLeft size={16} /> Volver al inicio
          </button>

          <div className="lg:hidden mb-6">
            <AshaKidsLogo variant="header" />
          </div>

          <h1 className="text-2xl font-black text-[#1C1135] mb-1">Bienvenido de vuelta 👋</h1>
          <p className="text-sm text-[#7C6F9A] font-medium mb-6">
            Inicia sesión con tu código de usuario de ASHAKids.
          </p>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-bold text-red-600 flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Campo Código de Usuario */}
            <div>
              <label className="block text-sm font-extrabold text-[#1C1135] mb-1.5">
                Código de usuario
              </label>
              <div className="relative">
                <UserIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                <input
                  type="text"
                  value={codigoUsuario}
                  onChange={e => setCodigoUsuario(e.target.value)}
                  placeholder="Ej. p00001, t00001, a00001"
                  disabled={isLoading}
                  maxLength={6}
                  className="w-full rounded-2xl border border-[#E8E5F4] bg-white pl-10 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-violet-400 font-mono"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-extrabold text-[#1C1135]">Contraseña</label>
                {onForgotPassword && (
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs font-bold hover:underline"
                    style={{ color: B.violet }}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full rounded-2xl border border-[#E8E5F4] bg-white pl-10 pr-10 py-3 text-sm font-medium focus:outline-none focus:border-violet-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E95B7]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Recordarme */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => setRemember(r => !r)}
                className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-colors"
                style={{
                  borderColor: remember ? B.violet : B.border,
                  background: remember ? B.violet : "white",
                }}
              >
                {remember && <Check size={11} color="white" />}
              </div>
              <span className="text-sm font-medium text-[#7C6F9A]">Recordarme</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60 transition-all shadow-md"
              style={{ background: `linear-gradient(135deg, ${B.violet}, ${B.violetDark})` }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Validando con API...</span>
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </form>

          {/* Accesos rápidos de desarrollo (Usuarios de prueba oficiales) */}
          <div className="mt-6 p-4 rounded-2xl border border-[#E8E5F4] bg-white shadow-sm">
            <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2.5">
              Usuarios de desarrollo (Fase 3A)
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
                  className="flex items-center justify-between text-xs px-3 py-2 rounded-xl hover:bg-violet-50 border border-transparent hover:border-[#E8E5F4] transition-all text-left"
                >
                  <span className="font-extrabold text-[#1C1135]">{d.label}</span>
                  <span className="font-mono text-[11px] text-[#7C6F9A] font-bold">{d.codigo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
