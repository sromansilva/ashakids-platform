import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, CheckCircle, Mail, Lock } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { AshaKidsLogo } from "@/components/illustrations/AshaKidsLogo";

// ─── Shared auth shell ─────────────────────────────────────────────────────────
import { AuthShell } from "@/pages/auth/Auth/AuthShell";
import { FieldRow } from "@/pages/auth/Auth/FieldRow";

export function RegisterPadre({ go, onNameSet }: { go: (v: View) => void; onNameSet?: (name: string) => void }) {
  const [form, setForm] = useState({ nombre: "", apellido: "", email: "", pass: "", pass2: "", terms: false });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const set = (k: keyof typeof form) => (v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const isDisabled = !form.terms || !form.nombre.trim() || !form.apellido.trim() || !form.email.trim() || !form.pass.trim() || !form.pass2.trim() || form.pass !== form.pass2;

  const submit = () => {
    onNameSet?.(`${form.nombre} ${form.apellido}`);
    setLoading(true);
    setTimeout(() => { setLoading(false); go("register/verify"); }, 1000);
  };

  return (
    <AuthShell side={
      <div className="relative z-10 text-white text-center max-w-xs">
        <div className="flex justify-center mb-10">
          <AshaKidsLogo variant="auth" textColor="white" />
        </div>
        <div className="auth-float rounded-3xl p-6 mb-6" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}>
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="font-extrabold text-lg mb-2">El camino de tu hijo empieza aquí</h3>
          <p className="text-sm" style={{ color: "rgba(196,181,253,.85)" }}>Acceso a terapeutas certificados, seguimiento en tiempo real y ASHI para guiarte.</p>
        </div>
        {["Registro gratuito en 2 minutos", "Sin contratos, sin sorpresas", "ASHI te acompaña desde el día 1"].map((b, i) => (
          <div key={i} className="flex items-center gap-2 mb-2">
            <CheckCircle size={14} style={{ color: "#34D399" }} />
            <span className="text-sm font-medium" style={{ color: "rgba(196,181,253,.9)" }}>{b}</span>
          </div>
        ))}
      </div>
    }>
      <div className="w-full max-w-md">
        <button onClick={() => go("landing")} className="flex items-center gap-1.5 text-sm font-bold text-[#7C6F9A] hover:text-violet-600 mb-6 transition-colors">
          <ArrowLeft size={15} /> Volver
        </button>
        <h1 className="text-2xl font-black text-[#1C1135] mb-1">Crea tu cuenta</h1>
        <p className="text-sm text-[#7C6F9A] font-medium mb-6">Es rápido, gratuito y sin tarjeta de crédito.</p>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldRow label="Nombre" placeholder="Ana" value={form.nombre} onChange={set("nombre")} error={submitted && !form.nombre.trim() ? "Obligatorio" : undefined} />
            <FieldRow label="Apellido" placeholder="García" value={form.apellido} onChange={set("apellido")} error={submitted && !form.apellido.trim() ? "Obligatorio" : undefined} />
          </div>
          <FieldRow label="Correo electrónico" type="email" placeholder="ana@email.com" value={form.email} onChange={set("email")} icon={<Mail size={15} />} error={submitted && !form.email.trim() ? "El correo es obligatorio" : undefined} />
          <FieldRow label="Contraseña" type="password" placeholder="Mínimo 8 caracteres" value={form.pass} onChange={set("pass")} icon={<Lock size={15} />} error={submitted && !form.pass.trim() ? "La contraseña es obligatoria" : undefined} />
          <FieldRow label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña" value={form.pass2} onChange={set("pass2")} icon={<Lock size={15} />} error={submitted && !form.pass2.trim() ? "Confirma tu contraseña" : submitted && form.pass !== form.pass2 ? "Las contraseñas no coinciden" : undefined} />

          <label className="flex items-start gap-3 cursor-pointer">
            <div onClick={() => set("terms")(!form.terms)}
              className="w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
              style={{ borderColor: form.terms ? B.violet : B.border, background: form.terms ? B.violet : "white" }}>
              {form.terms && <Check size={12} color="white" />}
            </div>
            <span className="text-sm text-[#7C6F9A] font-medium">Acepto los <span className="font-extrabold" style={{ color: B.violet }}>Términos de servicio</span> y la <span className="font-extrabold" style={{ color: B.violet }}>Política de privacidad</span></span>
          </label>

          <button
            onClick={() => { setSubmitted(true); if (!isDisabled && !loading) submit(); }}
            className="w-full rounded-2xl py-3.5 font-extrabold text-sm text-white transition-all flex items-center justify-center gap-2"
            style={{ background: loading ? B.textMid : `linear-gradient(135deg, ${B.violet}, ${B.violetDark})`, opacity: loading || isDisabled ? 0.5 : 1, cursor: loading || isDisabled ? "not-allowed" : "pointer" }}>
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando cuenta…</> : <>Crear cuenta <ArrowRight size={16} /></>}
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E8E5F4]" />
            <span className="text-xs font-bold text-[#9E95B7]">o continúa con</span>
            <div className="flex-1 h-px bg-[#E8E5F4]" />
          </div>

          <button className="w-full rounded-2xl py-3 border border-[#E8E5F4] bg-white font-bold text-sm text-[#1C1135] hover:border-violet-300 hover:bg-violet-50 transition-all flex items-center justify-center gap-3">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continuar con Google
          </button>
        </div>

        <p className="text-center text-sm text-[#7C6F9A] font-medium mt-5">
          ¿Ya tienes cuenta?{" "}
          <button onClick={() => go("login")} className="font-extrabold hover:underline" style={{ color: B.violet }}>Iniciar sesión</button>
        </p>
      </div>
    </AuthShell>
  );
}
