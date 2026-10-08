import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

export function AdminContenido() {
  const [catFilter, setCatFilter] = useState("todos");
  const cats = ["todos", "cuentos", "canciones", "juegos", "trabalenguas", "adivinanzas"];
  const contenido = [
    { title: "El bosque de los cuentos",         cat: "cuentos",      views: 1842, status: "publicado", level: "1-2" },
    { title: "Canción del abecedario",            cat: "canciones",    views: 2134, status: "publicado", level: "1"   },
    { title: "Trabalenguas del sol",              cat: "trabalenguas", views: 987,  status: "publicado", level: "2-3" },
    { title: "Adivinanza del elefante",           cat: "adivinanzas",  views: 754,  status: "publicado", level: "2"   },
    { title: "Juego de las sílabas",              cat: "juegos",       views: 1230, status: "publicado", level: "1-3" },
    { title: "El viaje al mundo de los sonidos",  cat: "cuentos",      views: 0,    status: "borrador",  level: "2"   },
  ];
  const filtered = catFilter === "todos" ? contenido : contenido.filter(c => c.cat === catFilter);
  const iconMap: Record<string, string> = { cuentos: "📖", canciones: "🎵", juegos: "🎮", trabalenguas: "💬", adivinanzas: "🧩" };
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Contenido</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Mundo ASHA · {contenido.length} elementos</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Nuevo contenido</Btn>
      </div>
      <div className="flex gap-2 flex-wrap mb-5">
        {cats.map(c => (
          <button key={c} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: catFilter === c ? B.violet : B.violetLight, color: catFilter === c ? "white" : B.textMid }}
            onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>
      <Crd>
        <div className="divide-y" style={{ borderColor: B.border }}>
          {filtered.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4 hover:bg-[#F5F3FF] transition-colors">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: B.violetLight }}>
                {iconMap[item.cat] || "📄"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135]">{item.title}</p>
                <p className="text-xs text-[#7C6F9A] font-medium capitalize">{item.cat} · Nivel {item.level}</p>
              </div>
              <div className="text-xs text-[#7C6F9A] font-medium">{item.views > 0 ? `${item.views.toLocaleString()} vistas` : "—"}</div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: item.status === "publicado" ? "#D1FAE5" : B.orangeLight, color: item.status === "publicado" ? "#059669" : B.orange }}>
                {item.status}
              </span>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Edit size={13} /></button>
                <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      </Crd>
    </div>
  );
}
