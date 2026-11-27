import { useNavigate } from "react-router-dom";
import { View } from "@/shared/domain/types/navigation";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";

type FooterLink =
  | { label: string; kind: "anchor"; hash: string }
  | { label: string; kind: "view"; view: View };

const footerCols: { title: string; links: FooterLink[] }[] = [
  {
    title: "Plataforma",
    links: [
      { label: "Especialistas", kind: "anchor", hash: "#landing-specialists" },
      { label: "Mundo ASHA", kind: "anchor", hash: "#landing-worlds" },
      { label: "ASHI Intelligence", kind: "view", view: "public/ashi" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nosotros", kind: "view", view: "public/nosotros" },
      { label: "Recursos", kind: "view", view: "public/recursos" },
    ],
  },
  {
    title: "Soporte",
    links: [
      { label: "Centro de Ayuda", kind: "view", view: "public/ayuda" },
      { label: "Contacto", kind: "view", view: "public/contacto" },
    ],
  },
];

export function PublicFooter({ go, landing = false }: { go: (v: View) => void; landing?: boolean }) {
  const navigate = useNavigate();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    if (landing) return;
    e.preventDefault();
    navigate(`/${hash}`);
  };

  return (
    <footer className="landing-footer">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <button
            type="button"
            onClick={() => go("landing")}
            className="flex items-center gap-2 mb-3 landing-footer-brand text-left"
            aria-label="Ir al inicio de ASHAKids"
          >
            <Isotipo size={96} />
            <span className="landing-wordmark" aria-label="ASHAKids">
              <span>ASHA</span>
              <span>Kids</span>
            </span>
          </button>
          <p className="text-sm font-medium opacity-70 leading-relaxed">
            Plataforma de terapia de lenguaje infantil virtual. Conectamos familias con especialistas certificados.
          </p>
        </div>
        {footerCols.map((col) => (
          <div key={col.title}>
            <p className="font-extrabold text-sm mb-3 opacity-90">{col.title}</p>
            <div className="flex flex-col gap-2">
              {col.links.map((lk) =>
                lk.kind === "anchor" ? (
                  <a
                    key={lk.label}
                    href={landing ? lk.hash : `/${lk.hash}`}
                    onClick={(e) => handleAnchorClick(e, lk.hash)}
                  >
                    {lk.label}
                  </a>
                ) : (
                  <button
                    key={lk.label}
                    type="button"
                    onClick={() => go(lk.view)}
                    className="text-left text-sm font-medium"
                  >
                    {lk.label}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-6 py-4 max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs opacity-50">
        <span>© 2026 ASHAKids. Todos los derechos reservados.</span>
        <span>Hecho con ❤️ para las familias</span>
      </div>
    </footer>
  );
}
