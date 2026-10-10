/**
 * Página de Login conectada a FastAPI (POST /api/v1/auth/login).
 * Presentación de acceso con la marca ASHAKids; conserva useAuth().
 * Identificador de acceso: codigo_usuario (VARCHAR(6)).
 */

import React, { useRef, useState } from "react";
import { ArrowRight, AudioLines, ChevronLeft, CircleAlert, Clock3, Eye, EyeOff, Loader2, Lock, ShieldCheck, Target, User as UserIcon, Users } from "lucide-react";
import { AshaKidsLogo } from "@/components/illustrations/AshaKidsLogo";
import { useAuth } from "@/hooks/useAuth";
import { SemanticRole } from "@/types/auth";

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
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [codigoUsuario, setCodigoUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    <main className="asha-login">
      <header className="login-header">
        <AshaKidsLogo variant="header" />
        <button type="button" onClick={onGoHome} className="login-home"><ChevronLeft size={18} /> Volver al inicio</button>
      </header>
      <div className="login-layout">
        <section className="login-welcome" aria-labelledby="login-welcome-title">
          <h2 id="login-welcome-title">El acompañamiento<br /><span>que tu hijo merece</span></h2>
          <div className="login-word" aria-hidden="true">
            <span className="login-letter login-letter-h">h</span><span className="login-letter login-letter-o">o</span>
            <span className="login-letter login-letter-l">l</span><span className="login-letter login-letter-a">a</span>
            <span className="login-word-caption">Cada palabra cuenta.</span>
          </div>
          <p>Conecta con los mejores especialistas y sigue el progreso de tu hijo en tiempo real.</p>
          <ul className="login-benefits">
            <li><AudioLines size={19} /><span>Lenguaje</span></li>
            <li><Target size={19} /><span>Seguimiento</span></li>
            <li><Clock3 size={19} /><span><strong>24/7</strong> Disponible</span></li>
          </ul>
        </section>
        <div className="login-access">
          <section className="login-form-panel" aria-labelledby="login-title">
            <h1 id="login-title">Bienvenido de vuelta</h1>
            <p className="login-description">Inicia sesión con tu código de usuario de ASHAKids.</p>
            {errorMessage && <div role="alert" className="login-error"><CircleAlert size={19} /><span>{errorMessage}</span></div>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-field">
                <label htmlFor="login-user-code">Código de usuario</label>
                <div className="login-input-wrap">
                  <UserIcon size={19} aria-hidden="true" />
                  <input id="login-user-code" type="text" value={codigoUsuario} onChange={e => setCodigoUsuario(e.target.value)} placeholder="Código de usuario" disabled={isLoading} maxLength={6} autoComplete="username" />
                </div>
              </div>
              <div className="login-field">
                <div className="login-field-heading">
                  <label htmlFor="login-password">Contraseña</label>
                  {onForgotPassword && <button type="button" onClick={onForgotPassword} className="login-forgot">¿Olvidaste tu contraseña?</button>}
                </div>
                <div className="login-input-wrap">
                  <Lock size={19} aria-hidden="true" />
                  <input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" disabled={isLoading} autoComplete="current-password" />
                  <button type="button" onClick={() => setShowPassword(s => !s)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword} className="login-password-toggle">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
                </div>
              </div>
              <label className="login-remember"><input type="checkbox" checked={remember} onChange={() => setRemember(r => !r)} /><span>Recordarme</span></label>
              <button type="submit" disabled={isLoading} className="login-submit">
                {isLoading ? <><Loader2 size={19} className="login-spinner" /><span>Iniciando sesión…</span></> : <>Iniciar sesión <ArrowRight size={19} /></>}
              </button>
            </form>
          </section>
          {import.meta.env.DEV && <section className="login-development" aria-label="Usuarios de desarrollo">
            <p>Usuarios de desarrollo (Fase 3A)</p>
            <div>{[
              { label: "Padre / Familia", codigo: "p00001", icon: Users },
              { label: "Terapeuta", codigo: "t00001", icon: AudioLines },
              { label: "Administrador", codigo: "a00001", icon: ShieldCheck },
            ].map(d => <button key={d.codigo} type="button" disabled={isLoading} onClick={() => handleQuickDemo(d.codigo)}><d.icon size={17} /><span>{d.label}</span><code>{d.codigo}</code></button>)}</div>
          </section>}
        </div>
      </div>
    </main>
  );
};
