import { useState } from "react";
import { UserPlus, X, Star, CheckCircle, FileText, Trash2, Eye } from "lucide-react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";
import { therapists } from "@/mocks/demo";

export function AdminTerapias() {
  return <AdminTerapeutas go={() => {}} />;
}

export function AdminTerapeutas({ go: _go }: { go: (v: View) => void }) {
  type TerapeutaRec = { name: string; specialty: string; rating: number; patients: number; sessions: number; income: string; status: string; verified: boolean; av: string; color: string; };
  const [viewProfile, setViewProfile] = useState<TerapeutaRec | null>(null);
  const terapeutas: TerapeutaRec[] = [
    { name: "Dra. Ana Ruiz",       specialty: "Terapia del Lenguaje", rating: 4.9, patients: 18, sessions: 143, income: "—", status: "verificado",  verified: true,  av: "AR", color: B.violet  },
    { name: "Lic. Carlos Mendoza", specialty: "Terapia del Lenguaje", rating: 4.7, patients: 12, sessions: 98,  income: "—", status: "verificado",  verified: true,  av: "CM", color: B.teal    },
    { name: "Dra. María Torres",   specialty: "Terapia del Lenguaje", rating: 4.8, patients: 15, sessions: 121, income: "—", status: "verificado",  verified: true,  av: "MT", color: "#EC4899" },
    { name: "Lic. Pedro Sánchez",  specialty: "Terapia del Lenguaje", rating: 4.5, patients: 8,  sessions: 62,  income: "—", status: "pendiente",   verified: false, av: "PS", color: B.orange  },
    { name: "Dra. Laura Vega",     specialty: "Terapia del Lenguaje", rating: 0,   patients: 0,  sessions: 0,   income: "—", status: "en revisión", verified: false, av: "LV", color: "#8B5CF6" },
  ];
  const filtered = terapeutas;
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Terapeutas</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">{terapeutas.length} terapeutas registrados</p>
        </div>
        <Btn variant="primary" size="sm"><UserPlus size={13} /> Invitar terapeuta</Btn>
      </div>
      {/* ── Perfil modal ── */}
      {viewProfile && (() => {
        const shared = therapists.find(th => th.name === viewProfile.name);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E5F4] flex-shrink-0">
                <h2 className="font-extrabold text-[#1C1135] text-lg">Perfil del terapeuta</h2>
                <button onClick={() => setViewProfile(null)} className="p-2 rounded-xl hover:bg-[#F5F3FF] text-[#9E95B7]"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex items-start gap-5 mb-6">
                  <Av initials={viewProfile.av} color={viewProfile.color} size="xl" />
                  <div className="flex-1">
                    <h3 className="font-black text-2xl text-[#1C1135]">{viewProfile.name}</h3>
                    <p className="text-sm text-[#7C6F9A] font-medium">{viewProfile.specialty}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {viewProfile.rating > 0 && (
                        <><Star size={14} className="text-amber-400 fill-amber-400" /><span className="font-black text-[#1C1135]">{viewProfile.rating}</span></>
                      )}
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: viewProfile.status === "verificado" ? "#D1FAE5" : viewProfile.status === "pendiente" ? "#FEF3C7" : "#FEF9C3", color: viewProfile.status === "verificado" ? "#059669" : "#D97706" }}>
                        {viewProfile.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Pacientes",   value: String(viewProfile.patients) },
                    { label: "Sesiones",    value: String(viewProfile.sessions) },
                    { label: "Experiencia", value: shared?.experience ?? "N/A" },
                  ].map(f => (
                    <div key={f.label} className="rounded-2xl p-3" style={{ background: B.bg }}>
                      <p className="text-xs font-extrabold text-[#9E95B7] uppercase tracking-wider">{f.label}</p>
                      <p className="font-bold text-[#1C1135] text-sm mt-0.5">{f.value}</p>
                    </div>
                  ))}
                </div>
                {shared && (
                  <div className="mb-5">
                    <p className="font-extrabold text-[#1C1135] mb-2 text-sm">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {shared.tags.map(tag => <Bdg key={tag} color="violet">{tag}</Bdg>)}
                    </div>
                  </div>
                )}
                <div className="mb-5 p-4 rounded-2xl" style={{ background: B.violetLight }}>
                  <p className="text-sm font-medium text-[#1C1135] leading-relaxed">
                    "Especialista en terapia infantil con enfoque lúdico y familiar. Trabajo con niños desde los 3 años usando metodologías basadas en evidencia, adaptando cada sesión al ritmo y necesidades del niño."
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  {!viewProfile.verified && <Btn variant="primary" className="flex-1 justify-center"><CheckCircle size={14} /> Aprobar cuenta</Btn>}
                  {viewProfile.verified && <Btn variant="secondary" className="flex-1 justify-center" onClick={() => { const blob = new Blob([`DOCUMENTOS - ${viewProfile.name}\n\nEspecialidad: ${viewProfile.specialty}\nEstado: ${viewProfile.status}\nSesiones: ${viewProfile.sessions}\n\nDatos simulados para demostración.`], { type: "application/pdf" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `docs-${viewProfile.name.replace(/\s/g,"-").toLowerCase()}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}><FileText size={14} /> Solicitar documentos</Btn>}
                  <Btn variant="danger" className="flex-1 justify-center"><Trash2 size={14} /> Suspender</Btn>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex flex-col gap-4">
        {filtered.map(t => (
          <Crd key={t.name} className="p-5">
            <div className="flex items-start gap-4 flex-wrap">
              <Av initials={t.av} color={t.color} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
                  <div>
                    <p className="font-extrabold text-[#1C1135]">{t.name}</p>
                    <p className="text-xs text-[#7C6F9A] font-medium mt-0.5">{t.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Pacientes",    val: String(t.patients) },
                    { label: "Sesiones",     val: String(t.sessions) },
                    { label: "Calificación", val: t.rating > 0 ? `★ ${t.rating}` : "Sin datos" },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl p-2.5" style={{ background: B.violetLight }}>
                      <p className="text-xs text-[#9E95B7] font-medium">{s.label}</p>
                      <p className="font-extrabold text-sm text-[#1C1135]">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end flex-wrap pt-3 mt-3 border-t" style={{ borderColor: B.border }}>
              <Btn size="sm" variant="ghost" onClick={() => setViewProfile(t)}><Eye size={12} /> Ver perfil</Btn>
              {!t.verified && <Btn size="sm" variant="primary"><CheckCircle size={12} /> Aprobar</Btn>}
              {t.verified && <Btn size="sm" variant="secondary" onClick={() => { const blob = new Blob([`DOCUMENTOS - ${t.name}\n\nDatos simulados para demostración.`], { type: "application/pdf" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `docs-${t.name.replace(/\s/g,"-").toLowerCase()}.pdf`; document.body.appendChild(a); a.click(); document.body.removeChild(a); }}><FileText size={12} /> Solicitar docs</Btn>}
              <Btn size="sm" variant="danger"><Trash2 size={12} /> Suspender</Btn>
            </div>
          </Crd>
        ))}
      </div>
    </div>
  );
}
