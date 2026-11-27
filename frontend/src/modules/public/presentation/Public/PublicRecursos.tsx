import { useState } from "react";
import { View } from "@/shared/domain/types/navigation";
import { PublicPageShell } from "./PublicPageShell";
import { PublicDialog } from "../landing/PublicDialog";

interface ResourceItem {
  icon: string;
  cat: string;
  title: string;
  mins: string;
  author: string;
  summary: string;
  tip: string;
}

const cats = ["Todos", "Artículos", "Guías", "Infografías"];

const resources: ResourceItem[] = [
  {
    icon: "📝",
    cat: "Artículos",
    title: "Cómo apoyar el lenguaje de tu hijo en casa",
    mins: "5 min",
    author: "Equipo Clínico ASHAKids",
    summary:
      "Recomendaciones prácticas para transformar momentos cotidianos —como la lectura o el juego— en oportunidades de comunicación significativa.",
    tip: "Habla con frases claras, da tiempo para que responda y celebra cada intento comunicativo.",
  },
  {
    icon: "📋",
    cat: "Guías",
    title: "Guía completa para padres: Terapia de lenguaje",
    mins: "12 min",
    author: "Equipo ASHAKids",
    summary:
      "Conoce qué esperar en la evaluación inicial, cómo se diseñan los objetivos terapéuticos y cómo acompañar cada sesión de 40 minutos.",
    tip: "Anota las dudas que surjan durante la semana para compartirlas con tu terapeuta.",
  },
  {
    icon: "📊",
    cat: "Infografías",
    title: "Hitos del desarrollo del lenguaje 0-7 años",
    mins: "3 min",
    author: "Equipo ASHAKids",
    summary:
      "Resumen orientativo de las principales etapas de comprensión, vocabulario y claridad del habla en la infancia temprana.",
    tip: "Cada niño tiene su propio ritmo; ante cualquier duda, una orientación profesional aporta tranquilidad.",
  },
  {
    icon: "📝",
    cat: "Artículos",
    title: "Señales de alerta en el desarrollo del lenguaje infantil",
    mins: "7 min",
    author: "Equipo Clínico ASHAKids",
    summary:
      "Indicadores clave que ayudan a las familias a identificar cuándo conviene consultar con un especialista en terapia de lenguaje.",
    tip: "La detección temprana permite intervenciones más lúdicas, breves y efectivas.",
  },
  {
    icon: "📋",
    cat: "Guías",
    title: "Agenda terapéutica: Cómo organizarse con tu hijo",
    mins: "6 min",
    author: "Equipo ASHAKids",
    summary:
      "Consejos sencillos para preparar un espacio tranquilo antes de cada sesión virtual y mantener una rutina positiva en casa.",
    tip: "Prepara el dispositivo con 5 minutos de anticipación en un ambiente sin distracciones.",
  },
  {
    icon: "📊",
    cat: "Infografías",
    title: "Hitos del lenguaje oral: qué esperar en cada etapa",
    mins: "4 min",
    author: "Equipo Clínico ASHAKids",
    summary:
      "Guía visual sobre cómo evoluciona la pronunciación y la construcción de frases desde los 3 años en adelante.",
    tip: "Refuerza los sonidos de manera natural repitiendo la palabra correctamente sin corregir bruscamente.",
  },
];

export function PublicRecursos({ go }: { go: (v: View) => void }) {
  const [cat, setCat] = useState("Todos");
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const filtered = cat === "Todos" ? resources : resources.filter((r) => r.cat === cat);

  return (
    <PublicPageShell go={go} cur="public/recursos">
      <section className="asha-public-hero">
        <div className="landing-container asha-public-hero-inner">
          <span className="asha-public-eyebrow">Recursos para familias</span>
          <h1>
            Centro de <span>Recursos</span>
          </h1>
          <p className="asha-public-lead">
            Artículos, guías e infografías creadas por nuestro equipo para acompañar el desarrollo del lenguaje en casa.
          </p>
        </div>
      </section>

      <section className="asha-public-section asha-public-section--tinted">
        <div className="landing-container">
          <div className="flex gap-2.5 flex-wrap justify-center mb-10" role="tablist" aria-label="Filtrar recursos">
            {cats.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`asha-public-filter-btn ${cat === c ? "is-active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {filtered.map((r) => (
              <button
                key={r.title}
                type="button"
                onClick={() => setSelectedResource(r)}
                className="asha-card asha-glass asha-card--interactive w-full text-left flex items-start gap-4"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "var(--asha-lavender)" }}
                  aria-hidden="true"
                >
                  {r.icon}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-[#7C3AED] mb-1">{r.cat}</span>
                  <h3 className="text-base font-extrabold text-[#1C1135] mb-2 leading-snug">{r.title}</h3>
                  <p className="mt-auto text-xs text-[#615274] font-semibold">
                    {r.author} · {r.mins} de lectura
                  </p>
                </div>
              </button>
            ))}
          </div>

          {selectedResource && (
            <PublicDialog title={selectedResource.title} onClose={() => setSelectedResource(null)}>
              <div className="flex items-center justify-between gap-3 mt-2 mb-4">
                <span
                  className="text-xs font-extrabold px-3 py-1 rounded-full"
                  style={{ background: "var(--asha-lavender)", color: "var(--asha-primary-dark)" }}
                >
                  {selectedResource.cat}
                </span>
                <span className="text-xs font-bold text-[#615274]">
                  {selectedResource.author} · {selectedResource.mins}
                </span>
              </div>
              <p>{selectedResource.summary}</p>
              <div className="rounded-2xl p-4 mb-6" style={{ background: "var(--asha-lavender-soft)" }}>
                <p className="!m-0 text-sm font-bold text-[#5B21B6]">Consejo práctico</p>
                <p className="!mt-1 !mb-0 text-sm text-[#615274]">{selectedResource.tip}</p>
              </div>
              <div className="landing-dialog-actions">
                <button
                  type="button"
                  className="asha-btn"
                  onClick={() => {
                    setSelectedResource(null);
                    go("public/contacto");
                  }}
                >
                  ¿Tienes dudas? Contáctanos
                </button>
                <button type="button" className="landing-context-link" onClick={() => setSelectedResource(null)}>
                  Cerrar
                </button>
              </div>
            </PublicDialog>
          )}
        </div>
      </section>
    </PublicPageShell>
  );
}
