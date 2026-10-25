import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthShell } from "./AuthShell";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { authService } from "@/modules/auth/infrastructure/authService";

export function CreatePassword() {
  // El fragmento no se envía al servidor ni aparece en logs HTTP o Referer.
  const [token] = useState(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get("token") ?? "";
    return value;
  });
  useEffect(() => { window.history.replaceState(null, "", window.location.pathname); }, []);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const inputClass = "w-full rounded-xl border border-slate-400 px-4 py-3 mt-1 mb-4 focus:outline-violet-700";
  return <AuthShell><section className="w-full max-w-md text-[#1C1135]" aria-labelledby="password-title">
    <h1 id="password-title" className="text-2xl font-black mb-4">Crea tu contraseña</h1>
    <p className="mb-6 text-slate-700">Elige una contraseña personal de 12 a 128 caracteres. Después inicia sesión con el código que recibiste por correo.</p>
    {error && <p role="alert" className="mb-4 text-red-700">{error}</p>}
    {message && <p role="status" className="mb-4 text-green-800">{message}</p>}
    {token && !done && <form onSubmit={async event => {
      event.preventDefault(); setError(""); setMessage("");
      if (password !== confirmation) { setError("Las contraseñas no coinciden."); return; }
      setBusy(true);
      try { const result = await authService.createPassword(token, password); setMessage(result.message); setDone(true); setPassword(""); setConfirmation(""); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos crear tu contraseña. Solicita otro enlace."); }
      finally { setBusy(false); }
    }}>
      <label htmlFor="new-password" className="font-bold">Nueva contraseña</label>
      <input id="new-password" className={inputClass} type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} value={password} onChange={e => setPassword(e.target.value)} />
      <label htmlFor="confirm-password" className="font-bold">Repite la contraseña</label>
      <input id="confirm-password" className={inputClass} type="password" autoComplete="new-password" required minLength={12} maxLength={128} disabled={busy} value={confirmation} onChange={e => setConfirmation(e.target.value)} />
      <Btn type="submit" className="w-full" disabled={busy}>{busy ? "Guardando…" : "Crear mi contraseña"}</Btn>
    </form>}
    {!done && <form className="mt-8 border-t border-slate-300 pt-6" onSubmit={async event => {
      event.preventDefault(); setError(""); setMessage(""); setBusy(true);
      try { const result = await authService.resendActivation(code); setMessage(result.message); }
      catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos solicitar el enlace."); }
      finally { setBusy(false); }
    }}>
      <h2 className="font-bold mb-2">¿No llegó el correo o venció el enlace?</h2>
      <label htmlFor="activation-code">Código de usuario</label>
      <input id="activation-code" className={inputClass} autoComplete="username" required maxLength={64} disabled={busy} value={code} onChange={e => setCode(e.target.value)} />
      <Btn type="submit" variant="outline" className="w-full" disabled={busy}>{busy ? "Solicitando…" : "Enviar otro enlace"}</Btn>
    </form>}
    <Link to="/login" className="block mt-6 text-violet-800 underline font-bold">Ir al inicio de sesión</Link>
  </section></AuthShell>;
}
