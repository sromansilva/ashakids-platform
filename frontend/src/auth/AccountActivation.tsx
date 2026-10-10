import { useState, type FormEvent } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import { ApiError } from "@/api/client";
import { clearIdentityData } from "@/app/providers/queryClient";

export function AccountActivation() {
  const { user, refreshUser, logout } = useAuth();
  const [initial, setInitial] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (password !== confirmation) { setError("Las contraseñas nuevas no coinciden."); return; }
    setBusy(true); setError("");
    try {
      await authService.activate(initial, password);
      setInitial(""); setPassword(""); setConfirmation("");
      clearIdentityData();
      await refreshUser();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo activar la cuenta. Reintenta.");
    } finally { setBusy(false); }
  }

  const inputClass = "mt-2 w-full rounded-xl border border-violet-200 bg-white px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600";
  return <main className="min-h-screen bg-violet-50 px-4 py-10 flex items-center justify-center text-violet-950">
    <section className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-10" aria-labelledby="activation-title">
      <KeyRound className="text-violet-700 mb-5" size={32} aria-hidden="true" />
      <h1 id="activation-title" className="text-2xl font-bold">Crea tu contraseña personal</h1>
      <p className="mt-3 text-slate-700">Hola, {user?.nombres}. Para proteger tu cuenta, cambia la contraseña inicial que te entregó el asesor.</p>
      <p className="mt-2 text-sm text-slate-700">Tu código de acceso es <strong>{user?.codigo_usuario}</strong>. La contraseña nueva debe tener entre 12 y 128 caracteres.</p>
      <form onSubmit={submit} className="mt-7 space-y-5">
        <label className="block font-semibold">Contraseña inicial
          <input type="password" autoComplete="current-password" required maxLength={128} value={initial} onChange={e => setInitial(e.target.value)} disabled={busy} className={inputClass} />
        </label>
        <label className="block font-semibold">Contraseña nueva
          <input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} className={inputClass} />
        </label>
        <label className="block font-semibold">Repite la contraseña nueva
          <input type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} className={inputClass} />
        </label>
        {error && <p role="alert" className="text-red-800">{error}</p>}
        <button type="submit" disabled={busy} className="w-full min-h-11 rounded-xl bg-violet-700 px-4 py-3 font-bold text-white hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:opacity-60">
          {busy ? <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} aria-hidden="true" /> Guardando contraseña…</span> : "Guardar contraseña y continuar"}
        </button>
      </form>
      <button onClick={() => void logout()} disabled={busy} className="mt-5 min-h-11 underline underline-offset-4 text-violet-800 focus-visible:outline focus-visible:outline-2">Cerrar sesión</button>
    </section>
  </main>;
}
