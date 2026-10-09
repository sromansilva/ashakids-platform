import { useState } from "react";
import { Search, Star, Users, Video } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { therapists } from "@/mocks/demo";

// ─── Shared public nav ────────────────────────────────────────────────────────
import { PublicNav } from "@/pages/public/Public/PublicNav";
import { PublicFooter } from "@/pages/public/Public/PublicFooter";

export function PublicEspecialistas({ go }: { go: (v: View) => void }) {
  const [search, setSearch]   = useState("");
  const [spec,   setSpec]     = useState("Todos");
  const specialties = ["Todos", "Lenguaje", "Fonología", "Articulación", "Comprensión", "Fluidez", "Comunicación"];
  const filtered = therapists.filter(t =>
    (spec === "Todos" || t.tags.some(tag => tag.toLowerCase().includes(spec.toLowerCase()))) &&
    (t.name.toLowerCase().includes(search.toLowerCase()) || t.specialty.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div style={{ fontFamily: '"Nunito", system-ui, sans-serif', background: B.bg }}>
      <PublicNav go={go} cur="public/especialistas" />
      {/* Hero */}
      <div className="py-12 px-4 text-center max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full mb-4" style={{ background: B.violetLight, color: B.violet }}>
          <Users size={12} /> {therapists.filter(t => t.available).length} especialistas disponibles ahora
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-[#1C1135] mb-4 leading-tight">Encuentra al especialista en <span style={{ color: B.violet }}>terapia de lenguaje</span></h1>
        <p className="text-lg text-[#7C6F9A] font-medium mb-6">Especialistas en terapia de lenguaje infantil, verificados y con experiencia en atención virtual.</p>
        <div className="flex items-center gap-2 max-w-lg mx-auto bg-white rounded-2xl border border-[#E8E5F4] px-4 py-3 shadow-sm">
          <Search size={16} className="text-[#9E95B7]" />
          <input className="flex-1 bg-transparent text-sm font-medium focus:outline-none text-[#1C1135] placeholder:text-[#9E95B7]"
            placeholder="Buscar por nombre o especialidad…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <div className="flex gap-2 flex-wrap">
            {specialties.map(s => (
              <button key={s} onClick={() => setSpec(s)}
                className="px-3 py-1.5 rounded-2xl text-xs font-bold transition-all"
                style={{ background: spec === s ? B.violet : B.violetLight, color: spec === s ? "white" : B.textMid }}>
                {s}
              </button>
            ))}
          </div>

        </div>
        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12 max-w-5xl mx-auto justify-items-center">
          {filtered.map(t => (
            <div key={t.id} className="w-full max-w-sm bg-white rounded-3xl border border-[#E8E5F4] p-5 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <Av initials={t.av} color={t.color} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-extrabold text-[#1C1135] text-sm">{t.name}</p>
                    {t.available && <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-[#7C6F9A] font-medium">{t.specialty}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-extrabold text-[#1C1135]">{t.rating}</span>
                    <span className="text-xs text-[#9E95B7]">({t.reviews} reseñas)</span>
                  </div>
                </div>
                <p className="font-black text-lg text-[#1C1135]">S/ {t.price}<span className="text-xs font-medium text-[#9E95B7]">/ses</span></p>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {t.tags.map(tag => <Bdg key={tag} color="violet">{tag}</Bdg>)}
                <Bdg color="gray">{t.experience}</Bdg>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Btn variant="secondary" size="sm" onClick={() => go("login")}><Video size={12} /> Ver perfil</Btn>
                <Btn variant="cta"       size="sm" onClick={() => go("login")}>Agendar</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PublicFooter go={go} />
    </div>
  );
}
