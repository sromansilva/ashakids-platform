import { ArrowLeft, KeyRound, MessageCircle, UserRound } from "lucide-react";
import type { View } from "@/shared/domain/types/navigation";
import { AuthShell } from "./AuthShell";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";
import { getAshaKidsWhatsAppUrl } from "@/shared/domain/contact";

type Mode = "registration" | "recovery" | "verification";
/** These routes explain the available account flow; they never simulate an API write. */
export function AccountAccessInfo({ go, mode = "registration", audience }: {
  go: (view: View) => void; mode?: Mode; audience?: "familia" | "terapeuta";
}) {
  const recovery = mode === "recovery";
  const verification = mode === "verification";
  const whatsappUrl = getAshaKidsWhatsAppUrl(recovery
    ? "Hola AshaKids, necesito ayuda para recuperar el acceso a mi cuenta."
    : verification
      ? "Hola AshaKids, no recibí el enlace de activación de mi cuenta."
      : "Hola AshaKids, quisiera solicitar información sobre una cuenta.");
  const title = recovery ? "¿Olvidaste tu contraseña?" : verification ? "Verificación de correo" : "Acceso a ASHAKids";
  return <AuthShell><section className="w-full max-w-md text-[#1C1135]" aria-labelledby="access-title">
    <button className="flex items-center gap-2 mb-8 font-black focus-visible:outline-violet-700" onClick={() => go("landing")} aria-label="Volver al inicio de ASHAKids"><Isotipo size={40} /> ASHAKids</button>
    {recovery ? <KeyRound className="text-violet-700 mb-4" size={36} /> : <UserRound className="text-violet-700 mb-4" size={36} />}
    <h1 id="access-title" className="text-2xl font-black mb-4">{title}</h1>
    <p className="text-base text-[#4B4264] leading-relaxed mb-5">{recovery
      ? "La recuperación por correo todavía no está disponible. Contacta al equipo de AshaKids por WhatsApp para recuperar el acceso."
      : verification
        ? "Revisa tu correo y pulsa Crear mi contraseña. El enlace vence en dos horas. Si no llegó, solicita otro enlace en la página de creación de contraseña."
        : `Las cuentas${audience ? ` de ${audience}` : " de familias y terapeutas"} las crea el personal autorizado. Solicita la tuya por WhatsApp y recibirás un enlace seguro para activarla.`}</p>
    <div className="rounded-2xl bg-violet-50 p-5 mb-6 text-base leading-relaxed">
      <h2 className="font-extrabold mb-2">Cómo continuar</h2>
      <ol className="list-decimal pl-5 space-y-2">
        <li>{recovery ? "Escríbenos por WhatsApp para recuperar el acceso." : verification ? "Abre el enlace de un solo uso que recibiste en tu correo." : "Escríbenos por WhatsApp para solicitar una cuenta."}</li>
        <li>{recovery ? "Solicita el restablecimiento por el canal acordado con el equipo." : verification ? "Crea tu contraseña; el enlace vence en dos horas." : "El personal autorizado crea tu cuenta y envía un enlace seguro de activación."}</li>
        <li>{verification ? "Si no recibiste el correo, pide ayuda por WhatsApp." : "Inicia sesión con tu código de usuario y contraseña."}</li>
      </ol>
    </div>
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3 font-bold text-white mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2">
      <MessageCircle size={18} /> {verification ? "Pedir ayuda por WhatsApp" : "Contactar por WhatsApp"}
    </a>
    <Btn className="w-full mb-3" onClick={() => go("login")}>Ir al inicio de sesión</Btn>
    <Btn variant="ghost" className="w-full" onClick={() => go("landing")}><ArrowLeft size={16} /> Volver al inicio</Btn>
  </section></AuthShell>;
}
