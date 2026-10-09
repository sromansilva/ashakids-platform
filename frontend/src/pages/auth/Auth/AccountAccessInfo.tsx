import { ArrowLeft, KeyRound, UserRound } from "lucide-react";
import type { View } from "@/types/navigation";
import { AuthShell } from "./AuthShell";
import { Btn } from "@/components/common/Btn";
import { Isotipo } from "@/components/illustrations/Isotipo";

type Mode = "registration" | "recovery" | "verification";
/** These routes explain the available account flow; they never simulate an API write. */
export function AccountAccessInfo({ go, mode = "registration", audience }: {
  go: (view: View) => void; mode?: Mode; audience?: "familia" | "terapeuta";
}) {
  const recovery = mode === "recovery";
  const title = recovery ? "¿Olvidaste tu contraseña?" : mode === "verification" ? "Verificación de correo" : "Acceso a ASHAKids";
  return <AuthShell><section className="w-full max-w-md text-[#1C1135]" aria-labelledby="access-title">
    <button className="flex items-center gap-2 mb-8 font-black focus-visible:outline-violet-700" onClick={() => go("landing")} aria-label="Volver al inicio de ASHAKids"><Isotipo size={40} /> ASHAKids</button>
    {recovery ? <KeyRound className="text-violet-700 mb-4" size={36} /> : <UserRound className="text-violet-700 mb-4" size={36} />}
    <h1 id="access-title" className="text-2xl font-black mb-4">{title}</h1>
    <p className="text-base text-[#4B4264] leading-relaxed mb-5">{recovery
      ? "La recuperación por correo todavía no está disponible. Contacta a la administración del proyecto para recuperar el acceso."
      : mode === "verification"
        ? "ASHAKids todavía no envía enlaces de verificación. No hay un correo de activación pendiente desde esta pantalla."
        : `Las cuentas${audience ? ` de ${audience}` : " de familias y terapeutas"} se crean desde administración. El registro público todavía no está disponible.`}</p>
    <div className="rounded-2xl bg-violet-50 p-5 mb-6 text-base leading-relaxed">
      <h2 className="font-extrabold mb-2">Cómo continuar</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>Contacta al integrante responsable de administrar las cuentas.</li>
        <li>{recovery ? "Solicita el restablecimiento por el canal acordado con el equipo." : "Solicita una cuenta con el rol correspondiente y recibe tu código de usuario."}</li>
        <li>Inicia sesión con tu código y contraseña.</li>
      </ol>
    </div>
    <Btn className="w-full mb-3" onClick={() => go("login")}>Ir al inicio de sesión</Btn>
    <Btn variant="ghost" className="w-full" onClick={() => go("landing")}><ArrowLeft size={16} /> Volver al inicio</Btn>
  </section></AuthShell>;
}
