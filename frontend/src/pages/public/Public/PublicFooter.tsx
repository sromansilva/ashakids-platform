import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Isotipo } from "@/components/illustrations/Isotipo";

// ─── Shared public nav ────────────────────────────────────────────────────────

export function PublicFooter({ go }: { go: (v: View) => void }) {
  const cols = [
    { title: "Plataforma",  links: [{ l: "Especialistas", v: "public/especialistas" as View }, { l: "Mundo ASHA", v: "public/mundo" as View }, { l: "ASHI Intelligence", v: "public/ashi" as View }] },
    { title: "Empresa",     links: [{ l: "Sobre Nosotros", v: "public/nosotros" as View }, { l: "Historias", v: "public/historias" as View }, { l: "Trabaja con nosotros", v: "public/trabaja" as View }] },
    { title: "Soporte",     links: [{ l: "Centro de Ayuda", v: "public/ayuda" as View }, { l: "Contacto", v: "public/contacto" as View }] },
  ];
  return (
    <footer style={{ background: B.violetDeep }} className="text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Isotipo size={32} />
            <span className="font-extrabold text-lg">AshaKids</span>
          </div>
          <p className="text-sm font-medium opacity-70 leading-relaxed">Plataforma de terapia de lenguaje infantil virtual. Conectamos familias con especialistas certificados.</p>
        </div>
        {cols.map(col => (
          <div key={col.title}>
            <p className="font-extrabold text-sm mb-3 opacity-90">{col.title}</p>
            <div className="flex flex-col gap-2">
              {col.links.map(lk => (
                <button key={lk.l} onClick={() => go(lk.v)}
                  className="text-left text-sm opacity-60 hover:opacity-100 transition-opacity font-medium">{lk.l}</button>
              ))}
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
