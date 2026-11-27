import type { ReactNode } from "react";
import type { View } from "@/shared/domain/types/navigation";
import { PublicNav } from "./PublicNav";
import { PublicFooter } from "./PublicFooter";
import { AshhiFloat } from "@/shared/presentation/components/assistant/AshhiFloat";
import "../landing/landing-kit.css";
import "../landing/landing.css";
import "../landing/landing-reference.css";
import "../landing/landing-continuity.css";
import "../landing/landing-unified.css";
import "../landing/landing-footer.css";
import "../landing/landing-refinements.css";
import "./public-pages.css";

interface PublicPageShellProps {
  go: (v: View) => void;
  cur: View;
  children: ReactNode;
}

export function PublicPageShell({ go, cur, children }: PublicPageShellProps) {
  return (
    <div className="asha-landing asha-ui asha-unified asha-public-page">
      <a className="landing-skip" href="#landing-content">
        Saltar al contenido
      </a>
      <PublicNav go={go} cur={cur} presentation="asha" />
      <main id="landing-content" className="asha-public-main">
        {children}
      </main>
      <PublicFooter go={go} landing />
      <AshhiFloat role={null} appearance="landing" />
    </div>
  );
}
