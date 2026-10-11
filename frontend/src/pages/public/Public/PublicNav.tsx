import { useState } from "react";
import { X } from "lucide-react";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Isotipo } from "@/components/illustrations/Isotipo";
import { MobileTopBar } from "@/components/common/MobileTopBar";

import { PublicDialog } from '../landing/PublicDialog';
const anchors = [{label: "Cómo funciona", id: "landing-steps"}, {label: "Especialistas", id: "landing-specialists"}, {label: "Mundo ASHA", id: "landing-worlds"}, {label: "Preguntas frecuentes", id: "landing-faq"}];

// â”€â”€â”€ Shared public nav â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function PublicNav({ go, cur, presentation }: { go: (v: View) => void; cur: View; presentation?: 'asha' }) {
  const branded = cur === 'landing' || presentation === 'asha';
  const [mob, setMob] = useState(false);
  const links: { label: string; view: View }[] = [
    { label: "Especialistas",  view: "public/especialistas" },
    { label: "Mundo ASHA",     view: "public/mundo" },
    { label: "Recursos",       view: "public/recursos" },
    { label: "Sobre Nosotros", view: "public/nosotros" },
  ];
  const mobileTitle = cur === "landing" ? "Inicio" : links.find((link) => link.view === cur)?.label ?? "AshaKids";
  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur md:border-b md:border-[#E8E5F4]">
      <MobileTopBar title={mobileTitle} onMenu={() => setMob((value) => !value)} menuOpen={mob} />
      <div className="hidden md:flex max-w-7xl mx-auto px-4 sm:px-6 items-center justify-between h-16">
        <button onClick={() => go("landing")} className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border border-transparent hover:border-[#E8E5F4] hover:shadow-sm transition-all ${branded ? 'landing-brand' : ''}`}>
          <Isotipo size={32} />
          {branded ? <span className="landing-wordmark"><span>Asha</span><span>Kids</span><i className="landing-logo-rays" aria-hidden="true"/></span> : <span className="font-extrabold text-[#1C1135] text-lg tracking-tight">AshaKids</span>}
        </button>
        <div className="hidden md:flex items-center gap-1">
          {cur === 'landing' ? anchors.map(a => <a key={a.id} className="landing-nav-link" href={`#${a.id}`}>{a.label}</a>) : links.map(l => (
            <button key={l.view} onClick={() => go(l.view)}
              className={`px-3 py-1.5 rounded-xl text-sm font-bold transition-colors ${cur === l.view ? "text-violet-700 bg-violet-50" : "text-[#7C6F9A] hover:text-violet-700 hover:bg-violet-50"}`}>
              {l.label}
            </button>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Btn variant="cta" size="sm" className={branded ? 'asha-btn asha-btn--outline' : ''} onClick={() => go("login")}>Iniciar sesión</Btn>
        </div>

      </div>
      {mob && cur === 'landing' && <PublicDialog title="ASHAKids" onClose={() => setMob(false)}><nav className="landing-mobile-links" aria-label="Navegación pública">{anchors.map(a => <a key={a.id} href={`#${a.id}`} onClick={() => setMob(false)}>{a.label}</a>)}<button className="asha-btn asha-btn--outline" onClick={() => { setMob(false); go('login'); }}>Iniciar sesión</button></nav></PublicDialog>}
      {mob && cur !== 'landing' && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-black/50 backdrop-blur-sm">
          <aside className="w-[84vw] max-w-none h-[100dvh] flex flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200" style={{ paddingTop: "max(59px, env(safe-area-inset-top))", paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="flex shrink-0 items-center justify-between px-4 pt-4 pb-3"><div className="flex items-center gap-2"><Isotipo size={38} /><span className="font-extrabold text-[#1C1135] text-sm">AshaKids</span></div><button type="button" onClick={() => setMob(false)} className="w-11 h-11 rounded-xl flex items-center justify-center text-[#7C6F9A] hover:bg-violet-50" aria-label="Cerrar menú"><X size={18} /></button></div>
            <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-2 flex flex-col gap-0.5">
              {links.map(l => <button key={l.view} onClick={() => { go(l.view); setMob(false); }} className={`w-full flex items-center px-3.5 py-2.5 rounded-2xl text-left text-sm font-bold transition-all ${cur === l.view ? "bg-violet-700 text-white shadow-sm shadow-violet-200" : "text-[#7C6F9A] hover:bg-violet-50 hover:text-violet-700"}`}>{l.label}</button>)}
            </nav>
            <div className="shrink-0 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"><Btn variant="cta" className="w-full justify-center" onClick={() => { go("login"); setMob(false); }}>Iniciar sesión</Btn></div>
          </aside>
          <button type="button" aria-label="Cerrar menú" onClick={() => setMob(false)} className="flex-1" />
        </div>
      )}
    </nav>
  );
}
