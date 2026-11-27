import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { View } from "@/shared/domain/types/navigation";
import { Btn } from "@/shared/presentation/components/common/Btn";
import { Isotipo } from "@/shared/presentation/components/illustrations/Isotipo";
import { MobileTopBar } from "@/shared/presentation/components/common/MobileTopBar";
import { PublicDialog } from "../landing/PublicDialog";

const anchors = [
  { label: "Cómo funciona", id: "landing-steps" },
  { label: "Mundo ASHA", id: "landing-worlds" },
  { label: "Especialistas", id: "landing-specialists" },
  { label: "Preguntas frecuentes", id: "landing-faq" },
];

type SubpageNavItem =
  | { label: string; kind: "hash"; href: string }
  | { label: string; kind: "view"; view: View };

const subpageLinks: SubpageNavItem[] = [
  { label: "Especialistas", kind: "hash", href: "/#landing-specialists" },
  { label: "Mundo ASHA", kind: "hash", href: "/#landing-worlds" },
  { label: "Recursos", kind: "view", view: "public/recursos" },
  { label: "Sobre Nosotros", kind: "view", view: "public/nosotros" },
];

export function PublicNav({ go, cur, presentation }: { go: (v: View) => void; cur: View; presentation?: "asha" }) {
  const branded = cur === "landing" || presentation === "asha";
  const navigate = useNavigate();
  const [mob, setMob] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

  useEffect(() => {
    if (cur !== "landing") {
      setActiveAnchor(null);
      return;
    }

    const updateActiveSection = () => {
      const scrollMarker = window.scrollY + 180;
      let currentId: string | null = null;
      for (const anchor of anchors) {
        const el = document.getElementById(anchor.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (scrollMarker >= top) {
          currentId = anchor.id;
        }
      }
      setActiveAnchor(currentId);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("hashchange", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("hashchange", updateActiveSection);
    };
  }, [cur]);

  const mobileTitle =
    cur === "landing"
      ? "Inicio"
      : subpageLinks.find((link) => link.kind === "view" && link.view === cur)?.label ??
        (cur === "public/ashi"
          ? "ASHI Intelligence"
          : cur === "public/ayuda"
            ? "Centro de Ayuda"
            : cur === "public/contacto"
              ? "Contacto"
              : "AshaKids");

  const handleHashNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMob(false);
    navigate(href);
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur md:border-b md:border-[#E8E5F4]">
      <MobileTopBar title={mobileTitle} onMenu={() => setMob((value) => !value)} menuOpen={mob} />
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 items-center justify-between h-16">
        <button
          type="button"
          onClick={() => go("landing")}
          className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-transparent hover:border-[#E8E5F4] hover:shadow-sm transition-all ${branded ? "landing-brand" : ""}`}
        >
          <Isotipo size={32} />
          {branded ? (
            <span className="landing-wordmark">
              <span>Asha</span>
              <span>Kids</span>
              <i className="landing-logo-rays" aria-hidden="true" />
            </span>
          ) : (
            <span className="font-extrabold text-[#1C1135] text-lg tracking-tight">AshaKids</span>
          )}
        </button>

        <div className="hidden md:flex items-center gap-1">
          {cur === "landing"
            ? anchors.map((a) => {
                const isActive = activeAnchor === a.id;
                return (
                  <a
                    key={a.id}
                    className={`landing-nav-link ${isActive ? "is-active" : ""}`}
                    href={`#${a.id}`}
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => setActiveAnchor(a.id)}
                  >
                    {a.label}
                  </a>
                );
              })
            : subpageLinks.map((l) =>
                l.kind === "hash" ? (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={(e) => handleHashNav(e, l.href)}
                    className="landing-nav-link"
                  >
                    {l.label}
                  </a>
                ) : (
                  <button
                    key={l.view}
                    type="button"
                    onClick={() => go(l.view)}
                    aria-current={cur === l.view ? "page" : undefined}
                    className={`landing-nav-link ${cur === l.view ? "is-active" : ""}`}
                  >
                    {l.label}
                  </button>
                )
              )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Btn variant="cta" size="sm" className={branded ? "asha-btn asha-btn--outline" : ""} onClick={() => go("login")}>
            Iniciar sesión
          </Btn>
        </div>
      </div>

      {mob && (
        <PublicDialog title="ASHAKids" onClose={() => setMob(false)}>
          <nav className="landing-mobile-links" aria-label="Navegación pública">
            {cur === "landing"
              ? anchors.map((a) => (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    className={activeAnchor === a.id ? "is-active" : undefined}
                    aria-current={activeAnchor === a.id ? "location" : undefined}
                    onClick={() => {
                      setActiveAnchor(a.id);
                      setMob(false);
                    }}
                  >
                    {a.label}
                  </a>
                ))
              : subpageLinks.map((l) =>
                  l.kind === "hash" ? (
                    <a key={l.label} href={l.href} onClick={(e) => handleHashNav(e, l.href)}>
                      {l.label}
                    </a>
                  ) : (
                    <button
                      key={l.view}
                      type="button"
                      className={`text-left ${cur === l.view ? "is-active" : ""}`}
                      aria-current={cur === l.view ? "page" : undefined}
                      onClick={() => {
                        setMob(false);
                        go(l.view);
                      }}
                    >
                      {l.label}
                    </button>
                  )
                )}
            <button
              type="button"
              className="asha-btn asha-btn--outline"
              onClick={() => {
                setMob(false);
                go("login");
              }}
            >
              Iniciar sesión
            </button>
          </nav>
        </PublicDialog>
      )}
    </nav>
  );
}
