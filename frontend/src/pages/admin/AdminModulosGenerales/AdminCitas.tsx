import { useState } from "react";
import { Plus, X, Edit } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";
import { Bdg } from "@/components/common/Bdg";
import { Av } from "@/components/common/Av";

export function AdminCitas() {
  const [statusFilter, setStatusFilter] = useState("todas");
  const citas = [
    { patient: "Mateo Gómez",     therapist: "Dra. Ana Ruiz",       date: "Hoy 09:00",   type: "Virtual",    status: "confirmada",  dur: "45 min", av: "MG", color: B.violet  },
    { patient: "Valentina López", therapist: "Dra. Ana Ruiz",       date: "Hoy 11:30",   type: "Presencial", status: "confirmada",  dur: "60 min", av: "VL", color: B.teal    },
    { patient: "Bruno Ríos",      therapist: "Dra. Ana Ruiz",       date: "Hoy 15:00",   type: "Virtual",    status: "confirmada",  dur: "45 min", av: "BR", color: "#22C55E" },
    { patient: "Fernanda Torres", therapist: "Lic. Carlos Mendoza", date: "Mañana 10:00",type: "Presencial", status: "pendiente",   dur: "60 min", av: "FT", color: B.orange  },
    { patient: "Sebastián Vargas",therapist: "Dra. María Torres",  date: "Jue 02 Ago",  type: "Virtual",    status: "pendiente",   dur: "45 min", av: "SV", color: "#8B5CF6" },
    { patient: "Camila Ponce",    therapist: "Lic. Pedro Sánchez", date: "Lun 28 Jul",  type: "Presencial", status: "cancelada",   dur: "60 min", av: "CP", color: "#EC4899" },
  ];
  const scMap: Record<string, {bg:string; color:string}> = {
    confirmada: { bg: "#D1FAE5", color: "#059669" },
    pendiente:  { bg: B.orangeLight, color: B.orange },
    cancelada:  { bg: "#FEE2E2", color: "#DC2626" },
  };
  const statuses = ["todas", "confirmada", "pendiente", "cancelada"];
  const filtered = statusFilter === "todas" ? citas : citas.filter(c => c.status === statusFilter);
  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1C1135] mb-1">Gestión de Citas</h2>
          <p className="text-sm text-[#7C6F9A] font-medium">Calendario global de la plataforma</p>
        </div>
        <Btn variant="primary" size="sm"><Plus size={13} /> Revisar solicitudes</Btn>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Confirmadas", val: citas.filter(c=>c.status==="confirmada").length, color: "#059669", bg: "#D1FAE5"     },
          { label: "Pendientes",  val: citas.filter(c=>c.status==="pendiente").length,  color: B.orange,  bg: B.orangeLight },
          { label: "Canceladas",  val: citas.filter(c=>c.status==="cancelada").length,  color: "#DC2626", bg: "#FEE2E2"     },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {statuses.map(s => (
          <button key={s} className="px-3 py-1.5 rounded-2xl text-xs font-bold capitalize transition-all"
            style={{ background: statusFilter === s ? B.violet : B.violetLight, color: statusFilter === s ? "white" : B.textMid }}
            onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map((c, i) => {
          const sc = scMap[c.status] || { bg: B.violetLight, color: B.violet };
          return (
            <Crd key={i} className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <Av initials={c.av} color={c.color} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135]">{c.patient}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">con {c.therapist}</p>
                </div>
                <div className="text-xs text-[#7C6F9A] font-medium">{c.date} · {c.dur}</div>
                <Bdg color={c.type === "Virtual" ? "violet" : "gray"}>{c.type}</Bdg>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-violet-600 hover:bg-violet-50 transition-colors"><Edit size={13} /></button>
                  <button className="p-1.5 rounded-xl text-[#9E95B7] hover:text-red-500 hover:bg-red-50 transition-colors"><X size={13} /></button>
                </div>
              </div>
            </Crd>
          );
        })}
      </div>
    </div>
  );
}
