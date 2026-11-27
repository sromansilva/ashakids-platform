import { useState } from "react";
import { Search, Sparkles, ChevronDown, ArrowRight } from "lucide-react";
import { View } from "@/shared/domain/types/navigation";
import { PublicPageShell } from "./PublicPageShell";

const faqs = [
  {
    q: "¿Cómo agendo mi primera sesión?",
    a: "Desde tu panel familiar, ingresa a la sección 'Agenda', elige al terapeuta que prefieras, selecciona el horario disponible y confirma tu cita. Recibirás un correo de confirmación.",
    cat: "Citas",
  },
  {
    q: "¿Cómo funcionan las sesiones virtuales?",
    a: "Las sesiones virtuales duran 40 minutos y se realizan mediante Google Meet desde el enlace habilitado por tu terapeuta al iniciar la sesión. No necesitas instalaciones complejas.",
    cat: "Tecnología",
  },
  {
    q: "¿Cómo veo el progreso de mi hijo?",
    a: "En el Centro Familiar, sección 'Mi Camino ASHA' y 'Reportes', encontrarás el seguimiento, los informes publicados por el terapeuta y los próximos objetivos.",
    cat: "Seguimiento",
  },
  {
    q: "¿Puedo cancelar o reprogramar una cita?",
    a: "Sí. Puedes cancelar o reprogramar una cita con al menos 24 horas de anticipación desde la sección 'Agenda' en tu panel familiar.",
    cat: "Citas",
  },
  {
    q: "¿Cómo solicito una cuenta familiar en ASHAKids?",
    a: "Las cuentas familiares se gestionan a través de nuestro equipo de administración. Puedes solicitar información desde nuestra sección de Contacto por WhatsApp y recibirás un enlace seguro para activar tu acceso.",
    cat: "Acceso",
  },
];

export function PublicAyuda({ go }: { go: (v: View) => void }) {
  const [search, setSearch] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.cat.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PublicPageShell go={go} cur="public/ayuda">
      <section className="asha-public-hero">
        <div className="landing-container asha-public-hero-inner">
          <span className="asha-public-eyebrow">Soporte</span>
          <h1>
            Centro de <span>Ayuda</span>
          </h1>
          <p className="asha-public-lead">Encuentra respuestas rápidas a las preguntas más frecuentes sobre ASHAKids.</p>
          <div className="asha-public-search">
            <Search size={18} className="text-[#7C3AED] shrink-0" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar en el centro de ayuda…"
              aria-label="Buscar preguntas frecuentes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="asha-public-section asha-public-section--tinted">
        <div className="landing-container max-w-3xl">
          {filtered.length === 0 ? (
            <div className="asha-card text-center mb-10">
              <p className="font-extrabold text-[#1C1135] mb-1">No encontramos resultados para «{search}»</p>
              <p className="text-sm text-[#615274]">Intenta con otras palabras o escríbenos desde Contacto.</p>
            </div>
          ) : (
            <div className="landing-faq-list mb-10">
              {filtered.map((faq, i) => {
                const isOpen = faqOpen === i;
                return (
                  <div key={faq.q} className={`landing-faq-item ${isOpen ? "is-open" : ""}`}>
                    <h3>
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={`help-faq-${i}`}
                        onClick={() => setFaqOpen(isOpen ? null : i)}
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#EDE9FE] text-[#5B21B6]">
                            {faq.cat}
                          </span>
                          <span>{faq.q}</span>
                        </span>
                        <ChevronDown size={20} />
                      </button>
                    </h3>
                    {isOpen && (
                      <div id={`help-faq-${i}`} className="landing-faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="asha-public-cta-banner">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "var(--asha-white)", color: "var(--asha-primary)" }}
              >
                <Sparkles size={22} aria-hidden="true" />
              </div>
              <div>
                <p className="font-extrabold text-[#1C1135] text-lg">¿No encontraste lo que buscabas?</p>
                <p className="text-sm font-medium text-[#615274]">
                  Escríbenos directamente y nuestro equipo te orientará con gusto.
                </p>
              </div>
            </div>
            <button type="button" className="asha-btn asha-btn--sm" onClick={() => go("public/contacto")}>
              Ir a Contacto <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
