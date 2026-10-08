import { useState } from "react";
import { X, PlayCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicRecursos({ go }: { go: (v: View) => void }) {
  const [cat, setCat] = useState("Todos");
  const [selectedResource, setSelectedResource] = useState<null | { icon: string; cat: string; title: string; mins: string; author: string }>(null);
  const cats = ["Todos", "Artículos", "Guías", "Videos", "Infografías"];
  const resources = [
    { icon: "📝", cat: "Artículos",   title: "Cómo apoyar el lenguaje de tu hijo en casa",             mins: "5 min", author: "Dra. Ana Ruiz"       },
    { icon: "📋", cat: "Guías",       title: "Guía completa para padres: Terapia de lenguaje",          mins: "12 min", author: "Equipo ASHAKids"     },
    { icon: "🎬", cat: "Videos",      title: "Ejercicios de soplo para practicar en casa",               mins: "8 min", author: "Dra. Ana Ruiz"       },
    { icon: "📊", cat: "Infografías", title: "Hitos del desarrollo del lenguaje 0-7 años",               mins: "3 min", author: "Equipo ASHAKids"     },
    { icon: "📝", cat: "Artículos",   title: "Señales de alerta en el desarrollo del lenguaje infantil",  mins: "7 min", author: "Lic. Carlos Mendoza" },
    { icon: "🎬", cat: "Videos",      title: "Cómo motivar a los niños durante la terapia de lenguaje",   mins: "10 min", author: "Dra. María Torres"  },
    { icon: "📋", cat: "Guías",       title: "Agenda terapéutica: Cómo organizarse con tu hijo",          mins: "6 min", author: "Equipo ASHAKids"     },
    { icon: "📊", cat: "Infografías", title: "Hitos del lenguaje oral: qué esperar en cada etapa",        mins: "4 min", author: "Lic. Roberto Díaz" },
  ];
  const filtered = cat === "Todos" ? resources : resources.filter(r => r.cat === cat);
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/recursos" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-[#1C1135] mb-3">Centro de Recursos</h1>
          <p className="text-lg text-[#7C6F9A] font-medium">Artículos, guías y videos creados por nuestros especialistas para acompañar a las familias.</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mb-8">
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className="px-4 py-2 rounded-2xl text-sm font-bold transition-all"
              style={{ background: cat === c ? B.violet : B.violetLight, color: cat === c ? "white" : B.textMid }}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-5 auto-rows-fr max-w-4xl mx-auto justify-items-center">
          {filtered.map((r) => (
            <button key={r.title} type="button" onClick={() => setSelectedResource(r)}
              className="w-full max-w-md min-h-[154px] h-full rounded-3xl bg-white p-5 border border-[#E8E5F4] text-left hover:shadow-lg hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-500 transition-all">
              <div className="flex h-full items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: B.violetLight }}>{r.icon}</div>
                <div className="flex h-full flex-1 flex-col">
                  <span className="text-xs font-bold text-violet-600 mb-1 block">{r.cat}</span>
                  <h3 className="font-extrabold text-sm text-[#1C1135] mb-2 leading-snug">{r.title}</h3>
                  <p className="mt-auto text-xs text-[#9E95B7] font-medium">{r.author} · {r.mins} de lectura</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedResource && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="resource-preview-title">
            <button type="button" aria-label="Cerrar vista previa" onClick={() => setSelectedResource(null)} className="absolute inset-0 bg-[#1C1135]/55 backdrop-blur-sm" />
            <section className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#F8F6FF] shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E8E5F4] bg-white/95 px-5 sm:px-7 py-4 backdrop-blur">
                <div className="flex items-center gap-3 min-w-0"><span className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: B.violetLight }}>📄</span><p className="text-sm font-extrabold text-[#1C1135] truncate">Vista previa del documento</p></div>
                <button type="button" onClick={() => setSelectedResource(null)} className="w-10 h-10 rounded-xl hover:bg-violet-50 flex items-center justify-center text-[#7C6F9A]" aria-label="Cerrar"><X size={20} /></button>
              </div>
              <article className="m-4 sm:m-7 rounded-2xl bg-white border border-[#E8E5F4] p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between gap-4 mb-7"><span className="text-xs font-extrabold px-3 py-1.5 rounded-full" style={{ background: B.violetLight, color: B.violet }}>{selectedResource.cat}</span><span className="text-xs text-[#9E95B7] font-bold">PDF · {selectedResource.mins}</span></div>
                <h2 id="resource-preview-title" className="text-2xl sm:text-3xl font-black leading-tight text-[#1C1135] mb-3">{selectedResource.title}</h2>
                <p className="text-sm font-bold text-[#7C6F9A] mb-7">Por {selectedResource.author}</p>
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#51466F] font-medium">
                  <p>Esta vista previa resume recomendaciones prácticas para acompañar el desarrollo del lenguaje en casa, respetando el ritmo y las necesidades de cada niño.</p>
                  <p>Encontrarás ideas sencillas para integrar en la rutina familiar y preguntas que puedes conversar con el terapeuta durante el seguimiento.</p>
                </div>
                {selectedResource.cat === "Videos" && <a href="https://www.youtube.com/watch?v=ashakids-demo" target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-extrabold text-white transition-opacity hover:opacity-90" style={{ background: "#FF0000" }}><PlayCircle size={17} /> Ver video en YouTube</a>}
              </article>
            </section>
          </div>
        )}
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
