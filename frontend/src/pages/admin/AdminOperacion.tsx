import { useState } from "react";
import { ChevronRight, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Av } from "@/components/common/Av";

// ── Operación — Incidencias + Sesiones activas ─────────────────────────────────
export function AdminOperacion({ go }: { go: (v: View) => void }) {
  const [tab, setTab] = useState<"incidencias" | "sesiones">("incidencias");

  type Incidencia = {
    id: number; user: string; role: string; type: string; title: string;
    date: string; time: string; read: boolean; resolved: boolean;
  };

  const [incidencias, setIncidencias] = useState<Incidencia[]>([
    { id: 1, user: "Laura Gómez", role: "Padre", type: "Funcional", title: "El botón de guardar no responde", date: "2026-09-09", time: "10:32", read: false, resolved: false },
    { id: 2, user: "Dra. Ana Ruiz", role: "Terapeuta", type: "Error de datos", title: "Historial de paciente no carga", date: "2026-09-09", time: "09:15", read: true, resolved: false },
    { id: 3, user: "Carlos R.", role: "Padre", type: "Visual / Diseño", title: "El mapa de Mundo ASHA no se muestra en móvil", date: "2026-09-08", time: "17:45", read: true, resolved: true },
  ]);
  const [selected, setSelected] = useState<number | null>(null);

  const activeSessions = [
    { id: "SES-A7F2", therapist: "Dra. Ana Ruiz", av: "AR", color: B.violet, hora: "09:00", dur: "18 min", conectividad: "Estable", estado: "Normal" },
    { id: "SES-B3C8", therapist: "Lic. Carlos Mendoza", av: "CM", color: B.teal, hora: "09:15", dur: "12 min", conectividad: "Degradada", estado: "Revisión" },
    { id: "SES-D1E4", therapist: "Dra. María Torres", av: "MT", color: "#EC4899", hora: "08:45", dur: "24 min", conectividad: "Estable", estado: "Normal" },
  ];

  const roleColor = (role: string) => role === "Terapeuta" ? { bg: B.tealLight, color: B.teal } : { bg: B.violetLight, color: B.violet };
  const statusBadge = (inc: Incidencia) => {
    if (inc.resolved) return { label: "Resuelto", bg: "#D1FAE5", color: "#059669" };
    if (inc.read) return { label: "Leído", bg: "#F3F4F6", color: "#6B7280" };
    return { label: "Nuevo", bg: B.orangeLight, color: B.orange };
  };

  const markRead = (id: number) => setIncidencias(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  const markResolved = (id: number) => setIncidencias(prev => prev.map(i => i.id === id ? { ...i, read: true, resolved: true } : i));

  const sel = selected !== null ? incidencias.find(i => i.id === selected) ?? null : null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto" style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}>
      <div className="mb-5">
        <h1 className="text-2xl font-black text-[#1C1135]">Operación</h1>
        <p className="text-sm text-[#7C6F9A] font-medium mt-1">Incidencias reportadas y sesiones activas.</p>
      </div>

      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-5 border border-amber-200 bg-amber-50 text-xs font-bold text-amber-700">
        <span>⚠️</span> Datos simulados para demostración
      </div>

      <div className="flex flex-wrap gap-2 mb-5" aria-label="Gestión clínica real">
        <Btn size="sm" variant="secondary" onClick={() => go('admin/pacientes')}>Pacientes y tratamientos</Btn>
        <Btn size="sm" variant="secondary" onClick={() => go('admin/citas')}>Agenda clínica</Btn>
        <Btn size="sm" variant="secondary" onClick={() => go('admin/sesiones')}>Sesiones y reportes</Btn>
      </div>
      <Crd className="overflow-hidden">
        {/* Tab pills */}
        <div className="flex gap-2 p-4 border-b border-[#E8E5F4]">
          {(["incidencias", "sesiones"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-2xl text-xs font-black capitalize transition-all"
              style={{ background: tab === t ? B.violet : B.violetLight, color: tab === t ? "white" : B.textMid }}>
              {t === "incidencias" ? "Incidencias" : "Sesiones activas"}
            </button>
          ))}
        </div>

        {/* ── Incidencias tab ── */}
        {tab === "incidencias" && (
          <div className="divide-y divide-[#F5F3FF]">
            {incidencias.map(inc => {
              const rc = roleColor(inc.role);
              const sb = statusBadge(inc);
              const isOpen = selected === inc.id;
              return (
                <div key={inc.id}>
                  <button className="w-full text-left px-5 py-4 hover:bg-[#FAFAF9] transition-colors"
                    onClick={() => setSelected(isOpen ? null : inc.id)}>
                    <div className="flex items-start gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-extrabold text-sm text-[#1C1135]">{inc.user}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: rc.bg, color: rc.color }}>{inc.role}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: sb.bg, color: sb.color }}>{sb.label}</span>
                        </div>
                        <p className="text-sm font-medium text-[#1C1135]">{inc.title}</p>
                        <p className="text-xs text-[#9E95B7] font-medium mt-0.5">{inc.type} · {inc.date} {inc.time}</p>
                      </div>
                      <ChevronRight size={16} className="text-[#C4B5FD] flex-shrink-0 mt-1 transition-transform"
                        style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }} />
                    </div>
                  </button>

                  {isOpen && sel && (
                    <div className="mx-4 mb-4 rounded-2xl border border-[#E8E5F4] p-4" style={{ background: B.violetLight }}>
                      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                        {[
                          { label: "Usuario", val: sel.user },
                          { label: "Rol", val: sel.role },
                          { label: "Fecha", val: `${sel.date} ${sel.time}` },
                          { label: "Tipo", val: sel.type },
                        ].map(f => (
                          <div key={f.label}>
                            <p className="font-extrabold text-[#9E95B7] uppercase tracking-wider mb-0.5">{f.label}</p>
                            <p className="font-bold text-[#1C1135]">{f.val}</p>
                          </div>
                        ))}
                      </div>
                      <p className="font-extrabold text-sm text-[#1C1135] mb-1">{sel.title}</p>
                      <p className="text-xs text-[#7C6F9A] font-medium mb-4">
                        El usuario reportó este problema a través del formulario de soporte. Verificar si el error es reproducible y registrar la acción tomada.
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {!sel.read && (
                          <Btn size="sm" variant="secondary" onClick={() => markRead(sel.id)}>
                            <CheckCircle size={12} /> Confirmar lectura
                          </Btn>
                        )}
                        {!sel.resolved && (
                          <Btn size="sm" variant="primary" onClick={() => markResolved(sel.id)}>
                            <CheckCircle size={12} /> Marcar como resuelto
                          </Btn>
                        )}
                        {sel.resolved && (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-xl" style={{ background: "#D1FAE5", color: "#059669" }}>
                            Incidencia resuelta
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Sesiones activas tab ── */}
        {tab === "sesiones" && (
          <div>
            <div className="text-xs text-[#9E95B7] font-medium px-5 py-2 bg-[#FAFAF9] border-b border-[#F0EEF9]">
              Datos técnicos únicamente · Sin contenido clínico
            </div>
            <div className="divide-y divide-[#F5F3FF]">
              {activeSessions.map((s, i) => (
                <div key={i} className="px-5 py-4 flex items-center gap-3 flex-wrap hover:bg-[#F9F8FE] transition-colors">
                  <Av initials={s.av} color={s.color} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#1C1135] font-mono">{s.id}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium">{s.therapist}</p>
                  </div>
                  <div className="text-xs text-[#7C6F9A] font-medium text-right">
                    <p>{s.hora} · {s.dur}</p>
                    <p className={s.conectividad === "Estable" ? "text-green-600 font-bold" : "text-amber-600 font-bold"}>
                      📶 {s.conectividad}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.estado === "Normal" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {s.estado}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[#E8E5F4] text-center">
              <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-50 text-green-700">
                {activeSessions.length} sesiones en curso
              </span>
            </div>
          </div>
        )}
      </Crd>
    </div>
  );
}
