import { Eye, CheckCircle } from "lucide-react";
import { B } from "@/theme/brand/B";
import { Btn } from "@/components/common/Btn";
import { Crd } from "@/components/common/Crd";

export function AdminModeracion() {
  const incidents = [
    { title: "Reporte de usuario: comentario inapropiado", user: "Anónimo",      date: "29 Jul", severity: "media", status: "pendiente"   },
    { title: "Incidencia técnica: sesión interrumpida",    user: "Laura Gómez",  date: "28 Jul", severity: "alta",  status: "en revisión" },
    { title: "Solicitud de eliminación de cuenta",         user: "Carlos Mendez",date: "27 Jul", severity: "baja",  status: "resuelto"    },
    { title: "Contenido inapropiado reportado",            user: "Sistema",      date: "26 Jul", severity: "media", status: "resuelto"    },
  ];
  const svStyle: Record<string, {bg:string; color:string}> = {
    alta:  { bg: "#FEE2E2", color: "#DC2626" },
    media: { bg: B.orangeLight, color: B.orange },
    baja:  { bg: B.violetLight, color: B.violet },
  };
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-[#1C1135] mb-1">Moderación</h2>
        <p className="text-sm text-[#7C6F9A] font-medium">Gestión de incidencias y reportes de usuarios</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {[
          { label: "Pendientes",  val: incidents.filter(i=>i.status==="pendiente").length,  color: B.orange,  bg: B.orangeLight },
          { label: "En revisión", val: incidents.filter(i=>i.status==="en revisión").length, color: B.violet,  bg: B.violetLight },
          { label: "Resueltos",   val: incidents.filter(i=>i.status==="resuelto").length,   color: "#059669", bg: "#D1FAE5"     },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
            <p className="font-black text-2xl text-[#1C1135]">{s.val}</p>
            <p className="text-xs font-bold mt-1" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {incidents.map((item, i) => {
          const sv = svStyle[item.severity] || svStyle.baja;
          return (
            <Crd key={i} className="p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm text-[#1C1135] mb-1">{item.title}</p>
                  <p className="text-xs text-[#7C6F9A] font-medium">Reportado por: {item.user} · {item.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: sv.bg, color: sv.color }}>{item.severity}</span>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: item.status === "resuelto" ? "#D1FAE5" : item.status === "pendiente" ? B.orangeLight : B.violetLight, color: item.status === "resuelto" ? "#059669" : item.status === "pendiente" ? B.orange : B.violet }}>
                    {item.status}
                  </span>
                </div>
              </div>
              {item.status !== "resuelto" && (
                <div className="flex gap-2 mt-3 pt-3 border-t" style={{ borderColor: B.border }}>
                  <Btn size="sm" variant="secondary"><Eye size={12} /> Revisar</Btn>
                  <Btn size="sm" variant="primary"><CheckCircle size={12} /> Resolver</Btn>
                </div>
              )}
            </Crd>
          );
        })}
      </div>
    </div>
  );
}
