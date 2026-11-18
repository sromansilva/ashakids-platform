/**
 * Página de Login conectada a FastAPI (POST /api/v1/auth/login).
 * Presentación de acceso con la marca ASHAKids; conserva useAuth().
 * Identificador de acceso: codigo_usuario (VARCHAR(6)).
 */

import { Link, useLocation } from "react-router-dom";
import React, { useRef, useState } from "react";
import { ArrowRight, ChevronLeft, CircleAlert, Clock, Eye, EyeOff, Loader2, Lock, ShieldCheck, User as UserIcon } from "lucide-react";
import { AshaKidsLogo } from "@/shared/presentation/components/illustrations/AshaKidsLogo";
import { useAuth } from "@/modules/auth/application/useAuth";
import { SemanticRole } from "@/modules/auth/domain/auth";

import "./login.css";

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
  const { login, verify2fa } = useAuth();
  const location = useLocation();
  const inactivityNotice = (location.state as { inactivityNotice?: string } | null)?.inactivityNotice;
  const [isLoading, setIsLoading] = useState(false);
  const [codigoUsuario, setCodigoUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mfaTicket, setMfaTicket] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const submitting = useRef(false);

  const handleSubmit = async (e?: React.FormEvent, customCodigo?: string, customPass?: string) => {
    if (e) e.preventDefault();
    if (submitting.current) return;
    setErrorMessage(null);

    const codigoToSend = (customCodigo || codigoUsuario).trim();
    const passToSend = customPass || password;

    if (!codigoToSend || !passToSend) {
      setErrorMessage("Por favor ingresa tu código de usuario y contraseña.");
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    try {
      const res = await login({ codigo_usuario: codigoToSend, password: passToSend });
      if (res.requires_2fa && res.mfa_ticket) {
        setMfaTicket(res.mfa_ticket);
        setTwoFactorCode("");
      } else if (res.user) {
        onSuccess(res.user.rol);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión.";
      setErrorMessage(msg);
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  const handleVerify2fa = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mfaTicket || submitting.current) return;

    const cleanCode = twoFactorCode.trim();
    if (cleanCode.length !== 6) {
      setErrorMessage("Por favor ingresa el código completo de 6 dígitos.");
      return;
    }

    submitting.current = true;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await verify2fa(mfaTicket, cleanCode);
      onSuccess(user.rol);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Código de verificación incorrecto.";
      setErrorMessage(msg);
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  return (
    <main className="asha-login">
      <header className="login-header">
        <AshaKidsLogo variant="header" />
        <button type="button" onClick={onGoHome} className="login-home"><ChevronLeft size={16} /> Volver al inicio</button>
      </header>
      <div className="login-layout">
        <section className="login-welcome" aria-labelledby="login-welcome-title">
          <h2 id="login-welcome-title">El acompañamiento<br /><span>que tu hijo merece</span></h2>
          <p className="login-welcome-sub">
            Conectamos familias y terapeutas certificados para acompañar el desarrollo del lenguaje y aprender jugando.
          </p>
          <div className="login-word" aria-hidden="true">
            <span className="login-letter login-letter-h">h</span><span className="login-letter login-letter-o">o</span>
            <span className="login-letter login-letter-l">l</span><span className="login-letter login-letter-a">a</span>
            <span className="login-word-caption">Cada palabra cuenta.</span>
          </div>
          <div className="login-features">
            <div className="login-feature-item">
              <span className="login-feature-dot" />
              <span>Terapeutas certificados y planes a medida</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-dot" />
              <span>Mundo ASHA con actividades lúdicas guiadas</span>
            </div>
            <div className="login-feature-item">
              <span className="login-feature-dot" />
              <span>Monitoreo continuo y reportes de progreso</span>
            </div>
          </div>
        </section>
        <div className="login-access">
          <section className="login-form-panel" aria-labelledby="login-title">
            <h1 id="login-title">{mfaTicket ? "Verificación en dos pasos" : "Bienvenido de vuelta"}</h1>
            <p className="login-description">
              {mfaTicket
                ? "Introduce el código de 6 dígitos generado por tu app Google o Microsoft Authenticator."
                : "Inicia sesión con tu código de usuario de ASHAKids."}
            </p>
            {inactivityNotice && !errorMessage && !mfaTicket && (
              <div role="status" className="mb-4 flex items-center gap-2.5 p-3 rounded-2xl bg-[#EDE9FE] border border-violet-200 text-[#1C1135] text-xs sm:text-sm font-semibold">
                <Clock size={18} className="text-[#6B46FE] shrink-0" />
                <span>{inactivityNotice}</span>
              </div>
            )}
            {errorMessage && <div role="alert" className="login-error"><CircleAlert size={18} /><span>{errorMessage}</span></div>}

            {mfaTicket ? (
              <form onSubmit={handleVerify2fa} className="login-form">
                <div className="login-field">
                  <label htmlFor="login-2fa-code">Código de seguridad (6 dígitos)</label>
                  <div className="login-input-wrap">
                    <ShieldCheck size={18} aria-hidden="true" />
                    <input
                      id="login-2fa-code"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={e => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      disabled={isLoading}
                      autoComplete="one-time-code"
                      autoFocus
                      className="font-mono tracking-widest text-center font-black text-lg"
                    />
                  </div>
                  <p className="text-[11px] font-semibold text-[#615274] mt-1.5 leading-snug">
                    Abre tu aplicación autenticadora (Google o Microsoft Authenticator) e introduce el código numérico temporal.
                  </p>
                </div>

                <button type="submit" disabled={isLoading || twoFactorCode.length !== 6} className="login-submit">
                  {isLoading ? (
                    <><Loader2 size={18} className="login-spinner" /><span>Verificando código…</span></>
                  ) : (
                    <>Verificar y acceder <ArrowRight size={18} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMfaTicket(null);
                    setTwoFactorCode("");
                    setErrorMessage(null);
                  }}
                  className="w-full mt-3 text-center text-xs font-bold text-[#6B46FE] hover:underline cursor-pointer"
                >
                  ← Volver a ingresar contraseña
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="login-field">
                  <label htmlFor="login-user-code">Código de usuario</label>
                  <div className="login-input-wrap">
                    <UserIcon size={18} aria-hidden="true" />
                    <input id="login-user-code" type="text" value={codigoUsuario} onChange={e => setCodigoUsuario(e.target.value)} placeholder="Código de usuario" disabled={isLoading} maxLength={6} autoComplete="username" />
                  </div>
                </div>
                <div className="login-field">
                  <div className="login-field-heading">
                    <label htmlFor="login-password">Contraseña</label>
                    {onForgotPassword && <button type="button" onClick={onForgotPassword} className="login-forgot">¿Olvidaste tu contraseña?</button>}
                  </div>
                  <div className="login-input-wrap">
                    <Lock size={18} aria-hidden="true" />
                    <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} className="login-password-toggle">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                <label className="login-remember"><input type="checkbox" checked={remember} onChange={() => setRemember(r => !r)} /><span>Recordarme</span></label>
                <button type="submit" disabled={isLoading} className="login-submit">
                  {isLoading ? <><Loader2 size={18} className="login-spinner" /><span>Iniciando sesión…</span></> : <>Iniciar sesión <ArrowRight size={18} /></>}
                </button>
              </form>
            )}

            {!mfaTicket && (
              <p className="login-first-access">¿Es tu primer acceso? Revisa tu correo para crear tu contraseña. <Link className="underline font-bold" to="/crear-contrasena">Solicitar enlace</Link></p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
