import { MessageCircle, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import type { View } from "@/shared/domain/types/navigation";
import { ACCOUNT_REQUEST_WHATSAPP_URL } from "@/shared/domain/contact";
import { PublicPageShell } from "./PublicPageShell";

export function PublicContacto({ go }: { go: (view: View) => void }) {
  return (
    <PublicPageShell go={go} cur="public/contacto">
      <section className="asha-public-hero">
        <div className="landing-container asha-public-hero-inner">
          <span className="asha-public-eyebrow">Contacto</span>
          <h1>
            Conversemos por <span>WhatsApp</span>
          </h1>
          <p className="asha-public-lead">
            Escríbenos para solicitar información o pedir una cuenta familiar. El personal autorizado crea la cuenta y
            envía un enlace seguro para activarla.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={ACCOUNT_REQUEST_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="asha-btn asha-btn--lg"
              style={{
                background: "linear-gradient(180deg, #25D366, #16A34A)",
                borderColor: "transparent",
                boxShadow: "inset 0 -4px 0 #15803D, 0 6px 18px rgb(22 163 74 / 24%)",
              }}
            >
              <MessageCircle size={20} /> Solicitar información por WhatsApp
            </a>
            <button type="button" className="asha-btn asha-btn--outline asha-btn--lg" onClick={() => go("public/ayuda")}>
              Ver Centro de Ayuda <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="asha-public-section asha-public-section--tinted">
        <div className="landing-container">
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <article className="asha-card asha-glass">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--asha-lavender)", color: "var(--asha-primary-dark)" }}
              >
                <Clock size={20} aria-hidden="true" />
              </div>
              <h3 className="text-base font-extrabold text-[#1C1135] mb-1.5">Atención personalizada</h3>
              <p className="text-sm text-[#615274] font-medium">
                Te orientamos sobre el proceso de alta familiar, evaluación inicial y sesiones virtuales de 40 minutos.
              </p>
            </article>
            <article className="asha-card asha-glass">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
                style={{ background: "var(--asha-teal-soft)", color: "var(--asha-teal)" }}
              >
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <h3 className="text-base font-extrabold text-[#1C1135] mb-1.5">Acceso seguro y verificado</h3>
              <p className="text-sm text-[#615274] font-medium">
                Cada cuenta familiar se activa mediante un enlace temporal privado enviado directamente a tu correo.
              </p>
            </article>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
