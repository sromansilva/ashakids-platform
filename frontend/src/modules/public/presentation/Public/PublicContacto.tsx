import { MessageCircle } from "lucide-react";
import type { View } from "@/shared/domain/types/navigation";
import { PublicNav } from "@/modules/public/presentation/Public/PublicNav";
import { PublicFooter } from "@/modules/public/presentation/Public/PublicFooter";
import { ACCOUNT_REQUEST_WHATSAPP_URL } from "@/shared/domain/contact";

export function PublicContacto({ go }: { go: (view: View) => void }) {
  return (
    <div className="min-h-screen bg-[#F8F6FF] font-[Nunito,system-ui,sans-serif]">
      <PublicNav go={go} cur="public/contacto" />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="mb-3 text-sm font-extrabold uppercase tracking-wider text-violet-700">Contacto</p>
        <h1 className="mb-4 text-3xl font-black text-[#1C1135] sm:text-4xl">Conversemos por WhatsApp</h1>
        <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-[#7C6F9A]">
          Escríbenos para solicitar información o pedir una cuenta familiar. El personal autorizado crea la cuenta y envía un enlace seguro para activarla.
        </p>
        <a href={ACCOUNT_REQUEST_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-7 py-4 font-extrabold text-white shadow-sm transition hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2">
          <MessageCircle size={20} /> Solicitar información por WhatsApp
        </a>
      </main>
      <PublicFooter go={go} />
    </div>
  );
}
