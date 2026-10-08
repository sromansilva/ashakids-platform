import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Av } from "@/components/common/Av";

// ─── Shared auth shell ─────────────────────────────────────────────────────────

export function AdminSolicitudes() {
  const [filter, setFilter] = useState<"pendientes" | "aprobadas" | "rechazadas">("pendientes");
  const [selected, setSelected] = useState<number | null>(null);

  const requests = [
    { name: "Lic. María Fernández", specialty: "Terapia del Lenguaje", exp: "6 años", date: "28 Jul 2026", av: "MF", color: B.violet,  city: "Guadalajara, MX", status: "pendientes", rating: null },
    { name: "Lic. Jorge Salinas",   specialty: "Articulación y Fonología",  exp: "4 años", date: "27 Jul 2026", av: "JS", color: "#2563EB", city: "Monterrey, MX",   status: "pendientes", rating: null },
    { name: "Dra. Claudia Rojas",   specialty: "Comprensión del Lenguaje",  exp: "9 años", date: "25 Jul 2026", av: "CR", color: B.teal,    city: "Buenos Aires, AR",status: "pendientes", rating: null },
    { name: "Lic. Pablo Herrera",   specialty: "Fluidez del Habla",         exp: "3 años", date: "20 Jul 2026", av: "PH", color: B.orange,  city: "Bogotá, CO",      status: "aprobadas",  rating: null },
    { name: "Dra. Sofía Mendez",    specialty: "Pragmática",                exp: "7 años", date: "15 Jul 2026", av: "SM", color: "#EC4899", city: "Lima, PE",         status: "rechazadas", rating: null },
  ];

  const filtered = requests.filter(r => r.status === filter);
  const counts = { pendientes: requests.filter(r => r.status === "pendientes").length, aprobadas: requests.filter(r => r.status === "aprobadas").length, rechazadas: requests.filter(r => r.status === "rechazadas").length };

  return (
    <div className="p-4 sm:p-6 max-w-5xl" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-[#1C1135]">Solicitudes de terapeutas</h1>
        <p className="text-sm text-[#7C6F9A] font-medium">Revisa y gestiona las postulaciones recibidas.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([
          { k: "pendientes" as const, label: "Pendientes", color: B.warning,  bg: B.warningLight,  icon: "⏳" },
          { k: "aprobadas"  as const, label: "Aprobadas",  color: B.success,  bg: B.successLight,  icon: "✅" },
          { k: "rechazadas" as const, label: "Rechazadas", color: B.danger,   bg: B.dangerLight,   icon: "❌" },
        ]).map(s => (
          <button key={s.k} onClick={() => setFilter(s.k)}
            className="rounded-2xl p-4 border-2 transition-all text-left"
            style={{ background: filter === s.k ? s.bg : "white", borderColor: filter === s.k ? s.color : B.border }}>
            <div className="flex items-center gap-2 mb-1">
              <span>{s.icon}</span>
              <span className="text-2xl font-black" style={{ color: s.color }}>{counts[s.k]}</span>
            </div>
            <p className="text-xs font-bold text-[#7C6F9A]">{s.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* List */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {filtered.length === 0 && <p className="text-sm text-[#9E95B7] font-medium text-center py-8">Sin solicitudes {filter}</p>}
          {filtered.map((r, i) => (
            <button key={i} onClick={() => setSelected(i)}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 text-left transition-all hover:border-violet-300"
              style={{ borderColor: selected === i ? B.violet : B.border }}>
              <Av initials={r.av} color={r.color} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm text-[#1C1135] truncate">{r.name}</p>
                <p className="text-xs text-[#7C6F9A] font-medium">{r.specialty}</p>
                <p className="text-xs text-[#9E95B7] font-medium">{r.date}</p>
              </div>
              <ChevronRight size={14} className="text-[#9E95B7] flex-shrink-0" />
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-3">
          {selected === null ? (
            <div className="bg-white rounded-2xl border border-[#E8E5F4] p-10 text-center h-full flex flex-col items-center justify-center">
              <div className="text-4xl mb-3">👆</div>
              <p className="font-extrabold text-[#1C1135] mb-1">Selecciona una solicitud</p>
              <p className="text-sm text-[#7C6F9A] font-medium">Haz clic en una tarjeta para ver todos los detalles.</p>
            </div>
          ) : (() => {
            const r = filtered[selected];
            return (
              <div className="bg-white rounded-2xl border border-[#E8E5F4] p-5">
                <div className="flex items-start gap-4 mb-5">
                  <Av initials={r.av} color={r.color} size="xl" />
                  <div>
                    <h2 className="font-extrabold text-xl text-[#1C1135]">{r.name}</h2>
                    <p className="text-sm text-[#7C6F9A] font-medium">{r.specialty} · {r.exp} de experiencia</p>
                    <p className="text-xs text-[#9E95B7] font-medium">{r.city} · Solicitud: {r.date}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { l: "Especialidad", v: r.specialty },
                    { l: "Experiencia",  v: r.exp        },
                    { l: "Ciudad",       v: r.city       },
                    { l: "Modalidad",    v: "Virtual y presencial" },
                    { l: "Tarifa",       v: "$65/sesión"  },
                    { l: "Idiomas",      v: "Español, Inglés" },
                  ].map(f => (
                    <div key={f.l} className="rounded-xl p-3" style={{ background: B.bg }}>
                      <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{f.l}</p>
                      <p className="text-sm font-bold text-[#1C1135]">{f.v}</p>
                    </div>
                  ))}
                </div>
                {/* Documents */}
                <div className="mb-5">
                  <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider mb-2">Documentos adjuntos</p>
                  <div className="flex flex-col gap-2">
                    {["Currículum / CV", "Título profesional", "Cédula profesional"].map(doc => (
                      <div key={doc} className="flex items-center justify-between p-2.5 rounded-xl border border-[#E8E5F4]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📄</span>
                          <span className="text-sm font-bold text-[#1C1135]">{doc}</span>
                        </div>
                        <button className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: B.violetLight, color: B.violet }}>Ver</button>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Actions */}
                {filter === "pendientes" && (
                  <div className="flex gap-2">
                    <button className="flex-1 rounded-2xl py-2.5 text-sm font-extrabold text-white"
                      style={{ background: `linear-gradient(135deg, ${B.success}, #059669)` }}>
                      ✅ Aprobar
                    </button>
                    <button className="flex-1 rounded-2xl py-2.5 text-sm font-extrabold border-2"
                      style={{ borderColor: B.warning, color: B.warning }}>
                      ⚠️ Solicitar cambios
                    </button>
                    <button className="flex-1 rounded-2xl py-2.5 text-sm font-extrabold border-2"
                      style={{ borderColor: B.danger, color: B.danger }}>
                      ❌ Rechazar
                    </button>
                  </div>
                )}
                {filter === "aprobadas" && (
                  <div className="rounded-2xl p-3" style={{ background: B.successLight }}>
                    <p className="text-sm font-extrabold" style={{ color: B.success }}>✅ Cuenta creada — Correo de bienvenida enviado</p>
                  </div>
                )}
                {filter === "rechazadas" && (
                  <div className="rounded-2xl p-3" style={{ background: B.dangerLight }}>
                    <p className="text-sm font-extrabold" style={{ color: B.danger }}>❌ Solicitud rechazada</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
